/**
 * Authoritative contracts and type definitions for client-harness.
 * Zero-dependency self-contained definitions matching @index0/contracts.
 */

export type SandboxLanguage = 'python' | 'typescript' | 'bash';
export type AgentRole = 'architect' | 'developer' | 'critic' | 'qa';

export interface IAgentIdentity {
  agentId: string;
  role: AgentRole;
  displayName: string;
  model?: string;
}

export type PostcardMessageType =
  | 'plan_proposal'
  | 'plan_approval'
  | 'implementation'
  | 'review_request'
  | 'review_verdict'
  | 'test_request'
  | 'test_result'
  | 'handoff'
  | 'escalation'
  | 'acknowledgment';

export interface IPostcardEnvelope {
  version: '1.0';
  id: string;
  from: IAgentIdentity;
  to: IAgentIdentity | '*';
  type: PostcardMessageType;
  payload: Record<string, unknown>;
  timestamp: string;
  parentId?: string;
  ttl?: number;
  signatures?: string[];
}

export const GNAP_TRAILERS = {
  AGENT_ID: 'X-GNAP-Agent-Id',
  AGENT_ROLE: 'X-GNAP-Agent-Role',
  CYCLE_ID: 'X-GNAP-Cycle-Id',
  MESSAGE_TYPE: 'X-GNAP-Message-Type',
  SEQUENCE: 'X-GNAP-Sequence',
  VERDICT: 'X-GNAP-Verdict',
  PARENT_COMMIT: 'X-GNAP-Parent-Commit'
} as const;

export type GNAPTrailerKey = (typeof GNAP_TRAILERS)[keyof typeof GNAP_TRAILERS];

export interface IGNAPCommitTrailers {
  agentId: string;
  agentRole: AgentRole;
  cycleId: string;
  messageType: PostcardMessageType;
  sequence: number;
  verdict?: string;
  parentCommit?: string;
}

export const GNAP_PATHS = {
  ROOT: '.gnap',
  MESSAGES: '.gnap/messages',
  STATE: '.gnap/state.json',
  ROSTER: '.gnap/roster.json',
  LOCK: '.gnap/lock'
} as const;

export interface IGNAPDiskMessage {
  envelope: IPostcardEnvelope;
  meta: {
    commitHash?: string;
    branch?: string;
    writtenAt: string;
    sequence: number;
  };
}

export function formatGNAPCommitMessage(params: {
  title: string;
  summary: string;
  trailers: IGNAPCommitTrailers;
}): string {
  const trailerLines = [
    `${GNAP_TRAILERS.AGENT_ID}: ${params.trailers.agentId}`,
    `${GNAP_TRAILERS.AGENT_ROLE}: ${params.trailers.agentRole}`,
    `${GNAP_TRAILERS.CYCLE_ID}: ${params.trailers.cycleId}`,
    `${GNAP_TRAILERS.MESSAGE_TYPE}: ${params.trailers.messageType}`,
    `${GNAP_TRAILERS.SEQUENCE}: ${params.trailers.sequence}`
  ];

  if (params.trailers.verdict) {
    trailerLines.push(`${GNAP_TRAILERS.VERDICT}: ${params.trailers.verdict}`);
  }
  if (params.trailers.parentCommit) {
    trailerLines.push(`${GNAP_TRAILERS.PARENT_COMMIT}: ${params.trailers.parentCommit}`);
  }

  return `${params.title}\n\n${params.summary}\n\n${trailerLines.join('\n')}`;
}

export interface ISandboxRequest {
  id: string;
  code: string;
  language: SandboxLanguage;
  timeoutMs: number;
  environmentVariables?: Record<string, string>;
  cpuCount?: number;
  memoryMb?: number;
}

export interface ISandboxExecutionResult {
  id: string;
  exitCode: number;
  stdout: string;
  stderr: string;
  durationMs: number;
  error?: string;
  timedOut?: boolean;
}

export interface ISandboxQuotas {
  defaultTimeoutMs: number;
  maxTimeoutMs: number;
  maxMemoryMb: number;
  defaultCpuCount: number;
}

export const SANDBOX_QUOTAS: Readonly<ISandboxQuotas> = {
  defaultTimeoutMs: 30_000,
  maxTimeoutMs: 300_000,
  maxMemoryMb: 1024,
  defaultCpuCount: 1
};

export interface ISandboxHealthResponse {
  status: 'healthy' | 'degraded';
  activeSandboxes: number;
  timestamp: string;
}

export interface IApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
