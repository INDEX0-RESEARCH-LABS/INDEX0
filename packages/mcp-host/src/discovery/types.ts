/**
 * AutoMCP Capability & Discovery Contracts — @index0/mcp-host
 */

import type { IMCPServerConfig } from "@index0/contracts";

export type MCPCapabilityDomain =
  | 'database'
  | 'container'
  | 'cloud'
  | 'vcs'
  | 'search'
  | 'filesystem'
  | 'custom';

export interface ITaskCapabilityRequirement {
  domain: MCPCapabilityDomain;
  subType: string;
  accessLevel: 'read_only' | 'read_write' | 'admin';
  requiredTools?: string[];
  priority: 'mandatory' | 'optional';
  confidence: number; // 0.0 - 1.0
  sourceHint?: string;
}

export interface IDiscoveredMCPServer {
  capability: ITaskCapabilityRequirement;
  serverConfig: IMCPServerConfig;
  tier: 0 | 1 | 2 | 3;
  source: 'native' | 'workspace' | 'catalog' | 'web';
  reason: string;
}

export interface IWorkspaceInspectionResult {
  detectedCapabilities: ITaskCapabilityRequirement[];
  projectType: string;
  detectedFiles: string[];
}
