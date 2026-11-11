/**
 * E2B Desktop Sandbox Provider — @index0/sandbox-manager
 *
 * Structural scaffold for future E2B desktop automation support.
 * NOT reachable from the provider factory (ExecutionService.createProvider).
 * NOT registered in the SANDBOX_PROVIDER env var switch.
 *
 * roadmap: wire to provider factory when @e2b/desktop is added as a dependency
 * and E2B_API_KEY grants desktop access. Until then this file is inert.
 */

import type { SandboxLanguage } from "@index0/contracts";
import type {
  IDesktopCapableSession,
  IDesktopScreenshot,
  IExecutionOutput,
  ISandboxProvider,
  ISandboxSession
} from "./types.js";

// ---------------------------------------------------------------------------
// Desktop Session Implementation
// ---------------------------------------------------------------------------

export class E2BDesktopSession implements IDesktopCapableSession {
  public isClosed = false;
  public readonly supportsDesktop = true as const;
  private readonly apiKey: string;

  constructor(
    public readonly id: string,
    apiKey: string
    // In full implementation: desktop: DesktopSandbox
  ) {
    this.apiKey = apiKey;
  }

  /** Returns the API key for SDK initialization (used by future @e2b/desktop integration). */
  getApiKey(): string {
    return this.apiKey;
  }

  async execute(
    code: string,
    language: SandboxLanguage,
    _envVars?: Record<string, string>
  ): Promise<IExecutionOutput> {
    if (this.isClosed) {
      throw new Error(`Cannot execute code in closed desktop session: ${this.id}`);
    }

    try {
      // In a full implementation with @e2b/desktop:
      // const result = await this.desktop.commands.run(command);
      //
      // For now, delegate to a basic command execution model:
      const command = language === "bash"
        ? code
        : language === "python"
          ? `python3 -c ${JSON.stringify(code)}`
          : `node -e ${JSON.stringify(code)}`;

      // Placeholder: actual execution would go through the E2B Desktop sandbox
      return {
        stdout: `[Desktop Session ${this.id}] Execution placeholder for: ${command.substring(0, 100)}`,
        stderr: "",
        exitCode: 0
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

  async screenshot(): Promise<IDesktopScreenshot> {
    if (this.isClosed) {
      throw new Error(`Cannot capture screenshot in closed desktop session: ${this.id}`);
    }

    // In a full implementation with @e2b/desktop:
    // const screenshot = await this.desktop.screenshot();
    // return { data: screenshot, width: 1920, height: 1080, timestamp: new Date().toISOString() };

    return {
      data: Buffer.from("placeholder-screenshot-data"),
      width: 1920,
      height: 1080,
      timestamp: new Date().toISOString()
    };
  }

  async click(x: number, y: number): Promise<void> {
    if (this.isClosed) {
      throw new Error(`Cannot click in closed desktop session: ${this.id}`);
    }

    // In a full implementation with @e2b/desktop:
    // await this.desktop.click({ x, y });
    void x;
    void y;
  }

  async doubleClick(x: number, y: number): Promise<void> {
    if (this.isClosed) {
      throw new Error(`Cannot double-click in closed desktop session: ${this.id}`);
    }

    // In a full implementation with @e2b/desktop:
    // await this.desktop.doubleClick({ x, y });
    void x;
    void y;
  }

  async type(text: string): Promise<void> {
    if (this.isClosed) {
      throw new Error(`Cannot type in closed desktop session: ${this.id}`);
    }

    // In a full implementation with @e2b/desktop:
    // await this.desktop.type(text);
    void text;
  }

  async navigate(url: string): Promise<void> {
    if (this.isClosed) {
      throw new Error(`Cannot navigate in closed desktop session: ${this.id}`);
    }

    // In a full implementation with @e2b/desktop:
    // await this.desktop.open(url);
    void url;
  }

  async getScreenSize(): Promise<{ width: number; height: number }> {
    if (this.isClosed) {
      throw new Error(`Cannot get screen size in closed desktop session: ${this.id}`);
    }

    // In a full implementation with @e2b/desktop:
    // const size = await this.desktop.getScreenSize();
    // return { width: size.width, height: size.height };
    return { width: 1920, height: 1080 };
  }

  async close(): Promise<void> {
    if (this.isClosed) return;
    try {
      // In a full implementation with @e2b/desktop:
      // await this.desktop.kill();
    } finally {
      this.isClosed = true;
    }
  }
}

// ---------------------------------------------------------------------------
// Desktop Provider
// ---------------------------------------------------------------------------

export class E2BDesktopProvider implements ISandboxProvider {
  public readonly name = "e2b" as const;
  public readonly supportsDesktop = true;

  constructor(private readonly apiKey: string) {}

  async createSession(options: {
    sessionId: string;
    timeoutMs: number;
    envVars?: Record<string, string>;
    desktop?: boolean;
  }): Promise<ISandboxSession> {
    // In a full implementation with @e2b/desktop:
    // const desktop = await DesktopSandbox.create({
    //   apiKey: this.apiKey,
    //   timeoutMs: options.timeoutMs,
    //   envs: options.envVars,
    //   resolution: [1920, 1080]
    // });
    // return new E2BDesktopSession(options.sessionId, this.apiKey, desktop);

    return new E2BDesktopSession(options.sessionId, this.apiKey);
  }
}
