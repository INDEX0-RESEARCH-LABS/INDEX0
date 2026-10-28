import test from 'node:test';
import assert from 'node:assert/strict';
import { Index0Engine } from '../dist/engine.js';
import { GitWorktreeManager } from '../dist/worktree.js';

test('GitWorktreeManager — Repo Verification', async () => {
  const manager = new GitWorktreeManager();
  const isRepo = await manager.isGitRepo();
  assert.equal(isRepo, true, 'Current workspace must be a valid git repository');
});

test('Index0Engine — 4-Tier Matrix Review fails closed when the orchestrator is unreachable', async () => {
  // Deterministic: point at a closed port instead of the default gateway so the
  // test never reaches the network and never depends on prod availability.
  const engine = new Index0Engine({ orchestratorBase: 'http://127.0.0.1:9/orchestrator' });
  const steps = await engine.runReviewMatrix('Implement secure JWT claims validation');

  assert.equal(steps.length, 4);
  assert.deepEqual(
    steps.map((s) => s.step),
    ['architect', 'developer', 'critic', 'qa']
  );
  // An unreachable backend must never synthesize an approval.
  assert.ok(steps.every((s) => s.status === 'failed'));
  assert.ok(steps.every((s) => s.verdict === 'rejected'));
  assert.match(steps[0].details, /offline|unreachable/i);
});

test('Index0Engine — Terminal Output Sanitization', () => {
  const engine = new Index0Engine();
  const noisy = '\x1b[32m✔ Built target successfully\x1b[0m\n\rProgress: 100%\n';
  const { sanitized, tokensSaved } = engine.sanitizeTerminalOutput(noisy);

  assert.ok(sanitized.includes('Built target successfully'));
  assert.ok(!sanitized.includes('\x1b[32m'));
});
