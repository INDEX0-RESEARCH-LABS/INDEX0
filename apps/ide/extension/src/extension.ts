/**
 * INDEX0 VS Code Extension — @index0/ide-extension
 * Bridges local desktop VS Code editor to sovereign INDEX0 AI platform via Gateway routing.
 */

import type { IAgentRunRequest, IApiResponse, IAgentRun } from '@index0/contracts';

export interface IExtensionCommandDisposable {
  dispose(): void;
}

export interface IExtensionContext {
  subscriptions: IExtensionCommandDisposable[];
}

export interface IExtensionConfig {
  gatewayUrl: string;
  modelPreference: string;
}

export class Index0ExtensionManager {
  private config: IExtensionConfig;

  constructor(config?: Partial<IExtensionConfig>) {
    this.config = {
      gatewayUrl: config?.gatewayUrl || 'http://localhost:8080',
      modelPreference: config?.modelPreference || 'claude-3-5-sonnet-20241022'
    };
  }

  getConfig(): Readonly<IExtensionConfig> {
    return { ...this.config };
  }

  updateConfig(updates: Partial<IExtensionConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  /**
   * Dispatch an autonomous agent run to the API Gateway.
   */
  async startAgentRun(request: IAgentRunRequest): Promise<IApiResponse<IAgentRun>> {
    const url = `${this.config.gatewayUrl}/api/v1/agents/runs`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Client-Type': 'vscode-extension'
      },
      body: JSON.stringify({
        ...request,
        model: request.model || this.config.modelPreference
      })
    });

    return (await response.json()) as IApiResponse<IAgentRun>;
  }

  /**
   * Resolve the browser workbench launch URL for a specific workspace.
   */
  getWorkbenchUrl(workspaceId: string = 'ws-main-dev'): string {
    return `${this.config.gatewayUrl}/workbench?workspace=${encodeURIComponent(workspaceId)}`;
  }

  /**
   * Resolve the telemetry dashboard URL for a specific run.
   */
  getTelemetryUrl(runId?: string): string {
    return runId
      ? `${this.config.gatewayUrl}/telemetry/runs/${encodeURIComponent(runId)}`
      : `${this.config.gatewayUrl}/telemetry`;
  }
}

// Global manager instance
export const extensionManager = new Index0ExtensionManager();

/**
 * VS Code Extension Activation Lifecycle Hook
 */
export function activate(context: IExtensionContext): Index0ExtensionManager {
  const commands: IExtensionCommandDisposable[] = [
    {
      dispose: () => {
        // Disposable handle for index0.startAgentRun
      }
    },
    {
      dispose: () => {
        // Disposable handle for index0.openWorkbench
      }
    },
    {
      dispose: () => {
        // Disposable handle for index0.viewTelemetry
      }
    }
  ];

  context.subscriptions.push(...commands);
  return extensionManager;
}

/**
 * VS Code Extension Deactivation Lifecycle Hook
 */
export function deactivate(): void {
  // Teardown long-lived resources
}
