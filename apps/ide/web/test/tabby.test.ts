import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { TabbyClient } from '../dist/services/tabbyClient.js';

describe('TabbyML Edge Autocomplete Client', () => {
  it('should initialize with default local endpoint', () => {
    const client = new TabbyClient();
    assert.ok(client);
  });

  it('should normalize custom endpoint URL', () => {
    const client = new TabbyClient('http://127.0.0.1:8080///');
    assert.ok(client);
  });

  it('should gracefully return empty completions when edge server is offline', async () => {
    const client = new TabbyClient('http://127.0.0.1:59999');
    const completions = await client.getCompletions({ prefix: 'const a = ' }, 'typescript');
    assert.deepEqual(completions, []);
  });

  it('should report offline status when probing unreachable host', async () => {
    const client = new TabbyClient('http://127.0.0.1:59999');
    const health = await client.checkHealth();
    assert.equal(health.status, 'offline');
  });
});
