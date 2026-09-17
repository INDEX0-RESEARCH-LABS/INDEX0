/**
 * Configuration Module — @index0/sandbox-manager
 * Authoritative environment settings and resource quota defaults.
 */

import dotenv from "dotenv";
import { SANDBOX_QUOTAS } from "@index0/contracts";

dotenv.config();

export interface ISandboxConfig {
  port: number;
  host: string;
  e2bApiKey?: string;
  defaultTimeoutMs: number;
  maxTimeoutMs: number;
  maxMemoryMb: number;
  defaultCpuCount: number;
}

export const config: Readonly<ISandboxConfig> = {
  port: Number(process.env.SANDBOX_MANAGER_PORT || 4001),
  host: process.env.SANDBOX_MANAGER_HOST || "0.0.0.0",
  e2bApiKey:
    process.env.E2B_API_KEY &&
    process.env.E2B_API_KEY !== "e2b_api_key_placeholder" &&
    process.env.E2B_API_KEY !== "YOUR_E2B_API_KEY"
      ? process.env.E2B_API_KEY
      : undefined,
  defaultTimeoutMs: Number(process.env.SANDBOX_DEFAULT_TIMEOUT_MS || SANDBOX_QUOTAS.defaultTimeoutMs),
  maxTimeoutMs: Number(process.env.SANDBOX_MAX_TIMEOUT_MS || SANDBOX_QUOTAS.maxTimeoutMs),
  maxMemoryMb: Number(process.env.SANDBOX_MAX_MEMORY_MB || SANDBOX_QUOTAS.maxMemoryMb),
  defaultCpuCount: Number(process.env.SANDBOX_MAX_CPU_CORES || SANDBOX_QUOTAS.defaultCpuCount)
};
