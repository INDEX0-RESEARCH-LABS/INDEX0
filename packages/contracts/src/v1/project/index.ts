/**
 * Project & Workspace Contracts — @index0/contracts/v1/project
 * Authoritative schema definitions for Projects, Repositories, Workspaces, and Agent Run Summaries.
 */

export type GitProvider = "github" | "gitlab" | "custom";

export interface IProject {
  id: string;
  organizationId: string;
  name: string;
  slug: string;
  description?: string;
  defaultBranch: string;
  createdAt: string;
  updatedAt: string;
}

export interface IRepository {
  id: string;
  projectId: string;
  remoteUrl: string;
  provider: GitProvider;
  defaultBranch: string;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
}

export type WorkspaceStatus = "idle" | "active" | "error" | "archived";

export interface IWorkspace {
  id: string;
  projectId: string;
  repositoryId?: string;
  branch: string;
  status: WorkspaceStatus;
  containerId?: string;
  portAllocations?: Record<string, number>;
  createdAt: string;
  updatedAt: string;
}

export type RunStatus = "pending" | "running" | "completed" | "failed" | "cancelled";

export interface IAgentRunSummary {
  id: string;
  workspaceId: string;
  prompt: string;
  status: RunStatus;
  model: string;
  durationMs?: number;
  totalTokens?: number;
  createdAt: string;
  completedAt?: string;
}
