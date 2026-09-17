/**
 * Authenticated Gateway Fetch Wrapper — @index0/ide-web
 * Intercepts requests destined for Caddy API Gateway (port 8000), injecting Bearer tokens,
 * distributed tracing IDs (X-Request-ID), session credentials, and 401 retry handling.
 */

import { ZitadelOidcClient } from './oidcClient.js';

export interface IAuthFetchOptions extends RequestInit {
  skipAuth?: boolean;
  customToken?: string;
  requestId?: string;
}

export function generateRequestId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 9);
  return `req-${timestamp}-${randomPart}`;
}

/**
 * Creates an authenticated fetch function tied to a specific ZitadelOidcClient and Gateway base URL.
 */
export function createAuthFetch(
  oidcClient: ZitadelOidcClient,
  gatewayBaseUrl: string = 'http://localhost:8000'
) {
  return async function authFetch(
    input: string | URL | Request,
    init: IAuthFetchOptions = {}
  ): Promise<Response> {
    const { skipAuth = false, customToken, requestId = generateRequestId(), ...fetchInit } = init;

    // Resolve target URL
    let resolvedUrl: string;
    if (typeof input === 'string') {
      if (input.startsWith('http://') || input.startsWith('https://')) {
        resolvedUrl = input;
      } else {
        const cleanPath = input.startsWith('/') ? input : `/${input}`;
        resolvedUrl = `${gatewayBaseUrl.replace(/\/$/, '')}${cleanPath}`;
      }
    } else if (input instanceof URL) {
      resolvedUrl = input.toString();
    } else {
      resolvedUrl = input.url;
    }

    // Build headers
    const headers = new Headers(fetchInit.headers || {});
    headers.set('X-Request-ID', requestId);

    if (!skipAuth) {
      const token = customToken || oidcClient.getAccessToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
    }

    // Configure credentials pass-through for cookie-based session proxying (OpenHands/Zitadel)
    const options: RequestInit = {
      ...fetchInit,
      headers,
      credentials: fetchInit.credentials || 'include'
    };

    let response = await fetch(resolvedUrl, options);

    // If 401 Unauthorized and we have a refresh token, attempt transparent refresh and retry once
    if (response.status === 401 && !skipAuth && oidcClient.getRefreshToken()) {
      try {
        const { accessToken } = await oidcClient.refreshAccessToken();
        headers.set('Authorization', `Bearer ${accessToken}`);
        response = await fetch(resolvedUrl, {
          ...options,
          headers
        });
      } catch {
        // Refresh failed, return original 401
      }
    }

    return response;
  };
}
