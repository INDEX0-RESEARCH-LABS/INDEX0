import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  type ILagoBillableMetric,
  type ILagoPlan,
  type ILagoSubscriptionPayload,
  type ILagoWebhookEvent,
  type IPlatformPillarsManifest,
} from "@index0/contracts";

describe("Dev 2 Platform: Billing Platform Smoke & Lago / 4-Pillars Verification", () => {
  const currentDir = path.dirname(fileURLToPath(import.meta.url));
  const rootDir = path.resolve(currentDir, "../..");
  const plansPath = path.join(rootDir, "infra/lago/plans.json");
  const openmeterPath = path.join(rootDir, "infra/openmeter/config.yaml");
  const composePath = path.join(rootDir, "infra/compose/docker-compose.yml");
  const caddyfilePath = path.join(rootDir, "infra/gateway/Caddyfile");

  // ---------------------------------------------------------------------------
  // 1. Docker Compose 9-Service Graph & Health Dependencies
  // ---------------------------------------------------------------------------
  describe("Docker Compose 9-Service Architecture & Health Dependencies", () => {
    it("should declare all 9 core services across the 4 pillars in docker-compose.yml", () => {
      assert.ok(fs.existsSync(composePath), "docker-compose.yml must exist");
      const composeContent = fs.readFileSync(composePath, "utf-8");

      const expectedServices = [
        "postgres",
        "clickhouse",
        "openmeter",
        "lago",
        "temporal",
        "temporal-ui",
        "zitadel",
        "gateway",
        "openhands",
      ];

      for (const service of expectedServices) {
        const servicePattern = new RegExp(`^\\s*${service}:`, "m");
        assert.match(
          composeContent,
          servicePattern,
          `Service ${service} must be declared in docker-compose.yml`
        );
      }
    });

    it("should configure lago service with healthy postgres dependency and isolated network", () => {
      const composeContent = fs.readFileSync(composePath, "utf-8");

      assert.match(
        composeContent,
        /lago:[\s\S]*?depends_on:[\s\S]*?postgres:[\s\S]*?condition:\s*service_healthy/,
        "lago must depend on postgres with condition service_healthy"
      );

      assert.match(
        composeContent,
        /lago:[\s\S]*?networks:[\s\S]*?- index0-net/,
        "lago must be attached to index0-net"
      );
    });

    it("should map lago container port to 3001:3000 to prevent collision with openhands", () => {
      const composeContent = fs.readFileSync(composePath, "utf-8");

      assert.match(
        composeContent,
        /openhands:[\s\S]*?ports:[\s\S]*?"3000:3000"/,
        "openhands must publish port 3000"
      );

      assert.match(
        composeContent,
        /lago:[\s\S]*?ports:[\s\S]*?"3001:3000"/,
        "lago must publish port 3001:3000 avoiding collision with openhands"
      );
    });

    it("should configure postgresql connection string for lago pointing to postgres:5432/index0_dev", () => {
      const composeContent = fs.readFileSync(composePath, "utf-8");

      assert.match(
        composeContent,
        /LAGO_DATABASE_URL:.*postgresql:\/\/.*postgres:5432\/.*index0_dev/,
        "lago LAGO_DATABASE_URL must target postgres container on index0-net"
      );
    });

    it("should configure lago healthcheck with HTTP probe on /health", () => {
      const composeContent = fs.readFileSync(composePath, "utf-8");

      assert.match(
        composeContent,
        /lago:[\s\S]*?healthcheck:[\s\S]*?http:\/\/localhost:3000\/health/,
        "lago must declare healthcheck probing /health"
      );
    });

    it("should mount plans.json read-only into lago container", () => {
      const composeContent = fs.readFileSync(composePath, "utf-8");

      assert.match(
        composeContent,
        /\.\.\/lago\/plans\.json:\/etc\/lago\/plans\.json:ro/,
        "Must mount plans.json read-only into /etc/lago/plans.json"
      );
    });
  });

  // ---------------------------------------------------------------------------
  // 2. Lago Declarative Plans & Metric Synchronization
  // ---------------------------------------------------------------------------
  describe("Lago Declarative Manifest & Metric Synchronization", () => {
    it("should validate plans.json structure and metric mappings", () => {
      assert.ok(fs.existsSync(plansPath), "plans.json must exist");
      const plans = JSON.parse(fs.readFileSync(plansPath, "utf-8"));

      assert.equal(plans.version, "1.0");
      assert.equal(plans.billableMetrics.length, 5);
      assert.equal(plans.plans.length, 3);

      const metricCodes = plans.billableMetrics.map((m: ILagoBillableMetric) => m.code);
      assert.deepEqual(metricCodes.sort(), [
        "agent_run_count",
        "sandbox_duration_ms",
        "tokens_completion",
        "tokens_prompt",
        "tokens_total",
      ]);
    });

    it("should verify plan tiers match authoritative pricing and quotas", () => {
      const plans = JSON.parse(fs.readFileSync(plansPath, "utf-8"));
      const planMap = new Map<string, ILagoPlan>(plans.plans.map((p: ILagoPlan) => [p.code, p]));

      // Free Plan
      const free = planMap.get("plan_free");
      assert.ok(free);
      assert.equal(free.amountCents, 0);
      assert.equal(free.quotas.tokensPerMonth, 300000);
      assert.equal(free.quotas.concurrentSandboxes, 1);
      assert.equal(free.quotas.overageAllowed, false);

      // Pro Plan
      const pro = planMap.get("plan_pro");
      assert.ok(pro);
      assert.equal(pro.amountCents, 2900);
      assert.equal(pro.quotas.tokensPerMonth, 1000000);
      assert.equal(pro.quotas.concurrentSandboxes, 5);
      assert.equal(pro.quotas.overageAllowed, true);

      // Enterprise Plan
      const enterprise = planMap.get("plan_enterprise");
      assert.ok(enterprise);
      assert.equal(enterprise.amountCents, 49900);
      assert.equal(enterprise.quotas.tokensPerMonth, 50000000);
      assert.equal(enterprise.quotas.concurrentSandboxes, 50);
      assert.equal(enterprise.quotas.overageAllowed, true);
    });

    it("should verify 1:1 metric alignment between OpenMeter config and Lago metrics", () => {
      const openmeterRaw = fs.readFileSync(openmeterPath, "utf-8");
      const plans = JSON.parse(fs.readFileSync(plansPath, "utf-8"));

      for (const metric of plans.billableMetrics) {
        assert.ok(
          openmeterRaw.includes(`slug: "${metric.code}"`),
          `OpenMeter config must include meter slug for metric ${metric.code}`
        );
      }
    });
  });

  // ---------------------------------------------------------------------------
  // 3. Billing & Subscription Contract Conformance (Simulation)
  // ---------------------------------------------------------------------------
  describe("Billing & Subscription Contract Conformance", () => {
    it("should simulate Lago subscription payload conformance", () => {
      const payload: ILagoSubscriptionPayload = {
        subscription: {
          customerExternalId: "org_acme_labs",
          planCode: "plan_pro",
          name: "Acme Pro Subscription",
          externalId: "sub_acme_2026_09",
          billingTime: "calendar",
          subscriptionAt: new Date().toISOString(),
        },
      };

      assert.equal(payload.subscription.planCode, "plan_pro");
      assert.equal(payload.subscription.customerExternalId, "org_acme_labs");
      assert.equal(payload.subscription.billingTime, "calendar");
    });

    it("should simulate Lago webhook event dispatching for subscription lifecycle", () => {
      const webhookEvent: ILagoWebhookEvent = {
        webhookType: "subscription.created",
        objectType: "subscription",
        payload: {
          externalId: "sub_test_123",
          planCode: "plan_enterprise",
          status: "active",
        },
      };

      assert.equal(webhookEvent.webhookType, "subscription.created");
      assert.equal(webhookEvent.objectType, "subscription");
      assert.equal(webhookEvent.payload.status, "active");
    });

    it("should simulate 4-pillars platform manifest contract conformance", () => {
      const manifest: IPlatformPillarsManifest = {
        pillars: {
          build: [
            {
              name: "OpenHands Autonomous Agent Container",
              containerName: "index0-openhands",
              port: 3000,
              healthEndpoint: "http://localhost:3000/",
              protocol: "http",
            },
          ],
          ship: [
            {
              name: "Temporal Workflow Orchestration",
              containerName: "index0-temporal",
              port: 7233,
              protocol: "grpc",
            },
            {
              name: "Temporal Web UI",
              containerName: "index0-temporal-ui",
              port: 8233,
              healthEndpoint: "http://localhost:8233/",
              protocol: "http",
            },
            {
              name: "ClickHouse Columnar Analytics",
              containerName: "index0-clickhouse",
              port: 8123,
              healthEndpoint: "http://localhost:8123/ping",
              protocol: "http",
            },
          ],
          sell: [
            {
              name: "OpenMeter Usage Metering",
              containerName: "index0-openmeter",
              port: 8888,
              healthEndpoint: "http://localhost:8888/api/v1/health",
              protocol: "http",
            },
            {
              name: "Lago Sovereign Rating & Billing Engine",
              containerName: "index0-lago",
              port: 3001,
              healthEndpoint: "http://localhost:3000/health",
              protocol: "http",
            },
          ],
          grow: [
            {
              name: "Caddy Declarative API Gateway",
              containerName: "index0-gateway",
              port: 8000,
              healthEndpoint: "http://localhost:8000/",
              protocol: "http",
            },
            {
              name: "Zitadel Sovereign Identity & OIDC",
              containerName: "index0-zitadel",
              port: 8085,
              healthEndpoint: "http://localhost:8085/debug/healthz",
              protocol: "http",
            },
            {
              name: "PostgreSQL Primary System of Record",
              containerName: "index0-postgres",
              port: 5432,
              protocol: "tcp",
            },
          ],
        },
      };

      const totalServices =
        manifest.pillars.build.length +
        manifest.pillars.ship.length +
        manifest.pillars.sell.length +
        manifest.pillars.grow.length;

      assert.equal(totalServices, 9, "Total services across all 4 pillars must equal 9");
      assert.equal(manifest.pillars.build[0].containerName, "index0-openhands");
      assert.equal(manifest.pillars.sell[1].containerName, "index0-lago");
    });
  });

  // ---------------------------------------------------------------------------
  // 4. Option A Architecture Invariants (Zero Custom Billing Daemons)
  // ---------------------------------------------------------------------------
  describe("Option A Architecture Invariants (Zero Custom Billing Code)", () => {
    it("should verify zero custom Go or Express billing daemons exist in repository", () => {
      const packagesDir = path.join(rootDir, "packages");
      const servicesDir = path.join(rootDir, "services");

      const checkDir = (dir: string) => {
        if (!fs.existsSync(dir)) return;
        const files = fs.readdirSync(dir, { recursive: true });
        for (const file of files) {
          const filePath = path.join(dir, file as string);
          if (fs.statSync(filePath).isFile()) {
            assert.ok(
              !filePath.toLowerCase().includes("billing-daemon"),
              `Forbidden custom billing daemon found: ${filePath}`
            );
            assert.ok(
              !filePath.toLowerCase().includes("stripe-worker"),
              `Forbidden custom stripe worker found: ${filePath}`
            );
            assert.ok(
              !filePath.toLowerCase().includes("payment-service"),
              `Forbidden custom payment service found: ${filePath}`
            );
          }
        }
      };

      checkDir(packagesDir);
      checkDir(servicesDir);
    });

    it("should ensure packages/ and services/ contain no custom rating engines", () => {
      const packagesDir = path.join(rootDir, "packages");
      const servicesDir = path.join(rootDir, "services");

      const checkDir = (dir: string) => {
        if (!fs.existsSync(dir)) return;
        const files = fs.readdirSync(dir, { recursive: true });
        for (const file of files) {
          const filePath = path.join(dir, file as string);
          if (fs.statSync(filePath).isFile()) {
            assert.ok(
              !filePath.toLowerCase().includes("rating-engine"),
              `Forbidden custom rating engine found: ${filePath}`
            );
          }
        }
      };

      checkDir(packagesDir);
      checkDir(servicesDir);
    });
  });
});
