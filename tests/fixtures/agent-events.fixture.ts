/**
 * Agent Event & Streaming Fixtures — tests/fixtures/agent-events.fixture.ts
 * Generates realistic IAgentEvent sequences across all 9 AgentEventType variants for IDE and Gateway testing.
 */

import type {
  AgentEventType,
  IAgentEvent,
  IAgentPlanStep,
  IAgentRun,
  ISSEEventEnvelope,
  IToolCallPayload,
  IToolResultPayload,
  ISandboxEventPayload,
  IAgentMessagePayload,
  IAgentPlanPayload,
  IAgentCompletionPayload,
  IAgentFailurePayload
} from "@index0/contracts";

export function createMockAgentRun(overrides?: Partial<IAgentRun>): IAgentRun {
  const runId = overrides?.id || "run-fixture-001";
  const now = new Date().toISOString();

  return {
    id: runId,
    workspaceId: overrides?.workspaceId || "ws-main-dev",
    prompt: overrides?.prompt || "Implement math utilities and verify with unit tests",
    status: overrides?.status || "completed",
    model: overrides?.model || "claude-3-5-sonnet-20241022",
    plan: overrides?.plan || [
      { id: "step-1", title: "Scan workspace structure", status: "completed" },
      { id: "step-2", title: "Implement add and multiply functions in src/math.ts", status: "completed" },
      { id: "step-3", title: "Execute unit tests in sandbox", status: "completed" }
    ],
    createdAt: overrides?.createdAt || now,
    completedAt: overrides?.completedAt || now,
    ...overrides
  };
}

export function createMockAgentEventSequence(runId: string = "run-fixture-001"): IAgentEvent[] {
  const baseTime = Date.now();
  const stepTime = (offsetMs: number) => new Date(baseTime + offsetMs).toISOString();

  const steps: IAgentPlanStep[] = [
    { id: "step-1", title: "Inspect workspace codebase", status: "completed" },
    { id: "step-2", title: "Implement math functions", status: "completed" },
    { id: "step-3", title: "Run test suite inside isolated sandbox", status: "completed" }
  ];

  return [
    // 1. agent.started
    {
      id: `${runId}-evt-01`,
      runId,
      type: "agent.started",
      payload: {
        prompt: "Implement math utilities and verify with unit tests",
        model: "claude-3-5-sonnet-20241022"
      },
      timestamp: stepTime(0)
    },

    // 2. agent.plan
    {
      id: `${runId}-evt-02`,
      runId,
      type: "agent.plan",
      payload: {
        steps
      } satisfies IAgentPlanPayload,
      timestamp: stepTime(150)
    },

    // 3. agent.message (reasoning)
    {
      id: `${runId}-evt-03`,
      runId,
      type: "agent.message",
      payload: {
        role: "assistant",
        content: "I will first search the workspace for existing math utility modules."
      } satisfies IAgentMessagePayload,
      timestamp: stepTime(300)
    },

    // 4. tool.called
    {
      id: `${runId}-evt-04`,
      runId,
      type: "tool.called",
      payload: {
        callId: "call_mcp_search_01",
        tool: "search_text",
        parameters: { query: "export function add" }
      } satisfies IToolCallPayload,
      timestamp: stepTime(500)
    },

    // 5. tool.result
    {
      id: `${runId}-evt-05`,
      runId,
      type: "tool.result",
      payload: {
        callId: "call_mcp_search_01",
        tool: "search_text",
        output: {
          matches: [{ file: "src/math.ts", line: 5, snippet: "export function add(a: number, b: number)" }]
        }
      } satisfies IToolResultPayload,
      timestamp: stepTime(750)
    },

    // 6. sandbox.started
    {
      id: `${runId}-evt-06`,
      runId,
      type: "sandbox.started",
      payload: {
        sandboxId: "sbx-e2b-001",
        language: "typescript",
        codeSnippet: "import { add, multiply } from './src/math';\nassert.strictEqual(add(2, 3), 5);"
      } satisfies ISandboxEventPayload,
      timestamp: stepTime(1100)
    },

    // 7. sandbox.completed
    {
      id: `${runId}-evt-07`,
      runId,
      type: "sandbox.completed",
      payload: {
        sandboxId: "sbx-e2b-001",
        language: "typescript",
        exitCode: 0,
        durationMs: 240
      } satisfies ISandboxEventPayload,
      timestamp: stepTime(1400)
    },

    // 8. agent.message (confirmation)
    {
      id: `${runId}-evt-08`,
      runId,
      type: "agent.message",
      payload: {
        role: "assistant",
        content: "All test cases passed cleanly inside the E2B sandbox microVM."
      } satisfies IAgentMessagePayload,
      timestamp: stepTime(1600)
    },

    // 9. agent.completed
    {
      id: `${runId}-evt-09`,
      runId,
      type: "agent.completed",
      payload: {
        summary: "Implemented math utilities and validated test assertions.",
        totalSteps: 3,
        totalTokens: 1150,
        durationMs: 1800
      } satisfies IAgentCompletionPayload,
      timestamp: stepTime(1800)
    }
  ];
}

export function createMockFailureEventSequence(runId: string = "run-fixture-fail-001"): IAgentEvent[] {
  const baseTime = Date.now();
  const stepTime = (offsetMs: number) => new Date(baseTime + offsetMs).toISOString();

  return [
    {
      id: `${runId}-evt-01`,
      runId,
      type: "agent.started",
      payload: { prompt: "Execute critical workflow", model: "claude-3-5-sonnet-20241022" },
      timestamp: stepTime(0)
    },
    {
      id: `${runId}-evt-02`,
      runId,
      type: "agent.plan",
      payload: {
        steps: [{ id: "step-1", title: "Compile code", status: "in_progress" }]
      } satisfies IAgentPlanPayload,
      timestamp: stepTime(150)
    },
    {
      id: `${runId}-evt-03`,
      runId,
      type: "agent.failed",
      payload: {
        error: "Compilation failed: unexpected token in syntax tree",
        failedStepId: "step-1",
        recoverable: false
      } satisfies IAgentFailurePayload,
      timestamp: stepTime(400)
    }
  ];
}

export async function* simulateSSEStream(
  events: IAgentEvent[],
  intervalMs: number = 20
): AsyncGenerator<ISSEEventEnvelope> {
  for (const event of events) {
    if (intervalMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
    yield {
      id: event.id,
      event: event.type,
      data: JSON.stringify(event)
    };
  }
}
