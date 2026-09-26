/**
 * Unit Tests for Autonomous Repository Reverse-Engineering — @index0/client-harness
 */

import { test } from 'node:test';
import * as assert from 'node:assert/strict';
import { Index0Engine } from '../dist/engine.js';

test('Index0Engine — Autonomous Repository Reverse-Engineering', async () => {
  const engine = new Index0Engine();
  const repoUrl = 'https://github.com/xyflow/xyflow';
  const goal = 'Ultra-low-latency WebGPU node canvas';

  const result = await engine.reengineerRepo(repoUrl, goal);

  assert.ok(result.spec);
  assert.strictEqual(result.spec.repoName, 'xyflow');
  assert.ok(result.spec.crownJewels.length > 0);
  assert.ok(result.spec.cruftEliminated.length > 0);
  assert.ok(result.modernizationsApplied.length > 0);
  assert.ok(Object.keys(result.elevatedFiles).length > 0);
  assert.ok(result.estimatedPerfGain.includes('throughput'));
});
