/**
 * Sandbox Execution Contracts — @index0/contracts/v1/sandbox
 * Authoritative schema definitions for microVM lifecycle, language specs, and execution results.
 */

export type SandboxLanguage = "python" | "typescript" | "bash";

export interface ISandboxRequest {
  id: string;
  code: string;
  language: SandboxLanguage;
  timeoutMs: number;
  environmentVariables?: Record<string, string>;
  cpuCount?: number;
  memoryMb?: number;
}

export interface ISandboxExecutionResult {
  id: string;
  exitCode: number;
  stdout: string;
  stderr: string;
  durationMs: number;
  error?: string;
  timedOut?: boolean;
}

export interface ISandboxQuotas {
  defaultTimeoutMs: number;
  maxTimeoutMs: number;
  maxMemoryMb: number;
  defaultCpuCount: number;
}

export const SANDBOX_QUOTAS: Readonly<ISandboxQuotas> = {
  defaultTimeoutMs: 30_000,
  maxTimeoutMs: 300_000,
  maxMemoryMb: 1024,
  defaultCpuCount: 1
};

export interface ISandboxHealthResponse {
  status: "healthy" | "degraded";
  activeSandboxes: number;
  timestamp: string;
}

export * from "./desktop.js";
