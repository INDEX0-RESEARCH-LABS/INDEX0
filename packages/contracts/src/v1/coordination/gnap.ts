/**
 * Git-Native Agent Protocol (GNAP) Specifications — @index0/contracts/v1/coordination/gnap
 * Defines Git-commit-based coordination primitives, trailer headers, and state structures.
 */

import type { AgentRole, IPostcardEnvelope, PostcardMessageType } from "./index.js";

/** Standard Git trailer keys used by GNAP agents. */
export const GNAP_TRAILERS = {
  AGENT_ID: "X-GNAP-Agent-Id",
  AGENT_ROLE: "X-GNAP-Agent-Role",
  CYCLE_ID: "X-GNAP-Cycle-Id",
  MESSAGE_TYPE: "X-GNAP-Message-Type",
  SEQUENCE: "X-GNAP-Sequence",
  VERDICT: "X-GNAP-Verdict",
  PARENT_COMMIT: "X-GNAP-Parent-Commit"
} as const;

export type GNAPTrailerKey = typeof GNAP_TRAILERS[keyof typeof GNAP_TRAILERS];

/** Parsed GNAP Git commit trailers. */
export interface IGNAPCommitTrailers {
  agentId: string;
  agentRole: AgentRole;
  cycleId: string;
  messageType: PostcardMessageType;
  sequence: number;
  verdict?: string;
  parentCommit?: string;
}

/** Standard file paths inside the repository for GNAP coordination. */
export const GNAP_PATHS = {
  ROOT: ".gnap",
  MESSAGES: ".gnap/messages",
  STATE: ".gnap/state.json",
  ROSTER: ".gnap/roster.json",
  LOCK: ".gnap/lock"
} as const;

/** GNAP message envelope stored in repository files. */
export interface IGNAPDiskMessage {
  envelope: IPostcardEnvelope;
  meta: {
    commitHash?: string;
    branch?: string;
    writtenAt: string;
    sequence: number;
  };
}

/** Format a GNAP message into a Git commit body with standard trailers. */
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

  return `${params.title}\n\n${params.summary}\n\n${trailerLines.join("\n")}`;
}
