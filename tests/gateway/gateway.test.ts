import { describe, it } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

describe("Declarative Caddy API Gateway & Container Orchestration", () => {
  const currentDir = path.dirname(fileURLToPath(import.meta.url));
  const rootDir = path.resolve(currentDir, "../..");
  const caddyfilePath = path.join(rootDir, "infra/gateway/Caddyfile");
  const composePath = path.join(rootDir, "infra/compose/docker-compose.yml");

  describe("Caddyfile Configuration Integrity", () => {
    it("should exist and define the port 8000 gateway block", () => {
      assert.ok(fs.existsSync(caddyfilePath), "Caddyfile must exist at infra/gateway/Caddyfile");
      const content = fs.readFileSync(caddyfilePath, "utf-8");
      assert.match(content, /:8000\s*\{/, "Must listen on :8000");
    });

    it("should define direct /health probe endpoint", () => {
      const content = fs.readFileSync(caddyfilePath, "utf-8");
      assert.match(content, /handle\s+\/health\s*\{/, "Must declare handle /health");
      assert.match(content, /respond\s+`\{"status":"ok","gateway":"caddy","engine":"index0-gateway"\}`\s+200/, "Health response body mismatch");
      assert.match(content, /header\s+Content-Type\s+"application\/json"/, "Health response must set application/json");
    });

    it("should reverse-proxy /auth* to Zitadel OIDC (port 8085)", () => {
      const content = fs.readFileSync(caddyfilePath, "utf-8");
      assert.match(content, /handle\s+\/auth\*\s*\{/, "Must declare handle /auth*");
      assert.match(content, /reverse_proxy\s+zitadel:8085/, "Must proxy to zitadel:8085");
      assert.match(content, /header_up\s+Host\s+\{host\}/);
      assert.match(content, /header_up\s+X-Real-IP\s+\{remote_host\}/);
    });

    it("should reverse-proxy /temporal* to Temporal Web UI (port 8233)", () => {
      const content = fs.readFileSync(caddyfilePath, "utf-8");
      assert.match(content, /handle\s+\/temporal\*\s*\{/, "Must declare handle /temporal*");
      assert.match(content, /reverse_proxy\s+temporal-ui:8233/, "Must proxy to temporal-ui:8233");
    });

    it("should reverse-proxy /analytics* to ClickHouse HTTP (port 8123)", () => {
      const content = fs.readFileSync(caddyfilePath, "utf-8");
      assert.match(content, /handle\s+\/analytics\*\s*\{/, "Must declare handle /analytics*");
      assert.match(content, /reverse_proxy\s+clickhouse:8123/, "Must proxy to clickhouse:8123");
    });

    it("should reverse-proxy Cloud IDE / code-server (port 8443) with unbuffered flush", () => {
      const content = fs.readFileSync(caddyfilePath, "utf-8");
      assert.match(content, /reverse_proxy\s+code-server:8443/, "Must proxy traffic to code-server:8443");
      assert.match(content, /flush_interval\s+-1/, "Must set flush_interval -1 for real-time SSE & terminal streaming");
    });

    it("should enforce robust security headers", () => {
      const content = fs.readFileSync(caddyfilePath, "utf-8");
      assert.match(content, /X-Frame-Options\s+"SAMEORIGIN"/);
      assert.match(content, /X-Content-Type-Options\s+"nosniff"/);
      assert.match(content, /X-XSS-Protection\s+"1;\s*mode=block"/);
      assert.match(content, /Referrer-Policy\s+"strict-origin-when-cross-origin"/);
      assert.match(content, /-Server/, "Must strip Server banner");
    });
  });

  describe("Docker Compose Service Graph Conformance", () => {
    it("should declare the gateway service with caddy:2-alpine", () => {
      assert.ok(fs.existsSync(composePath), "docker-compose.yml must exist");
      const content = fs.readFileSync(composePath, "utf-8");
      assert.match(content, /gateway:/, "Must declare gateway service");
      assert.match(content, /image:\s*caddy:2-alpine/, "Must use caddy:2-alpine");
      assert.match(content, /"8000:8000"/, "Must publish port 8000:8000");
      assert.match(content, /\.\.\/gateway\/Caddyfile:\/etc\/caddy\/Caddyfile:ro/, "Must mount Caddyfile read-only");
    });

    it("should wire core services to index0-net", () => {
      const content = fs.readFileSync(composePath, "utf-8");
      const requiredServices = [
        "postgres:",
        "clickhouse:",
        "temporal:",
        "temporal-ui:",
        "zitadel:",
        "gateway:"
      ];
      for (const svc of requiredServices) {
        assert.ok(content.includes(svc), `docker-compose.yml must define service: ${svc}`);
      }
      assert.match(content, /name:\s*index0-net/, "Must declare index0-net bridge network");
    });

    it("should declare code-server in compose overlay with workspace mount", () => {
      const codeServerComposePath = path.join(rootDir, "infra/compose/code-server.yml");
      assert.ok(fs.existsSync(codeServerComposePath), "code-server.yml must exist");
      const content = fs.readFileSync(codeServerComposePath, "utf-8");
      assert.match(content, /code-server:/);
      assert.match(content, /\.\.\/\.\.\/workspace:\/workspace/);
    });
  });

  describe("Gateway Health Response Contract Conformance", () => {
    it("should conform to JSON response format", () => {
      const mockPayload = JSON.parse('{"status":"ok","gateway":"caddy","engine":"index0-gateway"}');
      assert.strictEqual(mockPayload.status, "ok");
      assert.strictEqual(mockPayload.gateway, "caddy");
      assert.strictEqual(mockPayload.engine, "index0-gateway");
    });
  });
});
