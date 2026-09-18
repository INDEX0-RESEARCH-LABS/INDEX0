import { describe, it } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

describe("Telemetry Pipeline Conformance (ClickHouse + OpenMeter)", () => {
  const currentDir = path.dirname(fileURLToPath(import.meta.url));
  const rootDir = path.resolve(currentDir, "../..");
  const initSqlPath = path.join(rootDir, "infra/clickhouse/init.sql");
  const openmeterConfigPath = path.join(rootDir, "infra/openmeter/config.yaml");
  const composePath = path.join(rootDir, "infra/compose/docker-compose.yml");
  const contractsTelemetryPath = path.join(
    rootDir,
    "packages/contracts/src/v1/telemetry/index.ts"
  );
  const contractsV1IndexPath = path.join(
    rootDir,
    "packages/contracts/src/v1/index.ts"
  );

  describe("ClickHouse Table Schema Conformance (init.sql)", () => {
    it("should exist and create the index0_analytics database", () => {
      assert.ok(fs.existsSync(initSqlPath), "init.sql must exist at infra/clickhouse/init.sql");
      const content = fs.readFileSync(initSqlPath, "utf-8");
      assert.match(
        content,
        /CREATE DATABASE IF NOT EXISTS index0_analytics;/i,
        "Must create index0_analytics database"
      );
      assert.match(content, /USE index0_analytics;/i, "Must switch to index0_analytics database");
    });

    it("should define audit_events table with MergeTree engine and monthly partition", () => {
      const content = fs.readFileSync(initSqlPath, "utf-8");
      assert.match(content, /CREATE TABLE IF NOT EXISTS audit_events/i);
      assert.match(content, /event_id\s+UUID/i);
      assert.match(content, /tenant_id\s+UUID/i);
      assert.match(content, /user_id\s+UUID/i);
      assert.match(content, /action\s+LowCardinality\(String\)/i);
      assert.match(content, /resource_type\s+LowCardinality\(String\)/i);
      assert.match(content, /ENGINE\s*=\s*MergeTree\(\)/i);
      assert.match(content, /PARTITION BY toYYYYMM\(timestamp\)/i);
      assert.match(content, /ORDER BY\s*\(tenant_id,\s*timestamp,\s*event_id\)/i);
    });

    it("should define agent_execution_metrics table with token accounting", () => {
      const content = fs.readFileSync(initSqlPath, "utf-8");
      assert.match(content, /CREATE TABLE IF NOT EXISTS agent_execution_metrics/i);
      assert.match(content, /metric_id\s+UUID/i);
      assert.match(content, /run_id\s+UUID/i);
      assert.match(content, /model\s+LowCardinality\(String\)/i);
      assert.match(content, /prompt_tokens\s+UInt32/i);
      assert.match(content, /completion_tokens\s+UInt32/i);
      assert.match(content, /total_tokens\s+UInt32/i);
      assert.match(content, /duration_ms\s+UInt32/i);
      assert.match(content, /status\s+LowCardinality\(String\)/i);
      assert.match(content, /ORDER BY\s*\(tenant_id,\s*model,\s*timestamp,\s*run_id\)/i);
    });

    it("should define api_requests table for HTTP request telemetry", () => {
      const content = fs.readFileSync(initSqlPath, "utf-8");
      assert.match(content, /CREATE TABLE IF NOT EXISTS api_requests/i);
      assert.match(content, /request_id\s+UUID/i);
      assert.match(content, /method\s+LowCardinality\(String\)/i);
      assert.match(content, /status_code\s+UInt16/i);
      assert.match(content, /duration_ms\s+UInt32/i);
      assert.match(content, /ORDER BY\s*\(tenant_id,\s*timestamp,\s*request_id\)/i);
    });

    it("should define usage_events table for OpenMeter ingestion sink", () => {
      const content = fs.readFileSync(initSqlPath, "utf-8");
      assert.match(content, /CREATE TABLE IF NOT EXISTS usage_events/i);
      assert.match(content, /id\s+UUID/i);
      assert.match(content, /type\s+LowCardinality\(String\)/i);
      assert.match(content, /subject\s+String/i);
      assert.match(content, /value\s+Float64/i);
      assert.match(content, /tenant_id\s+UUID/i);
      assert.match(content, /ORDER BY\s*\(tenant_id,\s*type,\s*timestamp,\s*id\)/i);
    });
  });

  describe("OpenMeter Declarative Configuration (config.yaml)", () => {
    it("should exist and define server ports and telemetry address", () => {
      assert.ok(fs.existsSync(openmeterConfigPath), "config.yaml must exist at infra/openmeter/config.yaml");
      const content = fs.readFileSync(openmeterConfigPath, "utf-8");
      assert.match(content, /address:\s*":8888"/, "Must listen on :8888");
      assert.match(content, /address:\s*":10000"/, "Must expose telemetry on :10000");
    });

    it("should configure ClickHouse aggregation sink pointing to index0_analytics", () => {
      const content = fs.readFileSync(openmeterConfigPath, "utf-8");
      assert.match(content, /clickhouse:/i, "Must define clickhouse aggregation sink");
      assert.match(content, /address:\s*"clickhouse:9000"/i, "Must target clickhouse:9000");
      assert.match(content, /database:\s*"index0_analytics"/i, "Must target index0_analytics database");
    });

    it("should register all 5 core meters matching MeteredDimension", () => {
      const content = fs.readFileSync(openmeterConfigPath, "utf-8");
      const expectedMeters = [
        { slug: "tokens_total", eventType: "tokens.total", agg: "SUM" },
        { slug: "tokens_prompt", eventType: "tokens.prompt", agg: "SUM" },
        { slug: "tokens_completion", eventType: "tokens.completion", agg: "SUM" },
        { slug: "sandbox_duration_ms", eventType: "sandbox.duration_ms", agg: "SUM" },
        { slug: "agent_run_count", eventType: "agent.run_count", agg: "COUNT" },
      ];

      for (const meter of expectedMeters) {
        assert.ok(
          content.includes(`slug: "${meter.slug}"`),
          `Must register meter slug: ${meter.slug}`
        );
        assert.ok(
          content.includes(`eventType: "${meter.eventType}"`),
          `Must map meter ${meter.slug} to eventType ${meter.eventType}`
        );
        assert.ok(
          content.includes(`aggregation: "${meter.agg}"`),
          `Must configure aggregation ${meter.agg} for ${meter.slug}`
        );
      }
    });
  });

  describe("Docker Compose Telemetry Stack Alignment", () => {
    it("should define clickhouse service with official 24-alpine image and init mount", () => {
      assert.ok(fs.existsSync(composePath), "docker-compose.yml must exist");
      const content = fs.readFileSync(composePath, "utf-8");
      assert.match(content, /clickhouse:/);
      assert.match(content, /image:\s*clickhouse\/clickhouse-server:24-alpine/);
      assert.match(content, /\.\.\/clickhouse\/init\.sql:\/docker-entrypoint-initdb\.d\/init\.sql:ro/);
      assert.match(content, /"8123:8123"/);
      assert.match(content, /"9000:9000"/);
    });

    it("should define openmeter service with official image and config mount", () => {
      const content = fs.readFileSync(composePath, "utf-8");
      assert.match(content, /openmeter:/, "Must declare openmeter service");
      assert.match(content, /image:\s*ghcr\.io\/openmeterio\/openmeter:latest/, "Must use official openmeter image");
      assert.match(content, /"8888:8888"/, "Must expose port 8888");
      assert.match(content, /\.\.\/openmeter\/config\.yaml:\/etc\/openmeter\/config\.yaml:ro/, "Must mount config.yaml");
    });

    it("should wire clickhouse and openmeter to index0-net with dependency ordering", () => {
      const content = fs.readFileSync(composePath, "utf-8");
      assert.match(content, /openmeter:[\s\S]*?depends_on:[\s\S]*?clickhouse:/, "openmeter must depend on clickhouse");
      assert.match(content, /openmeter:[\s\S]*?networks:[\s\S]*?- index0-net/, "openmeter must be attached to index0-net");
      assert.match(content, /clickhouse:[\s\S]*?networks:[\s\S]*?- index0-net/, "clickhouse must be attached to index0-net");
    });
  });

  describe("Option A Architecture Invariants (Zero Scratch-Built Code)", () => {
    it("should verify zero custom Go telemetry daemons exist in repository", () => {
      const packagesDir = path.join(rootDir, "packages");
      const servicesDir = path.join(rootDir, "services");

      const checkDir = (dir: string) => {
        if (!fs.existsSync(dir)) return;
        const files = fs.readdirSync(dir, { recursive: true });
        for (const file of files) {
          const filePath = path.join(dir, file as string);
          if (fs.statSync(filePath).isFile()) {
            assert.ok(
              !filePath.toLowerCase().includes("telemetry-daemon"),
              `Forbidden custom telemetry daemon found: ${filePath}`
            );
            assert.ok(
              !filePath.toLowerCase().includes("metering-service"),
              `Forbidden custom metering service found: ${filePath}`
            );
          }
        }
      };

      checkDir(packagesDir);
      checkDir(servicesDir);
    });
  });

  describe("@index0/contracts/v1/telemetry Contract Conformance", () => {
    it("should re-export telemetry from v1 barrel export", () => {
      assert.ok(fs.existsSync(contractsV1IndexPath), "v1/index.ts must exist");
      const content = fs.readFileSync(contractsV1IndexPath, "utf-8");
      assert.match(
        content,
        /export \* from "\.\/telemetry\/index\.js";/,
        "Must re-export telemetry from v1 index"
      );
    });

    it("should export all authoritative telemetry interfaces", () => {
      assert.ok(fs.existsSync(contractsTelemetryPath), "telemetry/index.ts must exist");
      const content = fs.readFileSync(contractsTelemetryPath, "utf-8");
      const expectedTypes = [
        "ClickHouseTableName",
        "IAuditEvent",
        "IAgentExecutionMetric",
        "IApiRequestLog",
        "IUsageTelemetryEvent",
        "OpenMeterAggregationType",
        "IOpenMeterMeterConfig",
        "IOpenMeterConfig",
        "ITelemetryQueryRequest",
        "ITelemetryQueryResponse",
      ];

      for (const typeName of expectedTypes) {
        assert.ok(
          content.includes(typeName),
          `telemetry/index.ts must export ${typeName}`
        );
      }
    });
  });
});
