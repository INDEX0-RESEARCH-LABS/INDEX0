import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { ExecutionResult } from '../dist/components/ExecutionResult.js';
import { TerminalViewer } from '../dist/terminal/TerminalViewer.js';
import { SandboxRunnerDemo } from '../dist/components/SandboxRunnerDemo.js';
import type { ISandboxExecutionResult } from '@index0/contracts';

describe('Web IDE Presentation Tier Components', () => {
  it('should export all visualizer and terminal components', () => {
    assert.equal(typeof ExecutionResult, 'function');
    assert.equal(typeof TerminalViewer, 'function');
    assert.equal(typeof SandboxRunnerDemo, 'function');
  });

  it('should construct ExecutionResult React element with success result', () => {
    const successResult: ISandboxExecutionResult = {
      id: 'test-res-01',
      exitCode: 0,
      stdout: 'Hello World\n',
      stderr: '',
      durationMs: 42,
      timedOut: false
    };

    const element = React.createElement(ExecutionResult, {
      result: successResult,
      language: 'python'
    });

    assert.ok(React.isValidElement(element));
    assert.equal(element.props.result.exitCode, 0);
    assert.equal(element.props.language, 'python');
  });

  it('should construct ExecutionResult React element with error result', () => {
    const errorResult: ISandboxExecutionResult = {
      id: 'test-res-02',
      exitCode: 1,
      stdout: '',
      stderr: 'Traceback (most recent call last):\nIndexError: list index out of range\n',
      durationMs: 15,
      timedOut: false,
      error: 'Process failed'
    };

    const element = React.createElement(ExecutionResult, {
      result: errorResult,
      language: 'python'
    });

    assert.ok(React.isValidElement(element));
    assert.equal(element.props.result.exitCode, 1);
    assert.ok(element.props.result.stderr.includes('IndexError'));
  });

  it('should construct TerminalViewer React element with streaming lines', () => {
    const element = React.createElement(TerminalViewer, {
      title: 'Active MicroVM',
      lines: [
        {
          id: 'line-1',
          timestamp: '12:00:00',
          command: 'python app.py',
          output: 'Starting server...',
          isError: false
        }
      ],
      isStreaming: true
    });

    assert.ok(React.isValidElement(element));
    assert.equal(element.props.lines?.length, 1);
    assert.equal(element.props.isStreaming, true);
  });
});
