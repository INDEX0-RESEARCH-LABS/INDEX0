/**
 * Telemetry & Token Usage Panel — @index0/ide-web
 * High-fidelity visual dashboard displaying token consumption, prompt vs completion ratios,
 * agent runtimes, multi-model rollups, and ClickHouse / OpenMeter cost estimates.
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Activity,
  Cpu,
  Clock,
  DollarSign,
  RefreshCw,
  X,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Database,
  Layers,
  ShieldCheck
} from 'lucide-react';
import type { IAgentExecutionMetric } from '@index0/contracts';
import {
  TelemetryService,
  TimeRangeOption,
  ITelemetryDashboardData,
  formatTokenCount,
  formatDuration,
  formatCurrency
} from '../services/telemetryService.js';

export interface ITelemetryUsagePanelProps {
  onClose?: () => void;
  className?: string;
  tenantId?: string;
  endpoint?: string;
  initialMetrics?: IAgentExecutionMetric[];
  autoFetch?: boolean;
}

export const TelemetryUsagePanel: React.FC<ITelemetryUsagePanelProps> = ({
  onClose,
  className = '',
  tenantId = 'tenant-default',
  endpoint = '/analytics',
  initialMetrics,
  autoFetch = true
}) => {
  const service = useMemo(
    () => new TelemetryService({ endpoint, defaultTenantId: tenantId }),
    [endpoint, tenantId]
  );

  const [timeRange, setTimeRange] = useState<TimeRangeOption>('24h');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dashboardData, setDashboardData] = useState<ITelemetryDashboardData>(() => {
    const rawMetrics = initialMetrics || service.generateSampleMetrics(tenantId);
    const summary = service.calculateAggregates(rawMetrics);
    const rollups = service.rollupByModel(rawMetrics);
    return {
      timeRange: '24h',
      tenantId,
      metrics: summary,
      modelRollups: rollups,
      recentActivity: rawMetrics.slice(0, 10)
    };
  });

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      if (initialMetrics) {
        const summary = service.calculateAggregates(initialMetrics);
        const rollups = service.rollupByModel(initialMetrics);
        setDashboardData({
          timeRange,
          tenantId,
          metrics: summary,
          modelRollups: rollups,
          recentActivity: initialMetrics.slice(0, 10)
        });
      } else {
        const data = await service.getDashboardData(tenantId, timeRange);
        setDashboardData(data);
      }
    } finally {
      setIsLoading(false);
    }
  }, [service, initialMetrics, tenantId, timeRange]);

  useEffect(() => {
    if (autoFetch && !initialMetrics) {
      loadData();
    }
  }, [autoFetch, initialMetrics, loadData]);

  const { metrics, modelRollups, recentActivity } = dashboardData;
  const successRate = metrics.totalRuns > 0
    ? Number(((metrics.successfulRuns / metrics.totalRuns) * 100).toFixed(1))
    : 100;

  return (
    <div
      className={`index0-telemetry-panel ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        background: '#0a0c14',
        color: '#e2e8f0',
        overflow: 'hidden',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
      }}
      data-testid="telemetry-usage-panel"
    >
      {/* Top Header Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 20px',
          background: '#121524',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          flexShrink: 0
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              background: 'rgba(56, 189, 248, 0.15)',
              border: '1px solid rgba(56, 189, 248, 0.3)'
            }}
          >
            <Activity size={18} color="#38bdf8" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <strong style={{ fontSize: '0.95rem', color: '#f8fafc' }}>
                Telemetry & Token Usage Analytics
              </strong>
              <span
                style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#34d399',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '4px',
                  padding: '1px 6px',
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: '#34d399'
                  }}
                />
                ClickHouse Live
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>
              Sink: <code style={{ color: '#cbd5e1' }}>/analytics</code> (Port 8000) • OpenMeter Ingestion Pipeline
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Time Range Selector */}
          <div
            style={{
              display: 'flex',
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '6px',
              padding: '2px',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}
            data-testid="timerange-selector"
          >
            {(['1h', '24h', '7d', '30d'] as TimeRangeOption[]).map((tr) => (
              <button
                key={tr}
                onClick={() => setTimeRange(tr)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '4px',
                  border: 'none',
                  background: timeRange === tr ? 'rgba(99, 102, 241, 0.3)' : 'transparent',
                  color: timeRange === tr ? '#a5b4fc' : '#94a3b8',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                data-testid={`timerange-btn-${tr}`}
              >
                {tr}
              </button>
            ))}
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => loadData()}
            disabled={isLoading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '6px',
              padding: '5px 10px',
              color: '#e2e8f0',
              fontSize: '0.75rem',
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
            title="Refresh metrics from ClickHouse"
            data-testid="telemetry-refresh-btn"
          >
            <RefreshCw
              size={13}
              style={{
                animation: isLoading ? 'spin 1s linear infinite' : 'none'
              }}
            />
            <span>Refresh</span>
          </button>

          {/* Close Button */}
          {onClose && (
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Close panel"
              data-testid="telemetry-close-btn"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Main Body Scrollable Area */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '18px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}
      >
        {/* Metric Summary Cards (4-Grid) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '12px'
          }}
          data-testid="metric-summary-grid"
        >
          {/* Card 1: Total Tokens Ingested */}
          <div
            style={{
              background: 'rgba(18, 21, 36, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '8px',
              padding: '14px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              position: 'relative',
              overflow: 'hidden'
            }}
            data-testid="card-total-tokens"
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>
                Total Tokens Ingested
              </span>
              <Cpu size={16} color="#818cf8" />
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: 700, color: '#f8fafc' }}>
              {formatTokenCount(metrics.totalTokens)}
            </div>

            {/* Prompt vs Completion Progress Bar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div
                style={{
                  height: '6px',
                  width: '100%',
                  borderRadius: '3px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  overflow: 'hidden'
                }}
              >
                <div
                  style={{
                    width: `${metrics.promptRatio}%`,
                    background: '#6366f1'
                  }}
                  title={`Prompt: ${metrics.promptRatio}%`}
                />
                <div
                  style={{
                    width: `${metrics.completionRatio}%`,
                    background: '#10b981'
                  }}
                  title={`Completion: ${metrics.completionRatio}%`}
                />
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.68rem',
                  color: '#94a3b8'
                }}
              >
                <span style={{ color: '#a5b4fc' }}>
                  Prompt: {formatTokenCount(metrics.promptTokens)} ({metrics.promptRatio}%)
                </span>
                <span style={{ color: '#6ee7b7' }}>
                  Comp: {formatTokenCount(metrics.completionTokens)} ({metrics.completionRatio}%)
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Estimated Spend */}
          <div
            style={{
              background: 'rgba(18, 21, 36, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '8px',
              padding: '14px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}
            data-testid="card-estimated-spend"
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>
                Estimated Spend (USD)
              </span>
              <DollarSign size={16} color="#34d399" />
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: 700, color: '#34d399' }}>
              {formatCurrency(metrics.estimatedCostUsd)}
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.7rem',
                color: '#94a3b8'
              }}
            >
              <Database size={12} color="#38bdf8" />
              <span>OpenMeter metered dimensions</span>
            </div>
          </div>

          {/* Card 3: Agent Runs & Success Rate */}
          <div
            style={{
              background: 'rgba(18, 21, 36, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '8px',
              padding: '14px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}
            data-testid="card-agent-runs"
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>
                Agent Runs
              </span>
              <Activity size={16} color="#f59e0b" />
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span style={{ fontSize: '1.45rem', fontWeight: 700, color: '#f8fafc' }}>
                {metrics.totalRuns}
              </span>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  color: successRate >= 90 ? '#34d399' : '#f87171',
                  background:
                    successRate >= 90
                      ? 'rgba(16, 185, 129, 0.15)'
                      : 'rgba(239, 68, 68, 0.15)',
                  padding: '1px 6px',
                  borderRadius: '4px'
                }}
              >
                {successRate}% Success
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                gap: '12px',
                fontSize: '0.68rem',
                color: '#94a3b8'
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#34d399' }}>
                <CheckCircle2 size={11} /> {metrics.successfulRuns} Completed
              </span>
              {metrics.failedRuns > 0 && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#f87171' }}>
                  <AlertCircle size={11} /> {metrics.failedRuns} Failed
                </span>
              )}
            </div>
          </div>

          {/* Card 4: Sandbox Execution Runtime */}
          <div
            style={{
              background: 'rgba(18, 21, 36, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '8px',
              padding: '14px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}
            data-testid="card-sandbox-runtime"
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>
                Sandbox Runtime
              </span>
              <Clock size={16} color="#38bdf8" />
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: 700, color: '#f8fafc' }}>
              {formatDuration(metrics.totalDurationMs)}
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.7rem',
                color: '#94a3b8'
              }}
            >
              <ShieldCheck size={12} color="#34d399" />
              <span>Avg: {formatDuration(metrics.avgDurationMs)} / run</span>
            </div>
          </div>
        </div>

        {/* Model Consumption Breakdown Table */}
        <div
          style={{
            background: 'rgba(18, 21, 36, 0.7)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '8px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
          data-testid="model-breakdown-card"
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart3 size={16} color="#818cf8" />
              <strong style={{ fontSize: '0.85rem', color: '#f1f5f9' }}>
                Model Consumption Breakdown & Pricing Rollup
              </strong>
            </div>
            <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
              {modelRollups.length} Active Models
            </span>
          </div>

          {/* Model Breakdown Table */}
          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.75rem',
                textAlign: 'left'
              }}
              data-testid="model-breakdown-table"
            >
              <thead>
                <tr
                  style={{
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                    color: '#94a3b8'
                  }}
                >
                  <th style={{ padding: '8px 10px', fontWeight: 600 }}>Model</th>
                  <th style={{ padding: '8px 10px', fontWeight: 600 }}>Total Tokens</th>
                  <th style={{ padding: '8px 10px', fontWeight: 600 }}>Prompt Tokens</th>
                  <th style={{ padding: '8px 10px', fontWeight: 600 }}>Completion Tokens</th>
                  <th style={{ padding: '8px 10px', fontWeight: 600 }}>Runs</th>
                  <th style={{ padding: '8px 10px', fontWeight: 600 }}>Est. Cost</th>
                  <th style={{ padding: '8px 10px', fontWeight: 600 }}>Usage Share</th>
                </tr>
              </thead>
              <tbody>
                {modelRollups.map((item) => (
                  <tr
                    key={item.model}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                      transition: 'background 0.15s ease'
                    }}
                  >
                    <td style={{ padding: '10px 10px', fontWeight: 600, color: '#f8fafc' }}>
                      <span
                        style={{
                          background: 'rgba(99, 102, 241, 0.15)',
                          color: '#c7d2fe',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontFamily: 'monospace',
                          fontSize: '0.72rem',
                          border: '1px solid rgba(99, 102, 241, 0.25)'
                        }}
                      >
                        {item.model}
                      </span>
                    </td>
                    <td style={{ padding: '10px 10px', color: '#e2e8f0' }}>
                      {formatTokenCount(item.totalTokens)}
                    </td>
                    <td style={{ padding: '10px 10px', color: '#a5b4fc' }}>
                      {formatTokenCount(item.promptTokens)}
                    </td>
                    <td style={{ padding: '10px 10px', color: '#6ee7b7' }}>
                      {formatTokenCount(item.completionTokens)}
                    </td>
                    <td style={{ padding: '10px 10px', color: '#cbd5e1' }}>
                      {item.runCount}
                    </td>
                    <td style={{ padding: '10px 10px', color: '#34d399', fontWeight: 600 }}>
                      {formatCurrency(item.estimatedCostUsd)}
                    </td>
                    <td style={{ padding: '10px 10px', minWidth: '120px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div
                          style={{
                            flex: 1,
                            height: '5px',
                            background: 'rgba(255, 255, 255, 0.08)',
                            borderRadius: '3px',
                            overflow: 'hidden'
                          }}
                        >
                          <div
                            style={{
                              width: `${item.usageSharePercent}%`,
                              height: '100%',
                              background: 'linear-gradient(90deg, #6366f1, #38bdf8)'
                            }}
                          />
                        </div>
                        <span style={{ fontSize: '0.68rem', color: '#94a3b8', width: '32px' }}>
                          {item.usageSharePercent}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Execution Stream Table */}
        <div
          style={{
            background: 'rgba(18, 21, 36, 0.7)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '8px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
          data-testid="recent-activity-card"
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={16} color="#38bdf8" />
              <strong style={{ fontSize: '0.85rem', color: '#f1f5f9' }}>
                Recent Agent Execution Stream
              </strong>
            </div>
            <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
              Showing last {recentActivity.length} events
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.72rem',
                textAlign: 'left'
              }}
              data-testid="recent-activity-table"
            >
              <thead>
                <tr
                  style={{
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                    color: '#94a3b8'
                  }}
                >
                  <th style={{ padding: '6px 10px', fontWeight: 600 }}>Timestamp</th>
                  <th style={{ padding: '6px 10px', fontWeight: 600 }}>Run ID</th>
                  <th style={{ padding: '6px 10px', fontWeight: 600 }}>Model</th>
                  <th style={{ padding: '6px 10px', fontWeight: 600 }}>Tokens (P/C)</th>
                  <th style={{ padding: '6px 10px', fontWeight: 600 }}>Duration</th>
                  <th style={{ padding: '6px 10px', fontWeight: 600 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.map((event) => (
                  <tr
                    key={event.metricId}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.03)'
                    }}
                  >
                    <td style={{ padding: '8px 10px', color: '#94a3b8' }}>
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </td>
                    <td style={{ padding: '8px 10px', fontFamily: 'monospace', color: '#cbd5e1' }}>
                      {event.runId}
                    </td>
                    <td style={{ padding: '8px 10px', color: '#e2e8f0' }}>
                      {event.model}
                    </td>
                    <td style={{ padding: '8px 10px', color: '#a5b4fc' }}>
                      {formatTokenCount(event.promptTokens)} / {formatTokenCount(event.completionTokens)}
                    </td>
                    <td style={{ padding: '8px 10px', color: '#cbd5e1' }}>
                      {formatDuration(event.durationMs)}
                    </td>
                    <td style={{ padding: '8px 10px' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          fontSize: '0.65rem',
                          fontWeight: 600,
                          background:
                            event.status === 'completed'
                              ? 'rgba(16, 185, 129, 0.15)'
                              : event.status === 'failed'
                              ? 'rgba(239, 68, 68, 0.15)'
                              : 'rgba(245, 158, 11, 0.15)',
                          color:
                            event.status === 'completed'
                              ? '#34d399'
                              : event.status === 'failed'
                              ? '#f87171'
                              : '#fbbf24'
                        }}
                      >
                        {event.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
