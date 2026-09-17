/**
 * Mock Sandbox Provider — @index0/sandbox-manager
 * Deterministic sandbox session implementation for testing, CI, and offline development.
 */

import type { SandboxLanguage } from "@index0/contracts";
import type { IExecutionOutput, ISandboxProvider, ISandboxSession } from "./types.js";

export class MockSandboxSession implements ISandboxSession {
  public isClosed = false;
  public executedCalls: Array<{ code: string; language: SandboxLanguage }> = [];

  constructor(
    public readonly id: string,
    public readonly timeoutMs: number,
    public readonly envVars?: Record<string, string>
  ) {}

  async execute(
    code: string,
    language: SandboxLanguage,
    _envVars?: Record<string, string>
  ): Promise<IExecutionOutput> {
    if (this.isClosed) {
      throw new Error(`Cannot execute code in closed session: ${this.id}`);
    }

    this.executedCalls.push({ code, language });

    // Simulate simulated exceptions or errors
    if (code.includes("raise Exception") || code.includes("throw new Error") || code.includes("exit 1")) {
      return {
        stdout: "",
        stderr: "Simulated runtime error: execution failure\n",
        exitCode: 1,
        error: "Execution terminated with non-zero exit code"
      };
    }

    // Simulate simulated timeout
    if (code.includes("__SIMULATE_TIMEOUT__")) {
      return {
        stdout: "",
        stderr: "Execution timed out\n",
        exitCode: 124,
        error: "Execution timed out",
        timedOut: true
      };
    }

    // Simulate Python print expressions
    if (language === "python") {
      if (code.includes("print(2+2)") || code.includes("print(2 + 2)")) {
        return {
          stdout: "4\n",
          stderr: "",
          exitCode: 0
        };
      }
      if (code.includes("print(") && code.includes(")")) {
        const match = code.match(/print\((?:'|")?(.*?)(?:'|")?\)/);
        const output = match ? match[1] : code;
        return {
          stdout: `${output}\n`,
          stderr: "",
          exitCode: 0
        };
      }
    }

    // Simulate TypeScript / JS console.log
    if (language === "typescript") {
      if (code.includes("console.log(2+2)") || code.includes("console.log(2 + 2)")) {
        return {
          stdout: "4\n",
          stderr: "",
          exitCode: 0
        };
      }
      if (code.includes("console.log(")) {
        const match = code.match(/console\.log\((?:'|")?(.*?)(?:'|")?\)/);
        const output = match ? match[1] : code;
        return {
          stdout: `${output}\n`,
          stderr: "",
          exitCode: 0
        };
      }
    }

    // Simulate Bash echo
    if (language === "bash") {
      if (code.includes("echo ")) {
        const output = code.replace(/echo\s+/, "").replace(/["']/g, "").trim();
        return {
          stdout: `${output}\n`,
          stderr: "",
          exitCode: 0
        };
      }
    }

    // Default successful execution
    return {
      stdout: "Executed successfully\n",
      stderr: "",
      exitCode: 0
    };
  }

  async close(): Promise<void> {
    this.isClosed = true;
  }
}

export class MockSandboxProvider implements ISandboxProvider {
  public readonly name = "mock";
  public readonly sessions: MockSandboxSession[] = [];

  async createSession(options: {
    sessionId: string;
    timeoutMs: number;
    envVars?: Record<string, string>;
  }): Promise<ISandboxSession> {
    const session = new MockSandboxSession(options.sessionId, options.timeoutMs, options.envVars);
    this.sessions.push(session);
    return session;
  }

  getActiveSessions(): MockSandboxSession[] {
    return this.sessions.filter((s) => !s.isClosed);
  }
}
