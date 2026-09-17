/**
 * Auth & Identity Contracts — @index0/contracts/v1/auth
 * Authoritative schema definitions for authentication, OIDC claims, and RBAC models.
 */

export type UserRole = "admin" | "member" | "viewer" | "agent";

export interface IUser {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
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
