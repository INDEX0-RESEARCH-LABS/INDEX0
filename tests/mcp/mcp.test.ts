import { describe, it } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

describe("MCP Tool Registry & Workspace Boundary Conformance", () => {
  const currentDir = path.dirname(fileURLToPath(import.meta.url));
  const rootDir = path.resolve(currentDir, "../..");
  const registryPath = path.join(rootDir, "infra/mcp/tool-registry.json");
  const instructionsPath = path.join(rootDir, "workspace/.openhands_instructions");
  const packagesDir = path.join(rootDir, "packages");
  const servicesDir = path.join(rootDir, "services");

  // -------------------------------------------------------------------------
  // 1. Tool Registry Schema Validation
  // -------------------------------------------------------------------------
  describe("Tool Registry Schema Validation", () => {
    it("should exist and parse as valid JSON", () => {
      assert.ok(fs.existsSync(registryPath), "infra/mcp/tool-registry.json must exist");
      const raw = fs.readFileSync(registryPath, "utf-8");
      const data = JSON.parse(raw);
      assert.strictEqual(data.version, "1.0", "Registry version must be 1.0");
      assert.ok(data.description, "Registry must have a description");
    });

    it("should contain required top-level sections", () => {
      const data = JSON.parse(fs.readFileSync(registryPath, "utf-8"));
      assert.ok(Array.isArray(data.servers), "Must have servers array");
      assert.ok(Array.isArray(data.nativeTools), "Must have nativeTools array");
      assert.ok(data.boundaryRules, "Must have boundaryRules object");
    });

    it("should define workspace root in boundary rules", () => {
      const data = JSON.parse(fs.readFileSync(registryPath, "utf-8"));
      assert.strictEqual(
        data.boundaryRules.workspaceRoot,
        "/opt/workspace_base",
        "Workspace root must be /opt/workspace_base"
      );
    });
  });

  // -------------------------------------------------------------------------
  // 2. Native Tool Inventory
  // -------------------------------------------------------------------------
  describe("Native OpenHands Tool Inventory", () => {
    const expectedNativeTools = [
      "openhands_file_search",
      "openhands_file_read",
      "openhands_file_edit",
      "openhands_directory_list",
      "openhands_bash_execute",
      "openhands_browser"
    ];

    it("should register exactly 6 native OpenHands tools", () => {
      const data = JSON.parse(fs.readFileSync(registryPath, "utf-8"));
      assert.strictEqual(data.nativeTools.length, 6, "Must have exactly 6 native tools");
    });

    it("should include all expected native tool names", () => {
      const data = JSON.parse(fs.readFileSync(registryPath, "utf-8"));
      const toolNames = data.nativeTools.map((t: { name: string }) => t.name);
      for (const expected of expectedNativeTools) {
        assert.ok(toolNames.includes(expected), `Must include native tool: ${expected}`);
      }
    });

    it("should mark all native tools with transport 'native' and sandboxed true", () => {
      const data = JSON.parse(fs.readFileSync(registryPath, "utf-8"));
      for (const tool of data.nativeTools) {
        assert.strictEqual(tool.transport, "native", `${tool.name} must use native transport`);
        assert.strictEqual(tool.sandboxed, true, `${tool.name} must be sandboxed`);
        assert.strictEqual(tool.isNative, true, `${tool.name} must be marked as native`);
      }
    });

    it("should cover all four tool categories across native tools", () => {
      const data = JSON.parse(fs.readFileSync(registryPath, "utf-8"));
      const categories = new Set(data.nativeTools.map((t: { category: string }) => t.category));
      const expectedCategories = ["filesystem", "search", "execution", "inspection"];
      for (const cat of expectedCategories) {
        assert.ok(categories.has(cat), `Must cover category: ${cat}`);
      }
    });
  });

  // -------------------------------------------------------------------------
  // 3. Standard MCP Server Entries
  // -------------------------------------------------------------------------
  describe("Standard MCP Server Configuration", () => {
    it("should register @modelcontextprotocol/server-filesystem with workspace confinement", () => {
      const data = JSON.parse(fs.readFileSync(registryPath, "utf-8"));
      const fsSrv = data.servers.find(
        (s: { name: string }) => s.name === "@modelcontextprotocol/server-filesystem"
      );
      assert.ok(fsSrv, "Must register @modelcontextprotocol/server-filesystem");
      assert.strictEqual(fsSrv.transport, "stdio", "Filesystem server must use stdio transport");
      assert.strictEqual(fsSrv.workspaceConfined, true, "Filesystem server must be workspace confined");
      assert.ok(fsSrv.args.includes("/opt/workspace_base"), "Args must include workspace root path");
    });

    it("should register @modelcontextprotocol/server-brave-search as optional external server", () => {
      const data = JSON.parse(fs.readFileSync(registryPath, "utf-8"));
      const braveSrv = data.servers.find(
        (s: { name: string }) => s.name === "@modelcontextprotocol/server-brave-search"
      );
      assert.ok(braveSrv, "Must register @modelcontextprotocol/server-brave-search");
      assert.strictEqual(braveSrv.transport, "stdio", "Brave Search server must use stdio transport");
      assert.strictEqual(braveSrv.workspaceConfined, false, "Brave Search is not workspace confined");
    });

    it("should use standard npx launch command for all MCP servers", () => {
      const data = JSON.parse(fs.readFileSync(registryPath, "utf-8"));
      for (const srv of data.servers) {
        assert.strictEqual(srv.command, "npx", `${srv.name} must use npx launcher command`);
      }
    });
  });

  // -------------------------------------------------------------------------
  // 4. Boundary Enforcement Rules
  // -------------------------------------------------------------------------
  describe("Workspace Boundary Enforcement", () => {
    it("should deny parent directory traversal (../../)", () => {
      const data = JSON.parse(fs.readFileSync(registryPath, "utf-8"));
      assert.ok(
        data.boundaryRules.denyPaths.includes("../../"),
        "Deny paths must include ../../"
      );
    });

    it("should deny access to sensitive host directories", () => {
      const data = JSON.parse(fs.readFileSync(registryPath, "utf-8"));
      const deniedDirs = ["/etc", "/var", "/root", "/home"];
      for (const dir of deniedDirs) {
        assert.ok(
          data.boundaryRules.denyPaths.includes(dir),
          `Deny paths must include ${dir}`
        );
      }
    });

    it("should set symlink resolution to deny", () => {
      const data = JSON.parse(fs.readFileSync(registryPath, "utf-8"));
      assert.strictEqual(
        data.boundaryRules.symlinkResolution,
        "deny",
        "Symlink resolution must be 'deny' to prevent path traversal"
      );
    });
  });

  // -------------------------------------------------------------------------
  // 5. Option A Compliance — Zero Custom MCP Host Code
  // -------------------------------------------------------------------------
  describe("Option A Architecture Compliance", () => {
    it("should contain zero custom Go MCP host code in packages/", () => {
      if (!fs.existsSync(packagesDir)) return;
      const goFiles = findFiles(packagesDir, ".go", "mcp");
      assert.strictEqual(
        goFiles.length,
        0,
        `Option A violation: found custom Go MCP code in packages/: ${goFiles.join(", ")}`
      );
    });

    it("should contain zero custom Go MCP host code in services/", () => {
      if (!fs.existsSync(servicesDir)) return;
      const goFiles = findFiles(servicesDir, ".go", "mcp");
      assert.strictEqual(
        goFiles.length,
        0,
        `Option A violation: found custom Go MCP code in services/: ${goFiles.join(", ")}`
      );
    });
  });

  // -------------------------------------------------------------------------
  // 6. Workspace Instructions — MCP Governance
  // -------------------------------------------------------------------------
  describe("Workspace Instructions MCP Governance", () => {
    it("should contain MCP Tool Governance section", () => {
      assert.ok(fs.existsSync(instructionsPath), "workspace/.openhands_instructions must exist");
      const content = fs.readFileSync(instructionsPath, "utf-8");
      assert.match(content, /MCP Tool Governance/, "Must contain MCP Tool Governance section");
    });

    it("should enforce workspace root confinement in instructions", () => {
      const content = fs.readFileSync(instructionsPath, "utf-8");
      assert.match(content, /\/opt\/workspace_base/, "Must reference workspace root path");
    });

    it("should forbid custom scratch-built MCP tool servers", () => {
      const content = fs.readFileSync(instructionsPath, "utf-8");
      assert.match(
        content,
        /Custom scratch-built MCP tool servers are forbidden/,
        "Must explicitly forbid custom MCP tool servers"
      );
    });

    it("should reference the canonical tool registry", () => {
      const content = fs.readFileSync(instructionsPath, "utf-8");
      assert.match(
        content,
        /infra\/mcp\/tool-registry\.json/,
        "Must reference infra/mcp/tool-registry.json"
      );
    });

    it("should deny symlink resolution for path traversal prevention", () => {
      const content = fs.readFileSync(instructionsPath, "utf-8");
      assert.match(
        content,
        /Symlink resolution is denied/,
        "Must deny symlink resolution"
      );
    });
  });

  // -------------------------------------------------------------------------
  // 7. Contract Module Exports
  // -------------------------------------------------------------------------
  describe("@index0/contracts/v1/mcp Contract Exports", () => {
    it("should export MCP module from v1 barrel", () => {
      const v1IndexPath = path.join(rootDir, "packages/contracts/src/v1/index.ts");
      const content = fs.readFileSync(v1IndexPath, "utf-8");
      assert.match(content, /export \* from ["']\.\/mcp\/index\.js["']/, "v1/index.ts must re-export mcp module");
    });

    it("should define all expected MCP type exports in contract source", () => {
      const mcpIndexPath = path.join(rootDir, "packages/contracts/src/v1/mcp/index.ts");
      assert.ok(fs.existsSync(mcpIndexPath), "packages/contracts/src/v1/mcp/index.ts must exist");
      const content = fs.readFileSync(mcpIndexPath, "utf-8");

      const expectedTypes = [
        "MCPTransport",
        "MCPToolCategory",
        "IMCPToolDefinition",
        "IMCPServerConfig",
        "IMCPToolInvocation",
        "IMCPToolResult",
        "IMCPBoundaryRules",
        "IMCPToolRegistry"
      ];

      for (const typeName of expectedTypes) {
        assert.match(
          content,
          new RegExp(`export\\s+(type|interface)\\s+${typeName}`),
          `Must export type/interface: ${typeName}`
        );
      }
    });
  });
});

// ---------------------------------------------------------------------------
// Utility: Recursively find files by extension and path fragment
// ---------------------------------------------------------------------------
function findFiles(dir: string, ext: string, pathFragment: string): string[] {
  const results: string[] = [];
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.name === "node_modules" || entry.name === ".git" || entry.name === "dist") continue;
      if (entry.isDirectory()) {
        results.push(...findFiles(fullPath, ext, pathFragment));
      } else if (entry.name.endsWith(ext) && fullPath.toLowerCase().includes(pathFragment)) {
        results.push(fullPath);
      }
    }
  } catch {
    // Skip inaccessible directories
  }
  return results;
}
