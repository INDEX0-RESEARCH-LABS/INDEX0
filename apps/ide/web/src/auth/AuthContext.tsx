/**
 * Auth Context & Provider — @index0/ide-web
 * React Context providing OIDC authentication state, RBAC authorization, and Gateway token management.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type {
  UserRole,
  IUser,
  IOrganization,
  IJwtClaims,
  ITenantContext,
  Permission
} from '@index0/contracts';
import {
  ZitadelOidcClient,
  resolvePermissions,
  isTokenExpired,
  type IZitadelOidcConfig
} from './oidcClient.js';
import { createAuthFetch, type IAuthFetchOptions } from './authFetch.js';

export interface IAuthState {
  user: IUser | null;
  organization: IOrganization | null;
  tenantContext: ITenantContext | null;
  token: string | null;
  roles: UserRole[];
  permissions: readonly Permission[];
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface IAuthContextValue extends IAuthState {
  login: () => Promise<void>;
  logout: () => Promise<void>;
  handleCallback: (code: string, state: string) => Promise<void>;
  refreshToken: () => Promise<string | null>;
  hasRole: (role: UserRole) => boolean;
  hasPermission: (permission: Permission) => boolean;
  loginAsDemoUser: (role?: UserRole) => void;
  authFetch: (input: string | URL | Request, init?: IAuthFetchOptions) => Promise<Response>;
  oidcClient: ZitadelOidcClient;
}

const AuthContext = createContext<IAuthContextValue | null>(null);

export interface IAuthProviderProps {
  children: React.ReactNode;
  config?: Partial<IZitadelOidcConfig>;
  gatewayBaseUrl?: string;
  initialDemoRole?: UserRole;
  enableAutoMock?: boolean;
}

export const AuthProvider: React.FC<IAuthProviderProps> = ({
  children,
  config,
  gatewayBaseUrl = 'http://localhost:8000',
  initialDemoRole,
  enableAutoMock = true
}) => {
  const oidcClient = useMemo(() => new ZitadelOidcClient(config), [config]);
  const authFetch = useMemo(() => createAuthFetch(oidcClient, gatewayBaseUrl), [oidcClient, gatewayBaseUrl]);

  const [state, setState] = useState<IAuthState>(() => {
    // Check for existing demo or stored session
    if (initialDemoRole) {
      const mock = oidcClient.createMockSession(initialDemoRole);
      return {
        user: mock.user,
        organization: mock.organization,
        tenantContext: mock.tenantContext,
        token: mock.token,
        roles: mock.claims.roles,
        permissions: resolvePermissions(mock.claims.roles),
        isAuthenticated: true,
        isLoading: false,
        error: null
      };
    }
    return {
      user: null,
      organization: null,
      tenantContext: null,
      token: null,
      roles: [],
      permissions: [],
      isAuthenticated: false,
      isLoading: true,
      error: null
    };
  });

  // Schedule silent token refresh
  const scheduleTokenRefresh = useCallback((claims: IJwtClaims) => {
    if (!claims.exp) return;
    const nowSeconds = Math.floor(Date.now() / 1000);
    const refreshDelayMs = Math.max(1000, (claims.exp - nowSeconds - 60) * 1000);

    const timer = setTimeout(async () => {
      try {
        if (oidcClient.getRefreshToken()) {
          const result = await oidcClient.refreshAccessToken();
          setState((prev) => ({
            ...prev,
            token: result.accessToken,
            roles: result.claims.roles,
            permissions: resolvePermissions(result.claims.roles)
          }));
          scheduleTokenRefresh(result.claims);
        }
      } catch (err: any) {
        console.warn('Silent token refresh failed:', err);
      }
    }, refreshDelayMs);

    return () => clearTimeout(timer);
  }, [oidcClient]);

  // Initialize session on mount
  useEffect(() => {
    if (initialDemoRole) return;

    const storedToken = oidcClient.getAccessToken();
    if (storedToken && !isTokenExpired(storedToken)) {
      try {
        const mock = oidcClient.createMockSession('admin');
        setState({
          user: mock.user,
          organization: mock.organization,
          tenantContext: mock.tenantContext,
          token: storedToken,
          roles: mock.claims.roles,
          permissions: resolvePermissions(mock.claims.roles),
          isAuthenticated: true,
          isLoading: false,
          error: null
        });
        scheduleTokenRefresh(mock.claims);
        return;
      } catch {
        oidcClient.clearTokens();
      }
    }

    // If auto-mock enabled in development environments without active OIDC provider
    if (enableAutoMock) {
      const mock = oidcClient.createMockSession('admin');
      setState({
        user: mock.user,
        organization: mock.organization,
        tenantContext: mock.tenantContext,
        token: mock.token,
        roles: mock.claims.roles,
        permissions: resolvePermissions(mock.claims.roles),
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
      return;
    }

    setState((prev) => ({ ...prev, isLoading: false }));
  }, [oidcClient, initialDemoRole, enableAutoMock, scheduleTokenRefresh]);

  const login = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const { authorizationUrl, codeVerifier, state: oidcState } = await oidcClient.createAuthorizationRequest();
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem('index0_code_verifier', codeVerifier);
        sessionStorage.setItem('index0_oidc_state', oidcState);
      }
      if (typeof window !== 'undefined') {
        window.location.href = authorizationUrl;
      }
    } catch (err: any) {
      setState((prev) => ({ ...prev, isLoading: false, error: err.message || 'Login initiation failed' }));
    }
  }, [oidcClient]);

  const handleCallback = useCallback(async (code: string, returnedState: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      let codeVerifier = '';
      if (typeof sessionStorage !== 'undefined') {
        const savedState = sessionStorage.getItem('index0_oidc_state');
        if (savedState && savedState !== returnedState) {
          throw new Error('OIDC state mismatch (CSRF detected)');
        }
        codeVerifier = sessionStorage.getItem('index0_code_verifier') || '';
      }

      const result = await oidcClient.exchangeCodeForTokens(code, codeVerifier);
      const mock = oidcClient.createMockSession(result.claims.roles[0] || 'member');

      setState({
        user: mock.user,
        organization: mock.organization,
        tenantContext: mock.tenantContext,
        token: result.accessToken,
        roles: result.claims.roles,
        permissions: resolvePermissions(result.claims.roles),
        isAuthenticated: true,
        isLoading: false,
        error: null
      });

      scheduleTokenRefresh(result.claims);
    } catch (err: any) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: err.message || 'Callback token exchange failed'
      }));
    }
  }, [oidcClient, scheduleTokenRefresh]);

  const logout = useCallback(async () => {
    oidcClient.clearTokens();
    setState({
      user: null,
      organization: null,
      tenantContext: null,
      token: null,
      roles: [],
      permissions: [],
      isAuthenticated: false,
      isLoading: false,
      error: null
    });
    if (typeof window !== 'undefined' && config?.postLogoutRedirectUri) {
      window.location.href = config.postLogoutRedirectUri;
    }
  }, [oidcClient, config]);

  const refreshToken = useCallback(async (): Promise<string | null> => {
    try {
      const result = await oidcClient.refreshAccessToken();
      setState((prev) => ({
        ...prev,
        token: result.accessToken,
        roles: result.claims.roles,
        permissions: resolvePermissions(result.claims.roles)
      }));
      return result.accessToken;
    } catch (err: any) {
      setState((prev) => ({ ...prev, error: err.message || 'Token refresh failed' }));
      return null;
    }
  }, [oidcClient]);

  const loginAsDemoUser = useCallback((role: UserRole = 'admin') => {
    const mock = oidcClient.createMockSession(role);
    setState({
      user: mock.user,
      organization: mock.organization,
      tenantContext: mock.tenantContext,
      token: mock.token,
      roles: mock.claims.roles,
      permissions: resolvePermissions(mock.claims.roles),
      isAuthenticated: true,
      isLoading: false,
      error: null
    });
  }, [oidcClient]);

  const hasRole = useCallback((role: UserRole) => state.roles.includes(role), [state.roles]);
  const hasPermission = useCallback((perm: Permission) => state.permissions.includes(perm), [state.permissions]);

  const contextValue = useMemo<IAuthContextValue>(() => ({
    ...state,
    login,
    logout,
    handleCallback,
    refreshToken,
    hasRole,
    hasPermission,
    loginAsDemoUser,
    authFetch,
    oidcClient
  }), [state, login, logout, handleCallback, refreshToken, hasRole, hasPermission, loginAsDemoUser, authFetch, oidcClient]);

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export function useAuth(): IAuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
