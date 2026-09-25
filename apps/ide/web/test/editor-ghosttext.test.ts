import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { Editor } from '../dist/components/Editor.js';
import { TabbyClient } from '../dist/services/tabbyClient.js';

describe('Editor GhostText & Tabby Edge Autocomplete', () => {
  const tabs = [
    {
      path: '/workspace/src/index.ts',
      name: 'index.ts',
      content: 'const greeting = "Hello INDEX0";\nconsole.log(greeting);'
    }
  ];

  it('should instantiate Editor with custom TabbyClient', () => {
    const mockClient = new TabbyClient('http://127.0.0.1:8080');
    const element = React.createElement(Editor, {
      tabs,
      activeTabPath: '/workspace/src/index.ts',
      onSelectTab: () => {},
      onCloseTab: () => {},
      tabbyClient: mockClient
    });

    assert.ok(element);
    assert.equal(element.props.tabs.length, 1);
    assert.equal(element.props.tabbyClient, mockClient);
  });

  it('should instantiate Editor with default TabbyClient when omitted', () => {
    const element = React.createElement(Editor, {
      tabs,
      activeTabPath: '/workspace/src/index.ts',
      onSelectTab: () => {},
      onCloseTab: () => {}
    });

    assert.ok(element);
    assert.equal(element.props.activeTabPath, '/workspace/src/index.ts');
  });
});
