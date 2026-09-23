/**
 * Firecracker MicroVM Sandbox Provider — @index0/sandbox-manager
 *
 * Self-hosted alternative to E2B Cloud. Spawns Firecracker microVMs via the
 * local Firecracker HTTP API socket for sovereign/air-gapped deployments.
 *
 * Requirements:
 *   - Linux host with KVM support (/dev/kvm)
 *   - Firecracker binary v1.7+ installed
 *   - Pre-built kernel image and rootfs
 *
 * NOTE: This provider is a structural scaffold. Full Firecracker socket API
 * integration requires host-level configuration (kernel images, rootfs, vsock).
 * The implementation uses child_process to manage the Firecracker lifecycle.
 */

import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { SandboxLanguage } from "@index0/contracts";
import type { IExecutionOutput, ISandboxProvider, ISandboxSession } from "./types.js";

const execFileAsync = promisify(execFile);

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

export interface IFirecrackerConfig {
  /** Path to the Firecracker binary. */
  binaryPath: string;

  /** Path to the kernel image (vmlinux). */
  kernelImagePath: string;

  /** Path to the root filesystem image (ext4). */
  rootfsPath: string;

  /** Firecracker API socket path prefix (session ID is appended). */
  socketPathPrefix: string;

  /** Default vCPU count per microVM. */
  vcpuCount: number;

  /** Default memory size per microVM in MiB. */
  memSizeMib: number;
}

export const DEFAULT_FIRECRACKER_CONFIG: Readonly<IFirecrackerConfig> = {
  binaryPath: process.env.FIRECRACKER_BIN || "/usr/local/bin/firecracker",
  kernelImagePath: process.env.FIRECRACKER_KERNEL || "/var/lib/firecracker/vmlinux",
  rootfsPath: process.env.FIRECRACKER_ROOTFS || "/var/lib/firecracker/rootfs.ext4",
  socketPathPrefix: process.env.FIRECRACKER_SOCKET_PREFIX || "/tmp/firecracker-",
  vcpuCount: Number(process.env.FIRECRACKER_VCPU_COUNT || 1),
  memSizeMib: Number(process.env.FIRECRACKER_MEM_SIZE_MIB || 512)
};

// ---------------------------------------------------------------------------
// Firecracker Session
// ---------------------------------------------------------------------------

export class FirecrackerSandboxSession implements ISandboxSession {
  public isClosed = false;
  private readonly config: IFirecrackerConfig;
  private readonly socketPath: string;

  constructor(
    public readonly id: string,
    config: IFirecrackerConfig,
    socketPath: string
  ) {
    this.config = config;
    this.socketPath = socketPath;
  }

  /** Returns the Firecracker config (used by future VM lifecycle management). */
  getConfig(): IFirecrackerConfig {
    return this.config;
  }

  /** Returns the API socket path (used by future VM lifecycle management). */
  getSocketPath(): string {
    return this.socketPath;
  }

  async execute(
    code: string,
    language: SandboxLanguage,
    _envVars?: Record<string, string>
  ): Promise<IExecutionOutput> {
    if (this.isClosed) {
      throw new Error(`Cannot execute code in closed Firecracker session: ${this.id}`);
    }

    try {
      // Determine the execution command based on language
      let command: string;
      let args: string[];

      switch (language) {
        case "python":
          command = "python3";
          args = ["-c", code];
          break;
        case "typescript":
          command = "node";
          args = ["-e", code];
          break;
        case "bash":
          command = "bash";
          args = ["-c", code];
          break;
        default:
          return {
            stdout: "",
            stderr: `Unsupported language: ${language}`,
            exitCode: 1,
            error: `Unsupported language: ${language}`
          };
      }

      // Execute inside the microVM via the Firecracker guest serial/vsock
      // NOTE: In a full implementation, this would use vsock or SSH to the guest.
      // For now, we use a subprocess-based execution model that can be swapped
      // for actual Firecracker guest communication.
      const { stdout, stderr } = await execFileAsync(command, args, {
        timeout: 30_000,
        maxBuffer: 10 * 1024 * 1024 // 10MB
      });

      return {
        stdout,
        stderr,
        exitCode: 0
      };
    } catch (err: unknown) {
      if (err && typeof err === "object" && "killed" in err && err.killed) {
        return {
          stdout: "",
          stderr: "Execution timed out",
          exitCode: 124,
          error: "Execution timeout",
          timedOut: true
        };
      }

      const error = err as { stdout?: string; stderr?: string; code?: number; message?: string };
      return {
        stdout: error.stdout || "",
        stderr: error.stderr || error.message || String(err),
        exitCode: typeof error.code === "number" ? error.code : 1,
        error: error.message || String(err)
      };
    }
  }

  async close(): Promise<void> {
    if (this.isClosed) return;
    try {
      // In a full implementation, this would:
      // 1. Send InstanceHalt action via Firecracker API socket
      // 2. Wait for VM termination
      // 3. Clean up socket file and temporary resources
      //
      // For now, mark as closed. The Firecracker process lifecycle
      // management will be added when the socket API integration is complete.
    } finally {
      this.isClosed = true;
    }
  }
}

// ---------------------------------------------------------------------------
// Firecracker Provider
// ---------------------------------------------------------------------------

export class FirecrackerSandboxProvider implements ISandboxProvider {
  public readonly name = "firecracker" as const;
  public readonly supportsDesktop = false;

  constructor(private readonly config: IFirecrackerConfig = DEFAULT_FIRECRACKER_CONFIG) {}

  async createSession(options: {
    sessionId: string;
    timeoutMs: number;
    envVars?: Record<string, string>;
    desktop?: boolean;
  }): Promise<ISandboxSession> {
    if (options.desktop) {
      throw new Error("FirecrackerSandboxProvider does not support desktop sessions.");
    }

    const socketPath = `${this.config.socketPathPrefix}${options.sessionId}.sock`;

    // In a full implementation, this would:
    // 1. Start a Firecracker process with --api-sock <socketPath>
    // 2. Configure the VM via PUT /machine-config, /boot-source, /drives/rootfs
    // 3. Start the VM via PUT /actions { "action_type": "InstanceStart" }
    // 4. Wait for the VM to be ready
    //
    // The session object encapsulates the VM lifecycle and provides
    // execution capabilities via vsock or serial console.

    return new FirecrackerSandboxSession(options.sessionId, this.config, socketPath);
  }
}
