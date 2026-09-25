/**
 * INDEX0 Client Harness — @index0/client-harness
 * Developer SDK and execution client for sandbox validation and benchmarking.
 */

import {
  SANDBOX_QUOTAS,
  type ISandboxRequest,
  type ISandboxExecutionResult,
  type ISandboxHealthResponse,
  type IApiResponse
} from '@index0/contracts';

export interface ISandboxClientOptions {
  baseUrl?: string;
  defaultTimeoutMs?: number;
}

export class SandboxClient {
  private readonly baseUrl: string;
  private readonly defaultTimeoutMs: number;

  constructor(options: ISandboxClientOptions = {}) {
    this.baseUrl = options.baseUrl ?? 'http://localhost:4001';
    this.defaultTimeoutMs = options.defaultTimeoutMs ?? SANDBOX_QUOTAS.defaultTimeoutMs;
  }

  /**
   * Execute code in the isolated sandbox environment.
   */
  async execute(request: ISandboxRequest): Promise<IApiResponse<ISandboxExecutionResult>> {
    const timeoutMs = request.timeoutMs ?? this.defaultTimeoutMs;

    const response = await fetch(`${this.baseUrl}/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Request-Source': 'index0-client-harness'
      },
      body: JSON.stringify({
        ...request,
        timeoutMs
      }),
      signal: AbortSignal.timeout(timeoutMs + 2000)
    });

    const body = (await response.json()) as IApiResponse<ISandboxExecutionResult>;
    return body;
  }

  /**
   * Check the health status of the sandbox manager service.
   */
  async checkHealth(): Promise<ISandboxHealthResponse> {
    const response = await fetch(`${this.baseUrl}/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    const body = (await response.json()) as ISandboxHealthResponse;
    return body;
  }

  /**
   * Simulate a mock sandbox execution in-memory without connecting to live backend.
   */
  simulateMockExecution(request: ISandboxRequest): ISandboxExecutionResult {
    const startTime = Date.now();

    if (request.timeoutMs > SANDBOX_QUOTAS.maxTimeoutMs) {
      return {
        id: request.id,
        exitCode: 124,
        stdout: '',
        stderr: `Timeout exceeded maximum allowed limit (${SANDBOX_QUOTAS.maxTimeoutMs}ms)`,
        durationMs: 5,
        timedOut: true,
        error: 'Execution exceeded maximum quota timeout'
      };
    }

    let stdout = '';
    let stderr = '';
    let exitCode = 0;

    if (request.code.includes('throw') || request.code.includes('raise ZeroDivisionError')) {
      exitCode = 1;
      stderr = 'Error: Simulated failure execution\n';
    } else {
      stdout = `[${request.language.toUpperCase()}] Execution output for: ${request.code.slice(0, 30)}...\n`;
    }

    const durationMs = Math.max(1, Date.now() - startTime);

    return {
      id: request.id,
      exitCode,
      stdout,
      stderr,
      durationMs,
      timedOut: false
    };
  }

  /**
   * Format an execution result with ANSI terminal colors for CLI presentation.
   */
  static formatResult(result: ISandboxExecutionResult): string {
    const isSuccess = result.exitCode === 0 && !result.timedOut;
    const isTimeout = !!result.timedOut;

    const statusBadge = isTimeout
      ? '\x1b[43m\x1b[30m TIMEOUT \x1b[0m'
      : isSuccess
      ? '\x1b[42m\x1b[30m SUCCESS \x1b[0m'
      : '\x1b[41m\x1b[37m FAILED \x1b[0m';

    const exitBadge = `Exit: ${result.exitCode}`;
    const durationBadge = `${result.durationMs}ms`;

    const lines: string[] = [
      `┌─────────────────────────────────────────────────────────────┐`,
      `│  ${statusBadge}  ID: \x1b[36m${result.id}\x1b[0m | ${exitBadge} | Duration: \x1b[33m${durationBadge}\x1b[0m`,
      `├─────────────────────────────────────────────────────────────┤`
    ];

    if (result.stdout) {
      lines.push(`│ \x1b[32mSTDOUT:\x1b[0m`);
      const stdoutLines = result.stdout.trim().split('\n');
      for (const line of stdoutLines) {
        lines.push(`│   ${line}`);
      }
    }

    if (result.stderr) {
      lines.push(`│ \x1b[31mSTDERR:\x1b[0m`);
      const stderrLines = result.stderr.trim().split('\n');
      for (const line of stderrLines) {
        lines.push(`│   ${line}`);
      }
    }

    if (result.error) {
      lines.push(`│ \x1b[35mDIAGNOSTICS:\x1b[0m ${result.error}`);
    }

    lines.push(`└─────────────────────────────────────────────────────────────┘`);
    return lines.join('\n');
  }
}

export * from './gnap.js';
export * from './filter.js';
export * from './worktree.js';
export * from './opencode.js';

