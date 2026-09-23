/**
 * Viking MCP Server — @index0/mcp-host
 * Exposes viking:// 3-tier context retrieval via standard MCP tool calls.
 */

import { VikingContextProvider } from "./provider.js";
import type { ContextTier } from "@index0/contracts";

export interface IMCPToolCall {
  name: string;
  arguments: Record<string, unknown>;
}

export interface IMCPToolResult {
  content: Array<{
    type: "text" | "json";
    text: string;
  }>;
  isError?: boolean;
}

export class VikingMCPServer {
  constructor(private readonly provider: VikingContextProvider = new VikingContextProvider()) {}

  /**
   * List available tools exposed by this MCP server.
   */
  listTools() {
    return [
      {
        name: "viking_get_context",
        description: "Retrieve 3-tier compressed context (L0 Abstract, L1 Structural, L2 Full) for a file or module via viking:// protocol.",
        inputSchema: {
          type: "object",
          properties: {
            uri: {
              type: "string",
              description: "Viking URI or repository path (e.g. 'viking://packages/contracts/src/v1/auth/index.ts')"
            },
            tier: {
              type: "string",
              enum: ["L0_ABSTRACT", "L1_STRUCTURAL", "L2_FULL"],
              default: "L1_STRUCTURAL",
              description: "Detail tier: L0 (~50 tokens summary), L1 (~500 tokens signatures/types), L2 (~5000+ tokens full source)"
            }
          },
          required: ["uri"]
        }
      },
      {
        name: "viking_cache_stats",
        description: "Retrieve cache hit rates, size, and total tokens cached in the Viking context layer.",
        inputSchema: {
          type: "object",
          properties: {}
        }
      },
      {
        name: "viking_invalidate_cache",
        description: "Invalidate cached context entries across all tiers or for a specific path.",
        inputSchema: {
          type: "object",
          properties: {
            path: {
              type: "string",
              description: "Optional file or module path to invalidate. If omitted, clears entire cache."
            }
          }
        }
      }
    ];
  }

  /**
   * Execute an MCP tool call.
   */
  async handleToolCall(call: IMCPToolCall): Promise<IMCPToolResult> {
    try {
      switch (call.name) {
        case "viking_get_context": {
          const uri = String(call.arguments.uri || "");
          const tier = (call.arguments.tier as ContextTier) || "L1_STRUCTURAL";
          const res = await this.provider.resolveContext({
            requestId: `req-${Date.now()}`,
            path: uri,
            tier,
            timestamp: new Date().toISOString()
          });

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(res, null, 2)
              }
            ]
          };
        }

        case "viking_cache_stats": {
          const stats = this.provider.getCache().getStats();
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(stats, null, 2)
              }
            ]
          };
        }

        case "viking_invalidate_cache": {
          const pathArg = call.arguments.path ? String(call.arguments.path) : undefined;
          const invalidatedCount = this.provider.getCache().invalidate(pathArg);
          return {
            content: [
              {
                type: "text",
                text: `Invalidated ${invalidatedCount} cache entries.`
              }
            ]
          };
        }

        default:
          return {
            content: [{ type: "text", text: `Unknown tool: ${call.name}` }],
            isError: true
          };
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return {
        content: [{ type: "text", text: `Tool error: ${msg}` }],
        isError: true
      };
    }
  }

  getProvider(): VikingContextProvider {
    return this.provider;
  }
}
