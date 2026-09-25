import test from 'node:test';
import assert from 'node:assert/strict';
import { OpenCodeEngine } from '../dist/opencode.js';
import { GitWorktreeManager } from '../dist/worktree.js';

test('GitWorktreeManager — Repo Verification', async () => {
  const manager = new GitWorktreeManager();
  const isRepo = await manager.isGitRepo();
  assert.equal(isRepo, true, 'Current workspace must be a valid git repository');
});

test('OpenCodeEngine — 4-Tier Matrix Review', async () => {
  const engine = new OpenCodeEngine();
  const steps = await engine.runReviewMatrix('Implement secure JWT claims validation');

  assert.equal(steps.length, 4);
  assert.equal(steps[0].step, 'architect');
  assert.equal(steps[1].step, 'developer');
  assert.equal(steps[2].step, 'critic');
  assert.equal(steps[3].step, 'qa');

  assert.equal(steps[0].status, 'passed');
  assert.equal(steps[2].status, 'passed');
});

test('OpenCodeEngine — Terminal Output Sanitization', () => {
  const engine = new OpenCodeEngine();
  const noisy = '\x1b[32m✔ Built target successfully\x1b[0m\n\rProgress: 100%\n';
  const { sanitized, tokensSaved } = engine.sanitizeTerminalOutput(noisy);

  assert.ok(sanitized.includes('Built target successfully'));
  assert.ok(!sanitized.includes('\x1b[32m'));
});
