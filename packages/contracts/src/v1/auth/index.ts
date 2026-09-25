/**
 * Auth & Identity Contracts — @index0/contracts/v1/auth
 * Authoritative schema definitions for authentication, OIDC claims, and RBAC models.
 */

export type UserRole = "admin" | "member" | "viewer" | "agent";

export type SocialAuthProvider = "github" | "google";

export interface IUser {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  emailVerified: boolean;
  phoneNumber?: string;
  phoneVerified: boolean;
  phoneVerifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IAccount {
  id: string;
  userId: string;
  provider: SocialAuthProvider;
  providerAccountId: string;
  refreshToken?: string;
  accessToken?: string;
  expiresAt?: number;
  tokenType?: string;
  scope?: string;
  idToken?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IPhoneOtpSendRequest {
  phoneNumber: string; // E.164 format (e.g. +919876543210)
}

export interface IPhoneOtpSendResponse {
  success: boolean;
  expiresInSeconds: number;
  message: string;
}

export interface IPhoneOtpVerifyRequest {
  phoneNumber: string;
  otp: string; // 6-digit OTP code
}

export interface IPhoneOtpVerifyResponse {
  success: boolean;
  message: string;
  phoneVerified: boolean;
  user?: Partial<IUser>;
}

export interface IOrganization {
  id: string;
  name: string;
  slug: string;
  planTier: "free" | "pro" | "enterprise";
  createdAt: string;
  updatedAt: string;
}

export interface IMembership {
  id: string;
  userId: string;
  organizationId: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface IJwtClaims {
  sub: string;
  orgId: string;
  email: string;
  roles: UserRole[];
  exp: number;
  iat: number;
  iss: string;
  aud?: string;
}

export interface ITenantContext {
  tenantId: string;
  userId: string;
  role: UserRole;
}

export type Permission =
  | "project:read"
  | "project:write"
  | "project:delete"
  | "agent:execute"
  | "agent:manage"
  | "billing:read"
  | "billing:write"
  | "settings:read"
  | "settings:write";

export const DEFAULT_ROLE_PERMISSIONS: Record<UserRole, readonly Permission[]> = {
  admin: [
    "project:read",
    "project:write",
    "project:delete",
    "agent:execute",
    "agent:manage",
    "billing:read",
    "billing:write",
    "settings:read",
    "settings:write"
  ],
  member: [
    "project:read",
    "project:write",
    "agent:execute",
    "billing:read",
    "settings:read"
  ],
  viewer: [
    "project:read",
    "settings:read"
  ],
  agent: [
    "project:read",
    "project:write",
    "agent:execute"
  ]
};
