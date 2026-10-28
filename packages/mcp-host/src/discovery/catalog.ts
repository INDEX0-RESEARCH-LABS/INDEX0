/**
 * AutoMCP Verified Catalog & Resolution Matrix — @index0/mcp-host
 * 
 * Maps task capabilities to concrete, sandboxed MCP server execution configs.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import type { ITaskCapabilityRequirement, IDiscoveredMCPServer } from './types.js';

export interface ICatalogEntry {
  domain: ITaskCapabilityRequirement['domain'];
  subType: string;
  serverPackage: string;
  command: string;
  argsTemplate: string[];
  transport: 'stdio';
  workspaceConfined: boolean;
  description: string;
}

export const VERIFIED_MCP_CATALOG: ICatalogEntry[] = [
  {
    domain: 'search',
    subType: 'web',
    serverPackage: '@index0/client-harness/mcp-websearch',
    command: 'node',
    argsTemplate: ['~/.index0/bin/index0-mcp-websearch.js'],
    transport: 'stdio',
    workspaceConfined: false,
    description: 'Sovereign zero-key live web search and HTML-to-Markdown scraper'
  },
  {
    domain: 'database',
    subType: 'postgres',
    serverPackage: '@modelcontextprotocol/server-postgres',
    command: 'npx',
    argsTemplate: ['-y', '@modelcontextprotocol/server-postgres'],
    transport: 'stdio',
    workspaceConfined: false,
    description: 'PostgreSQL schema inspection, table listing, and SQL query runner'
  },
  {
    domain: 'database',
    subType: 'sqlite',
    serverPackage: '@modelcontextprotocol/server-sqlite',
    command: 'npx',
    argsTemplate: ['-y', '@modelcontextprotocol/server-sqlite', '--db', '{{WORKSPACE_ROOT}}/data.db'],
    transport: 'stdio',
    workspaceConfined: true,
    description: 'Local SQLite database explorer and schema auditor'
  },
  {
    domain: 'container',
    subType: 'docker',
    serverPackage: 'mcp-server-docker',
    command: 'uvx',
    argsTemplate: ['mcp-server-docker'],
    transport: 'stdio',
    workspaceConfined: false,
    description: 'Docker container management, compose triage, and image builder'
  },
  {
    domain: 'cloud',
    subType: 'kubernetes',
    serverPackage: 'kubernetes-mcp-server',
    command: 'uvx',
    argsTemplate: ['kubernetes-mcp-server'],
    transport: 'stdio',
    workspaceConfined: false,
    description: 'Kubernetes cluster state, pod logs, and deployment verification'
  },
  {
    domain: 'vcs',
    subType: 'github',
    serverPackage: '@modelcontextprotocol/server-github',
    command: 'npx',
    argsTemplate: ['-y', '@modelcontextprotocol/server-github'],
    transport: 'stdio',
    workspaceConfined: false,
    description: 'GitHub repository management, PR generation, and issue tracking'
  },
  {
    domain: 'filesystem',
    subType: 'workspace',
    serverPackage: '@modelcontextprotocol/server-filesystem',
    command: 'npx',
    argsTemplate: ['-y', '@modelcontextprotocol/server-filesystem', '{{WORKSPACE_ROOT}}'],
    transport: 'stdio',
    workspaceConfined: true,
    description: 'Deep directory traversal, file search, and sandbox inspection'
  }
];

export class MCPResolver {
  /**
   * Resolves a capability requirement across the 4-tier matrix:
   * Tier 0: Native in-memory / local binary
   * Tier 1: Workspace config file (.index0/mcp.json)
   * Tier 2: Verified catalog entry
   */
  public static resolve(
    capability: ITaskCapabilityRequirement,
    workspaceRoot: string = process.cwd()
  ): IDiscoveredMCPServer | null {
    // Tier 0: Native micro-servers
    if (capability.domain === 'search' && capability.subType === 'web') {
      const home = process.env.INDEX0_HOME ?? path.join(process.env.HOME || '', '.index0');
      const bin = path.join(home, 'bin', 'index0-mcp-websearch.js');
      return {
        capability,
        tier: 0,
        source: 'native',
        reason: 'Sovereign native web search micro-server',
        serverConfig: {
          name: 'index0-websearch',
          command: 'node',
          args: [bin],
          transport: 'stdio',
          workspaceConfined: false,
          description: 'Native live web search and HTML scraper'
        }
      };
    }

    // Tier 1: Workspace local config (.index0/mcp.json)
    const wsMcpConfig = path.join(workspaceRoot, '.index0', 'mcp.json');
    if (fs.existsSync(wsMcpConfig)) {
      try {
        const raw = JSON.parse(fs.readFileSync(wsMcpConfig, 'utf8'));
        const matching = raw.servers?.[capability.subType];
        if (matching) {
          return {
            capability,
            tier: 1,
            source: 'workspace',
            reason: `Workspace declared MCP server in ${wsMcpConfig}`,
            serverConfig: {
              name: matching.name || capability.subType,
              command: matching.command,
              args: matching.args || [],
              transport: matching.transport || 'stdio',
              workspaceConfined: matching.workspaceConfined ?? true,
              description: matching.description
            }
          };
        }
      } catch {
        // Non-fatal
      }
    }

    // Tier 2: Verified Sovereign Catalog
    const entry = VERIFIED_MCP_CATALOG.find(
      (c) => c.domain === capability.domain && c.subType === capability.subType
    );

    if (entry) {
      const resolvedArgs = entry.argsTemplate.map((arg) =>
        arg.replace('{{WORKSPACE_ROOT}}', workspaceRoot)
      );

      return {
        capability,
        tier: 2,
        source: 'catalog',
        reason: `Matched verified catalog entry for ${entry.serverPackage}`,
        serverConfig: {
          name: entry.subType,
          command: entry.command,
          args: resolvedArgs,
          transport: entry.transport,
          workspaceConfined: entry.workspaceConfined,
          description: entry.description
        }
      };
    }

    return null;
  }

  /**
   * Batch resolves a list of capabilities into unique discovered MCP servers.
   */
  public static resolveAll(
    capabilities: ITaskCapabilityRequirement[],
    workspaceRoot: string = process.cwd()
  ): IDiscoveredMCPServer[] {
    const servers: IDiscoveredMCPServer[] = [];
    const seenNames = new Set<string>();

    for (const cap of capabilities) {
      const discovered = this.resolve(cap, workspaceRoot);
      if (discovered && !seenNames.has(discovered.serverConfig.name)) {
        seenNames.add(discovered.serverConfig.name);
        servers.push(discovered);
      }
    }

    return servers;
  }
}
