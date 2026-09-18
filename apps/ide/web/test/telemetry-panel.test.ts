import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {
  TelemetryService,
  MODEL_PRICING,
  formatTokenCount,
  formatDuration,
  formatCurrency
} from '../dist/services/telemetryService.js';
import { TelemetryUsagePanel } from '../dist/components/TelemetryUsagePanel.js';
import {
  TelemetryUsagePanel as IndexTelemetryUsagePanel,
  TelemetryService as IndexTelemetryService
} from '../dist/index.js';
import type { IAgentExecutionMetric, ITelemetryQueryRequest } from '@index0/contracts';

describe('Dev 3: Telemetry Querying Service & Token Usage Panel (@index0/ide-web)', () => {
  describe('TelemetryService Token Aggregation & Pricing Math', () => {
    const mockMetrics: IAgentExecutionMetric[] = [
      {
        metricId: 'm-1',
        timestamp: '2026-09-18T10:00:00Z',
        tenantId: 'tenant-acme',
        runId: 'run-101',
        workspaceId: 'ws-1',
        model: 'claude-3-5-sonnet',
        promptTokens: 10000,
        completionTokens: 2000,
        totalTokens: 12000,
        durationMs: 15000,
        status: 'completed',
        stepCount: 4
      },
      {
        metricId: 'm-2',
        timestamp: '2026-09-18T10:15:00Z',
        tenantId: 'tenant-acme',
        runId: 'run-102',
        workspaceId: 'ws-1',
        model: 'gpt-4o',
        promptTokens: 20000,
        completionTokens: 5000,
        totalTokens: 25000,
        durationMs: 25000,
        status: 'completed',
        stepCount: 6
      },
      {
        metricId: 'm-3',
        timestamp: '2026-09-18T10:30:00Z',
        tenantId: 'tenant-acme',
        runId: 'run-103',
        workspaceId: 'ws-1',
        model: 'claude-3-5-sonnet',
        promptTokens: 5000,
        completionTokens: 1000,
        totalTokens: 6000,
        durationMs: 8000,
        status: 'failed',
        stepCount: 2,
        errorType: 'ContextLengthExceeded'
      },
      {
        metricId: 'm-4',
        timestamp: '2026-09-18T10:45:00Z',
        tenantId: 'tenant-acme',
        runId: 'run-104',
        workspaceId: 'ws-1',
        model: 'deepseek-coder',
        promptTokens: 15000,
        completionTokens: 3000,
        totalTokens: 18000,
        durationMs: 12000,
        status: 'running',
        stepCount: 3
      }
    ];

    it('should calculate accurate aggregated token totals across metrics', () => {
      const service = new TelemetryService();
      const aggregates = service.calculateAggregates(mockMetrics);

      assert.strictEqual(aggregates.totalTokens, 61000);
      assert.strictEqual(aggregates.promptTokens, 50000);
      assert.strictEqual(aggregates.completionTokens, 11000);
      assert.strictEqual(aggregates.totalRuns, 4);
    });

    it('should calculate accurate prompt and completion percentage ratios', () => {
      const service = new TelemetryService();
      const aggregates = service.calculateAggregates(mockMetrics);

      // Prompt ratio: 50000 / 61000 = 81.967% -> 82.0%
      assert.strictEqual(aggregates.promptRatio, 82.0);
      // Completion ratio: 11000 / 61000 = 18.032% -> 18.0%
      assert.strictEqual(aggregates.completionRatio, 18.0);
    });

    it('should safely handle zero total tokens without division by zero or NaN', () => {
      const service = new TelemetryService();
      const zeroMetrics: IAgentExecutionMetric[] = [
        {
          metricId: 'm-zero',
          timestamp: '2026-09-18T10:00:00Z',
          tenantId: 'tenant-acme',
          runId: 'run-zero',
          workspaceId: 'ws-1',
          model: 'claude-3-5-sonnet',
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
          durationMs: 0,
          status: 'completed',
          stepCount: 0
        }
      ];

      const aggregates = service.calculateAggregates(zeroMetrics);
      assert.strictEqual(aggregates.totalTokens, 0);
      assert.strictEqual(aggregates.promptRatio, 0);
      assert.strictEqual(aggregates.completionRatio, 0);
      assert.strictEqual(aggregates.avgDurationMs, 0);
    });

    it('should calculate accurate agent run status tallies', () => {
      const service = new TelemetryService();
      const aggregates = service.calculateAggregates(mockMetrics);

      assert.strictEqual(aggregates.successfulRuns, 2);
      assert.strictEqual(aggregates.failedRuns, 1);
      assert.strictEqual(aggregates.activeRuns, 1);
    });

    it('should calculate accurate duration totals and averages', () => {
      const service = new TelemetryService();
      const aggregates = service.calculateAggregates(mockMetrics);

      // Total: 15000 + 25000 + 8000 + 12000 = 60000ms
      assert.strictEqual(aggregates.totalDurationMs, 60000);
      // Average: 60000 / 4 = 15000ms
      assert.strictEqual(aggregates.avgDurationMs, 15000);
    });

    it('should calculate exact model pricing based on baseline reference rates', () => {
      const service = new TelemetryService();

      // Claude 3.5 Sonnet: $0.003 prompt / 1k, $0.015 completion / 1k
      // 10,000 prompt = $0.03, 2,000 completion = $0.03 -> Total $0.06
      const sonnetCost = service.calculateCost('claude-3-5-sonnet', 10000, 2000);
      assert.strictEqual(sonnetCost, 0.06);

      // GPT-4o: $0.0025 prompt / 1k, $0.010 completion / 1k
      // 20,000 prompt = $0.05, 5,000 completion = $0.05 -> Total $0.10
      const gpt4oCost = service.calculateCost('gpt-4o', 20000, 5000);
      assert.strictEqual(gpt4oCost, 0.10);

      // DeepSeek Coder: $0.00014 prompt / 1k, $0.00028 completion / 1k
      // 15,000 prompt = $0.0021, 3,000 completion = $0.00084 -> Total $0.00294
      const deepseekCost = service.calculateCost('deepseek-coder', 15000, 3000);
      assert.strictEqual(deepseekCost, 0.00294);

      // Fallback model pricing
      const fallbackCost = service.calculateCost('unknown-model-xyz', 10000, 2000);
      // default: $0.001 prompt / 1k, $0.003 completion / 1k
      // 10k prompt = $0.01, 2k completion = $0.006 -> Total $0.016
      assert.strictEqual(fallbackCost, 0.016);
    });

    it('should rollup metrics by model with sorted ranking and usage share', () => {
      const service = new TelemetryService();
      const rollups = service.rollupByModel(mockMetrics);

      assert.strictEqual(rollups.length, 3);
      // Sorted by totalTokens descending:
      // gpt-4o: 25000 tokens
      // deepseek-coder: 18000 tokens
      // claude-3-5-sonnet: 12000 + 6000 = 18000 tokens
      assert.strictEqual(rollups[0].model, 'gpt-4o');
      assert.strictEqual(rollups[0].totalTokens, 25000);
      assert.strictEqual(rollups[0].runCount, 1);

      // Check sonnet aggregated runCount = 2
      const sonnetRollup = rollups.find((r) => r.model === 'claude-3-5-sonnet');
      assert.ok(sonnetRollup);
      assert.strictEqual(sonnetRollup.runCount, 2);
      assert.strictEqual(sonnetRollup.totalTokens, 18000);
      assert.strictEqual(sonnetRollup.promptTokens, 15000);
      assert.strictEqual(sonnetRollup.completionTokens, 3000);

      // Grand total = 61000, check shares
      const gptShare = Number(((25000 / 61000) * 100).toFixed(1));
      assert.strictEqual(rollups[0].usageSharePercent, gptShare);
    });
  });

  describe('Formatting & Utility Functions', () => {
    it('should format token counts into human-readable strings', () => {
      assert.strictEqual(formatTokenCount(1500000), '1.5M');
      assert.strictEqual(formatTokenCount(2000000), '2M');
      assert.strictEqual(formatTokenCount(45200), '45.2K');
      assert.strictEqual(formatTokenCount(1000), '1K');
      assert.strictEqual(formatTokenCount(850), '850');
      assert.strictEqual(formatTokenCount(0), '0');
    });

    it('should format execution durations into human-readable strings', () => {
      assert.strictEqual(formatDuration(450), '450ms');
      assert.strictEqual(formatDuration(25000), '25s');
      assert.strictEqual(formatDuration(150000), '2m 30s');
      assert.strictEqual(formatDuration(120000), '2m');
      assert.strictEqual(formatDuration(3600000), '1h');
      assert.strictEqual(formatDuration(3720000), '1h 2m');
      assert.strictEqual(formatDuration(0), '0s');
      assert.strictEqual(formatDuration(-10), '0s');
    });

    it('should format currency amounts with USD symbol and standard decimals', () => {
      const formatted1 = formatCurrency(12.45);
      assert.ok(formatted1.includes('$12.45'));

      const formatted2 = formatCurrency(0);
      assert.ok(formatted2.includes('$0.00'));
    });
  });

  describe('Sample Metrics & ClickHouse Query Envelope', () => {
    it('should generate 28 sample metrics conforming strictly to IAgentExecutionMetric', () => {
      const service = new TelemetryService({ defaultTenantId: 'tenant-demo' });
      const samples = service.generateSampleMetrics('tenant-demo');

      assert.strictEqual(samples.length, 28);
      for (const sample of samples) {
        assert.ok(sample.metricId.startsWith('metric-sample-'));
        assert.strictEqual(sample.tenantId, 'tenant-demo');
        assert.ok(sample.promptTokens > 0);
        assert.ok(sample.completionTokens > 0);
        assert.strictEqual(sample.totalTokens, sample.promptTokens + sample.completionTokens);
        assert.ok(['completed', 'failed', 'running'].includes(sample.status));
        assert.ok(sample.durationMs > 0);
        assert.ok(sample.timestamp);
      }
    });

    it('should construct valid query URL and handle successful ClickHouse JSON response', async () => {
      let requestedUrl = '';
      const mockFetch = async (input: RequestInfo | URL) => {
        requestedUrl = String(input);
        return {
          ok: true,
          status: 200,
          json: async () => ({
            data: [
              {
                metric_id: 'm-live-1',
                timestamp: '2026-09-18T10:00:00Z',
                tenant_id: 'tenant-test',
                run_id: 'run-live-1',
                workspace_id: 'ws-test',
                model: 'claude-3-5-sonnet',
                prompt_tokens: 12000,
                completion_tokens: 3000,
                total_tokens: 15000,
                duration_ms: 18000,
                status: 'completed',
                step_count: 5
              }
            ],
            rows: 1,
            rows_read: 1,
            bytes_read: 512
          })
        } as unknown as Response;
      };

      const service = new TelemetryService({
        endpoint: '/analytics',
        defaultTenantId: 'tenant-test',
        fetchFn: mockFetch
      });

      const request: ITelemetryQueryRequest = {
        table: 'agent_execution_metrics',
        tenantId: 'tenant-test',
        from: '2026-09-18T00:00:00Z',
        limit: 50
      };

      const response = await service.queryMetrics(request);
      assert.strictEqual(response.rows, 1);
      assert.strictEqual(response.data.length, 1);
      assert.ok(requestedUrl.includes('/analytics?query='));
      assert.ok(requestedUrl.includes('agent_execution_metrics'));
      assert.ok(requestedUrl.includes('tenant-test'));
    });

    it('should gracefully handle query errors and return zero data without throwing', async () => {
      const failingFetch = async () => {
        throw new Error('Connection refused to gateway');
      };

      const service = new TelemetryService({
        endpoint: '/analytics',
        fetchFn: failingFetch
      });

      const response = await service.queryMetrics({
        table: 'agent_execution_metrics',
        tenantId: 'tenant-error',
        from: '2026-09-18T00:00:00Z'
      });

      assert.strictEqual(response.rows, 0);
      assert.strictEqual(response.data.length, 0);
      assert.ok(typeof response.durationMs === 'number');
    });

    it('should fetch full dashboard data with fallback to sample metrics when offline', async () => {
      const failingFetch = async () => {
        throw new Error('Offline');
      };

      const service = new TelemetryService({
        endpoint: '/analytics',
        defaultTenantId: 'tenant-fallback',
        fetchFn: failingFetch
      });

      const dashboard = await service.getDashboardData('tenant-fallback', '24h');
      assert.strictEqual(dashboard.tenantId, 'tenant-fallback');
      assert.strictEqual(dashboard.timeRange, '24h');
      assert.ok(dashboard.metrics.totalTokens > 0);
      assert.ok(dashboard.modelRollups.length > 0);
      assert.ok(dashboard.recentActivity.length > 0);
    });
  });

  describe('TelemetryUsagePanel React Component Rendering', () => {
    it('should instantiate TelemetryUsagePanel React element with default state', () => {
      const element = React.createElement(TelemetryUsagePanel, {
        className: 'test-telemetry-panel'
      });

      assert.ok(React.isValidElement(element));
      assert.strictEqual(element.type, TelemetryUsagePanel);
    });

    it('should accept custom initialMetrics and tenantId props', () => {
      const customMetrics: IAgentExecutionMetric[] = [
        {
          metricId: 'test-metric-1',
          timestamp: '2026-09-18T09:00:00Z',
          tenantId: 'tenant-custom',
          runId: 'run-test-1',
          workspaceId: 'ws-test',
          model: 'claude-3-5-sonnet',
          promptTokens: 8000,
          completionTokens: 2000,
          totalTokens: 10000,
          durationMs: 14000,
          status: 'completed',
          stepCount: 3
        }
      ];

      const element = React.createElement(TelemetryUsagePanel, {
        tenantId: 'tenant-custom',
        initialMetrics: customMetrics,
        autoFetch: false
      });

      assert.ok(React.isValidElement(element));
      assert.strictEqual(element.props.tenantId, 'tenant-custom');
      assert.strictEqual(element.props.initialMetrics?.length, 1);
      assert.strictEqual(element.props.autoFetch, false);
    });

    it('should construct TelemetryUsagePanel with onClose callback', () => {
      let closed = false;
      const element = React.createElement(TelemetryUsagePanel, {
        onClose: () => {
          closed = true;
        }
      });

      assert.ok(React.isValidElement(element));
      assert.strictEqual(typeof element.props.onClose, 'function');
      element.props.onClose?.();
      assert.strictEqual(closed, true);
    });
  });

  describe('Monorepo Package Exports & Contract Conformance', () => {
    it('should re-export TelemetryUsagePanel and TelemetryService from @index0/ide-web barrel', () => {
      assert.strictEqual(typeof IndexTelemetryUsagePanel, 'function');
      assert.strictEqual(typeof IndexTelemetryService, 'function');
    });

    it('should export MODEL_PRICING constants with expected multi-provider models', () => {
      assert.ok(MODEL_PRICING['claude-3-5-sonnet']);
      assert.ok(MODEL_PRICING['gpt-4o']);
      assert.ok(MODEL_PRICING['deepseek-coder']);
      assert.ok(MODEL_PRICING['claude-3-opus']);
      assert.ok(MODEL_PRICING['default']);
    });
  });
});
