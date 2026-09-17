/**
 * INDEX0 Real-time Agent Event Stream Service — @index0/ide-web
 * Subscribes to /api/v1/agents/runs/:id/events via Gateway abstraction and handles all 9 AgentEventType variants.
 */

import type {
  AgentEventType,
  IAgentEvent,
  IAgentPlanStep,
  ISSEEventEnvelope
} from '@index0/contracts';

export interface IAgentStreamState {
  runId: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  planSteps: IAgentPlanStep[];
  messages: Array<{ role: string; content: string }>;
  toolCalls: Array<{ callId: string; tool: string; parameters: Record<string, unknown>; result?: unknown; isError?: boolean }>;
  error?: string;
}

export class AgentEventStreamService {
  private readonly gatewayBaseUrl: string;

  constructor(gatewayBaseUrl: string = 'http://localhost:8080') {
    this.gatewayBaseUrl = gatewayBaseUrl;
  }

  /**
   * Parse a single raw SSE message envelope into a strongly typed IAgentEvent.
   */
  static parseSSEEnvelope(envelope: ISSEEventEnvelope): IAgentEvent | null {
    try {
      if (!envelope.data) return null;
      const parsed = JSON.parse(envelope.data) as IAgentEvent;
      if (!parsed.id || !parsed.type || !parsed.runId) {
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  }

  /**
   * Parse raw SSE string chunks (event: ...\ndata: ...\n\n).
   */
  static parseRawSSEChunk(rawChunk: string): IAgentEvent[] {
    const events: IAgentEvent[] = [];
    const lines = rawChunk.split('\n');
    let currentEvent = 'message';
    let currentData = '';

    for (const line of lines) {
      if (line.startsWith('event:')) {
        currentEvent = line.slice(6).trim();
      } else if (line.startsWith('data:')) {
        currentData = line.slice(5).trim();
      } else if (line === '' && currentData) {
        const envelope: ISSEEventEnvelope = {
          event: currentEvent,
          data: currentData
        };
        const parsed = AgentEventStreamService.parseSSEEnvelope(envelope);
        if (parsed) events.push(parsed);
        currentEvent = 'message';
        currentData = '';
      }
    }

    if (currentData) {
      const envelope: ISSEEventEnvelope = {
        event: currentEvent,
        data: currentData
      };
      const parsed = AgentEventStreamService.parseSSEEnvelope(envelope);
      if (parsed) events.push(parsed);
    }

    return events;
  }

  /**
   * Reducer function that transitions state based on all 9 AgentEventType variants.
   */
  static reduceEvent(state: IAgentStreamState, event: IAgentEvent): IAgentStreamState {
    const next = { ...state };

    switch (event.type as AgentEventType) {
      case 'agent.started': {
        next.status = 'running';
        const payload = event.payload as { prompt?: string };
        if (payload.prompt) {
          next.messages.push({ role: 'user', content: payload.prompt });
        }
        break;
      }

      case 'agent.plan': {
        const payload = event.payload as { steps?: IAgentPlanStep[] };
        if (payload.steps) {
          next.planSteps = [...payload.steps];
        }
        break;
      }

      case 'agent.message': {
        const payload = event.payload as { role: string; content: string };
        if (payload.content) {
          next.messages.push({ role: payload.role || 'assistant', content: payload.content });
        }
        break;
      }

      case 'tool.called': {
        const payload = event.payload as { callId: string; tool: string; parameters: Record<string, unknown> };
        next.toolCalls.push({
          callId: payload.callId,
          tool: payload.tool,
          parameters: payload.parameters || {}
        });
        break;
      }

      case 'tool.result': {
        const payload = event.payload as { callId: string; tool: string; output: unknown; isError?: boolean };
        const idx = next.toolCalls.findIndex((t) => t.callId === payload.callId);
        if (idx >= 0) {
          next.toolCalls[idx] = {
            ...next.toolCalls[idx],
            result: payload.output,
            isError: payload.isError
          };
        }
        break;
      }

      case 'sandbox.started': {
        const payload = event.payload as { language: string; sandboxId: string };
        next.messages.push({
          role: 'system',
          content: `MicroVM sandbox [${payload.sandboxId}] started for ${payload.language}.`
        });
        break;
      }

      case 'sandbox.completed': {
        const payload = event.payload as { exitCode?: number; durationMs?: number };
        next.messages.push({
          role: 'system',
          content: `MicroVM execution finished with Exit ${payload.exitCode ?? 0} in ${payload.durationMs ?? 0}ms.`
        });
        break;
      }

      case 'agent.completed': {
        next.status = 'completed';
        const payload = event.payload as { summary?: string };
        if (payload.summary) {
          next.messages.push({ role: 'assistant', content: payload.summary });
        }
        break;
      }

      case 'agent.failed': {
        next.status = 'failed';
        const payload = event.payload as { error?: string };
        next.error = payload.error || 'Agent run failed';
        next.messages.push({ role: 'assistant', content: `Error: ${next.error}` });
        break;
      }
    }

    return next;
  }

  /**
   * Subscribe to live SSE events from API Gateway.
   */
  subscribeToRun(
    runId: string,
    onEvent: (event: IAgentEvent) => void,
    onError?: (error: Error) => void
  ): () => void {
    const url = `${this.gatewayBaseUrl}/api/v1/agents/runs/${encodeURIComponent(runId)}/events`;

    if (typeof EventSource !== 'undefined') {
      const es = new EventSource(url);

      es.onmessage = (msgEvent) => {
        const parsed = AgentEventStreamService.parseSSEEnvelope({
          event: msgEvent.type || 'message',
          data: msgEvent.data
        });
        if (parsed) onEvent(parsed);
      };

      es.onerror = (err) => {
        if (onError) onError(new Error(`SSE connection error: ${String(err)}`));
      };

      return () => es.close();
    }

    // Fallback for non-browser or testing environments
    return () => {};
  }
}
