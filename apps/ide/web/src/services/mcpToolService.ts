/**
 * Model Context Protocol (MCP) Tool Service — @index0/ide-web
 * Loads canonical tool registry, categorizes tools by MCPToolCategory,
 * computes sandbox status badges, and evaluates workspace boundary confinement.
 */

import type {
  MCPToolCategory,
  IMCPToolDefinition,
  IMCPBoundaryRules,
  IMCPToolRegistry
} from '@index0/contracts';

export type {
  MCPTransport,
  MCPToolCategory,
  IMCPToolDefinition,
  IMCPServerConfig,
  IMCPBoundaryRules,
  IMCPToolRegistry
} from '@index0/contracts';

export const CANONICAL_MCP_REGISTRY: IMCPToolRegistry = {
  version: '1.0',
  servers: [
    {
      name: '@modelcontextprotocol/server-filesystem',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-filesystem', '/opt/workspace_base'],
      env: {},
      transport: 'stdio',
      workspaceConfined: true,
      description: 'Standard MCP filesystem server providing read-only file access confined to workspace root'
    },
    {
      name: '@modelcontextprotocol/server-brave-search',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-brave-search'],
      env: {
        BRAVE_API_KEY: '${BRAVE_API_KEY:-}'
      },
      transport: 'stdio',
      workspaceConfined: false,
      description: 'Optional standard MCP Brave Search server for web research queries'
    }
  ],
  nativeTools: [
    {
      name: 'openhands_file_search',
      description: 'Ripgrep-powered workspace code search across all project files',
      category: 'search',
      transport: 'native',
      sandboxed: true,
      isNative: true
    },
    {
      name: 'openhands_file_read',
      description: 'Read file contents within the workspace boundary',
      category: 'filesystem',
      transport: 'native',
      sandboxed: true,
      isNative: true
    },
    {
      name: 'openhands_file_edit',
      description: 'Apply edits to workspace files with diff tracking',
      category: 'filesystem',
      transport: 'native',
      sandboxed: true,
      isNative: true
    },
    {
      name: 'openhands_directory_list',
      description: 'List directory contents within the workspace tree',
      category: 'inspection',
      transport: 'native',
      sandboxed: true,
      isNative: true
    },
    {
      name: 'openhands_bash_execute',
      description: 'Execute shell commands inside the sandboxed runtime container',
      category: 'execution',
      transport: 'native',
      sandboxed: true,
      isNative: true
    },
    {
      name: 'openhands_browser',
      description: 'Browser interaction tool for web page navigation and inspection',
      category: 'inspection',
      transport: 'native',
      sandboxed: true,
      isNative: true
    }
  ],
  boundaryRules: {
    workspaceRoot: '/opt/workspace_base',
    denyPaths: ['../../', '/etc', '/var', '/root', '/home'],
    symlinkResolution: 'deny'
  }
};

export const CATEGORY_COLORS: Record<MCPToolCategory, { bg: string; text: string; border: string }> = {
  filesystem: { bg: 'rgba(56, 189, 248, 0.15)', text: '#38bdf8', border: 'rgba(56, 189, 248, 0.3)' },
  search: { bg: 'rgba(167, 139, 250, 0.15)', text: '#c084fc', border: 'rgba(167, 139, 250, 0.3)' },
  execution: { bg: 'rgba(16, 185, 129, 0.15)', text: '#34d399', border: 'rgba(16, 185, 129, 0.3)' },
  inspection: { bg: 'rgba(251, 191, 36, 0.15)', text: '#fbbf24', border: 'rgba(251, 191, 36, 0.3)' }
};

export class MCPToolService {
  private registry: IMCPToolRegistry;

  constructor(customRegistry?: Partial<IMCPToolRegistry>) {
    this.registry = {
      ...CANONICAL_MCP_REGISTRY,
      ...customRegistry,
      servers: customRegistry?.servers || CANONICAL_MCP_REGISTRY.servers,
      nativeTools: customRegistry?.nativeTools || CANONICAL_MCP_REGISTRY.nativeTools,
      boundaryRules: {
        ...CANONICAL_MCP_REGISTRY.boundaryRules,
        ...(customRegistry?.boundaryRules || {})
      }
    };
  }

  public getRegistry(): Readonly<IMCPToolRegistry> {
    return this.registry;
  }

  public getBoundaryRules(): Readonly<IMCPBoundaryRules> {
    return this.registry.boundaryRules;
  }

  /**
   * Normalizes all native tools and server configurations into a unified IMCPToolDefinition list.
   */
  public getAllTools(): IMCPToolDefinition[] {
    const tools: IMCPToolDefinition[] = [...this.registry.nativeTools];

    for (const server of this.registry.servers) {
      let category: MCPToolCategory = 'filesystem';
      if (server.name.includes('search')) {
        category = 'search';
      }

      tools.push({
        name: server.name,
        description: server.description || `MCP Server: ${server.name}`,
        category,
        transport: server.transport,
        sandboxed: server.workspaceConfined,
        isNative: false
      });
    }

    return tools;
  }

  /**
   * Groups all 8 tools into the 4 canonical MCPToolCategory domains.
   */
  public getToolsByCategory(): Record<MCPToolCategory, IMCPToolDefinition[]> {
    const grouped: Record<MCPToolCategory, IMCPToolDefinition[]> = {
      filesystem: [],
      search: [],
      execution: [],
      inspection: []
    };

    const allTools = this.getAllTools();
    for (const tool of allTools) {
      if (grouped[tool.category]) {
        grouped[tool.category].push(tool);
      }
    }

    return grouped;
  }

  /**
   * Computes aggregate metrics for registered tools.
   */
  public getToolCount(): { total: number; native: number; external: number; sandboxed: number } {
    const all = this.getAllTools();
    const native = all.filter((t) => t.isNative).length;
    const external = all.filter((t) => !t.isNative).length;
    const sandboxed = all.filter((t) => t.sandboxed).length;

    return {
      total: all.length,
      native,
      external,
      sandboxed
    };
  }

  /**
   * Validates whether a file path is permitted under the workspace boundary confinement rules.
   */
  public validatePathAccess(requestedPath: string): { allowed: boolean; reason?: string } {
    const rules = this.registry.boundaryRules;

    // Check explicit deny patterns (e.g. "../../", "/etc", "/var", "/root", "/home")
    for (const denyPattern of rules.denyPaths) {
      if (requestedPath.includes(denyPattern)) {
        return {
          allowed: false,
          reason: `Path contains forbidden boundary traversal pattern: "${denyPattern}"`
        };
      }
    }

    // Normalized path check against workspace root
    if (requestedPath.startsWith('/') && !requestedPath.startsWith(rules.workspaceRoot)) {
      return {
        allowed: false,
        reason: `Path "${requestedPath}" escapes workspace root boundary: "${rules.workspaceRoot}"`
      };
    }

    return { allowed: true };
  }

  /**
   * Filters tools by name or description search query and optional category.
   */
  public filterTools(query: string = '', categoryFilter: MCPToolCategory | 'all' = 'all'): IMCPToolDefinition[] {
    const cleanQuery = query.toLowerCase().trim();
    return this.getAllTools().filter((tool) => {
      const matchesCategory = categoryFilter === 'all' || tool.category === categoryFilter;
      const matchesQuery =
        !cleanQuery ||
        tool.name.toLowerCase().includes(cleanQuery) ||
        tool.description.toLowerCase().includes(cleanQuery);
      return matchesCategory && matchesQuery;
    });
  }

  public getCategoryColor(category: MCPToolCategory) {
    return CATEGORY_COLORS[category] || CATEGORY_COLORS.filesystem;
  }
}
