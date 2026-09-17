/**
 * Execution Service — @index0/sandbox-manager
 * Orchestrates the mandatory 5-stage lifecycle:
 * create → execute → capture result → telemetry → cleanup
 * with guaranteed microVM teardown inside the finally block.
 */

import type {
  ISandboxRequest,
  ISandboxExecutionResult,
  ISandboxHealthResponse
} from "@index0/contracts";
import { SANDBOX_QUOTAS } from "@index0/contracts";
import type { ISandboxProvider, ISandboxSession } from "../sandbox/types.js";
import { MockSandboxProvider } from "../sandbox/mock-provider.js";
import { E2BSandboxProvider } from "../sandbox/e2b-provider.js";
import { config } from "../config.js";

export class ExecutionService {
  private readonly provider: ISandboxProvider;
  private activeSandboxesCount = 0;

  constructor(customProvider?: ISandboxProvider) {
    if (customProvider) {
      this.provider = customProvider;
    } else if (config.e2bApiKey) {
      this.provider = new E2BSandboxProvider(config.e2bApiKey);
    } else {
      this.provider = new MockSandboxProvider();
    }
  }

  getProviderName(): string {
    return this.provider.name;
  }

  getActiveSandboxesCount(): number {
    return this.activeSandboxesCount;
  }

  getHealth(): ISandboxHealthResponse {
    return {
      status: "healthy",
      activeSandboxes: this.activeSandboxesCount,
      timestamp: new Date().toISOString()
    };
  }

  async execute(request: ISandboxRequest): Promise<ISandboxExecutionResult> {
    const startTime = Date.now();
    const timeoutMs = Math.min(
      Math.max(100, request.timeoutMs || config.defaultTimeoutMs),
      config.maxTimeoutMs || SANDBOX_QUOTAS.maxTimeoutMs
    );

    let session: ISandboxSession | null = null;
    let result: ISandboxExecutionResult;

    try {
      // 1. CREATE: Provision isolated microVM session
      session = await this.provider.createSession({
        sessionId: request.id,
        timeoutMs,
        envVars: request.environmentVariables
      });
      this.activeSandboxesCount++;

      // 2. EXECUTE: Run code inside microVM with timeout protection
      const executionPromise = session.execute(
        request.code,
        request.language,
        request.environmentVariables
      );

      // Race execution against hard timeout
      let timeoutHandle: NodeJS.Timeout | null = null;
      const timeoutPromise = new Promise<{ timedOut: true }>((resolve) => {
        timeoutHandle = setTimeout(() => resolve({ timedOut: true }), timeoutMs);
      });

      const outcome = await Promise.race([executionPromise, timeoutPromise]);
      if (timeoutHandle) clearTimeout(timeoutHandle);

      const durationMs = Date.now() - startTime;

      if ("timedOut" in outcome && outcome.timedOut) {
        result = {
          id: request.id,
          exitCode: 124,
          stdout: "",
          stderr: `Execution timed out after ${timeoutMs}ms`,
          durationMs,
          error: "Execution timeout",
          timedOut: true
        };
      } else {
        const output = outcome as {
          stdout: string;
          stderr: string;
          exitCode: number;
          error?: string;
          timedOut?: boolean;
        };
        result = {
          id: request.id,
          exitCode: output.exitCode,
          stdout: output.stdout,
          stderr: output.stderr,
          durationMs,
          error: output.error,
          timedOut: output.timedOut || false
        };
      }

      // 3. TELEMETRY: Record execution metrics log (Principle 13)
      this.emitTelemetry(request, result, durationMs);

      return result;
    } catch (err: unknown) {
      const durationMs = Date.now() - startTime;
      const errorMessage = err instanceof Error ? err.message : String(err);

      result = {
        id: request.id,
        exitCode: 1,
        stdout: "",
        stderr: `Execution failure: ${errorMessage}`,
        durationMs,
        error: errorMessage,
        timedOut: false
      };

      this.emitTelemetry(request, result, durationMs);
      return result;
    } finally {
      // 4. CLEANUP (MANDATORY): Always terminate session in finally block
      if (session) {
        try {
          await session.close();
        } catch (cleanupError) {
          console.error(
            `[SandboxManager] Teardown error for session ${request.id}:`,
            cleanupError
          );
        } finally {
          this.activeSandboxesCount = Math.max(0, this.activeSandboxesCount - 1);
        }
      }
    }
  }

  private emitTelemetry(
    request: ISandboxRequest,
    result: ISandboxExecutionResult,
    durationMs: number
  ): void {
    // Structured telemetry event log
    const telemetryEvent = {
      eventId: `telemetry_${request.id}`,
      type: "sandbox.executed",
      timestamp: new Date().toISOString(),
      data: {
        requestId: request.id,
        language: request.language,
        exitCode: result.exitCode,
        durationMs,
        timedOut: result.timedOut,
        hasError: Boolean(result.error),
        provider: this.provider.name
      }
    };
    // Emit to stdout in structured JSON format
    if (process.env.NODE_ENV !== "test") {
      console.log(JSON.stringify(telemetryEvent));
    }
  }
}
