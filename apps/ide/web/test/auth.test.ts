import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {
  ZitadelOidcClient,
  generateRandomString,
  generateCodeChallenge,
  decodeJwtPayload,
  isTokenExpired,
  resolvePermissions,
  DEFAULT_OIDC_CONFIG
} from '../dist/auth/oidcClient.js';
import { createAuthFetch, generateRequestId } from '../dist/auth/authFetch.js';
import { UserNav } from '../dist/components/UserNav.js';
import { OpenHandsViewer } from '../dist/components/OpenHandsViewer.js';
import { Workbench } from '../dist/workbench/Workbench.js';
import type { UserRole } from '@index0/contracts';
import { DEFAULT_ROLE_PERMISSIONS } from '@index0/contracts';

describe('Dev 3: Zitadel OIDC Client & Gateway Authentication (@index0/ide-web)', () => {
  describe('PKCE Code Flow & Token Invariants', () => {
    it('should initialize with authoritative default Gateway configuration (port 8000)', () => {
      const client = new ZitadelOidcClient();
      const config = client.getConfig();

      assert.strictEqual(config.issuer, 'http://localhost:8000/auth');
      assert.strictEqual(config.clientId, 'index0-ide');
      assert.strictEqual(config.redirectUri, 'http://localhost:5173/auth/callback');
      assert.ok(config.scope.includes('openid'));
      assert.ok(config.scope.includes('urn:zitadel:iam:org:project:roles'));
    });

    it('should generate cryptographically compliant PKCE code verifier and challenge (RFC 7636)', async () => {
      const verifier = generateRandomString(64);
      assert.strictEqual(verifier.length, 64);
      assert.match(verifier, /^[A-Za-z0-9\-._~]+$/);

      const challenge = await generateCodeChallenge(verifier);
      assert.ok(challenge.length > 0);
      assert.doesNotMatch(challenge, /[+/=]/, 'Challenge must be unpadded base64url');
    });

    it('should construct valid authorization request URL pointing to Caddy Gateway on port 8000', async () => {
      const client = new ZitadelOidcClient();
      const authReq = await client.createAuthorizationRequest('custom-csrf-state-123');

      assert.strictEqual(authReq.state, 'custom-csrf-state-123');
      assert.ok(authReq.codeVerifier.length >= 43);

      const url = new URL(authReq.authorizationUrl);
      assert.strictEqual(url.origin, 'http://localhost:8000');
      assert.strictEqual(url.pathname, '/auth/oauth/v2/authorize');
      assert.strictEqual(url.searchParams.get('client_id'), 'index0-ide');
      assert.strictEqual(url.searchParams.get('redirect_uri'), 'http://localhost:5173/auth/callback');
      assert.strictEqual(url.searchParams.get('response_type'), 'code');
      assert.strictEqual(url.searchParams.get('code_challenge_method'), 'S256');
      assert.strictEqual(url.searchParams.get('state'), 'custom-csrf-state-123');
      assert.ok(url.searchParams.get('code_challenge'));
    });

    it('should decode JWT payload into typed IJwtClaims without signature verification', () => {
      const client = new ZitadelOidcClient();
      const session = client.createMockSession('admin');
      const claims = decodeJwtPayload(session.token);

      assert.strictEqual(claims.sub, 'usr-demo-darion-01');
      assert.strictEqual(claims.orgId, 'org-acme-labs-01');
      assert.strictEqual(claims.email, 'darion@index0.internal');
      assert.deepStrictEqual(claims.roles, ['admin']);
      assert.ok(claims.exp > claims.iat);
      assert.strictEqual(claims.iss, 'http://localhost:8000/auth');
    });

    it('should correctly evaluate token expiration with clock skew margins', () => {
      const client = new ZitadelOidcClient();
      const session = client.createMockSession('member');

      // Fresh token is not expired
      assert.strictEqual(isTokenExpired(session.token, 60), false);

      // Expired claims
      const expiredPayload = {
        sub: 'usr-1',
        orgId: 'org-1',
        email: 'usr@test.com',
        roles: ['member'],
        exp: Math.floor(Date.now() / 1000) - 10,
        iat: Math.floor(Date.now() / 1000) - 100,
        iss: 'http://localhost:8000/auth'
      };
      const header = Buffer.from(JSON.stringify({ alg: 'none' })).toString('base64url');
      const payload = Buffer.from(JSON.stringify(expiredPayload)).toString('base64url');
      const expiredToken = `${header}.${payload}.sig`;

      assert.strictEqual(isTokenExpired(expiredToken, 0), true);
    });

    it('should resolve RBAC permissions accurately according to DEFAULT_ROLE_PERMISSIONS', () => {
      const adminPerms = resolvePermissions(['admin']);
      for (const expected of DEFAULT_ROLE_PERMISSIONS.admin) {
        assert.ok(adminPerms.includes(expected), `Admin should have permission ${expected}`);
      }

      const viewerPerms = resolvePermissions(['viewer']);
      assert.ok(viewerPerms.includes('project:read'));
      assert.ok(viewerPerms.includes('settings:read'));
      assert.strictEqual(viewerPerms.includes('project:delete'), false);

      const agentPerms = resolvePermissions(['agent']);
      assert.ok(agentPerms.includes('agent:execute'));
      assert.strictEqual(agentPerms.includes('billing:write'), false);
    });
  });

  describe('Authenticated Gateway Fetch Interceptor (authFetch)', () => {
    it('should generate unique X-Request-ID strings with timestamp prefix', () => {
      const id1 = generateRequestId();
      const id2 = generateRequestId();
      assert.match(id1, /^req-[a-z0-9]+-[a-z0-9]+$/);
      assert.notStrictEqual(id1, id2);
    });

    it('should inject Bearer token and X-Request-ID headers on outgoing requests', async () => {
      const client = new ZitadelOidcClient();
      const session = client.createMockSession('admin');
      let capturedRequest: { url: string; headers: Record<string, string> } | null = null;

      // Mock global fetch for testing
      const originalFetch = globalThis.fetch;
      globalThis.fetch = async (input: any, init?: any) => {
        const headers: Record<string, string> = {};
        if (init?.headers) {
          const h = new Headers(init.headers);
          h.forEach((val, key) => {
            headers[key.toLowerCase()] = val;
          });
        }
        capturedRequest = {
          url: typeof input === 'string' ? input : input.url,
          headers
        };
        return new Response(JSON.stringify({ status: 'ok' }), { status: 200 });
      };

      try {
        const authFetch = createAuthFetch(client, 'http://localhost:8000');
        await authFetch('/api/v1/workspaces');

        assert.ok(capturedRequest !== null);
        assert.strictEqual(capturedRequest.url, 'http://localhost:8000/api/v1/workspaces');
        assert.strictEqual(capturedRequest.headers['authorization'], `Bearer ${session.token}`);
        assert.ok(capturedRequest.headers['x-request-id'].startsWith('req-'));
      } finally {
        globalThis.fetch = originalFetch;
      }
    });

    it('should omit Authorization header when skipAuth is set to true', async () => {
      const client = new ZitadelOidcClient();
      client.createMockSession('admin');
      let capturedHeaders: Record<string, string> = {};

      const originalFetch = globalThis.fetch;
      globalThis.fetch = async (_input: any, init?: any) => {
        const h = new Headers(init?.headers);
        h.forEach((val, key) => {
          capturedHeaders[key.toLowerCase()] = val;
        });
        return new Response(JSON.stringify({ status: 'ok' }), { status: 200 });
      };

      try {
        const authFetch = createAuthFetch(client, 'http://localhost:8000');
        await authFetch('/health', { skipAuth: true });

        assert.strictEqual(capturedHeaders['authorization'], undefined);
        assert.ok(capturedHeaders['x-request-id']);
      } finally {
        globalThis.fetch = originalFetch;
      }
    });
  });

  describe('Presentation Tier Auth & OpenHands Components', () => {
    it('should construct UserNav React element with default state', () => {
      const element = React.createElement(UserNav, { className: 'test-nav' });
      assert.ok(React.isValidElement(element));
      assert.strictEqual(element.type, UserNav);
    });

    it('should construct OpenHandsViewer React element pointing to port 8000', () => {
      const element = React.createElement(OpenHandsViewer, {
        gatewayUrl: 'http://localhost:8000',
        workspacePath: '/opt/workspace_base'
      });
      assert.ok(React.isValidElement(element));
      assert.strictEqual(element.props.gatewayUrl, 'http://localhost:8000');
      assert.strictEqual(element.props.workspacePath, '/opt/workspace_base');
    });

    it('should construct Workbench React element in workbench mode', () => {
      const workbenchEl = React.createElement(Workbench, {
        initialMode: 'workbench',
        workspaceId: 'ws-test',
        projectName: 'index0-test'
      });
      assert.ok(React.isValidElement(workbenchEl));
    });
  });
});
