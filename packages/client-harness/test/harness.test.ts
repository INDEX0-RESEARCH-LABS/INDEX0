import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { SandboxClient } from '../dist/index.js';
import type { ISandboxRequest, ISandboxExecutionResult } from '@index0/contracts';

describe('SandboxClient SDK & Harness', () => {
  const client = new SandboxClient({ baseUrl: 'http://localhost:4001' });

  it('should instantiate with default and custom configurations', () => {
    const defaultClient = new SandboxClient();
    assert.ok(defaultClient);

    const customClient = new SandboxClient({
      baseUrl: 'http://127.0.0.1:4001',
      defaultTimeoutMs: 10_000
    });
    assert.ok(customClient);
  });

  it('should simulate mock execution successfully', () => {
    const request: ISandboxRequest = {
      id: 'mock-test-01',
      language: 'python',
      code: 'print("Mock Output")',
      timeoutMs: 5000
    };

    const result = client.simulateMockExecution(request);
    assert.equal(result.id, 'mock-test-01');
    assert.equal(result.exitCode, 0);
    assert.ok(result.stdout.includes('Mock Output'));
    assert.equal(result.timedOut, false);
  });

  it('should simulate mock execution failure for exception code', () => {
    const request: ISandboxRequest = {
      id: 'mock-err-02',
      language: 'python',
      code: 'raise ZeroDivisionError',
      timeoutMs: 5000
    };

    const result = client.simulateMockExecution(request);
    assert.equal(result.exitCode, 1);
    assert.ok(result.stderr.includes('Simulated failure'));
  });

  it('should simulate mock execution timeout for excessive quota requests', () => {
    const request: ISandboxRequest = {
      id: 'mock-timeout-03',
      language: 'bash',
      code: 'sleep 500',
      timeoutMs: 500_000 // Exceeds 300,000 max quota
    };

    const result = client.simulateMockExecution(request);
    assert.equal(result.exitCode, 124);
    assert.equal(result.timedOut, true);
  });

  it('should format execution result with ANSI badges', () => {
    const sampleResult: ISandboxExecutionResult = {
      id: 'res-ansi-01',
      exitCode: 0,
      stdout: 'Hello World\n',
      stderr: '',
      durationMs: 12,
      timedOut: false
    };

    const formatted = SandboxClient.formatResult(sampleResult);
    assert.ok(formatted.includes('SUCCESS'));
    assert.ok(formatted.includes('res-ansi-01'));
    assert.ok(formatted.includes('Hello World'));
  });
});
