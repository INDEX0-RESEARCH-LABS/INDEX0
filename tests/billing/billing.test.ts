import { describe, it } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

describe("Sovereign Billing & 4-Pillars Platform Lifecycle Conformance", () => {
  const currentDir = path.dirname(fileURLToPath(import.meta.url));
  const rootDir = path.resolve(currentDir, "../..");
  const plansPath = path.join(rootDir, "infra/lago/plans.json");
  const openmeterPath = path.join(rootDir, "infra/openmeter/config.yaml");
  const composePath = path.join(rootDir, "infra/compose/docker-compose.yml");
  const contractsBillingPath = path.join(
    rootDir,
    "packages/contracts/src/v1/billing/index.ts"
  );
  const contractsV1IndexPath = path.join(
    rootDir,
    "packages/contracts/src/v1/index.ts"
  );

  describe("Lago Plan Catalog Conformance (plans.json)", () => {
    it("should exist and parse as valid JSON manifest", () => {
      assert.ok(fs.existsSync(plansPath), "plans.json must exist at infra/lago/plans.json");
      const raw = fs.readFileSync(plansPath, "utf-8");
      const manifest = JSON.parse(raw);
      assert.strictEqual(manifest.version, "1.0");
      assert.ok(Array.isArray(manifest.billableMetrics), "Must have billableMetrics array");
      assert.ok(Array.isArray(manifest.plans), "Must have plans array");
    });

    it("should define the authoritative 3 subscription tiers (free, pro, enterprise)", () => {
      const manifest = JSON.parse(fs.readFileSync(plansPath, "utf-8"));
      const planCodes = manifest.plans.map((p: { code: string }) => p.code);

      assert.ok(planCodes.includes("plan_free"), "Must declare plan_free");
      assert.ok(planCodes.includes("plan_pro"), "Must declare plan_pro");
      assert.ok(planCodes.includes("plan_enterprise"), "Must declare plan_enterprise");
    });

    it("should enforce exact tier pricing models and monthly intervals", () => {
      const manifest = JSON.parse(fs.readFileSync(plansPath, "utf-8"));
      const plansMap = new Map(manifest.plans.map((p: any) => [p.code, p]));

      const freePlan = plansMap.get("plan_free");
      assert.strictEqual(freePlan.amountCents, 0, "Free plan must cost 0 cents");
      assert.strictEqual(freePlan.amountCurrency, "USD");
      assert.strictEqual(freePlan.interval, "monthly");
      assert.strictEqual(freePlan.quotas.overageAllowed, false);

      const proPlan = plansMap.get("plan_pro");
      assert.strictEqual(proPlan.amountCents, 2900, "Pro plan must cost $29.00 (2900 cents)");
      assert.strictEqual(proPlan.amountCurrency, "USD");
      assert.strictEqual(proPlan.interval, "monthly");
      assert.strictEqual(proPlan.quotas.overageAllowed, true);

      const enterprisePlan = plansMap.get("plan_enterprise");
      assert.strictEqual(enterprisePlan.amountCents, 49900, "Enterprise plan must cost $499.00 (49900 cents)");
      assert.strictEqual(enterprisePlan.amountCurrency, "USD");
      assert.strictEqual(enterprisePlan.interval, "monthly");
      assert.strictEqual(enterprisePlan.quotas.overageAllowed, true);
    });
  });

  describe("OpenMeter-to-Lago Metric Alignment", () => {
    it("should register all 5 core billable metrics with correct aggregation models", () => {
      const manifest = JSON.parse(fs.readFileSync(plansPath, "utf-8"));
      const metricCodes = manifest.billableMetrics.map((m: { code: string }) => m.code);

      const expectedMetrics = [
        { code: "tokens_total", agg: "sum_agg" },
        { code: "tokens_prompt", agg: "sum_agg" },
        { code: "tokens_completion", agg: "sum_agg" },
        { code: "sandbox_duration_ms", agg: "sum_agg" },
        { code: "agent_run_count", agg: "count_agg" },
      ];

      for (const expected of expectedMetrics) {
        assert.ok(metricCodes.includes(expected.code), `Must register metric ${expected.code}`);
        const found = manifest.billableMetrics.find((m: any) => m.code === expected.code);
        assert.strictEqual(
          found.aggregationType,
          expected.agg,
          `Metric ${expected.code} must use aggregation ${expected.agg}`
        );
      }
    });

    it("should align 1:1 with OpenMeter meters defined in config.yaml", () => {
      const openmeterContent = fs.readFileSync(openmeterPath, "utf-8");
      const lagoManifest = JSON.parse(fs.readFileSync(plansPath, "utf-8"));

      for (const metric of lagoManifest.billableMetrics) {
        assert.ok(
          openmeterContent.includes(`slug: "${metric.code}"`),
          `OpenMeter config must include meter slug for Lago metric ${metric.code}`
        );
      }
    });
  });

  describe("4-Pillars Platform Lifecycle & Compose Conformance", () => {
    it("should declare all 4 platform pillars across services in compose stack", () => {
      assert.ok(fs.existsSync(composePath), "docker-compose.yml must exist");
      const content = fs.readFileSync(composePath, "utf-8");
      const codeServerPath = path.join(rootDir, "infra/compose/code-server.yml");
      const codeServerContent = fs.readFileSync(codeServerPath, "utf-8");

      // BUILD Pillar
      assert.match(codeServerContent, /code-server:/, "BUILD pillar: code-server must be defined");
      assert.match(codeServerContent, /"8443:8443"/, "code-server must publish port 8443");

      // SHIP Pillar
      assert.match(content, /temporal:/, "SHIP pillar: temporal must be defined");
      assert.match(content, /temporal-ui:/, "SHIP pillar: temporal-ui must be defined");
      assert.match(content, /clickhouse:/, "SHIP pillar: clickhouse must be defined");

      // SELL Pillar
      assert.match(content, /openmeter:/, "SELL pillar: openmeter must be defined");
      assert.match(content, /lago:/, "SELL pillar: lago must be defined");

      // GATEWAY & IDENTITY
      assert.match(content, /gateway:/, "Gateway must be defined");
      assert.match(content, /zitadel:/, "Zitadel must be defined");
      assert.match(content, /postgres:/, "PostgreSQL must be defined");
    });

    it("should configure lago container with official image, port 3001:3000, and plans mount", () => {
      const content = fs.readFileSync(composePath, "utf-8");
      assert.match(content, /image:\s*getlago\/api:v1\.12\.0/, "Must use official getlago/api image");
      assert.match(content, /"3001:3000"/, "Must publish port 3001:3000 to prevent port 3000 collision with OpenHands");
      assert.match(
        content,
        /\.\.\/lago\/plans\.json:\/etc\/lago\/plans\.json:ro/,
        "Must mount plans.json read-only"
      );
      assert.match(content, /lago:[\s\S]*?depends_on:[\s\S]*?postgres:/, "lago must depend on postgres");
      assert.match(content, /lago:[\s\S]*?networks:[\s\S]*?- index0-net/, "lago must connect to index0-net");
    });
  });

  describe("Option A Architecture Invariants (Zero Scratch-Built Code)", () => {
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
          }
        }
      };

      checkDir(packagesDir);
      checkDir(servicesDir);
    });
  });

  describe("@index0/contracts/v1/billing Contract Conformance", () => {
    it("should re-export billing from v1 barrel export", () => {
      assert.ok(fs.existsSync(contractsV1IndexPath), "v1/index.ts must exist");
      const content = fs.readFileSync(contractsV1IndexPath, "utf-8");
      assert.match(
        content,
        /export \* from "\.\/billing\/index\.js";/,
        "Must re-export billing from v1 index"
      );
    });

    it("should export all authoritative Lago and 4-pillar types", () => {
      assert.ok(fs.existsSync(contractsBillingPath), "billing/index.ts must exist");
      const content = fs.readFileSync(contractsBillingPath, "utf-8");
      const expectedTypes = [
        "SubscriptionTier",
        "SubscriptionStatus",
        "InvoiceStatus",
        "ICustomer",
        "ISubscription",
        "IInvoice",
        "MeteredDimension",
        "IOpenMeterEvent",
        "IUsageEvent",
        "LagoAggregationType",
        "ILagoBillableMetric",
        "LagoChargeModel",
        "ILagoPlanCharge",
        "LagoPlanInterval",
        "ILagoPlan",
        "ILagoSubscriptionPayload",
        "LagoWebhookType",
        "ILagoWebhookEvent",
        "PlatformPillarName",
        "IPlatformPillarService",
        "IPlatformPillarsManifest",
      ];

      for (const typeName of expectedTypes) {
        assert.ok(
          content.includes(typeName),
          `billing/index.ts must export ${typeName}`
        );
      }
    });
  });
});
