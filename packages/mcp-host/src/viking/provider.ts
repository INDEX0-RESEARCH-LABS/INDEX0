/**
 * Viking Context Provider — @index0/mcp-host
 * Generates L0 Abstract, L1 Structural, and L2 Full context from code files.
 */

import * as fs from "node:fs/promises";
import * as path from "node:path";
import type {
  ContextTier,
  IVikingContextRequest,
  IVikingContextResponse,
  IVikingL0Abstract,
  IVikingL1Structural
} from "@index0/contracts";
import { VikingContextCache } from "./cache.js";

export class VikingContextProvider {
  private readonly cache: VikingContextCache;

  constructor(
    private readonly repoRoot: string = process.cwd(),
    cache?: VikingContextCache
  ) {
    this.cache = cache ?? new VikingContextCache();
  }

  /**
   * Approximate token count for text content (~4 characters per token).
   */
  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  /**
   * Parse a viking:// URI into a clean relative file path.
   * e.g., "viking://packages/contracts/src/v1/auth" -> "packages/contracts/src/v1/auth"
   */
  parseVikingUri(uri: string): string {
    return uri.replace(/^viking:\/\//, "").replace(/^\/+/, "");
  }

  /**
   * Generate L0 Abstract summary of a source file or directory.
   */
  async generateL0Abstract(targetPath: string): Promise<IVikingL0Abstract> {
    const fullPath = path.resolve(this.repoRoot, targetPath);
    let stat;
    try {
      stat = await fs.stat(fullPath);
    } catch {
      return {
        path: targetPath,
        summary: `File or directory not found: ${targetPath}`,
        language: "unknown",
        keyExports: [],
        dependencies: []
      };
    }

    if (stat.isDirectory()) {
      const files = await fs.readdir(fullPath);
      return {
        path: targetPath,
        summary: `Directory containing ${files.length} items (${files.slice(0, 5).join(", ")})`,
        language: "directory",
        keyExports: [],
        dependencies: []
      };
    }

    const content = await fs.readFile(fullPath, "utf-8");
    const ext = path.extname(targetPath).toLowerCase();
    const language = ext === ".ts" ? "typescript" : ext === ".py" ? "python" : ext === ".go" ? "go" : ext;

    // Extract exported symbols
    const exportMatches = content.match(/export\s+(?:class|interface|type|const|function)\s+([A-Za-z0-9_]+)/g) || [];
    const keyExports = exportMatches.map((m) => m.split(/\s+/).pop() || "").filter(Boolean);

    // Extract import dependencies
    const importMatches = content.match(/from\s+["']([^"']+)["']/g) || [];
    const dependencies = importMatches.map((m) => m.replace(/from\s+["']|["']/g, "")).slice(0, 10);

    return {
      path: targetPath,
      summary: `Source module with ${keyExports.length} exports and ${dependencies.length} dependencies.`,
      language,
      keyExports: keyExports.slice(0, 8),
      dependencies
    };
  }

  /**
   * Generate L1 Structural summary of a source file.
   */
  async generateL1Structural(targetPath: string): Promise<IVikingL1Structural> {
    const fullPath = path.resolve(this.repoRoot, targetPath);
    try {
      const content = await fs.readFile(fullPath, "utf-8");

      // Extract type definitions and interfaces
      const typeMatches = content.match(/(?:export\s+)?(?:interface|type)\s+([A-Za-z0-9_]+)[^;{]*/g) || [];
      const typeDefinitions = typeMatches.map((t) => t.trim()).slice(0, 15);

      // Extract function/method signatures
      const sigMatches = content.match(/(?:export\s+)?(?:async\s+)?function\s+([A-Za-z0-9_]+)\s*\(([^)]*)\)(?::\s*([^{]+))?/g) || [];
      const signatures = sigMatches.map((sig) => {
        const isAsync = sig.includes("async ");
        const isExported = sig.includes("export ");
        const nameMatch = sig.match(/function\s+([A-Za-z0-9_]+)/);
        const name = nameMatch ? nameMatch[1] : "anonymous";
        const paramsMatch = sig.match(/\(([^)]*)\)/);
        const params = paramsMatch ? paramsMatch[1].trim() : "";
        const returnMatch = sig.match(/\):\s*([^{]+)/);
        const returnType = returnMatch ? returnMatch[1].trim() : "void";

        return {
          name,
          params,
          returnType,
          isExported,
          isAsync
        };
      });

      const importMatches = content.match(/import\s+[^;]+;/g) || [];
      const exportMatches = content.match(/export\s+[^;]+;/g) || [];

      return {
        path: targetPath,
        directoryTree: path.dirname(targetPath),
        signatures,
        typeDefinitions,
        imports: importMatches.slice(0, 10),
        exports: exportMatches.slice(0, 10)
      };
    } catch {
      return {
        path: targetPath,
        directoryTree: path.dirname(targetPath),
        signatures: [],
        typeDefinitions: [],
        imports: [],
        exports: []
      };
    }
  }

  /**
   * Retrieve full source code (L2).
   */
  async generateL2Full(targetPath: string): Promise<string> {
    const fullPath = path.resolve(this.repoRoot, targetPath);
    return await fs.readFile(fullPath, "utf-8");
  }

  /**
   * Main resolver entrypoint for viking:// requests.
   */
  async resolveContext(request: IVikingContextRequest): Promise<IVikingContextResponse> {
    const cleanPath = this.parseVikingUri(request.path);
    const now = new Date().toISOString();

    // Check cache first
    const cached = this.cache.get(cleanPath, request.tier);
    if (cached) {
      return {
        requestId: request.requestId,
        tier: cached.tier,
        content: cached.content,
        tokenCount: cached.tokenCount,
        cached: true,
        cacheKey: cached.key,
        generatedAt: cached.createdAt,
        timestamp: now
      };
    }

    let content: string;
    let actualTier: ContextTier = request.tier;

    switch (request.tier) {
      case "L0_ABSTRACT": {
        const abstract = await this.generateL0Abstract(cleanPath);
        content = JSON.stringify(abstract, null, 2);
        break;
      }
      case "L1_STRUCTURAL": {
        const structural = await this.generateL1Structural(cleanPath);
        content = JSON.stringify(structural, null, 2);
        break;
      }
      case "L2_FULL": {
        try {
          content = await this.generateL2Full(cleanPath);
        } catch (err: unknown) {
          // Graceful degradation to L0 on failure
          const abstract = await this.generateL0Abstract(cleanPath);
          content = JSON.stringify(abstract, null, 2);
          actualTier = "L0_ABSTRACT";
        }
        break;
      }
    }

    const tokenCount = this.estimateTokens(content);
    const entry = this.cache.set(cleanPath, actualTier, content, tokenCount);

    return {
      requestId: request.requestId,
      tier: actualTier,
      content,
      tokenCount,
      cached: false,
      cacheKey: entry.key,
      generatedAt: entry.createdAt,
      timestamp: now
    };
  }

  getCache(): VikingContextCache {
    return this.cache;
  }
}
