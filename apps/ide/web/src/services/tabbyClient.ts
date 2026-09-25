/**
 * TabbyML Local Edge Inline Completion Client — @index0/ide-web
 * Provides sub-20ms GhostText inline completions via local TabbyML / vLLM inference.
 */

export interface ITabbySegments {
  prefix: string;
  suffix?: string;
}

export interface ITabbyCompletionRequest {
  language?: string;
  segments: ITabbySegments;
  user?: string;
}

export interface ITabbyChoice {
  index: number;
  text: string;
}

export interface ITabbyCompletionResponse {
  id: string;
  choices: ITabbyChoice[];
}

export interface ITabbyHealthResponse {
  model?: string;
  device?: string;
  version?: string;
  status: 'ok' | 'degraded' | 'offline';
  latencyMs?: number;
}

export class TabbyClient {
  private readonly baseUrl: string;
  private isOnline = false;
  private lastHealthCheck = 0;

  get online(): boolean {
    return this.isOnline;
  }

  get lastChecked(): number {
    return this.lastHealthCheck;
  }

  constructor(baseUrl = 'http://localhost:8080') {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
  }

  /**
   * Check TabbyML edge server responsiveness.
   */
  async checkHealth(): Promise<ITabbyHealthResponse> {
    const startTime = Date.now();
    try {
      const response = await fetch(`${this.baseUrl}/v1/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(1500)
      });

      const latencyMs = Date.now() - startTime;
      if (response.ok) {
        this.isOnline = true;
        this.lastHealthCheck = Date.now();
        const data = await response.json().catch(() => ({}));
        return {
          status: 'ok',
          latencyMs,
          model: data.model || 'StarCoder-1B',
          device: data.device || 'cpu',
          version: data.version || '0.18.0'
        };
      }

      this.isOnline = false;
      return { status: 'degraded', latencyMs };
    } catch {
      this.isOnline = false;
      return { status: 'offline' };
    }
  }

  /**
   * Fetch GhostText autocomplete suggestion from TabbyML local edge.
   */
  async getCompletions(
    segments: ITabbySegments,
    language = 'typescript'
  ): Promise<ITabbyChoice[]> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          language,
          segments
        }),
        signal: AbortSignal.timeout(2000)
      });

      if (!response.ok) {
        return [];
      }

      const data: ITabbyCompletionResponse = await response.json();
      return data.choices || [];
    } catch {
      return [];
    }
  }
}

export const defaultTabbyClient = new TabbyClient(
  typeof window !== 'undefined' && (window as unknown as { TABBY_ENDPOINT?: string }).TABBY_ENDPOINT
    ? (window as unknown as { TABBY_ENDPOINT?: string }).TABBY_ENDPOINT
    : 'http://localhost:8080'
);
