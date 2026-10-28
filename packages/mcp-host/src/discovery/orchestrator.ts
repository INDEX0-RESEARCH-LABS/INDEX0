/**
 * AutoMCP Orchestrator — @index0/mcp-host
 * 
 * High-level autonomous coordinator that discovers, validates, and plans
 * Just-In-Time MCP server attachments for autonomous agent runs.
 */

import { CapabilityExtractor } from './capability-extractor.js';
import { MCPResolver } from './catalog.js';
import type { IDiscoveredMCPServer, ITaskCapabilityRequirement } from './types.js';

export interface IAutoMCPPlan {
  taskPrompt: string;
  workspaceRoot: string;
  extractedCapabilities: ITaskCapabilityRequirement[];
  discoveredServers: IDiscoveredMCPServer[];
  gnapTrailers: Record<string, string>;
  markdownSummary: string;
}

export class AutoMCPOrchestrator {
  /**
   * Plans autonomous MCP attachments for an agent task.
   */
  public static planForTask(prompt: string, workspaceRoot: string = process.cwd()): IAutoMCPPlan {
    const extractedCapabilities = CapabilityExtractor.extract(prompt, workspaceRoot);
    const discoveredServers = MCPResolver.resolveAll(extractedCapabilities, workspaceRoot);

    // Generate GNAP trailers for audit trail
    const gnapTrailers: Record<string, string> = {};
    if (discoveredServers.length > 0) {
      gnapTrailers['MCP-Discovered'] = discoveredServers.map((s) => s.serverConfig.name).join(', ');
      gnapTrailers['MCP-Tiers'] = discoveredServers.map((s) => `T${s.tier}:${s.serverConfig.name}`).join(', ');
    }

    // Generate human/agent markdown summary
    const lines = [
      `### AutoMCP Autonomous Discovery Plan`,
      `**Objective**: "${prompt.slice(0, 60)}${prompt.length > 60 ? '...' : ''}"`,
      `**Workspace**: \`${workspaceRoot}\``,
      ``,
      `#### Discovered Capabilities (${extractedCapabilities.length}):`
    ];

    if (extractedCapabilities.length === 0) {
      lines.push(`*(No external MCP tool capabilities required for this task)*`);
    } else {
      for (const cap of extractedCapabilities) {
        lines.push(`- **[${cap.domain.toUpperCase()}]** \`${cap.subType}\` (${Math.round(cap.confidence * 100)}% confidence) — *${cap.sourceHint || 'Prompt match'}*`);
      }
    }

    lines.push(``, `#### Attached MCP Servers (${discoveredServers.length}):`);
    if (discoveredServers.length === 0) {
      lines.push(`*(No external MCP servers needed; native sovereign primitives active)*`);
    } else {
      for (const s of discoveredServers) {
        lines.push(`- **Tier ${s.tier} (${s.source.toUpperCase()})**: \`${s.serverConfig.name}\``);
        lines.push(`  Command: \`${s.serverConfig.command} ${s.serverConfig.args.join(' ')}\``);
        lines.push(`  Security: ${s.serverConfig.workspaceConfined ? 'Sandboxed to workspace root' : 'Unconfined'}`);
        lines.push(`  Rationale: ${s.reason}`);
      }
    }

    return {
      taskPrompt: prompt,
      workspaceRoot,
      extractedCapabilities,
      discoveredServers,
      gnapTrailers,
      markdownSummary: lines.join('\n')
    };
  }
}
