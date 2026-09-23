/**
 * Multi-Agent Coordination Contracts — @index0/contracts/v1/coordination
 * Authoritative schema definitions for the Git-Native Agent Protocol (GNAP),
 * Postcard message envelopes, and decentralized agent identity.
 */

// ---------------------------------------------------------------------------
// Agent Identity & Roles
// ---------------------------------------------------------------------------

/**
 * Agent role within the multi-agent review loop.
 * Determines the agent's responsibilities and permitted actions.
 */
export type AgentRole = "architect" | "developer" | "critic" | "qa";

export interface IAgentIdentity {
  /** Unique agent instance identifier. */
  agentId: string;

  /** Agent's role in the coordination workflow. */
  role: AgentRole;

  /** Human-readable agent display name. */
  displayName: string;

  /** Model backing this agent (e.g., "claude-sonnet-4", "gpt-4o"). */
  model?: string;
}

// ---------------------------------------------------------------------------
// Postcard Protocol — Inter-Agent Message Envelope
// ---------------------------------------------------------------------------

export type PostcardMessageType =
  | "plan_proposal"
  | "plan_approval"
  | "implementation"
  | "review_request"
  | "review_verdict"
  | "test_request"
  | "test_result"
  | "handoff"
  | "escalation"
  | "acknowledgment";

export interface IPostcardEnvelope {
  /** Postcard protocol version. */
  version: "1.0";

  /** Unique message identifier (UUIDv4). */
  id: string;

  /** Sender agent identity. */
  from: IAgentIdentity;

  /** Target agent identity or "*" for broadcast. */
  to: IAgentIdentity | "*";

  /** Message type discriminator. */
  type: PostcardMessageType;

  /** Message payload (type-specific content). */
  payload: Record<string, unknown>;

  /** ISO-8601 timestamp of message creation. */
  timestamp: string;

  /** Parent message ID for threading/reply chains. */
  parentId?: string;

  /** Message time-to-live in seconds (optional expiry). */
  ttl?: number;

  /** Optional cryptographic signatures for message integrity. */
  signatures?: string[];
}

// ---------------------------------------------------------------------------
// GNAP — Git-Native Agent Protocol
// ---------------------------------------------------------------------------

export interface IGNAPConfig {
  /** GNAP protocol version. */
  version: "1.0";

  /** Directory within the repository for GNAP messages. */
  messageDir: string;

  /** Directory within the repository for GNAP state. */
  stateDir: string;

  /** Registered agent roster for this repository. */
  agents: IAgentIdentity[];

  /** Maximum message age before garbage collection (seconds). */
  messageRetentionSeconds: number;
}

export interface IGNAPMessage extends IPostcardEnvelope {
  /** Git commit hash that introduced this message. */
  commitHash?: string;

  /** Relative file path within the repository (e.g., ".gnap/messages/001-plan.json"). */
  filePath: string;

  /** Sequence number for ordering within a review cycle. */
  sequenceNumber: number;
}

export interface IGNAPState {
  /** Current review cycle identifier. */
  currentCycleId: string;

  /** Current stage in the review cycle. */
  currentStage: AgentRole;

  /** Total messages in the current cycle. */
  messageCount: number;

  /** ISO-8601 timestamp of last activity. */
  lastActivity: string;

  /** Whether the cycle is complete. */
  isComplete: boolean;
}

// ---------------------------------------------------------------------------
// Agent Handoff
// ---------------------------------------------------------------------------

export interface IAgentHandoff {
  /** Unique handoff identifier. */
  id: string;

  /** Agent handing off work. */
  from: IAgentIdentity;

  /** Agent receiving work. */
  to: IAgentIdentity;

  /** Summary of work completed by the handing-off agent. */
  summary: string;

  /** Artifacts produced (file paths, diff references). */
  artifacts: string[];

  /** Specific instructions for the receiving agent. */
  instructions?: string;

  /** ISO-8601 timestamp. */
  timestamp: string;
}

// ---------------------------------------------------------------------------
// Review Verdict
// ---------------------------------------------------------------------------

export type ReviewVerdictDecision = "approve" | "request_changes" | "reject";

export interface IReviewVerdict {
  /** Unique verdict identifier. */
  id: string;

  /** Review cycle this verdict belongs to. */
  cycleId: string;

  /** Agent issuing the verdict. */
  reviewer: IAgentIdentity;

  /** Verdict decision. */
  decision: ReviewVerdictDecision;

  /** Detailed review comments. */
  comments: string;

  /** Specific file-level findings. */
  findings: IReviewFinding[];

  /** SAST scan results (if applicable). */
  sastResults?: ISASTScanSummary;

  /** ISO-8601 timestamp. */
  timestamp: string;
}

export type ReviewFindingSeverity = "info" | "warning" | "error" | "critical";

export interface IReviewFinding {
  /** File path relative to repository root. */
  filePath: string;

  /** Line number (1-indexed). */
  line?: number;

  /** Finding severity. */
  severity: ReviewFindingSeverity;

  /** Category of the finding. */
  category: string;

  /** Human-readable finding description. */
  message: string;

  /** Suggested fix (optional). */
  suggestedFix?: string;
}

export interface ISASTScanSummary {
  /** Total findings count. */
  totalFindings: number;

  /** Findings broken down by severity. */
  bySeverity: Record<ReviewFindingSeverity, number>;

  /** Whether the scan passed the gate policy. */
  passed: boolean;

  /** Scanner tool name (e.g., "semgrep", "trivy"). */
  scanner: string;

  /** Scan duration in milliseconds. */
  durationMs: number;
}

export * from "./gnap.js";
