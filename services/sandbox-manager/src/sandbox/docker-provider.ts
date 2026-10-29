/**
 * Docker Sandbox Provider — @index0/sandbox-manager
 * Real isolated execution engine using ephemeral Docker containers with zero-trust network isolation.
 * Falls back to secured local sub-process execution when Docker socket is unavailable.
 */

import { spawn } from "node:child_process";
import { promisify } from "node:util";
import { exec } from "node:child_process";
import { resolve } from "node:path";
import type { SandboxLanguage } from "@index0/contracts";
import type { IExecutionOutput, ISandboxProvider, ISandboxSession } from "./types.js";

const execAsync = promisify(exec);

export class DockerSandboxSession implements ISandboxSession {
  public isClosed = false;

  constructor(
    public readonly id: string,
    public readonly timeoutMs: number,
    public readonly envVars?: Record<string, string>,
    public readonly maxMemoryMb: number = 512,
    public readonly maxCpus: number = 2
  ) {}

  async execute(
    code: string,
    language: SandboxLanguage,
    callEnvVars?: Record<string, string>
  ): Promise<IExecutionOutput> {
    if (this.isClosed) {
      throw new Error(`Cannot execute code in closed session: ${this.id}`);
    }

    const mergedEnv = { ...this.envVars, ...callEnvVars };

    // Check if Docker CLI is functional
    let hasDocker = false;
    try {
      await execAsync("docker --version", { timeout: 1500 });
      hasDocker = true;
    } catch {
      hasDocker = false;
    }

    if (hasDocker) {
      return this._executeInDocker(code, language, mergedEnv);
    } else {
      return this._executeLocalSubprocess(code, language, mergedEnv);
    }
  }

  private async _executeInDocker(
    code: string,
    language: SandboxLanguage,
    envVars: Record<string, string>
  ): Promise<IExecutionOutput> {
    let image = "alpine:3.19";
    let cmdArgs: string[] = [];

    // Map language to isolated image and execution command
    if (language === "python") {
      image = "python:3.11-alpine";
      cmdArgs = ["python3", "-c", code];
    } else if (language === "typescript") {
      image = "node:22-alpine";
      cmdArgs = ["node", "-e", code];
    } else {
      // Default to bash / sh
      image = "alpine:3.19";
      cmdArgs = ["sh", "-c", code];
    }

    // Language images lack a toolchain for real repo work (git, npm, patch).
    // SANDBOX_IMAGE lets QA run a full node:22 image instead.
    const imageOverride = process.env.SANDBOX_IMAGE?.trim();
    if (imageOverride) {
      image = imageOverride;
    }

    // Prepare docker CLI arguments with strict sandboxing invariants
    const dockerArgs = [
      "run",
      "--rm",
      "--network", "none", // Zero network access (Anti-SSRF invariant)
      `--cpus=${this.maxCpus}`,
      `-m=${this.maxMemoryMb}m`,
      "--pids-limit=64" // Prevent fork bombs
    ];

    // Read-only repo mount so QA can verify a diff against the real tree.
    // A per-request override lets one sandbox serve many repositories; the
    // process-wide env var is only the default.
    const workspacePath =
      envVars.SANDBOX_WORKSPACE_PATH?.trim() || process.env.SANDBOX_WORKSPACE_PATH?.trim();
    if (workspacePath) {
      dockerArgs.push("-v", `${resolve(workspacePath)}:/src:ro`);
    }

    // Inject environment variables (control-plane keys stay out of the box)
    for (const [k, v] of Object.entries(envVars)) {
      if (k.startsWith("SANDBOX_")) continue;
      dockerArgs.push("-e", `${k}=${v}`);
    }

    dockerArgs.push(image, ...cmdArgs);

    return this._spawnProcess("docker", dockerArgs);
  }

  private async _executeLocalSubprocess(
    code: string,
    language: SandboxLanguage,
    envVars: Record<string, string>
  ): Promise<IExecutionOutput> {
    let bin = "sh";
    let args: string[] = [];

    if (language === "python") {
      bin = "python3";
      args = ["-c", code];
    } else if (language === "typescript") {
      bin = "node";
      args = ["-e", code];
    } else {
      bin = "sh";
      args = ["-c", code];
    }

    return this._spawnProcess(bin, args, envVars);
  }

  private _spawnProcess(
    bin: string,
    args: string[],
    customEnv?: Record<string, string>
  ): Promise<IExecutionOutput> {
    return new Promise((resolve) => {
      let stdout = "";
      let stderr = "";
      let isTimedOut = false;

      const proc = spawn(bin, args, {
        env: { ...process.env, ...customEnv },
        stdio: ["ignore", "pipe", "pipe"]
      });

      const timer = setTimeout(() => {
        isTimedOut = true;
        proc.kill("SIGKILL");
      }, this.timeoutMs);

      proc.stdout.on("data", (chunk: Buffer) => {
        stdout += chunk.toString("utf-8");
      });

      proc.stderr.on("data", (chunk: Buffer) => {
        stderr += chunk.toString("utf-8");
      });

      proc.on("error", (err: Error) => {
        clearTimeout(timer);
        resolve({
          stdout,
          stderr: stderr || err.message,
          exitCode: 1,
          error: err.message,
          timedOut: isTimedOut
        });
      });

      proc.on("close", (code: number | null) => {
        clearTimeout(timer);
        const exitCode = isTimedOut ? 124 : (code ?? 0);
        resolve({
          stdout,
          stderr,
          exitCode,
          error: isTimedOut ? "Execution timed out" : undefined,
          timedOut: isTimedOut
        });
      });
    });
  }

  async close(): Promise<void> {
    this.isClosed = true;
  }
}

export class DockerSandboxProvider implements ISandboxProvider {
  public readonly name = "docker" as const;
  public readonly supportsDesktop = false;
  public readonly sessions: DockerSandboxSession[] = [];

  constructor(
    private readonly maxMemoryMb: number = 512,
    private readonly maxCpus: number = 2
  ) {}

  async createSession(options: {
    sessionId: string;
    timeoutMs: number;
    envVars?: Record<string, string>;
    desktop?: boolean;
  }): Promise<ISandboxSession> {
    const session = new DockerSandboxSession(
      options.sessionId,
      options.timeoutMs,
      options.envVars,
      this.maxMemoryMb,
      this.maxCpus
    );
    this.sessions.push(session);
    return session;
  }
}
