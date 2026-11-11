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

  it('should expose orchestratorUrl defaulting to localhost:8000', () => {
    const manager = new Index0ExtensionManager();
    const config = manager.getConfig();
    assert.equal(config.orchestratorUrl, 'http://localhost:8000');
  });

  it('should update extension configuration including orchestratorUrl', () => {
    const manager = new Index0ExtensionManager();
    manager.updateConfig({
      gatewayUrl: 'https://gateway.index0.ai',
      orchestratorUrl: 'https://orch.index0.ai',
      modelPreference: 'claude'
    });

    const config = manager.getConfig();
    assert.equal(config.gatewayUrl, 'https://gateway.index0.ai');
    assert.equal(config.orchestratorUrl, 'https://orch.index0.ai');
    assert.equal(config.modelPreference, 'claude');
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

  it('runCycle returns offline failure when orchestrator is unreachable', async () => {
    const manager = new Index0ExtensionManager({ orchestratorUrl: 'http://localhost:19999' });
    const result = await manager.runCycle('fix the divide-by-zero bug');
    assert.equal(result.cycleId, 'offline');
    assert.equal(result.passed, false);
    assert.ok(result.testOutput.includes('[Offline]'));
  });

  it('should activate extension and register disposable subscriptions', () => {
    const mockContext: IExtensionContext = {
      subscriptions: []
    };

    const manager = activate(mockContext);
    assert.ok(manager);
    assert.equal(mockContext.subscriptions.length, 7);

    // Call deactivate cleanly
    deactivate();
  });
});
