import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { Workbench } from '../dist/workbench/Workbench.js';
import { Explorer } from '../dist/components/Explorer.js';
import { Editor } from '../dist/components/Editor.js';
import { AgentPanel } from '../dist/components/AgentPanel.js';

describe('Web IDE Workbench Components', () => {
  it('should instantiate Workbench React element with defaults', () => {
    const element = React.createElement(Workbench, {
      workspaceId: 'ws-demo',
      projectName: 'index0-core'
    });
    assert.ok(React.isValidElement(element));
    assert.equal(element.props.workspaceId, 'ws-demo');
    assert.equal(element.props.projectName, 'index0-core');
  });

  it('should instantiate Explorer React element with mock file nodes', () => {
    const element = React.createElement(Explorer, {
      files: [
        { id: '1', name: 'src', path: '/src', type: 'directory', children: [] },
        { id: '2', name: 'README.md', path: '/README.md', type: 'file' }
      ],
      activeFilePath: '/README.md',
      onSelectFile: () => {}
    });
    assert.ok(React.isValidElement(element));
    assert.equal(element.props.files.length, 2);
    assert.equal(element.props.activeFilePath, '/README.md');
  });

  it('should instantiate Editor React element with tabs', () => {
    const element = React.createElement(Editor, {
      tabs: [
        { path: '/src/math.ts', name: 'math.ts', content: 'export const x = 1;' }
      ],
      activeTabPath: '/src/math.ts',
      onSelectTab: () => {},
      onCloseTab: () => {}
    });
    assert.ok(React.isValidElement(element));
    assert.equal(element.props.tabs.length, 1);
    assert.equal(element.props.tabs[0].name, 'math.ts');
  });

  it('should instantiate AgentPanel React element with plan steps and messages', () => {
    const element = React.createElement(AgentPanel, {
      planSteps: [
        { id: 'step-1', title: 'Verify math utilities', status: 'completed' },
        { id: 'step-2', title: 'Run sandbox tests', status: 'in_progress' }
      ],
      messages: [
        { role: 'user', content: 'Verify math' },
        { role: 'assistant', content: 'Starting plan' }
      ],
      status: 'running',
      isStreaming: true,
      onSendMessage: () => {},
      onConfirmStep: () => {}
    });
    assert.ok(React.isValidElement(element));
    assert.equal(element.props.planSteps.length, 2);
    assert.equal(element.props.messages.length, 2);
    assert.equal(element.props.status, 'running');
  });
});
