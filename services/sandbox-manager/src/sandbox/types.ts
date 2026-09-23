/**
 * Internal Sandbox Provider Contracts — @index0/sandbox-manager
 */

import type { SandboxLanguage } from "@index0/contracts";

// ---------------------------------------------------------------------------
// Provider Type Selection
// ---------------------------------------------------------------------------

/** Supported sandbox provider backends. */
export type SandboxProviderType = "e2b" | "firecracker" | "docker" | "mock";

// ---------------------------------------------------------------------------
// Execution Output
// ---------------------------------------------------------------------------

export interface IExecutionOutput {
  stdout: string;
  stderr: string;
  exitCode: number;
  error?: string;
  timedOut?: boolean;
}

// ---------------------------------------------------------------------------
// Sandbox Session (Base)
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Desktop-Capable Session (Extension)
// ---------------------------------------------------------------------------

/** Screenshot capture result from a desktop sandbox. */
export interface IDesktopScreenshot {
  /** Raw image data as a Buffer (PNG format). */
  data: Buffer;
  /** Screenshot width in pixels. */
  width: number;
  /** Screenshot height in pixels. */
  height: number;
  /** ISO-8601 timestamp of capture. */
  timestamp: string;
}

/**
 * Extended sandbox session with desktop automation capabilities.
 * Used by E2B Desktop and similar visual testing providers.
 */
export interface IDesktopCapableSession extends ISandboxSession {
  /** Whether this session supports desktop automation. */
  readonly supportsDesktop: true;

  /** Capture a screenshot of the desktop. */
  screenshot(): Promise<IDesktopScreenshot>;

  /** Click at the specified screen coordinates. */
  click(x: number, y: number): Promise<void>;

  /** Double-click at the specified screen coordinates. */
  doubleClick(x: number, y: number): Promise<void>;

  /** Type text into the focused element. */
  type(text: string): Promise<void>;

  /** Navigate the browser to the specified URL. */
  navigate(url: string): Promise<void>;

  /** Get the current screen dimensions. */
  getScreenSize(): Promise<{ width: number; height: number }>;
}

// ---------------------------------------------------------------------------
// Sandbox Provider
// ---------------------------------------------------------------------------

export interface ISandboxProvider {
  readonly name: SandboxProviderType;

  /** Whether this provider supports desktop automation sessions. */
  readonly supportsDesktop: boolean;

  createSession(options: {
    sessionId: string;
    timeoutMs: number;
    envVars?: Record<string, string>;
    /** Request a desktop-capable session (only if provider supports it). */
    desktop?: boolean;
  }): Promise<ISandboxSession>;
}

