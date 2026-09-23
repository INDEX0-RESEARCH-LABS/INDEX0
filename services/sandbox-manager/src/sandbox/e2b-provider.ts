/**
 * E2B Cloud MicroVM Sandbox Provider — @index0/sandbox-manager
 * Connects to E2B software execution microVMs via @e2b/code-interpreter SDK.
 */

import { Sandbox } from "@e2b/code-interpreter";
import type { SandboxLanguage } from "@index0/contracts";
import type { IExecutionOutput, ISandboxProvider, ISandboxSession } from "./types.js";

export class E2BSandboxSession implements ISandboxSession {
  public isClosed = false;

  constructor(
    public readonly id: string,
    private readonly sandbox: Sandbox
  ) {}

  async execute(
    code: string,
    language: SandboxLanguage,
    _envVars?: Record<string, string>
  ): Promise<IExecutionOutput> {
    if (this.isClosed) {
      throw new Error(`Cannot execute code in closed E2B session: ${this.id}`);
    }

    try {
      if (language === "python") {
        const execution = await this.sandbox.runCode(code, { language: "python" });
        const stdout = execution.logs.stdout.join("\n");
        const stderr = execution.logs.stderr.join("\n");
        const hasError = execution.error !== null && execution.error !== undefined;

        return {
          stdout,
          stderr: hasError ? `${stderr}\n${execution.error?.value || ""}` : stderr,
          exitCode: hasError ? 1 : 0,
          error: execution.error?.name
        };
      }

      // TypeScript / Bash executions via commands interface
      const command = language === "bash" ? code : `node -e ${JSON.stringify(code)}`;
      const result = await this.sandbox.commands.run(command);

      return {
        stdout: result.stdout,
        stderr: result.stderr,
        exitCode: result.exitCode ?? 0,
        error: result.error
      };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      return {
        stdout: "",
        stderr: errorMessage,
        exitCode: 1,
        error: errorMessage
      };
    }
  }

  async close(): Promise<void> {
    if (this.isClosed) return;
    try {
      await this.sandbox.kill();
    } finally {
      this.isClosed = true;
    }
  }
}

export class E2BSandboxProvider implements ISandboxProvider {
  public readonly name = "e2b" as const;
  public readonly supportsDesktop = false;

  constructor(private readonly apiKey: string) {}

  async createSession(options: {
    sessionId: string;
    timeoutMs: number;
    envVars?: Record<string, string>;
    desktop?: boolean;
  }): Promise<ISandboxSession> {
    if (options.desktop) {
      throw new Error("E2BSandboxProvider does not support desktop sessions. Use E2BDesktopProvider instead.");
    }

    const sandbox = await Sandbox.create({
      apiKey: this.apiKey,
      timeoutMs: options.timeoutMs,
      envs: options.envVars
    });

    return new E2BSandboxSession(options.sessionId, sandbox);
  }
}
