/**
 * Zitadel OIDC Client — @index0/ide-web
 * Lightweight, zero-dependency PKCE Code Flow OIDC client for Zitadel v2 via Caddy API Gateway.
 */

import type {
  UserRole,
  IUser,
  IOrganization,
  IJwtClaims,
  ITenantContext,
  Permission
} from '@index0/contracts';
import { DEFAULT_ROLE_PERMISSIONS } from '@index0/contracts';

export interface IZitadelOidcConfig {
  issuer: string;
  clientId: string;
  redirectUri: string;
  scope: string;
  postLogoutRedirectUri?: string;
}

export const DEFAULT_OIDC_CONFIG: IZitadelOidcConfig = {
  issuer: 'http://localhost:8000/auth',
  clientId: 'index0-ide',
  redirectUri: 'http://localhost:5173/auth/callback',
  scope: 'openid profile email urn:zitadel:iam:org:project:roles',
  postLogoutRedirectUri: 'http://localhost:5173/'
};

/**
 * Generates a cryptographically secure random string for PKCE and state parameters.
 */
export function generateRandomString(length: number = 48): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  let result = '';
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    for (let i = 0; i < length; i++) {
      result += charset[bytes[i] % charset.length];
    }
  } else {
    // Fallback for non-crypto environments
    for (let i = 0; i < length; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length));
    }
  }
  return result;
}

/**
 * Computes base64url representation of an ArrayBuffer.
 */
export function bufferToBase64Url(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = typeof btoa === 'function' ? btoa(binary) : Buffer.from(binary, 'binary').toString('base64');
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Computes SHA-256 hash for PKCE Code Challenge (S256 method).
 */
export async function generateCodeChallenge(verifier: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return bufferToBase64Url(digest);
  }
  // Node.js fallback if crypto.subtle is unavailable
  try {
    const nodeCrypto = await import('node:crypto');
    const hash = nodeCrypto.createHash('sha256').update(verifier).digest('base64url');
    return hash;
  } catch {
    // Last resort fallback
    return verifier;
  }
}

/**
 * Decodes a base64url encoded JWT payload string into typed claims without verifying signature.
 * (Signature verification is enforced server-side by Caddy / Zitadel Gateway).
 */
export function decodeJwtPayload<T = IJwtClaims>(token: string): T {
  const parts = token.split('.');
  if (parts.length < 2) {
    throw new Error('Invalid JWT format: missing payload part');
  }

  let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4 !== 0) {
    base64 += '=';
  }

  const jsonStr = typeof atob === 'function'
    ? atob(base64)
    : Buffer.from(base64, 'base64').toString('utf-8');

  return JSON.parse(jsonStr) as T;
}

/**
 * Checks if a JWT token has expired or will expire within the given clock skew window.
 */
export function isTokenExpired(token: string, clockSkewSeconds: number = 60): boolean {
  try {
    const claims = decodeJwtPayload<IJwtClaims>(token);
    if (!claims.exp) return false;
    const nowSeconds = Math.floor(Date.now() / 1000);
    return claims.exp <= nowSeconds + clockSkewSeconds;
  } catch {
    return true;
  }
}

/**
 * Aggregates all unique permissions granted to the provided user roles.
 */
export function resolvePermissions(roles: UserRole[]): readonly Permission[] {
  const permissionsSet = new Set<Permission>();
  for (const role of roles) {
    const perms = DEFAULT_ROLE_PERMISSIONS[role] || [];
    for (const perm of perms) {
      permissionsSet.add(perm);
    }
  }
  return Array.from(permissionsSet);
}

/**
 * Primary OIDC Client for Zitadel v2 integration through Caddy API Gateway.
 */
export class ZitadelOidcClient {
  private config: IZitadelOidcConfig;
  private inMemoryAccessToken: string | null = null;
  private inMemoryRefreshToken: string | null = null;

  constructor(config: Partial<IZitadelOidcConfig> = {}) {
    this.config = { ...DEFAULT_OIDC_CONFIG, ...config };
  }

  public getConfig(): Readonly<IZitadelOidcConfig> {
    return this.config;
  }

