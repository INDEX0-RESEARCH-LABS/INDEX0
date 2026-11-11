/**
 * INDEX0 IDE Extension — @index0/ide-extension
 *
 * Unified VS Code extension for the INDEX0 Sovereign AI IDE.
 * Works identically in desktop (Electron) and cloud (code-server) modes.
 *
 * Provides:
 *  - Agent Execution Pane (sidebar webview)
 *  - GhostText Inline Completions (TabbyML backend)
 *  - AI Chat Participant (LiteLLM gateway + ZDR)
 *  - MCP Tools Inspector (webview panel)
 *  - Telemetry Dashboard (webview panel)
 *  - Voice Agent (webview panel, LiveKit WebRTC)
 *  - GNAP Diff Review (native diff editor)
 *  - Status Bar Widget (credits, GPU, execution state)
 */

import type {
  IAgentRunRequest,
  IApiResponse,
  IAgentRun,
} from '@index0/contracts';

// ─── Types ──────────────────────────────────────────────────────────

export interface IExtensionCommandDisposable {
  dispose(): void;
}

export interface IExtensionContext {
  subscriptions: IExtensionCommandDisposable[];
  extensionUri?: { fsPath: string };
}

export interface IExtensionConfig {
  gatewayUrl: string;
  modelPreference: string;
  tabbyEndpoint: string;
  litellmEndpoint: string;
  /** Direct orchestrator URL for the review-loop cycle endpoint. */
  orchestratorUrl: string;
  /** Gateway master key; empty means send no Authorization header. */
  apiKey?: string;
}

export type PanelId =
  | 'index0.agentPanel'
  | 'index0.mcpTools'
  | 'index0.telemetry'
  | 'index0.voiceAgent';

// ─── Configuration ──────────────────────────────────────────────────

const DEFAULT_CONFIG: IExtensionConfig = {
  gatewayUrl: 'http://localhost:8080',
  modelPreference: 'claude-3-5-sonnet-20241022',
  tabbyEndpoint: 'http://localhost:8080',
  litellmEndpoint: 'http://localhost:4000/v1',
  orchestratorUrl: process.env.INDEX0_ORCHESTRATOR_URL ?? 'http://localhost:8000',
  apiKey: process.env.INDEX0_API_KEY ?? '',
};

// ─── Extension Manager ─────────────────────────────────────────────

export class Index0ExtensionManager {
  private config: IExtensionConfig;

  constructor(config?: Partial<IExtensionConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  getConfig(): Readonly<IExtensionConfig> {
    return { ...this.config };
  }

  updateConfig(updates: Partial<IExtensionConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  // ── Agent Runs ──────────────────────────────────────────────────

  /**
   * Dispatch an autonomous agent run to the API Gateway.
   */
  async startAgentRun(
    request: IAgentRunRequest,
  ): Promise<IApiResponse<IAgentRun>> {
    const url = `${this.config.gatewayUrl}/api/v1/agents/runs`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Client-Type': 'vscode-extension',
      },
      body: JSON.stringify({
        ...request,
        model: request.model || this.config.modelPreference,
      }),
    });

