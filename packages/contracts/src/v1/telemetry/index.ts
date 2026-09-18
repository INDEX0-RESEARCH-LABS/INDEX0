/**
 * Telemetry & Analytics Contracts — @index0/contracts/v1/telemetry
 * Authoritative schema definitions for ClickHouse columnar tables,
 * OpenMeter event streams, and analytics query envelopes.
 */

// -----------------------------------------------------------------------------
// ClickHouse Table Enumeration & Names
// -----------------------------------------------------------------------------

export type ClickHouseTableName =
  | "audit_events"
  | "agent_execution_metrics"
  | "api_requests"
  | "usage_events";

// -----------------------------------------------------------------------------
// 1. Audit & Security Events
// -----------------------------------------------------------------------------

export interface IAuditEvent {
  eventId: string;
  timestamp: string;
  tenantId: string;
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  ipAddress: string;
  userAgent: string;
  metadata?: string | Record<string, unknown>;
  createdAt?: string;
}

// -----------------------------------------------------------------------------
// 2. Agent Execution Metrics & Token Accounting
// -----------------------------------------------------------------------------

export type AgentMetricStatus = "completed" | "failed" | "running" | "aborted";

export interface IAgentExecutionMetric {
  metricId: string;
  timestamp: string;
  tenantId: string;
  runId: string;
  workspaceId: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  durationMs: number;
  status: AgentMetricStatus | string;
  stepCount: number;
  errorType?: string;
  createdAt?: string;
}

// -----------------------------------------------------------------------------
// 3. API Gateway Request Logs
// -----------------------------------------------------------------------------

export interface IApiRequestLog {
  requestId: string;
  timestamp: string;
  tenantId: string;
  userId?: string;
  method: string;
  path: string;
  statusCode: number;
  durationMs: number;
  clientIp: string;
  userAgent: string;
  errorMessage?: string;
  createdAt?: string;
}

// -----------------------------------------------------------------------------
// 4. Raw Usage & Metering Events (OpenMeter Sink)
// -----------------------------------------------------------------------------

export interface IUsageTelemetryEvent {
  id: string;
  type: string;
  subject: string;
  timestamp: string;
  value: number;
  tenantId: string;
  metadata?: string | Record<string, unknown>;
  createdAt?: string;
}

// -----------------------------------------------------------------------------
// 5. OpenMeter Meter Definitions & Configuration
// -----------------------------------------------------------------------------

export type OpenMeterAggregationType =
  | "SUM"
  | "COUNT"
  | "AVG"
  | "MIN"
  | "MAX"
  | "UNIQUE_COUNT";

export interface IOpenMeterMeterConfig {
  slug: string;
  description: string;
  aggregation: OpenMeterAggregationType;
  eventType: string;
  valueProperty?: string;
  groupBy?: Record<string, string>;
}

export interface IOpenMeterConfig {
  address?: string;
  telemetry?: {
    address?: string;
  };
  aggregation?: {
    clickhouse?: {
      address: string;
      database: string;
      username?: string;
      password?: string;
    };
  };
  meters: IOpenMeterMeterConfig[];
}

// -----------------------------------------------------------------------------
// 6. Analytics Query & Aggregation Envelopes
// -----------------------------------------------------------------------------

export interface ITelemetryQueryRequest {
  table: ClickHouseTableName;
  tenantId: string;
  from: string;
  to?: string;
  filters?: Record<string, unknown>;
  limit?: number;
}

export interface ITelemetryQueryResponse<T = unknown> {
  data: T[];
  rows: number;
  durationMs: number;
  statistics?: {
    bytesRead?: number;
    rowsRead?: number;
    elapsedMs?: number;
  };
}
