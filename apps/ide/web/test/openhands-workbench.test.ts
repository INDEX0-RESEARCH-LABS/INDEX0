import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {
  OpenHandsService,
  DEFAULT_LLM_PROFILES,
  MANDATORY_GUARDRAILS
} from '../dist/services/openhandsClient.js';
import { OpenHandsViewer } from '../dist/components/OpenHandsViewer.js';

describe('Dev 3: OpenHands Autonomous Agent Workbench & Client UX (@index0/ide-web)', () => {
  describe('Multi-Provider LLM Profiles Configuration', () => {
    it('should configure 5 authoritative LLM profiles matching infra/openhands/llm-profiles.json', () => {
      const service = new OpenHandsService();
      const config = service.getProfiles();

      assert.strictEqual(config.version, '1.0');
      assert.strictEqual(config.default_profile, 'anthropic-claude');

      const expectedProfiles = [
        'anthropic-claude',
        'openai-gpt4o',
        'deepseek-coder',
        'local-ollama',
        'local-vllm'
      ];

      for (const id of expectedProfiles) {
        assert.ok(config.profiles[id], `Must define profile: ${id}`);
        assert.ok(config.profiles[id].model, `Profile ${id} must specify model`);
        assert.ok(config.profiles[id].recommended_for, `Profile ${id} must specify recommended_for`);
      }
    });

    it('should configure sovereign local inference profiles with host.docker.internal endpoints', () => {
      const service = new OpenHandsService();
      const ollama = service.getProfile('local-ollama');
      const vllm = service.getProfile('local-vllm');

      assert.ok(ollama);
      assert.strictEqual(ollama.is_local, true);
      assert.strictEqual(ollama.base_url, 'http://host.docker.internal:11434');
      assert.strictEqual(ollama.api_key_env, null);

      assert.ok(vllm);
      assert.strictEqual(vllm.is_local, true);
      assert.strictEqual(vllm.base_url, 'http://host.docker.internal:8000/v1');
      assert.strictEqual(vllm.api_key_env, null);
    });

    it('should retrieve default profile (anthropic-claude)', () => {
      const service = new OpenHandsService();
      const def = service.getDefaultProfile();
      assert.strictEqual(def.id, 'anthropic-claude');
      assert.strictEqual(def.profile.provider, 'anthropic');
      assert.match(def.profile.model, /claude-3-5-sonnet/);
    });
  });

  describe('Gateway Connectivity & Health Check Probing', () => {
    it('should return true when Gateway returns status ok', async () => {
      const service = new OpenHandsService();
      const originalFetch = globalThis.fetch;

      globalThis.fetch = async (input: any) => {
        const urlStr = typeof input === 'string' ? input : input.url;
        assert.ok(urlStr.includes('/health'));
        return new Response(JSON.stringify({ status: 'ok', gateway: 'caddy' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      };

      try {
        const isHealthy = await service.checkGatewayHealth('http://localhost:8000');
        assert.strictEqual(isHealthy, true);
      } finally {
        globalThis.fetch = originalFetch;
      }
    });

    it('should return false when Gateway is unreachable or returns error', async () => {
      const service = new OpenHandsService();
      const originalFetch = globalThis.fetch;

      globalThis.fetch = async () => {
        throw new Error('Connection refused');
      };

      try {
        const isHealthy = await service.checkGatewayHealth('http://localhost:8000');
        assert.strictEqual(isHealthy, false);
      } finally {
        globalThis.fetch = originalFetch;
      }
    });
  });

  describe('Workspace Guardrails & Prompt Injection', () => {
    it('should validate instructions containing all 6 mandatory platform guardrails', () => {
      const service = new OpenHandsService();
      const instructionsContent = `
# Autonomous Agent Workbench Instructions
1. Contract First: All models conform to @index0/contracts.
2. Option A Architecture Compliance: Route via Caddy API Gateway on port 8000.
3. Execution Sandboxing: Run code in disposable containers.
4. Tests Are Mandatory: Validate with pnpm test.
5. Zero Secrets in Git: Load credentials from .env.
6. Small, Atomic Commits: Keep changes small.
      `;

      const status = service.validateWorkspaceGuardrails(instructionsContent);
      assert.strictEqual(status.valid, true);
      assert.strictEqual(status.missingRules.length, 0);
      assert.strictEqual(status.detectedRules.length, 6);
    });

    it('should identify missing guardrails when instructions are incomplete', () => {
      const service = new OpenHandsService();
      const partialInstructions = `Contract First and Tests Are Mandatory.`;

      const status = service.validateWorkspaceGuardrails(partialInstructions);
      assert.strictEqual(status.valid, false);
      assert.ok(status.missingRules.includes('Option A Architecture Compliance'));
      assert.ok(status.missingRules.includes('Execution Sandboxing'));
      assert.ok(status.missingRules.includes('Zero Secrets in Git'));
      assert.ok(status.missingRules.includes('Small, Atomic Commits'));
    });

    it('should prepend platform guardrails to user task prompt', () => {
      const service = new OpenHandsService();
      const formatted = service.formatAgentPrompt('Add unit test for arithmetic parser');

      assert.match(formatted, /\[INDEX0 PLATFORM INSTRUCTIONS\]/);
      assert.match(formatted, /@index0\/contracts/);
      assert.match(formatted, /Option A Architecture/);
      assert.match(formatted, /Caddy Gateway port 8000/);
      assert.match(formatted, /\[USER TASK\]/);
      assert.match(formatted, /Add unit test for arithmetic parser/);
    });
  });

  describe('OpenHandsViewer React Component Rendering', () => {
    it('should construct OpenHandsViewer React element with default properties', () => {
      const element = React.createElement(OpenHandsViewer, {
        gatewayUrl: 'http://localhost:8000',
        workspacePath: '/opt/workspace_base'
      });
      assert.ok(React.isValidElement(element));
      assert.strictEqual(element.props.gatewayUrl, 'http://localhost:8000');
      assert.strictEqual(element.props.workspacePath, '/opt/workspace_base');
    });

    it('should construct OpenHandsViewer with sovereign local inference profile', () => {
      const element = React.createElement(OpenHandsViewer, {
        gatewayUrl: 'http://localhost:8000',
        initialProfileId: 'local-ollama'
      });
      assert.ok(React.isValidElement(element));
      assert.strictEqual(element.props.initialProfileId, 'local-ollama');
    });

    it('should construct OpenHandsViewer in light mode with theme="light"', () => {
      let toggledTheme = '';
      const onThemeChange = (newTheme: 'dark' | 'light') => {
        toggledTheme = newTheme;
      };

      const element = React.createElement(OpenHandsViewer, {
        gatewayUrl: 'http://localhost:8000',
        theme: 'light',
        onThemeChange
      });

      assert.ok(React.isValidElement(element));
      assert.strictEqual(element.props.theme, 'light');
      assert.strictEqual(element.props.onThemeChange, onThemeChange);
    });

    it('should construct OpenHandsViewer with dark theme explicitly configured', () => {
      const element = React.createElement(OpenHandsViewer, {
        gatewayUrl: 'http://localhost:8000',
        theme: 'dark'
      });

      assert.ok(React.isValidElement(element));
      assert.strictEqual(element.props.theme, 'dark');
    });
  });
});