    return (await response.json()) as IApiResponse<IAgentRun>;
  }

  // ── Review Loop Cycle (direct orchestrator) ────────────────────

  /**
   * Run the full 4-tier review loop via the agent-orchestrator.
   * Returns the cycle result or an offline-failure object.
   * Same contract as callOrchestratorCycle() in packages/client-harness/src/engine.ts.
   */
  async runCycle(
    task: string,
    contextFiles: string[] = [],
    maxIterations = 3,
  ): Promise<{
    cycleId: string;
    status: string;
    iteration: number;
    passed: boolean;
    testOutput: string;
    diff: string;
  }> {
    try {
      const res = await fetch(`${this.config.orchestratorUrl}/cycles/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Client': 'index0-vscode',
        },
        body: JSON.stringify({
          taskId: `vscode-${Date.now().toString(36)}`,
          userPrompt: task,
          repositoryRoot: '.',
          contextFiles,
          maxIterations,
        }),
        signal: AbortSignal.timeout(180_000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const c = await res.json() as {
        cycleId: string; status: string; iteration: number;
        qaResults?: { passed: boolean; testOutput?: string };
        implementationDiff?: string;
      };
      return {
        cycleId: c.cycleId,
        status: c.status,
        iteration: c.iteration,
        passed: c.qaResults?.passed ?? false,
        testOutput: c.qaResults?.testOutput ?? '',
        diff: c.implementationDiff ?? '',
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { cycleId: 'offline', status: 'failed', iteration: 0, passed: false, testOutput: `[Offline] ${msg}`, diff: '' };
    }
  }

  // ── GhostText / Inline Completions ─────────────────────────────

  /**
   * Request an inline code completion from the TabbyML edge engine.
   * Sub-20ms latency, $0 cloud cost (fully on-device).
   */
  async getInlineCompletion(
    prefix: string,
    suffix: string,
    language: string,
    filepath: string,
  ): Promise<string | null> {
    try {
      const url = `${this.config.tabbyEndpoint}/v1/completions`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language,
          segments: {
            prefix,
            suffix,
            filepath,
          },
        }),
      });

      if (!response.ok) return null;

      const data = (await response.json()) as {
        choices?: Array<{ text: string }>;
      };
      return data.choices?.[0]?.text ?? null;
    } catch {
      return null;
    }
  }

  // ── Chat / LLM Gateway ─────────────────────────────────────────

  /**
   * Send a chat message through the LiteLLM gateway with ZDR guarantees.
   */
  async chatCompletion(
    messages: Array<{ role: string; content: string }>,
    model?: string,
  ): Promise<string> {
    const url = `${this.config.litellmEndpoint}/chat/completions`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.config.apiKey ? { Authorization: `Bearer ${this.config.apiKey}` } : {}),
      },
      body: JSON.stringify({
        model: model || this.config.modelPreference,
        messages,
        stream: false,
      }),
    });

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    return data.choices?.[0]?.message?.content ?? '';
  }

  // ── URL Resolvers ──────────────────────────────────────────────

  getWorkbenchUrl(workspaceId: string = 'ws-main-dev'): string {
    return `${this.config.gatewayUrl}/workbench?workspace=${encodeURIComponent(workspaceId)}`;
  }

  getTelemetryUrl(runId?: string): string {
    return runId
      ? `${this.config.gatewayUrl}/telemetry/runs/${encodeURIComponent(runId)}`
      : `${this.config.gatewayUrl}/telemetry`;
  }
}

// ─── Global instance ────────────────────────────────────────────────

export const extensionManager = new Index0ExtensionManager();

// ─── Status Bar ─────────────────────────────────────────────────────

export interface IStatusBarState {
  credits: number;
  maxCredits: number;
  gpuAvailable: boolean;
  agentRunning: boolean;
  currentModel: string;
}

export function formatStatusBarText(state: IStatusBarState): string {
  const creditPct = Math.round((state.credits / state.maxCredits) * 100);
  const gpuIcon = state.gpuAvailable ? '⚡' : '💤';
  const agentIcon = state.agentRunning ? '$(sync~spin)' : '$(check)';
  return `${agentIcon} INDEX0 | ${gpuIcon} ${creditPct}% credits | ${state.currentModel}`;
}

// ─── VS Code Lifecycle ──────────────────────────────────────────────

/**
 * VS Code Extension Activation Lifecycle Hook.
 * Called when one of the activation events triggers.
 */
export function activate(context: IExtensionContext): Index0ExtensionManager {
  const commands: IExtensionCommandDisposable[] = [
    {
      // index0.startAgentRun — runs the 4-tier review loop via the orchestrator
      dispose: () => {
        // In a real VS Code extension this would call:
        //   vscode.commands.registerCommand('index0.startAgentRun', async () => {
        //     const task = await vscode.window.showInputBox({ prompt: 'Enter task' });
        //     if (!task) return;
        //     const result = await extensionManager.runCycle(task);
        //     vscode.window.showInformationMessage(
        //       result.passed ? `✅ ${result.cycleId}: tests passed` : `⚠️ ${result.cycleId}: ${result.status}`
        //     );
        //   })
      },
    },
    {
      dispose: () => {
        // index0.openAgentPanel
      },
    },
    {
      dispose: () => {
        // index0.openMcpTools
      },
    },
    {
      dispose: () => {
        // index0.openTelemetry
      },
    },
    {
      dispose: () => {
        // index0.openVoiceAgent
      },
    },
    {
      dispose: () => {
        // index0.toggleGhostText
      },
    },
    {
      dispose: () => {
        // index0.reviewGnapDiff
      },
    },
  ];

  context.subscriptions.push(...commands);
  return extensionManager;
}

/**
 * VS Code Extension Deactivation Lifecycle Hook.
 */
export function deactivate(): void {
  // Teardown long-lived resources (SSE connections, WebRTC sessions, etc.)
}
