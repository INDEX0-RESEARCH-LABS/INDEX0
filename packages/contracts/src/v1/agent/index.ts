/**
 * Agent Lifecycle & Event Streaming Contracts — @index0/contracts/v1/agent
 * Authoritative schema definitions for agent runs, planning, tool executions, and SSE event streaming.
 */

export type AgentEventType =
  | "agent.started"
  | "agent.plan"
  | "agent.message"
  | "tool.called"
  | "tool.result"
  | "sandbox.started"
  | "sandbox.completed"
  | "agent.completed"
  | "agent.failed";

export interface IAgentEvent<TPayload = Record<string, unknown>> {
  id: string;
  runId: string;
  type: AgentEventType;
  payload: TPayload;
  timestamp: string;
}

export type PlanStepStatus = "pending" | "in_progress" | "completed" | "failed";

export interface IAgentPlanStep {
  id: string;
  title: string;
  description?: string;
  status: PlanStepStatus;
}

export interface IToolCallPayload {
  callId: string;
  tool: string;
  parameters: Record<string, unknown>;
}

export interface IToolResultPayload {
  callId: string;
  tool: string;
  output: unknown;
  isError?: boolean;
}

export interface ISandboxEventPayload {
  sandboxId: string;
  language: string;
  codeSnippet?: string;
  exitCode?: number;
  durationMs?: number;
}

export interface IAgentMessagePayload {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface IAgentPlanPayload {
  steps: IAgentPlanStep[];
}

export interface IAgentCompletionPayload {
  summary: string;
  totalSteps: number;
  totalTokens?: number;
  durationMs: number;
}

export interface IAgentFailurePayload {
  error: string;
  failedStepId?: string;
  recoverable: boolean;
}

export type AgentRunStatus =
  | "pending"
  | "running"
  | "completed"
  | "failed"
  | "cancelled";

export interface IAgentRun {
  id: string;
  workspaceId: string;
  prompt: string;
  status: AgentRunStatus;
  model?: string;
  plan?: IAgentPlanStep[];
  createdAt: string;
  completedAt?: string;
  error?: string;
}

export interface IAgentRunRequest {
  workspaceId: string;
  prompt: string;
  model?: string;
  stream?: boolean;
}

export interface ISSEEventEnvelope {
  event: string;
  data: string;
  id?: string;
  retry?: number;
}
