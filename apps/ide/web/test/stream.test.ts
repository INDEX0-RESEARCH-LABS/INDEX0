import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { AgentEventStreamService, type IAgentStreamState } from '../dist/services/agentStream.js';
import type { IAgentEvent } from '@index0/contracts';

describe('AgentEventStreamService & SSE Parser', () => {
  it('should parse raw SSE string chunks into typed IAgentEvents', () => {
    const rawChunk = `event: agent.started\ndata: {"id":"evt-1","runId":"run-100","type":"agent.started","payload":{"prompt":"Build app"},"timestamp":"2026-09-18T00:00:00Z"}\n\n`;

    const events = AgentEventStreamService.parseRawSSEChunk(rawChunk);
    assert.equal(events.length, 1);
    assert.equal(events[0].id, 'evt-1');
    assert.equal(events[0].type, 'agent.started');
    assert.equal(events[0].runId, 'run-100');
  });

  it('should process all 9 AgentEventType variants through reduceEvent', () => {
    let state: IAgentStreamState = {
      runId: 'run-test-full',
      status: 'idle',
      planSteps: [],
      messages: [],
      toolCalls: []
    };

    const now = new Date().toISOString();

    // 1. agent.started
    state = AgentEventStreamService.reduceEvent(state, {
      id: 'e1',
      runId: 'run-test-full',
      type: 'agent.started',
      payload: { prompt: 'Verify math codebase' },
      timestamp: now
    });
    assert.equal(state.status, 'running');
    assert.equal(state.messages.length, 1);

    // 2. agent.plan
    state = AgentEventStreamService.reduceEvent(state, {
      id: 'e2',
      runId: 'run-test-full',
      type: 'agent.plan',
      payload: {
        steps: [
          { id: 's1', title: 'Step 1', status: 'completed' },
          { id: 's2', title: 'Step 2', status: 'in_progress' }
        ]
      },
      timestamp: now
    });
    assert.equal(state.planSteps.length, 2);

    // 3. agent.message
    state = AgentEventStreamService.reduceEvent(state, {
      id: 'e3',
      runId: 'run-test-full',
      type: 'agent.message',
      payload: { role: 'assistant', content: 'Analyzing math.ts' },
      timestamp: now
    });
    assert.equal(state.messages.length, 2);

    // 4. tool.called
    state = AgentEventStreamService.reduceEvent(state, {
      id: 'e4',
      runId: 'run-test-full',
      type: 'tool.called',
      payload: { callId: 'c1', tool: 'read_file', parameters: { path: 'math.ts' } },
      timestamp: now
    });
    assert.equal(state.toolCalls.length, 1);
    assert.equal(state.toolCalls[0].tool, 'read_file');

    // 5. tool.result
    state = AgentEventStreamService.reduceEvent(state, {
      id: 'e5',
      runId: 'run-test-full',
      type: 'tool.result',
      payload: { callId: 'c1', tool: 'read_file', output: 'content of file', isError: false },
      timestamp: now
    });
    assert.equal(state.toolCalls[0].result, 'content of file');

    // 6. sandbox.started
    state = AgentEventStreamService.reduceEvent(state, {
      id: 'e6',
      runId: 'run-test-full',
      type: 'sandbox.started',
      payload: { sandboxId: 'sb-01', language: 'python' },
      timestamp: now
    });
    assert.ok(state.messages.some((m) => m.content.includes('MicroVM sandbox')));

    // 7. sandbox.completed
    state = AgentEventStreamService.reduceEvent(state, {
      id: 'e7',
      runId: 'run-test-full',
      type: 'sandbox.completed',
      payload: { exitCode: 0, durationMs: 45 },
      timestamp: now
    });
    assert.ok(state.messages.some((m) => m.content.includes('Exit 0')));

    // 8. agent.completed
    state = AgentEventStreamService.reduceEvent(state, {
      id: 'e8',
      runId: 'run-test-full',
      type: 'agent.completed',
      payload: { summary: 'All steps verified cleanly' },
      timestamp: now
    });
    assert.equal(state.status, 'completed');
    assert.ok(state.messages.some((m) => m.content.includes('All steps verified')));

    // 9. agent.failed (tested on separate state)
    let failState: IAgentStreamState = {
      runId: 'run-fail',
      status: 'running',
      planSteps: [],
      messages: [],
      toolCalls: []
    };
    failState = AgentEventStreamService.reduceEvent(failState, {
      id: 'e9',
      runId: 'run-fail',
      type: 'agent.failed',
      payload: { error: 'SyntaxError in math.ts' },
      timestamp: now
    });
    assert.equal(failState.status, 'failed');
    assert.equal(failState.error, 'SyntaxError in math.ts');
  });
});
