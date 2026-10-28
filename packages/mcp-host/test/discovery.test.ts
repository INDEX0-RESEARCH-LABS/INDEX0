import test from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {
  CapabilityExtractor,
  MCPResolver,
  AutoMCPOrchestrator
} from '../dist/index.js';

test('AutoMCP — CapabilityExtractor parses domain requirements from prompt', () => {
  const prompt = 'Audit postgres migration files and verify docker-compose cluster';
  const caps = CapabilityExtractor.extractFromPrompt(prompt);

  assert.equal(caps.length, 2);
  const subTypes = caps.map((c) => c.subType);
  assert.ok(subTypes.includes('postgres'));
  assert.ok(subTypes.includes('docker'));
});

test('AutoMCP — CapabilityExtractor inspects workspace files for implicit stacks', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'index0-automcp-test-'));
  try {
    // Create dummy docker-compose.yml and prisma schema
    fs.writeFileSync(path.join(tmpDir, 'docker-compose.yml'), 'version: "3"');
    fs.mkdirSync(path.join(tmpDir, 'prisma'), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, 'prisma', 'schema.prisma'),
      'datasource db {\n  provider = "postgresql"\n}'
    );

    const inspection = CapabilityExtractor.inspectWorkspace(tmpDir);
    assert.equal(inspection.detectedCapabilities.length, 2);
    const subTypes = inspection.detectedCapabilities.map((c) => c.subType);
    assert.ok(subTypes.includes('docker'));
    assert.ok(subTypes.includes('postgres'));
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test('AutoMCP — MCPResolver resolves capabilities across 4-tier matrix', () => {
  const websearch = MCPResolver.resolve({
    domain: 'search',
    subType: 'web',
    accessLevel: 'read_only',
    priority: 'mandatory',
    confidence: 1.0
  });

  assert.ok(websearch);
  assert.equal(websearch.tier, 0);
  assert.equal(websearch.serverConfig.name, 'index0-websearch');

  const postgres = MCPResolver.resolve({
    domain: 'database',
    subType: 'postgres',
    accessLevel: 'read_write',
    priority: 'mandatory',
    confidence: 0.9
  });

  assert.ok(postgres);
  assert.equal(postgres.tier, 2);
  assert.equal(postgres.serverConfig.command, 'npx');
  assert.ok(postgres.serverConfig.args.includes('@modelcontextprotocol/server-postgres'));
});

test('AutoMCP — AutoMCPOrchestrator generates comprehensive plan and GNAP trailers', () => {
  const plan = AutoMCPOrchestrator.planForTask(
    'Inspect Kubernetes deployment pod logs and search the web for FastMCP docs'
  );

  assert.ok(plan.extractedCapabilities.length >= 2);
  assert.ok(plan.discoveredServers.some((s) => s.serverConfig.name === 'kubernetes'));
  assert.ok(plan.discoveredServers.some((s) => s.serverConfig.name === 'index0-websearch'));

  // GNAP trailer checks
  assert.ok(plan.gnapTrailers['MCP-Discovered'].includes('kubernetes'));
  assert.ok(plan.gnapTrailers['MCP-Discovered'].includes('index0-websearch'));

  // Markdown summary checks
  assert.ok(plan.markdownSummary.includes('AutoMCP Autonomous Discovery Plan'));
  assert.ok(plan.markdownSummary.includes('Attached MCP Servers'));
});
