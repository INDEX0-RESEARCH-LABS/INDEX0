/**
 * Model Context Protocol (MCP) Contracts — @index0/contracts/v1/mcp
 * Authoritative type definitions for MCP tool registration, invocation,
 * workspace boundary enforcement, and off-the-shelf server configuration.
 */

// ---------------------------------------------------------------------------
// Transport & Category Types
// ---------------------------------------------------------------------------

/** Supported MCP transport mechanisms. */
export type MCPTransport = "stdio" | "sse" | "native";

/** Categorical classification of MCP tools. */
export type MCPToolCategory = "filesystem" | "search" | "execution" | "inspection";

// ---------------------------------------------------------------------------
// Tool Definition
// ---------------------------------------------------------------------------

/** Authoritative metadata for a single registered MCP tool. */
export interface IMCPToolDefinition {
  /** Unique tool identifier (e.g., "openhands_file_search", "@modelcontextprotocol/server-filesystem"). */
  name: string;

  /** Human-readable description of the tool's purpose. */
  description: string;

  /** Tool category for grouping and access control. */
  category: MCPToolCategory;

  /** Transport mechanism used by this tool. */
  transport: MCPTransport;

  /** Whether this tool's execution is confined to the workspace sandbox. */
  sandboxed: boolean;

  /** Whether this tool is provided by the runtime natively (OpenHands built-in). */
  isNative: boolean;
}

// ---------------------------------------------------------------------------
// Server Configuration
// ---------------------------------------------------------------------------

/** Configuration for an off-the-shelf MCP server process. */
export interface IMCPServerConfig {
  /** Server package name (e.g., "@modelcontextprotocol/server-filesystem"). */
  name: string;

  /** Command to launch the server process. */
  command: string;

  /** Command-line arguments passed to the server. */
  args: string[];

  /** Environment variables injected into the server process. */
  env?: Record<string, string>;

  /** Transport mechanism for client-server communication. */
  transport: MCPTransport;

  /** Whether this server is confined to the workspace root. */
  workspaceConfined: boolean;

  /** Human-readable description of the server's purpose. */
  description?: string;
}

// ---------------------------------------------------------------------------
// Tool Invocation & Result
// ---------------------------------------------------------------------------

/** Payload for invoking an MCP tool. */
export interface IMCPToolInvocation {
  /** Unique request identifier for tracing. */
  requestId: string;

  /** Name of the tool to invoke (must match a registered tool). */
  toolName: string;

  /** Tool-specific arguments. */
  arguments: Record<string, unknown>;

  /** Absolute path to the workspace root for boundary enforcement. */
  workspaceRoot: string;

  /** ISO-8601 timestamp of the invocation request. */
  timestamp: string;
}

/** Result returned from an MCP tool invocation. */
export interface IMCPToolResult {
  /** Unique request identifier matching the originating invocation. */
  requestId: string;

  /** Name of the tool that produced this result. */
  toolName: string;

  /** Whether the tool invocation succeeded. */
  success: boolean;

  /** Tool output payload (tool-specific structure). */
  output?: unknown;

  /** Error message if the invocation failed. */
  error?: string;

  /** Execution duration in milliseconds. */
  durationMs: number;

  /** ISO-8601 timestamp of the result. */
  timestamp: string;
}

// ---------------------------------------------------------------------------
// Workspace Boundary Rules
// ---------------------------------------------------------------------------

/** Configuration for workspace boundary enforcement. */
export interface IMCPBoundaryRules {
  /** Absolute path to the workspace root. */
  workspaceRoot: string;

  /** Path patterns that are explicitly denied (e.g., "../../", "/etc"). */
  denyPaths: string[];

  /** Symlink resolution policy. */
  symlinkResolution: "deny" | "resolve" | "follow";
}

// ---------------------------------------------------------------------------
// Tool Registry
// ---------------------------------------------------------------------------

/** Canonical MCP tool registry manifest governing all authorized tools. */
export interface IMCPToolRegistry {
  /** Registry schema version. */
  version: string;

  /** Registered off-the-shelf MCP servers. */
  servers: IMCPServerConfig[];

  /** Native runtime tools provided by the agent platform. */
  nativeTools: IMCPToolDefinition[];

  /** Workspace boundary enforcement rules. */
  boundaryRules: IMCPBoundaryRules;
}
