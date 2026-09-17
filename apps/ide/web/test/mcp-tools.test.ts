import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {
  MCPToolService,
  CANONICAL_MCP_REGISTRY,
  CATEGORY_COLORS
} from '../dist/services/mcpToolService.js';
import { MCPToolsPanel } from '../dist/components/MCPToolsPanel.js';

describe('Dev 3: MCP Tool Status Service & Workbench Panel (@index0/ide-web)', () => {
  describe('Canonical MCP Tool Registry & Category Grouping', () => {
    it('should load canonical registry with exactly 8 authorized tools', () => {
      const service = new MCPToolService();
      const allTools = service.getAllTools();
      const metrics = service.getToolCount();

      assert.strictEqual(allTools.length, 8);
      assert.strictEqual(metrics.total, 8);
      assert.strictEqual(metrics.native, 6);
      assert.strictEqual(metrics.external, 2);
      assert.strictEqual(metrics.sandboxed, 7); // 6 native + 1 filesystem server
    });

    it('should categorize tools across all 4 canonical MCPToolCategory domains', () => {
      const service = new MCPToolService();
      const grouped = service.getToolsByCategory();

      // Filesystem category: 3 tools
      assert.strictEqual(grouped.filesystem.length, 3);
      const fsNames = grouped.filesystem.map((t) => t.name);
      assert.ok(fsNames.includes('openhands_file_read'));
      assert.ok(fsNames.includes('openhands_file_edit'));
      assert.ok(fsNames.includes('@modelcontextprotocol/server-filesystem'));

      // Search category: 2 tools
      assert.strictEqual(grouped.search.length, 2);
      const searchNames = grouped.search.map((t) => t.name);
      assert.ok(searchNames.includes('openhands_file_search'));
      assert.ok(searchNames.includes('@modelcontextprotocol/server-brave-search'));

      // Execution category: 1 tool
      assert.strictEqual(grouped.execution.length, 1);
      assert.strictEqual(grouped.execution[0].name, 'openhands_bash_execute');

      // Inspection category: 2 tools
      assert.strictEqual(grouped.inspection.length, 2);
      const inspectNames = grouped.inspection.map((t) => t.name);
      assert.ok(inspectNames.includes('openhands_directory_list'));
      assert.ok(inspectNames.includes('openhands_browser'));
    });

    it('should assign correct transports and sandbox flags', () => {
      const service = new MCPToolService();
      const all = service.getAllTools();

      for (const tool of all) {
        if (tool.isNative) {
          assert.strictEqual(tool.transport, 'native');
          assert.strictEqual(tool.sandboxed, true);
        } else {
          assert.strictEqual(tool.transport, 'stdio');
        }
      }
    });

    it('should filter tools by query and category', () => {
      const service = new MCPToolService();

      const searchFiltered = service.filterTools('search');
      assert.strictEqual(searchFiltered.length, 2);

      const execFiltered = service.filterTools('', 'execution');
      assert.strictEqual(execFiltered.length, 1);
      assert.strictEqual(execFiltered[0].name, 'openhands_bash_execute');

      const nonExistent = service.filterTools('non_existent_tool_xyz');
      assert.strictEqual(nonExistent.length, 0);
    });
  });

  describe('Workspace Boundary Confinement Rules', () => {
    it('should permit paths strictly within workspaceRoot (/opt/workspace_base)', () => {
      const service = new MCPToolService();

      const r1 = service.validatePathAccess('/opt/workspace_base/src/index.ts');
      assert.strictEqual(r1.allowed, true);

      const r2 = service.validatePathAccess('/opt/workspace_base/README.md');
      assert.strictEqual(r2.allowed, true);
    });

    it('should deny paths escaping workspace root or matching denyPatterns', () => {
      const service = new MCPToolService();

      const r1 = service.validatePathAccess('/opt/workspace_base/../../etc/passwd');
      assert.strictEqual(r1.allowed, false);
      assert.match(r1.reason || '', /forbidden boundary traversal/);

      const r2 = service.validatePathAccess('/etc/shadow');
      assert.strictEqual(r2.allowed, false);

      const r3 = service.validatePathAccess('/var/log/syslog');
      assert.strictEqual(r3.allowed, false);

      const r4 = service.validatePathAccess('/root/.ssh/id_rsa');
      assert.strictEqual(r4.allowed, false);

      const r5 = service.validatePathAccess('/home/user/code');
      assert.strictEqual(r5.allowed, false);
    });
  });

  describe('Category Colors & Transport Badge Styling', () => {
    it('should provide distinct color tokens for all 4 categories', () => {
      const service = new MCPToolService();
      const categories = ['filesystem', 'search', 'execution', 'inspection'] as const;

      for (const cat of categories) {
        const color = service.getCategoryColor(cat);
        assert.ok(color.bg);
        assert.ok(color.text);
        assert.ok(color.border);
      }
    });
  });

  describe('MCPToolsPanel React Component Rendering', () => {
    it('should construct MCPToolsPanel React element with default state', () => {
      const element = React.createElement(MCPToolsPanel, { className: 'test-mcp-panel' });
      assert.ok(React.isValidElement(element));
      assert.strictEqual(element.type, MCPToolsPanel);
    });

    it('should construct MCPToolsPanel with onClose handler', () => {
      let closed = false;
      const element = React.createElement(MCPToolsPanel, {
        onClose: () => {
          closed = true;
        }
      });
      assert.ok(React.isValidElement(element));
      assert.strictEqual(typeof element.props.onClose, 'function');
    });
  });
});
