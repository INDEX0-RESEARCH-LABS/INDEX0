/**
 * AutoMCP Capability Extractor — @index0/mcp-host
 * 
 * Analyzes autonomous agent tasks and workspace files to identify
 * necessary MCP tool capabilities before agent execution.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import type { ITaskCapabilityRequirement, IWorkspaceInspectionResult } from './types.js';

interface KeywordRule {
  domain: ITaskCapabilityRequirement['domain'];
  subType: string;
  patterns: RegExp[];
  accessLevel: ITaskCapabilityRequirement['accessLevel'];
}

const KEYWORD_RULES: KeywordRule[] = [
  {
    domain: 'database',
    subType: 'postgres',
    patterns: [/\bpostgres\b/i, /\bpostgresql\b/i, /\bpsql\b/i, /\bmigration\b/i, /\bsql query\b/i],
    accessLevel: 'read_write'
  },
  {
    domain: 'database',
    subType: 'sqlite',
    patterns: [/\bsqlite\b/i, /\b\.sqlite\b/i, /\bbetter-sqlite3\b/i],
    accessLevel: 'read_write'
  },
  {
    domain: 'container',
    subType: 'docker',
    patterns: [/\bdocker\b/i, /\bdocker-compose\b/i, /\bcontainerize\b/i, /\bdockerfile\b/i],
    accessLevel: 'read_write'
  },
  {
    domain: 'cloud',
    subType: 'kubernetes',
    patterns: [/\bk8s\b/i, /\bkubernetes\b/i, /\bkubectl\b/i, /\bpods?\b/i, /\bhelm\b/i],
    accessLevel: 'read_only'
  },
  {
    domain: 'vcs',
    subType: 'github',
    patterns: [/\bgithub\b/i, /\bpull request\b/i, /\bopen pr\b/i, /\bissue audit\b/i, /\bgh cli\b/i],
    accessLevel: 'read_write'
  },
  {
    domain: 'search',
    subType: 'web',
    patterns: [
      /\bsearch the web\b/i,
      /\blatest documentation\b/i,
      /\brelease notes\b/i,
      /\bapi docs\b/i,
      /\bbreaking changes?\b/i,
      /\bfastmcp\b/i,
      /\breact 19\b/i,
      /\blanggraph\b/i
    ],
    accessLevel: 'read_only'
  },
  {
    domain: 'filesystem',
    subType: 'workspace',
    patterns: [/\bdeep audit\b/i, /\bfile tree\b/i, /\breorganize directory\b/i],
    accessLevel: 'read_write'
  }
];

export class CapabilityExtractor {
  /**
   * Extracts required capabilities from task prompt text.
   */
  public static extractFromPrompt(prompt: string): ITaskCapabilityRequirement[] {
    const results: ITaskCapabilityRequirement[] = [];
    const lower = prompt.toLowerCase();

    for (const rule of KEYWORD_RULES) {
      const match = rule.patterns.some((pattern) => pattern.test(lower));
      if (match) {
        results.push({
          domain: rule.domain,
          subType: rule.subType,
          accessLevel: rule.accessLevel,
          priority: 'mandatory',
          confidence: 0.9,
          sourceHint: `Prompt matched keyword rule for ${rule.subType}`
        });
      }
    }

    return results;
  }

  /**
   * Inspects a workspace root directory for project files and dependencies.
   */
  public static inspectWorkspace(workspaceRoot: string): IWorkspaceInspectionResult {
    const detectedCapabilities: ITaskCapabilityRequirement[] = [];
    const detectedFiles: string[] = [];
    let projectType = 'generic';

    if (!workspaceRoot || !fs.existsSync(workspaceRoot)) {
      return { detectedCapabilities, projectType, detectedFiles };
    }

    // 1. Check Docker / Container files
    const dockerFiles = ['Dockerfile', 'docker-compose.yml', 'docker-compose.yaml', 'compose.yaml', 'compose.yml'];
    for (const f of dockerFiles) {
      if (fs.existsSync(path.join(workspaceRoot, f))) {
        detectedFiles.push(f);
        if (!detectedCapabilities.some((c) => c.subType === 'docker')) {
          detectedCapabilities.push({
            domain: 'container',
            subType: 'docker',
            accessLevel: 'read_write',
            priority: 'optional',
            confidence: 0.85,
            sourceHint: `Discovered workspace container file: ${f}`
          });
        }
      }
    }

    // 2. Check Prisma / Database schemas
    const prismaSchema = path.join(workspaceRoot, 'prisma', 'schema.prisma');
    if (fs.existsSync(prismaSchema)) {
      detectedFiles.push('prisma/schema.prisma');
      try {
        const content = fs.readFileSync(prismaSchema, 'utf8');
        if (content.includes('provider = "postgresql"')) {
          detectedCapabilities.push({
            domain: 'database',
            subType: 'postgres',
            accessLevel: 'read_write',
            priority: 'optional',
            confidence: 0.95,
            sourceHint: 'Prisma schema declares PostgreSQL provider'
          });
        } else if (content.includes('provider = "sqlite"')) {
          detectedCapabilities.push({
            domain: 'database',
            subType: 'sqlite',
            accessLevel: 'read_write',
            priority: 'optional',
            confidence: 0.95,
            sourceHint: 'Prisma schema declares SQLite provider'
          });
        }
      } catch {
        // Non-fatal if file read fails
      }
    }

    // 3. Check Git repository remote
    const gitConfig = path.join(workspaceRoot, '.git', 'config');
    if (fs.existsSync(gitConfig)) {
      detectedFiles.push('.git/config');
      try {
        const content = fs.readFileSync(gitConfig, 'utf8');
        if (content.includes('github.com')) {
          detectedCapabilities.push({
            domain: 'vcs',
            subType: 'github',
            accessLevel: 'read_only',
            priority: 'optional',
            confidence: 0.8,
            sourceHint: 'Git remote origin is hosted on GitHub'
          });
        }
      } catch {
        // Non-fatal
      }
    }

    // 4. Check Kubernetes manifests
    const k8sDir = path.join(workspaceRoot, 'k8s');
    if (fs.existsSync(k8sDir)) {
      detectedFiles.push('k8s/');
      detectedCapabilities.push({
        domain: 'cloud',
        subType: 'kubernetes',
        accessLevel: 'read_only',
        priority: 'optional',
        confidence: 0.75,
        sourceHint: 'Discovered k8s/ deployment directory'
      });
    }

    return {
      detectedCapabilities,
      projectType,
      detectedFiles
    };
  }

  /**
   * Unified extraction merging task prompt and workspace heuristics.
   */
  public static extract(prompt: string, workspaceRoot?: string): ITaskCapabilityRequirement[] {
    const fromPrompt = this.extractFromPrompt(prompt);
    if (!workspaceRoot) return fromPrompt;

    const fromWorkspace = this.inspectWorkspace(workspaceRoot).detectedCapabilities;
    const merged = [...fromPrompt];

    for (const wsCap of fromWorkspace) {
      const existing = merged.find((c) => c.domain === wsCap.domain && c.subType === wsCap.subType);
      if (!existing) {
        merged.push(wsCap);
      }
    }

    return merged;
  }
}
