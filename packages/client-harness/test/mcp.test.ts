import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import * as path from 'node:path';
import * as readline from 'node:readline';

const MCP_BIN = path.resolve(import.meta.dirname, '../dist/mcp-websearch.js');

test('MCP WebSearch Server — Handles initialize and tools/list via JSON-RPC', async () => {
  const child = spawn('node', [MCP_BIN], {
    stdio: ['pipe', 'pipe', 'pipe']
  });

  const rl = readline.createInterface({
    input: child.stdout,
    terminal: false
  });

  const responses: any[] = [];
  rl.on('line', (line) => {
    try {
      responses.push(JSON.parse(line));
    } catch {
      // ignore
    }
  });

  // 1. Send initialize
  child.stdin.write(JSON.stringify({
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {}
  }) + '\n');

  // 2. Send tools/list
  child.stdin.write(JSON.stringify({
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/list',
    params: {}
  }) + '\n');

  // Wait for responses
  await new Promise<void>((resolve) => {
    const check = setInterval(() => {
      if (responses.length >= 2) {
        clearInterval(check);
        resolve();
      }
    }, 50);
  });

  child.kill();

  // Assert initialize response
  const initRes = responses.find((r) => r.id === 1);
  assert.ok(initRes);
  assert.equal(initRes.result.serverInfo.name, 'index0-websearch');
  assert.equal(initRes.result.protocolVersion, '2024-11-05');

  // Assert tools/list response
  const toolsRes = responses.find((r) => r.id === 2);
  assert.ok(toolsRes);
  const toolNames = toolsRes.result.tools.map((t: any) => t.name);
  assert.ok(toolNames.includes('web_search'), 'Must export web_search tool');
  assert.ok(toolNames.includes('fetch_web_page'), 'Must export fetch_web_page tool');
  assert.ok(toolNames.includes('search_documentation'), 'Must export search_documentation tool');
});
