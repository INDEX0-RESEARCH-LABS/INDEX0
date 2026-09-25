import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import * as os from 'node:os';
import * as path from 'node:path';
import * as fs from 'node:fs/promises';
import { GNAPWorker } from '../dist/gnap.js';
import { GNAP_TRAILERS } from '@index0/contracts';

describe('Git-Native Agent Protocol (GNAP) Worker', () => {
  it('should initialize .gnap state and records steps with standard trailers', async () => {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'gnap-test-'));

    try {
      const worker = new GNAPWorker({
        repoRoot: tmpDir,
        agentId: 'agent-critic-01',
        agentRole: 'critic'
      });

      await worker.initializeRepository();
      const state1 = await worker.getState();
      assert.equal(state1.sequence, 0);
      assert.ok(state1.currentCycleId.startsWith('cycle-'));

      const step = await worker.recordStep({
        messageType: 'review_verdict',
        title: 'Review cycle completed',
        summary: 'All code security checks and unit tests passed cleanly.',
        payload: {
          approved: true,
          score: 98
        },
        verdict: 'approved'
      });

      // Verify commit message contains standard GNAP trailers
      assert.ok(step.commitMessage.includes(`${GNAP_TRAILERS.AGENT_ID}: agent-critic-01`));
      assert.ok(step.commitMessage.includes(`${GNAP_TRAILERS.AGENT_ROLE}: critic`));
      assert.ok(step.commitMessage.includes(`${GNAP_TRAILERS.SEQUENCE}: 1`));
      assert.ok(step.commitMessage.includes(`${GNAP_TRAILERS.VERDICT}: approved`));

      // Verify state was updated
      const state2 = await worker.getState();
      assert.equal(state2.sequence, 1);
      assert.equal(state2.lastVerdict, 'approved');
      assert.ok(state2.activeAgents.includes('agent-critic-01'));
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  });
});
