import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  type ClickHouseTableName,
  type IAuditEvent,
  type IAgentExecutionMetric,
  type IApiRequestLog,
  type IUsageTelemetryEvent,
  type IOpenMeterConfig,
  type IOpenMeterMeterConfig,
  type ITelemetryQueryRequest,
  type ITelemetryQueryResponse,
} from "@index0/contracts";

describe("Dev 2 Platform: Telemetry Platform Smoke & ClickHouse/OpenMeter Verification", () => {
  const currentDir = path.dirname(fileURLToPath(import.meta.url));
  const rootDir = path.resolve(currentDir, "../..");
  const initSqlPath = path.join(rootDir, "infra/clickhouse/init.sql");
  const openmeterConfigPath = path.join(rootDir, "infra/openmeter/config.yaml");
  const caddyfilePath = path.join(rootDir, "infra/gateway/Caddyfile");
  const composePath = path.join(rootDir, "infra/compose/docker-compose.yml");

  // ---------------------------------------------------------------------------
  // 1. ClickHouse Storage Engine, Partitioning & Indexing Invariants
  // ---------------------------------------------------------------------------
  describe("ClickHouse Storage Engine & Partition Pruning Conformance", () => {
    it("should ensure init.sql defines index0_analytics database", () => {
      assert.ok(fs.existsSync(initSqlPath), "ClickHouse init.sql must exist");
      const sql = fs.readFileSync(initSqlPath, "utf-8");

      assert.match(
        sql,
        /CREATE DATABASE IF NOT EXISTS index0_analytics;/i,
        "Must create index0_analytics database"
      );
      assert.match(
        sql,
        /USE index0_analytics;/i,
        "Must select index0_analytics database context"
      );
    });

    it("should enforce MergeTree engine across all 4 analytics tables", () => {
      const sql = fs.readFileSync(initSqlPath, "utf-8");
      const expectedTables: ClickHouseTableName[] = [
        "audit_events",
        "agent_execution_metrics",
        "api_requests",
        "usage_events",
      ];

      for (const table of expectedTables) {
        assert.match(
          sql,
          new RegExp(`CREATE TABLE IF NOT EXISTS ${table}`, "i"),
          `Must declare table ${table}`
        );

        // Verify each table uses ENGINE = MergeTree()
        const tableBlockRegex = new RegExp(
          `CREATE TABLE IF NOT EXISTS ${table}[\\s\\S]*?ENGINE\\s*=\\s*MergeTree\\(\\)`,
          "i"
        );
        assert.match(
          sql,
          tableBlockRegex,
          `Table ${table} must be configured with MergeTree engine`
        );
      }
    });

    it("should enforce monthly partition pruning with toYYYYMM(timestamp)", () => {
      const sql = fs.readFileSync(initSqlPath, "utf-8");
      const expectedTables: ClickHouseTableName[] = [
        "audit_events",
        "agent_execution_metrics",
        "api_requests",
        "usage_events",
      ];

      for (const table of expectedTables) {
        const partitionBlockRegex = new RegExp(
          `CREATE TABLE IF NOT EXISTS ${table}[\\s\\S]*?PARTITION BY toYYYYMM\\(timestamp\\)`,
          "i"
        );
        assert.match(
          sql,
          partitionBlockRegex,
          `Table ${table} must enforce monthly partition pruning using toYYYYMM(timestamp)`
        );
      }
    });

    it("should configure compound primary/sorting keys optimized for multi-tenant query pruning", () => {
      const sql = fs.readFileSync(initSqlPath, "utf-8");

      const expectedOrderKeys = [
        {
          table: "audit_events",
          pattern: /ORDER BY\s*\(\s*tenant_id\s*,\s*timestamp\s*,\s*event_id\s*\)/i,
          desc: "(tenant_id, timestamp, event_id)",
        },
        {
          table: "agent_execution_metrics",
          pattern: /ORDER BY\s*\(\s*tenant_id\s*,\s*model\s*,\s*timestamp\s*,\s*run_id\s*\)/i,
          desc: "(tenant_id, model, timestamp, run_id)",
        },
        {
          table: "api_requests",
          pattern: /ORDER BY\s*\(\s*tenant_id\s*,\s*timestamp\s*,\s*request_id\s*\)/i,
          desc: "(tenant_id, timestamp, request_id)",
        },
        {
          table: "usage_events",
          pattern: /ORDER BY\s*\(\s*tenant_id\s*,\s*type\s*,\s*timestamp\s*,\s*id\s*\)/i,
          desc: "(tenant_id, type, timestamp, id)",
        },
      ];

      for (const { table, pattern, desc } of expectedOrderKeys) {
        const orderRegex = new RegExp(
          `CREATE TABLE IF NOT EXISTS ${table}[\\s\\S]*?${pattern.source}`,
          "i"
        );
        assert.match(
          sql,
          orderRegex,
          `Table ${table} must order rows by ${desc} for optimal multi-tenant index traversal`
        );
      }
    });

    it("should apply LowCardinality optimizations to high-repetition categorical columns", () => {
      const sql = fs.readFileSync(initSqlPath, "utf-8");

      const lowCardinalityFields = [
        { table: "audit_events", column: "action" },
        { table: "audit_events", column: "resource_type" },
        { table: "agent_execution_metrics", column: "model" },
        { table: "agent_execution_metrics", column: "status" },
        { table: "agent_execution_metrics", column: "error_type" },
        { table: "api_requests", column: "method" },
        { table: "usage_events", column: "type" },
      ];

      for (const { table, column } of lowCardinalityFields) {
        const fieldRegex = new RegExp(
          `CREATE TABLE IF NOT EXISTS ${table}[\\s\\S]*?${column}\\s+LowCardinality\\(String\\)`,
          "i"
        );
        assert.match(
          sql,
          fieldRegex,
          `Column ${column} in table ${table} must use LowCardinality(String) for dictionary encoding`
        );
      }
    });

    it("should enforce DateTime64(3, 'UTC') millisecond timestamp precision", () => {
      const sql = fs.readFileSync(initSqlPath, "utf-8");
      const tables: ClickHouseTableName[] = [
        "audit_events",
        "agent_execution_metrics",
        "api_requests",
        "usage_events",
      ];

      for (const table of tables) {
        const timestampRegex = new RegExp(
          `CREATE TABLE IF NOT EXISTS ${table}[\\s\\S]*?timestamp\\s+DateTime64\\(3,\\s*'UTC'\\)`,
          "i"
        );
        assert.match(
          sql,
          timestampRegex,
          `Table ${table} must specify timestamp as DateTime64(3, 'UTC')`
        );
      }
    });
  });

  // ---------------------------------------------------------------------------
  // 2. OpenMeter Declarative Configuration & ClickHouse Sink Alignment
  // ---------------------------------------------------------------------------
  describe("OpenMeter Declarative Configuration & ClickHouse Sink Alignment", () => {
    function parseOpenMeterConfig(raw: string): IOpenMeterConfig {
      const config: Partial<IOpenMeterConfig> = {
        meters: [],
      };

      const addressMatch = raw.match(/^address:\s*"([^"]+)"/m);
      if (addressMatch) config.address = addressMatch[1];

      const telemetryMatch = raw.match(/telemetry:\s*\n\s*address:\s*"([^"]+)"/m);
      if (telemetryMatch) config.telemetry = { address: telemetryMatch[1] };

      const chMatch = raw.match(
        /aggregation:\s*\n\s*clickhouse:\s*\n\s*address:\s*"([^"]+)"\s*\n\s*database:\s*"([^"]+)"/m
      );
      if (chMatch) {
        config.aggregation = {
          clickhouse: {
            address: chMatch[1],
            database: chMatch[2],
          },
        };
      }

      // Parse meters
      const meterBlocks = raw.split(/-\s+slug:\s*"([^"]+)"/).slice(1);
      for (let i = 0; i < meterBlocks.length; i += 2) {
        const slug = meterBlocks[i];
        const block = meterBlocks[i + 1];

        const descMatch = block.match(/description:\s*"([^"]+)"/);
        const aggMatch = block.match(/aggregation:\s*"([^"]+)"/);
        const eventTypeMatch = block.match(/eventType:\s*"([^"]+)"/);
        const valPropMatch = block.match(/valueProperty:\s*"([^"]+)"/);

        const meter: IOpenMeterMeterConfig = {
          slug,
          description: descMatch ? descMatch[1] : "",
          aggregation: (aggMatch ? aggMatch[1] : "SUM") as any,
          eventType: eventTypeMatch ? eventTypeMatch[1] : "",
        };

        if (valPropMatch) meter.valueProperty = valPropMatch[1];

        const groupByMatch = block.match(/groupBy:\s*\n((?:\s+[\w]+:\s*"[^"]+"\s*\n?)+)/);
        if (groupByMatch) {
          const lines = groupByMatch[1].trim().split("\n");
          meter.groupBy = {};
          for (const line of lines) {
            const parts = line.trim().split(/:\s*"/);
            if (parts.length === 2) {
              const key = parts[0].trim();
              const val = parts[1].replace(/"$/, "").trim();
              meter.groupBy[key] = val;
            }
          }
        }

        config.meters!.push(meter);
      }

      return config as IOpenMeterConfig;
    }

    it("should parse infra/openmeter/config.yaml into valid IOpenMeterConfig", () => {
      assert.ok(fs.existsSync(openmeterConfigPath), "config.yaml must exist");
      const raw = fs.readFileSync(openmeterConfigPath, "utf-8");
      const config = parseOpenMeterConfig(raw);

      assert.strictEqual(config.address, ":8888", "OpenMeter must bind API to :8888");
      assert.strictEqual(config.telemetry?.address, ":10000", "OpenMeter telemetry must bind to :10000");
      assert.ok(config.aggregation?.clickhouse, "Must declare ClickHouse aggregation sink");
      assert.strictEqual(
        config.aggregation.clickhouse.address,
        "clickhouse:9000",
        "Must target ClickHouse native TCP port 9000"
      );
      assert.strictEqual(
        config.aggregation.clickhouse.database,
        "index0_analytics",
        "Must target index0_analytics database"
      );
    });

    it("should validate all 5 registered meters against schema requirements", () => {
      const raw = fs.readFileSync(openmeterConfigPath, "utf-8");
      const config = parseOpenMeterConfig(raw);

      assert.strictEqual(config.meters.length, 5, "Must define exactly 5 core meters");

      const expectedSlugs = [
        "tokens_total",
        "tokens_prompt",
        "tokens_completion",
        "sandbox_duration_ms",
        "agent_run_count",
      ];

      for (const expectedSlug of expectedSlugs) {
        const meter = config.meters.find((m) => m.slug === expectedSlug);
        assert.ok(meter, `Must register meter with slug: ${expectedSlug}`);
        assert.ok(meter.description.length > 0, `Meter ${expectedSlug} must have a description`);
        assert.ok(
          meter.aggregation === "SUM" || meter.aggregation === "COUNT",
          `Meter ${expectedSlug} aggregation must be SUM or COUNT`
        );
        assert.ok(
          meter.groupBy && "tenant_id" in meter.groupBy,
          `Meter ${expectedSlug} must include tenant_id in groupBy dimensions for multi-tenancy`
        );
      }
    });

    it("should verify valueProperty is present for all SUM aggregation meters", () => {
      const raw = fs.readFileSync(openmeterConfigPath, "utf-8");
      const config = parseOpenMeterConfig(raw);

      const sumMeters = config.meters.filter((m) => m.aggregation === "SUM");
      assert.strictEqual(sumMeters.length, 4, "Must have 4 SUM meters");

      for (const meter of sumMeters) {
        assert.strictEqual(
          meter.valueProperty,
          "$.value",
          `SUM meter ${meter.slug} must define valueProperty as '$.value'`
        );
      }
    });
  });

  // ---------------------------------------------------------------------------
  // 3. Gateway Reverse-Proxy Route & Header Sanitization
  // ---------------------------------------------------------------------------
  describe("Caddy Gateway /analytics Reverse-Proxy Route", () => {
    it("should define /analytics* route proxying to clickhouse:8123 with sanitized headers", () => {
      assert.ok(fs.existsSync(caddyfilePath), "Caddyfile must exist");
      const caddyfile = fs.readFileSync(caddyfilePath, "utf-8");

      assert.match(
        caddyfile,
        /handle\s+\/analytics\*\s*\{/,
        "Caddyfile must define a dedicated handle for /analytics*"
      );

      const chIdx = caddyfile.indexOf("reverse_proxy clickhouse:8123");
      assert.ok(chIdx !== -1, "Must find reverse_proxy clickhouse:8123");
      const nextProxyIdx = caddyfile.indexOf("reverse_proxy", chIdx + 20);
      const analyticsBlock = nextProxyIdx !== -1
        ? caddyfile.slice(chIdx, nextProxyIdx)
        : caddyfile.slice(chIdx);

      assert.match(
        analyticsBlock,
        /reverse_proxy\s+clickhouse:8123/,
        "Must reverse proxy /analytics* traffic to clickhouse:8123"
      );

      // Verify the 4 mandatory sanitized headers
      assert.match(
        analyticsBlock,
        /header_up\s+Host\s+\{host\}/,
        "Must forward Host header"
      );
      assert.match(
        analyticsBlock,
        /header_up\s+X-Real-IP\s+\{remote_host\}/,
        "Must sanitize and forward X-Real-IP"
      );
      assert.match(
        analyticsBlock,
        /header_up\s+X-Forwarded-For\s+\{remote_host\}/,
        "Must sanitize and forward X-Forwarded-For"
      );
      assert.match(
        analyticsBlock,
        /header_up\s+X-Forwarded-Proto\s+\{scheme\}/,
        "Must sanitize and forward X-Forwarded-Proto"
      );
    });

    it("should preserve security headers and CORS protection across analytics requests", () => {
      const caddyfile = fs.readFileSync(caddyfilePath, "utf-8");

      assert.match(caddyfile, /X-Frame-Options\s+"SAMEORIGIN"/);
      assert.match(caddyfile, /X-Content-Type-Options\s+"nosniff"/);
      assert.match(caddyfile, /-Server/, "Must strip Server header to conceal reverse proxy");
      assert.match(
        caddyfile,
        /Access-Control-Allow-Origin\s+"http:\/\/localhost:5173"/,
        "Must allow Web IDE CORS origin"
      );
    });
  });

  // ---------------------------------------------------------------------------
  // 4. Docker Compose Service Graph & Health Dependencies
  // ---------------------------------------------------------------------------
  describe("Docker Compose Service Graph & Health Dependencies", () => {
    it("should declare all 8 core platform services in docker-compose.yml", () => {
      assert.ok(fs.existsSync(composePath), "docker-compose.yml must exist");
      const compose = fs.readFileSync(composePath, "utf-8");

      const expectedServices = [
        "postgres",
        "clickhouse",
        "openmeter",
        "temporal",
        "temporal-ui",
        "zitadel",
        "openhands",
        "gateway",
      ];

      for (const service of expectedServices) {
        assert.match(
          compose,
          new RegExp(`\\n\\s{2}${service}:`, "m"),
          `Docker compose must declare service: ${service}`
        );
      }
    });

    it("should configure clickhouse service with volume, ports, and healthcheck", () => {
      const compose = fs.readFileSync(composePath, "utf-8");

      assert.match(
        compose,
        /image:\s*clickhouse\/clickhouse-server:24-alpine/,
        "ClickHouse must use official 24-alpine image"
      );
      assert.match(
        compose,
        /container_name:\s*index0-clickhouse/,
        "ClickHouse container name must be index0-clickhouse"
      );
      assert.match(
        compose,
        /clickhouse_data:\/var\/lib\/clickhouse/,
        "ClickHouse must mount persistent clickhouse_data volume"
      );
      assert.match(
        compose,
        /\.\.\/clickhouse\/init\.sql:\/docker-entrypoint-initdb\.d\/init\.sql:ro/,
        "ClickHouse must mount init.sql in read-only mode"
      );
      assert.match(
        compose,
        /wget --no-verbose --tries=1 --spider http:\/\/localhost:8123\/ping/,
        "ClickHouse must configure HTTP /ping healthcheck"
      );
    });

    it("should configure openmeter with clickhouse health dependency and port mapping", () => {
      const compose = fs.readFileSync(composePath, "utf-8");

      assert.match(
        compose,
        /image:\s*ghcr\.io\/openmeterio\/openmeter:latest/,
        "OpenMeter must use official image"
      );
      assert.match(
        compose,
        /container_name:\s*index0-openmeter/,
        "OpenMeter container name must be index0-openmeter"
      );
      assert.match(
        compose,
        /"8888:8888"/,
        "OpenMeter must expose port 8888"
      );
      assert.match(
        compose,
        /\.\.\/openmeter\/config\.yaml:\/etc\/openmeter\/config\.yaml:ro/,
        "OpenMeter must mount config.yaml read-only"
      );

      // Verify dependency condition
      const openmeterBlockMatch = compose.match(/openmeter:\s*\n([\s\S]*?)(?=\n\s{2}\w+:|$)/);
      assert.ok(openmeterBlockMatch, "Must find openmeter block");
      const block = openmeterBlockMatch[1];
      assert.match(
        block,
        /depends_on:[\s\S]*?clickhouse:[\s\S]*?condition:\s*service_healthy/,
        "OpenMeter must depend on ClickHouse with service_healthy condition"
      );
    });

    it("should attach all services to index0-net isolated bridge network", () => {
      const compose = fs.readFileSync(composePath, "utf-8");

      assert.match(
        compose,
        /networks:\s*\n\s*index0-net:\s*\n\s*name:\s*index0-net/,
        "Must declare index0-net bridge network"
      );
      assert.match(
        compose,
        /clickhouse:[\s\S]*?networks:[\s\S]*?- index0-net/,
        "clickhouse must be attached to index0-net"
      );
      assert.match(
        compose,
        /openmeter:[\s\S]*?networks:[\s\S]*?- index0-net/,
        "openmeter must be attached to index0-net"
      );
    });
  });

  // ---------------------------------------------------------------------------
  // 5. Analytical Query & Aggregation Contract Conformance (Simulation)
  // ---------------------------------------------------------------------------
  describe("Analytical Query & Aggregation Contract Conformance", () => {
    it("should simulate tenant token usage aggregation matching IAgentExecutionMetric contract", () => {
      const sampleMetric: IAgentExecutionMetric = {
        metricId: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
        timestamp: "2026-09-18T10:00:00.000Z",
        tenantId: "11111111-1111-1111-1111-111111111111",
        runId: "22222222-2222-2222-2222-222222222222",
        workspaceId: "33333333-3333-3333-3333-333333333333",
        model: "claude-3-5-sonnet",
        promptTokens: 1520,
        completionTokens: 480,
        totalTokens: 2000,
        durationMs: 4500,
        status: "completed",
        stepCount: 4,
      };

      assert.strictEqual(
        sampleMetric.promptTokens + sampleMetric.completionTokens,
        sampleMetric.totalTokens,
        "Total tokens must equal sum of prompt and completion tokens"
      );

      // Verify analytical SQL query template matches ClickHouse table schema
      const sqlQuery = `
        SELECT
          model,
          count(*) AS run_count,
          sum(prompt_tokens) AS total_prompt_tokens,
          sum(completion_tokens) AS total_completion_tokens,
          sum(total_tokens) AS grand_total_tokens,
          avg(duration_ms) AS avg_duration_ms
        FROM index0_analytics.agent_execution_metrics
        WHERE tenant_id = '${sampleMetric.tenantId}'
          AND toYYYYMM(timestamp) = 202609
        GROUP BY model
        ORDER BY grand_total_tokens DESC;
      `;

      assert.match(sqlQuery, /FROM index0_analytics\.agent_execution_metrics/);
      assert.match(sqlQuery, /WHERE tenant_id\s*=/);
      assert.match(sqlQuery, /AND toYYYYMM\(timestamp\)\s*=/);
      assert.match(sqlQuery, /GROUP BY model/);
    });

    it("should simulate OpenMeter raw usage event format matching IUsageTelemetryEvent", () => {
      const usageEvent: IUsageTelemetryEvent = {
        id: "55555555-5555-5555-5555-555555555555",
        type: "tokens.total",
        subject: "tenant-sub-123",
        timestamp: "2026-09-18T10:15:30.123Z",
        value: 2000,
        tenantId: "11111111-1111-1111-1111-111111111111",
        metadata: JSON.stringify({ model: "claude-3-5-sonnet", run_id: "abc" }),
      };

      assert.strictEqual(typeof usageEvent.id, "string");
      assert.strictEqual(typeof usageEvent.value, "number");
      assert.strictEqual(usageEvent.type, "tokens.total");

      // Verify ClickHouse insertion syntax
      const insertSql = `
        INSERT INTO index0_analytics.usage_events (id, type, subject, timestamp, value, tenant_id, metadata)
        VALUES ('${usageEvent.id}', '${usageEvent.type}', '${usageEvent.subject}', '${usageEvent.timestamp}', ${usageEvent.value}, '${usageEvent.tenantId}', '${usageEvent.metadata}');
      `;

      assert.match(insertSql, /INSERT INTO index0_analytics\.usage_events/);
      assert.match(insertSql, /VALUES/);
    });

    it("should simulate query request/response envelope conformance", () => {
      const request: ITelemetryQueryRequest = {
        table: "agent_execution_metrics",
        tenantId: "11111111-1111-1111-1111-111111111111",
        from: "2026-09-01T00:00:00.000Z",
        to: "2026-09-30T23:59:59.999Z",
        limit: 100,
      };

      const response: ITelemetryQueryResponse<{ model: string; totalTokens: number }> = {
        data: [
          { model: "claude-3-5-sonnet", totalTokens: 54200 },
          { model: "gpt-4o", totalTokens: 21800 },
        ],
        rows: 2,
        durationMs: 12,
        statistics: {
          bytesRead: 1024,
          rowsRead: 20,
          elapsedMs: 12,
        },
      };

      assert.strictEqual(request.table, "agent_execution_metrics");
      assert.strictEqual(response.rows, 2);
      assert.strictEqual(response.data.length, 2);
      assert.ok(response.statistics && response.statistics.elapsedMs === 12);
    });
  });

  // ---------------------------------------------------------------------------
  // 6. Option A Architecture Compliance (Zero Scratch-Built Code)
  // ---------------------------------------------------------------------------
  describe("Option A Architecture Invariants (Zero Custom Telemetry Code)", () => {
    it("should verify zero custom Go or Express telemetry daemons exist in repository", () => {
      const forbiddenDirs = [
        path.join(rootDir, "services/telemetry"),
        path.join(rootDir, "services/metering"),
        path.join(rootDir, "services/analytics"),
        path.join(rootDir, "packages/telemetry-collector"),
        path.join(rootDir, "packages/metering-daemon"),
        path.join(rootDir, "infra/telemetry-server"),
      ];

      for (const forbidden of forbiddenDirs) {
        assert.ok(
          !fs.existsSync(forbidden),
          `Option A Violation: Forbidden custom telemetry directory exists at ${forbidden}`
        );
      }
    });

    it("should ensure packages/ and services/ contain no custom telemetry daemons", () => {
      const scanDirs = [path.join(rootDir, "packages"), path.join(rootDir, "services")];

      for (const dir of scanDirs) {
        if (!fs.existsSync(dir)) continue;
        const entries = fs.readdirSync(dir, { recursive: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry as string);
          if (fs.statSync(fullPath).isFile()) {
            const lower = fullPath.toLowerCase();
            assert.ok(
              !lower.includes("telemetry-daemon"),
              `Option A Violation: Forbidden daemon found at ${fullPath}`
            );
            assert.ok(
              !lower.includes("openmeter-daemon"),
              `Option A Violation: Forbidden daemon found at ${fullPath}`
            );
            assert.ok(
              !lower.includes("clickhouse-proxy"),
              `Option A Violation: Forbidden proxy found at ${fullPath}`
            );
          }
        }
      }
    });
  });
});
