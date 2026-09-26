import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  type IMCPToolRegistry,
  type IMCPToolDefinition,
  type IMCPServerConfig,
  type IMCPBoundaryRules,
  type MCPTransport,
  type MCPToolCategory,
} from "@index0/contracts";

describe("Dev 2 Platform: MCP Tool Registry & Container Sandbox Conformance", () => {
  const currentDir = path.dirname(fileURLToPath(import.meta.url));
  const rootDir = path.resolve(currentDir, "../..");
  const registryPath = path.join(rootDir, "infra/mcp/tool-registry.json");
  const composePath = path.join(rootDir, "infra/compose/docker-compose.yml");
  const workspacePath = path.join(rootDir, "workspace");

  // -------------------------------------------------------------------------
  // 1. Contract Type & Schema Conformance
  // -------------------------------------------------------------------------
  describe("IMCPToolRegistry Schema Conformance", () => {
    it("should strictly conform to @index0/contracts IMCPToolRegistry interface", () => {
      assert.ok(fs.existsSync(registryPath), "tool-registry.json must exist");
      const registry: IMCPToolRegistry = JSON.parse(fs.readFileSync(registryPath, "utf-8"));

      assert.strictEqual(registry.version, "1.0");
      assert.ok(Array.isArray(registry.servers), "servers must be an array");
      assert.ok(Array.isArray(registry.nativeTools), "nativeTools must be an array");
      assert.ok(typeof registry.boundaryRules === "object" && registry.boundaryRules !== null);
      assert.strictEqual(registry.boundaryRules.workspaceRoot, "/opt/workspace_base");
    });

    it("should validate all 6 native tools against IMCPToolDefinition contract", () => {
      const registry: IMCPToolRegistry = JSON.parse(fs.readFileSync(registryPath, "utf-8"));
      assert.strictEqual(registry.nativeTools.length, 6, "Must register exactly 6 native tools");

      const validCategories: MCPToolCategory[] = ["filesystem", "search", "execution", "inspection"];
      const validTransports: MCPTransport[] = ["stdio", "sse", "native"];

      for (const tool of registry.nativeTools) {
        assert.ok(tool.name.length > 0, "Tool name must not be empty");
        assert.ok(tool.description.length > 0, "Tool description must not be empty");
        assert.ok(validCategories.includes(tool.category), `Invalid category: ${tool.category}`);
        assert.ok(validTransports.includes(tool.transport), `Invalid transport: ${tool.transport}`);
        assert.strictEqual(tool.transport, "native", "Native tools must use native transport");
        assert.strictEqual(tool.sandboxed, true, "Native tools must be sandboxed");
        assert.strictEqual(tool.isNative, true, "isNative must be true");
      }
    });

    it("should validate server configs against IMCPServerConfig contract", () => {
      const registry: IMCPToolRegistry = JSON.parse(fs.readFileSync(registryPath, "utf-8"));
      assert.strictEqual(registry.servers.length, 2, "Must configure exactly 2 MCP servers");

      for (const srv of registry.servers) {
        assert.ok(srv.name.startsWith("@modelcontextprotocol/"), `Server ${srv.name} must be official standard package`);
        assert.strictEqual(srv.command, "npx", "Server command must use npx runner");
        assert.ok(Array.isArray(srv.args), "Args must be an array");
        assert.strictEqual(srv.transport, "stdio", "Must use stdio transport");
        assert.ok(typeof srv.workspaceConfined === "boolean");
      }
    });
  });

  // -------------------------------------------------------------------------
  // 2. Docker Compose & Sandbox Confinement Alignment
  // -------------------------------------------------------------------------
  describe("Docker Compose Workspace Mount Alignment", () => {
    it("should match workspace mount with cloud IDE container mount", () => {
      const codeServerPath = path.join(rootDir, "infra/compose/code-server.yml");
      assert.ok(fs.existsSync(codeServerPath), "code-server.yml must exist");
      const compose = fs.readFileSync(codeServerPath, "utf-8");
      assert.match(
        compose,
        /\.\.\/\.\.\/workspace:\/workspace/,
        "code-server workspace mount must target /workspace"
      );
    });

    it("should verify host workspace directory exists and is accessible for bind mount", () => {
      assert.ok(fs.existsSync(workspacePath), "Host workspace/ directory must exist");
      const stats = fs.statSync(workspacePath);
      assert.ok(stats.isDirectory(), "workspace must be a valid directory");
    });
  });

  // -------------------------------------------------------------------------
  // 3. Filesystem Server Confinement & Argument Verification
  // -------------------------------------------------------------------------
  describe("Filesystem MCP Server Confinement", () => {
    it("should configure @modelcontextprotocol/server-filesystem strictly within workspaceRoot", () => {
      const registry: IMCPToolRegistry = JSON.parse(fs.readFileSync(registryPath, "utf-8"));
      const fsSrv = registry.servers.find(s => s.name === "@modelcontextprotocol/server-filesystem");

      assert.ok(fsSrv, "Filesystem server must be registered");
      assert.strictEqual(fsSrv.workspaceConfined, true, "Must be workspaceConfined");
      assert.strictEqual(fsSrv.transport, "stdio");

      // Verify that the args pass the workspace root
      const workspaceArg = fsSrv.args[fsSrv.args.length - 1];
      assert.strictEqual(
        workspaceArg,
        registry.boundaryRules.workspaceRoot,
        "Filesystem server target directory arg must equal boundaryRules.workspaceRoot"
      );
    });

    it("should configure @modelcontextprotocol/server-brave-search with stdio transport", () => {
      const registry: IMCPToolRegistry = JSON.parse(fs.readFileSync(registryPath, "utf-8"));
      const braveSrv = registry.servers.find(s => s.name === "@modelcontextprotocol/server-brave-search");

      assert.ok(braveSrv, "Brave search server must be registered");
      assert.strictEqual(braveSrv.transport, "stdio");
      assert.strictEqual(braveSrv.workspaceConfined, false);
      assert.ok(braveSrv.env && "BRAVE_API_KEY" in braveSrv.env);
    });
  });

  // -------------------------------------------------------------------------
  // 4. Boundary Path Traversal Protection Invariants (Simulation)
  // -------------------------------------------------------------------------
  describe("Boundary Path Traversal Invariants (Simulation)", () => {
    const registry: IMCPToolRegistry = JSON.parse(fs.readFileSync(registryPath, "utf-8"));
    const boundary = registry.boundaryRules;

    function validateAccess(targetPath: string): { allowed: boolean; reason?: string } {
      for (const deny of boundary.denyPaths) {
        if (targetPath.includes(deny)) {
          return { allowed: false, reason: `Denied path pattern matched: ${deny}` };
        }
      }
      const normalized = path.posix.normalize(targetPath);
      if (!normalized.startsWith(boundary.workspaceRoot)) {
        return { allowed: false, reason: `Path escapes workspace root ${boundary.workspaceRoot}` };
      }
      return { allowed: true };
    }

    it("should permit legitimate workspace paths", () => {
      const allowedSamples = [
        "/opt/workspace_base/src/index.ts",
        "/opt/workspace_base/package.json",
        "/opt/workspace_base/README.md",
        "/opt/workspace_base/docs/architecture/build.md",
        "/opt/workspace_base/nested/dir/deep/file.txt",
      ];

      for (const p of allowedSamples) {
        const result = validateAccess(p);
        assert.strictEqual(result.allowed, true, `Path should be allowed: ${p} (${result.reason})`);
      }
    });

    it("should deny path traversal attempts outside workspace root", () => {
      const deniedSamples = [
        "/opt/workspace_base/../../etc/passwd",
        "/opt/workspace_base/../../var/log/syslog",
        "/etc/shadow",
        "/var/run/docker.sock",
        "/root/.ssh/id_rsa",
        "/home/darion-dev/.bashrc",
        "/opt/workspace_base/../opt/another-dir",
      ];

      for (const p of deniedSamples) {
        const result = validateAccess(p);
        assert.strictEqual(result.allowed, false, `Path should be blocked: ${p}`);
      }
    });

    it("should enforce symlinkResolution policy set to 'deny'", () => {
      assert.strictEqual(
        boundary.symlinkResolution,
        "deny",
        "symlinkResolution must be 'deny' to block symlink-based boundary escape"
      );
    });
  });

  // -------------------------------------------------------------------------
  // 5. Option A Architecture Compliance (Zero Custom Go MCP Code)
  // -------------------------------------------------------------------------
  describe("Option A Architecture Invariants", () => {
    it("should verify that no custom Go MCP host code exists in the repository", () => {
      const forbiddenPaths = [
        path.join(rootDir, "gateway/mcp.go"),
        path.join(rootDir, "cmd/mcp/main.go"),
        path.join(rootDir, "infra/mcp/main.go"),
        path.join(rootDir, "services/mcp"),
        path.join(rootDir, "packages/mcp-server"),
      ];

      for (const forbidden of forbiddenPaths) {
        assert.ok(
          !fs.existsSync(forbidden),
          `Option A Violation: Forbidden custom MCP component exists at ${forbidden}`
        );
      }
    });
  });
});
