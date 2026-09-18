-- ClickHouse Analytics & Telemetry Schema for INDEX0 AI
-- Database: index0_analytics
-- Columnar storage engine for high-throughput immutable execution events

CREATE DATABASE IF NOT EXISTS index0_analytics;

USE index0_analytics;

-- -----------------------------------------------------------------------------
-- 1. Audit & Security Events
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_events (
    event_id UUID,
    timestamp DateTime64(3, 'UTC'),
    tenant_id UUID,
    user_id UUID,
    action LowCardinality(String),
    resource_type LowCardinality(String),
    resource_id String,
    ip_address String,
    user_agent String,
    metadata String,
    created_at DateTime DEFAULT now()
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(timestamp)
ORDER BY (tenant_id, timestamp, event_id);

-- -----------------------------------------------------------------------------
-- 2. Agent Execution Metrics & Token Accounting
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS agent_execution_metrics (
    metric_id UUID,
    timestamp DateTime64(3, 'UTC'),
    tenant_id UUID,
    run_id UUID,
    workspace_id UUID,
    model LowCardinality(String),
    prompt_tokens UInt32,
    completion_tokens UInt32,
    total_tokens UInt32,
    duration_ms UInt32,
    status LowCardinality(String),
    step_count UInt16,
    error_type LowCardinality(String),
    created_at DateTime DEFAULT now()
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(timestamp)
ORDER BY (tenant_id, model, timestamp, run_id);

-- -----------------------------------------------------------------------------
-- 3. API Gateway Request Logs & Performance Profiles
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS api_requests (
    request_id UUID,
    timestamp DateTime64(3, 'UTC'),
    tenant_id UUID,
    user_id UUID,
    method LowCardinality(String),
    path String,
    status_code UInt16,
    duration_ms UInt32,
    client_ip String,
    user_agent String,
    error_message String,
    created_at DateTime DEFAULT now()
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(timestamp)
ORDER BY (tenant_id, timestamp, request_id);

-- -----------------------------------------------------------------------------
-- 4. OpenMeter Usage & Metering Events (Sovereign Metering Sink)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usage_events (
    id UUID,
    type LowCardinality(String),
    subject String,
    timestamp DateTime64(3, 'UTC'),
    value Float64,
    tenant_id UUID,
    metadata String,
    created_at DateTime DEFAULT now()
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(timestamp)
ORDER BY (tenant_id, type, timestamp, id);

