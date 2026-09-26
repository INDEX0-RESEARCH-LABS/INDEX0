/**
 * Unit Tests for GitWorktreeManager Multiverse Support — @index0/client-harness
 */

import { test } from 'node:test';
import * as assert from 'node:assert/strict';
import { GitWorktreeManager } from '../dist/worktree.js';

test('GitWorktreeManager — Multiverse Hypothesis Methods', async () => {
  const manager = new GitWorktreeManager(process.cwd());
  const isRepo = await manager.isGitRepo();
  assert.strictEqual(isRepo, true);

  const activeBefore = await manager.listActiveWorktrees();
  assert.ok(Array.isArray(activeBefore));

  // Verify composite hypothesis worktree lifecycle
  const testTaskId = 'test-mcts-task';
  const testHypId = 'alpha';

  try {
    const wt = await manager.createHypothesisWorktree(testTaskId, testHypId);
    assert.strictEqual(wt.taskId, `${testTaskId}-${testHypId}`);
    assert.ok(wt.path.includes('.index0/worktrees'));
    assert.ok(wt.branch.includes(testTaskId));

    const activeDuring = await manager.listActiveWorktrees();
    assert.ok(activeDuring.some((w) => w.taskId === `${testTaskId}-${testHypId}`));
  } finally {
    // Clean up
    await manager.pruneHypotheses(testTaskId);
  }

  const activeAfter = await manager.listActiveWorktrees();
  assert.ok(!activeAfter.some((w) => w.taskId === `${testTaskId}-${testHypId}`));
});
