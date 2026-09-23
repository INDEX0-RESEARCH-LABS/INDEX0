/**
 * Configuration Module — @index0/sandbox-manager
 * Authoritative environment settings and resource quota defaults.
 */

import dotenv from "dotenv";
import { SANDBOX_QUOTAS } from "@index0/contracts";
import type { SandboxProviderType } from "./sandbox/types.js";

dotenv.config();

export interface ISandboxConfig {
  port: number;
  host: string;

  /** Active sandbox provider backend. */
  provider: SandboxProviderType;

  /** E2B Cloud configuration. */
  e2bApiKey?: string;

  /** Firecracker self-hosted configuration. */
  firecrackerBin?: string;
  firecrackerKernel?: string;
  firecrackerRootfs?: string;

  /** Resource quotas. */
  defaultTimeoutMs: number;
  maxTimeoutMs: number;
  maxMemoryMb: number;
  defaultCpuCount: number;
}

/**
 * Determine the sandbox provider from environment configuration.
 * Priority: explicit SANDBOX_PROVIDER env → auto-detect from available credentials.
 */
function resolveProvider(): SandboxProviderType {
  const explicit = process.env.SANDBOX_PROVIDER as SandboxProviderType | undefined;
  if (explicit && ["e2b", "firecracker", "docker", "mock"].includes(explicit)) {
    return explicit;
  }

  // Auto-detect: if E2B API key is configured, use E2B; otherwise fall back to mock
  const e2bKey = process.env.E2B_API_KEY;
  if (e2bKey && e2bKey !== "e2b_api_key_placeholder" && e2bKey !== "YOUR_E2B_API_KEY") {
    return "e2b";
  }

  return "mock";
}

export const config: Readonly<ISandboxConfig> = {
  port: Number(process.env.SANDBOX_MANAGER_PORT || 4001),
  host: process.env.SANDBOX_MANAGER_HOST || "0.0.0.0",
  provider: resolveProvider(),
  e2bApiKey:
    process.env.E2B_API_KEY &&
    process.env.E2B_API_KEY !== "e2b_api_key_placeholder" &&
    process.env.E2B_API_KEY !== "YOUR_E2B_API_KEY"
      ? process.env.E2B_API_KEY
      : undefined,
  firecrackerBin: process.env.FIRECRACKER_BIN || undefined,
  firecrackerKernel: process.env.FIRECRACKER_KERNEL || undefined,
  firecrackerRootfs: process.env.FIRECRACKER_ROOTFS || undefined,
  defaultTimeoutMs: Number(process.env.SANDBOX_DEFAULT_TIMEOUT_MS || SANDBOX_QUOTAS.defaultTimeoutMs),
  maxTimeoutMs: Number(process.env.SANDBOX_MAX_TIMEOUT_MS || SANDBOX_QUOTAS.maxTimeoutMs),
  maxMemoryMb: Number(process.env.SANDBOX_MAX_MEMORY_MB || SANDBOX_QUOTAS.maxMemoryMb),
  defaultCpuCount: Number(process.env.SANDBOX_MAX_CPU_CORES || SANDBOX_QUOTAS.defaultCpuCount)
};