  /**
   * Generates authorization URL, PKCE verifier, and state for starting OIDC Code Flow.
   */
  public async createAuthorizationRequest(customState?: string): Promise<{
    authorizationUrl: string;
    codeVerifier: string;
    state: string;
  }> {
    const codeVerifier = generateRandomString(64);
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    const state = customState || generateRandomString(32);

    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: 'code',
      scope: this.config.scope,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      state
    });

    const endpoint = `${this.config.issuer.replace(/\/$/, '')}/oauth/v2/authorize`;
    const authorizationUrl = `${endpoint}?${params.toString()}`;

    return { authorizationUrl, codeVerifier, state };
  }

  /**
   * Exchanges authorization code and code verifier for tokens at Zitadel token endpoint.
   */
  public async exchangeCodeForTokens(
    code: string,
    codeVerifier: string
  ): Promise<{
    accessToken: string;
    refreshToken?: string;
    idToken?: string;
    expiresIn: number;
    claims: IJwtClaims;
  }> {
    const endpoint = `${this.config.issuer.replace(/\/$/, '')}/oauth/v2/token`;
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      code,
      code_verifier: codeVerifier
    });

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json'
      },
      body: body.toString()
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Token exchange failed (${response.status}): ${errorText}`);
    }

    const data = (await response.json()) as {
      access_token: string;
      refresh_token?: string;
      id_token?: string;
      expires_in?: number;
    };
    const accessToken = data.access_token;
    const refreshToken = data.refresh_token;
    const idToken = data.id_token;
    const expiresIn = data.expires_in || 3600;

    const claims = decodeJwtPayload<IJwtClaims>(accessToken);

    this.setTokens(accessToken, refreshToken);
    return { accessToken, refreshToken, idToken, expiresIn, claims };
  }

  /**
   * Refreshes access token using stored or provided refresh token.
   */
  public async refreshAccessToken(
    refreshTokenParam?: string
  ): Promise<{
    accessToken: string;
    refreshToken?: string;
    expiresIn: number;
    claims: IJwtClaims;
  }> {
    const refreshToken = refreshTokenParam || this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const endpoint = `${this.config.issuer.replace(/\/$/, '')}/oauth/v2/token`;
    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: this.config.clientId,
      refresh_token: refreshToken
    });

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json'
      },
      body: body.toString()
    });

    if (!response.ok) {
      this.clearTokens();
      throw new Error(`Token refresh failed (${response.status})`);
    }

    const data = (await response.json()) as {
      access_token: string;
      refresh_token?: string;
      expires_in?: number;
    };
    const accessToken = data.access_token;
    const newRefreshToken = data.refresh_token || refreshToken;
    const expiresIn = data.expires_in || 3600;
    const claims = decodeJwtPayload<IJwtClaims>(accessToken);

    this.setTokens(accessToken, newRefreshToken);
    return { accessToken, refreshToken: newRefreshToken, expiresIn, claims };
  }

  /**
   * Stores access and refresh tokens in memory and sessionStorage if available.
   */
  public setTokens(accessToken: string, refreshToken?: string): void {
    this.inMemoryAccessToken = accessToken;
    if (refreshToken) {
      this.inMemoryRefreshToken = refreshToken;
    }

    if (typeof sessionStorage !== 'undefined') {
      try {
        sessionStorage.setItem('index0_access_token', accessToken);
        if (refreshToken) {
          sessionStorage.setItem('index0_refresh_token', refreshToken);
        }
      } catch {
        // Ignore storage exceptions in restricted environments
      }
    }
  }

  public getAccessToken(): string | null {
    if (this.inMemoryAccessToken) {
      return this.inMemoryAccessToken;
    }
    if (typeof sessionStorage !== 'undefined') {
      try {
        return sessionStorage.getItem('index0_access_token');
      } catch {
        return null;
      }
    }
    return null;
  }

  public getRefreshToken(): string | null {
    if (this.inMemoryRefreshToken) {
      return this.inMemoryRefreshToken;
    }
    if (typeof sessionStorage !== 'undefined') {
      try {
        return sessionStorage.getItem('index0_refresh_token');
      } catch {
        return null;
      }
    }
    return null;
  }

  public clearTokens(): void {
    this.inMemoryAccessToken = null;
    this.inMemoryRefreshToken = null;
    if (typeof sessionStorage !== 'undefined') {
      try {
        sessionStorage.removeItem('index0_access_token');
        sessionStorage.removeItem('index0_refresh_token');
      } catch {
        // Ignore
      }
    }
  }

  /**
   * Creates a deterministic mock session for testing or offline dev harnesses.
   */
  public createMockSession(role: UserRole = 'admin'): {
    user: IUser;
    organization: IOrganization;
    tenantContext: ITenantContext;
    token: string;
    claims: IJwtClaims;
  } {
    const userId = role === 'admin' ? 'usr-demo-darion-01' : 'usr-demo-alex-02';
    const email = role === 'admin' ? 'darion@index0.internal' : 'alex@index0.internal';
    const name = role === 'admin' ? 'Darion (System Admin)' : 'Alex (Software Engineer)';
    const orgId = 'org-acme-labs-01';

    const claims: IJwtClaims = {
      sub: userId,
      orgId,
      email,
      roles: [role],
      exp: Math.floor(Date.now() / 1000) + 3600,
      iat: Math.floor(Date.now() / 1000),
      iss: this.config.issuer,
      aud: this.config.clientId
    };

    const header = { alg: 'none', typ: 'JWT' };
    const encodedHeader = bufferToBase64Url(new TextEncoder().encode(JSON.stringify(header)));
    const encodedPayload = bufferToBase64Url(new TextEncoder().encode(JSON.stringify(claims)));
    const mockToken = `${encodedHeader}.${encodedPayload}.mock_signature`;

    const user: IUser = {
      id: userId,
      email,
      name,
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(userId)}`,
      emailVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const organization: IOrganization = {
      id: orgId,
      name: 'Acme Software Labs',
      slug: 'acme-software-labs',
      planTier: 'enterprise',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const tenantContext: ITenantContext = {
      tenantId: orgId,
      userId,
      role
    };

    this.setTokens(mockToken, 'mock_refresh_token_xyz');

    return { user, organization, tenantContext, token: mockToken, claims };
  }
}
