/**
 * Internal Sandbox Provider Contracts — @index0/sandbox-manager
 */

import type { SandboxLanguage } from "@index0/contracts";

export interface IExecutionOutput {
  stdout: string;
  stderr: string;
  exitCode: number;
  error?: string;
  timedOut?: boolean;
}

export interface ISandboxSession {
  readonly id: string;
  readonly isClosed: boolean;
  execute(
    code: string,
    language: SandboxLanguage,
    envVars?: Record<string, string>
  ): Promise<IExecutionOutput>;
  close(): Promise<void>;
}

export interface ISandboxProvider {
  readonly name: string;
  createSession(options: {
    sessionId: string;
    timeoutMs: number;
    envVars?: Record<string, string>;
  }): Promise<ISandboxSession>;
}
