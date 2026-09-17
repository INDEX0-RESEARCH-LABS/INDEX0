import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  Index0ExtensionManager,
  activate,
  deactivate,
  type IExtensionContext
} from '../dist/extension.js';

describe('VS Code Extension Scaffolding (@index0/ide-extension)', () => {
  it('should initialize extension manager with default Gateway configuration', () => {
    const manager = new Index0ExtensionManager();
    const config = manager.getConfig();

    assert.equal(config.gatewayUrl, 'http://localhost:8080');
    assert.equal(config.modelPreference, 'claude-3-5-sonnet-20241022');
  });

  it('should update extension configuration', () => {
    const manager = new Index0ExtensionManager();
    manager.updateConfig({
      gatewayUrl: 'https://gateway.index0.ai',
      modelPreference: 'gpt-4o'
    });

    const config = manager.getConfig();
    assert.equal(config.gatewayUrl, 'https://gateway.index0.ai');
    assert.equal(config.modelPreference, 'gpt-4o');
  });

  it('should construct correct workbench and telemetry routing URLs', () => {
    const manager = new Index0ExtensionManager({ gatewayUrl: 'http://localhost:8080' });

    const workbenchUrl = manager.getWorkbenchUrl('ws-feature-01');
    assert.equal(workbenchUrl, 'http://localhost:8080/workbench?workspace=ws-feature-01');

    const telemetryUrlWithRun = manager.getTelemetryUrl('run-999');
    assert.equal(telemetryUrlWithRun, 'http://localhost:8080/telemetry/runs/run-999');

    const telemetryUrlRoot = manager.getTelemetryUrl();
    assert.equal(telemetryUrlRoot, 'http://localhost:8080/telemetry');
  });

  it('should activate extension and register disposable subscriptions', () => {
    const mockContext: IExtensionContext = {
      subscriptions: []
    };

    const manager = activate(mockContext);
    assert.ok(manager);
    assert.equal(mockContext.subscriptions.length, 3);

    // Call deactivate cleanly
    deactivate();
  });
});
