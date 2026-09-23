/**
 * Context Compression & Memory Contracts — @index0/contracts/v1/context
 * Authoritative schema definitions for the viking:// 3-tier context retrieval
 * protocol, Letta (MemGPT) persistent memory blocks, and LiteLLM model routing.
 */

// ---------------------------------------------------------------------------
// Viking Protocol — 3-Tier Context Retrieval
// ---------------------------------------------------------------------------

/**
 * Context detail tier for the viking:// protocol.
 * L0 = Abstract summary (~50 tokens)
 * L1 = Structural overview (~500 tokens)
 * L2 = Full source code (~5000+ tokens)
 */
export type ContextTier = "L0_ABSTRACT" | "L1_STRUCTURAL" | "L2_FULL";

export interface IVikingContextRequest {
  /** Unique request identifier for tracing. */
  requestId: string;

  /** Viking URI path (e.g., "repo-name/packages/contracts/src/v1/agent"). */
  path: string;

  /** Requested detail tier. Server may return a lower tier if higher is unavailable. */
  tier: ContextTier;

  /** Maximum token budget for the response. */
  maxTokens?: number;

  /** ISO-8601 timestamp of the request. */
  timestamp: string;
}

export interface IVikingContextResponse {
  /** Matching request identifier. */
  requestId: string;

  /** Actual tier returned (may differ from requested if escalated/degraded). */
  tier: ContextTier;

  /** Context content as structured text. */
  content: string;

  /** Estimated token count of the returned content. */
  tokenCount: number;

  /** Whether the content was served from cache. */
  cached: boolean;

  /** Cache key if the result was cached. */
  cacheKey?: string;

  /** ISO-8601 timestamp of content generation. */
  generatedAt: string;

  /** ISO-8601 timestamp of the response. */
  timestamp: string;
}

// ---------------------------------------------------------------------------
// Viking L0 Abstract Structure
// ---------------------------------------------------------------------------

export interface IVikingL0Abstract {
  /** Module or file path relative to repository root. */
  path: string;

  /** One-line summary of the module's purpose. */
  summary: string;

  /** Primary programming language. */
  language: string;

  /** Framework or runtime (e.g., "express", "next.js", "prisma"). */
  framework?: string;

  /** Key exported symbols (type names, function names). */
  keyExports: string[];

  /** Direct dependency names. */
  dependencies: string[];
}

// ---------------------------------------------------------------------------
// Viking L1 Structural Overview
// ---------------------------------------------------------------------------

export interface IVikingL1Structural {
  /** Module or file path relative to repository root. */
  path: string;

  /** Directory tree structure as indented text. */
  directoryTree: string;

  /** Function and method signatures (name, params, return type). */
  signatures: IFunctionSignature[];

  /** Exported type definitions (interfaces, types, enums). */
  typeDefinitions: string[];

  /** Import graph — which modules this module depends on. */
  imports: string[];

  /** Export graph — which symbols this module exports. */
  exports: string[];
}

export interface IFunctionSignature {
  /** Function or method name. */
  name: string;

  /** Parameter list as a human-readable string. */
  params: string;

  /** Return type as a human-readable string. */
  returnType: string;

  /** Whether the function is exported. */
  isExported: boolean;

  /** Whether the function is async. */
  isAsync: boolean;
}

// ---------------------------------------------------------------------------
// Viking Context Cache
// ---------------------------------------------------------------------------

export interface IVikingCacheEntry {
  /** Cache key (derived from path + tier). */
  key: string;

  /** Cached context tier. */
  tier: ContextTier;

  /** Module path. */
  path: string;

  /** Cached content. */
  content: string;

  /** Estimated token count. */
  tokenCount: number;

  /** ISO-8601 timestamp of cache entry creation. */
  createdAt: string;

  /** ISO-8601 timestamp of cache entry expiration. */
  expiresAt: string;

  /** Git commit hash at time of generation (for invalidation). */
  commitHash?: string;
}

// ---------------------------------------------------------------------------
// Letta (MemGPT) — Persistent Agent Memory
// ---------------------------------------------------------------------------

export type LettaMemoryType = "core" | "archival" | "recall";

export interface ILettaMemoryBlock {
  /** Unique memory block identifier. */
  id: string;

  /** Memory type classification. */
  type: LettaMemoryType;

  /** Memory block label (e.g., "human", "persona", "project_context"). */
  label: string;

  /** Memory content as text. */
  value: string;

  /** Maximum token limit for this block. */
  limit: number;

  /** ISO-8601 timestamp of last update. */
  updatedAt: string;
}

export interface ILettaMemoryConfig {
  /** Letta server endpoint URL. */
  serverUrl: string;

  /** Agent identity within Letta. */
  agentId: string;

  /** Default core memory blocks to initialize. */
  coreBlocks: ILettaCoreBlockConfig[];

  /** Archival memory retention period in days. */
  archivalRetentionDays: number;

  /** Maximum archival memory entries. */
  maxArchivalEntries: number;
}

export interface ILettaCoreBlockConfig {
  /** Block label (e.g., "human", "persona", "system"). */
  label: string;

  /** Initial value for the block. */
  initialValue: string;

  /** Maximum token limit for the block. */
  limit: number;
}

// ---------------------------------------------------------------------------
// LiteLLM — Model Routing Configuration
// ---------------------------------------------------------------------------

export type ModelRoutingStrategy =
  | "cost-aware"
  | "latency-optimized"
  | "quality-first"
  | "round-robin";

export interface ILiteLLMRouteConfig {
  /** Routing strategy for model selection. */
  strategy: ModelRoutingStrategy;

  /** Available model definitions. */
  models: IModelRoute[];

  /** Fallback chains: if primary fails, try secondary, etc. */
  fallbacks: string[][];

  /** Maximum retry count per request. */
  maxRetries: number;

  /** Retry delay in seconds. */
  retryAfterSeconds: number;
}

export interface IModelRoute {
  /** Display name for the model route (e.g., "gpt-4o", "claude-sonnet-4"). */
  modelName: string;

  /** LiteLLM model identifier (e.g., "openai/gpt-4o"). */
  litellmModel: string;

  /** Optional custom API base URL (for self-hosted models). */
  apiBase?: string;

  /** Input cost per token in USD. */
  inputCostPerToken: number;

  /** Output cost per token in USD. */
  outputCostPerToken: number;

  /** Maximum context window size in tokens. */
  maxTokens: number;

  /** Task complexity categories this model is suitable for. */
  suitableFor: ModelTaskComplexity[];
}

export type ModelTaskComplexity =
  | "autocomplete"
  | "lint"
  | "simple_generation"
  | "code_review"
  | "complex_reasoning"
  | "architecture"
  | "research";
