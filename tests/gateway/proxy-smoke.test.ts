import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  type UserRole,
  DEFAULT_ROLE_PERMISSIONS,
} from "@index0/contracts";

describe("Dev 2 Platform: Gateway Proxy Smoke & Zitadel Identity Verification", () => {
  const currentDir = path.dirname(fileURLToPath(import.meta.url));
  const rootDir = path.resolve(currentDir, "../..");
  const caddyfilePath = path.join(rootDir, "infra/gateway/Caddyfile");
  const composePath = path.join(rootDir, "infra/compose/docker-compose.yml");
  const zitadelConfigPath = path.join(rootDir, "infra/zitadel/init-config.yaml");

  describe("Reverse-Proxy Route & Forwarding Header Sanitization", () => {
    it("should ensure all 4 reverse-proxy upstreams sanitize client forwarding headers", () => {
      assert.ok(fs.existsSync(caddyfilePath), "Caddyfile must exist");
      const caddyfile = fs.readFileSync(caddyfilePath, "utf-8");

      const expectedUpstreams = [
        { name: "Zitadel Auth", target: "zitadel:8085", handlePattern: /handle\s+\/auth\*\s*\{/ },
        { name: "Temporal UI", target: "temporal-ui:8233", handlePattern: /handle\s+\/temporal\*\s*\{/ },
        { name: "ClickHouse Analytics", target: "clickhouse:8123", handlePattern: /handle\s+\/analytics\*\s*\{/ },
        { name: "OpenHands Workbench", target: "openhands:3000", handlePattern: /handle\s*\{/ },
      ];

      for (const upstream of expectedUpstreams) {
        assert.match(
          caddyfile,
          upstream.handlePattern,
          `Caddyfile must define route handle for ${upstream.name}`
        );

        assert.ok(
          caddyfile.includes(`reverse_proxy ${upstream.target}`),
          `Caddyfile must reverse proxy to ${upstream.target}`
        );
      }

      // Verify that every reverse proxy block contains the 4 essential sanitized headers
      const proxyBlocks = caddyfile.split("reverse_proxy").slice(1);
      assert.strictEqual(proxyBlocks.length, 4, "Must define exactly 4 reverse_proxy blocks");

      for (const block of proxyBlocks) {
        assert.match(block, /header_up\s+Host\s+\{host\}/, "Must pass Host header");
        assert.match(block, /header_up\s+X-Real-IP\s+\{remote_host\}/, "Must pass X-Real-IP");
        assert.match(block, /header_up\s+X-Forwarded-For\s+\{remote_host\}/, "Must pass X-Forwarded-For");
        assert.match(block, /header_up\s+X-Forwarded-Proto\s+\{scheme\}/, "Must pass X-Forwarded-Proto");
      }
    });

    it("should configure flush_interval -1 on OpenHands for unbuffered SSE & streaming", () => {
      const caddyfile = fs.readFileSync(caddyfilePath, "utf-8");
      const openhandsBlockMatch = caddyfile.match(/reverse_proxy\s+openhands:3000\s*\{([^}]+)\}/);
      assert.ok(openhandsBlockMatch, "Must find OpenHands reverse_proxy block");
      const openhandsBlock = openhandsBlockMatch[1];
      assert.match(
        openhandsBlock,
        /flush_interval\s+-1/,
        "OpenHands upstream must enforce flush_interval -1 to prevent buffering SSE/WebSocket streams"
      );
    });

    it("should define a zero-upstream /health endpoint returning 200 JSON", () => {
      const caddyfile = fs.readFileSync(caddyfilePath, "utf-8");
      assert.match(caddyfile, /handle\s+\/health\s*\{/);
      assert.match(caddyfile, /respond\s+`\{"status":"ok","gateway":"caddy","engine":"index0-gateway"\}`\s+200/);
      assert.match(caddyfile, /header\s+Content-Type\s+"application\/json"/);
    });
  });

  describe("Security, Server Masking, and CORS Directives", () => {
    it("should enforce standard browser security headers and strip server banner", () => {
      const caddyfile = fs.readFileSync(caddyfilePath, "utf-8");
      assert.match(caddyfile, /X-Frame-Options\s+"SAMEORIGIN"/);
      assert.match(caddyfile, /X-Content-Type-Options\s+"nosniff"/);
      assert.match(caddyfile, /X-XSS-Protection\s+"1;\s*mode=block"/);
      assert.match(caddyfile, /Referrer-Policy\s+"strict-origin-when-cross-origin"/);
      assert.match(caddyfile, /-Server/, "Must suppress Server header to conceal reverse proxy signature");
    });

    it("should configure CORS headers for Web IDE development", () => {
      const caddyfile = fs.readFileSync(caddyfilePath, "utf-8");
      assert.match(caddyfile, /Access-Control-Allow-Origin\s+"http:\/\/localhost:5173"/);
      assert.match(caddyfile, /Access-Control-Allow-Methods\s+"GET,\s*POST,\s*PUT,\s*PATCH,\s*DELETE,\s*OPTIONS"/);
      assert.match(caddyfile, /Access-Control-Allow-Headers\s+"Authorization,\s*Content-Type,\s*X-Request-ID"/);
    });
  });

  describe("Zitadel Identity Provider & OIDC Configuration", () => {
    it("should have declarative init-config.yaml matching @index0/contracts/v1/auth", () => {
      assert.ok(fs.existsSync(zitadelConfigPath), "infra/zitadel/init-config.yaml must exist");
      const config = fs.readFileSync(zitadelConfigPath, "utf-8");

      // Verify instance parameters
      assert.match(config, /name:\s*"INDEX0 AI Sovereign Platform"/);
      assert.match(config, /externalDomain:\s*"localhost"/);
      assert.match(config, /externalPort:\s*8000/);
      assert.match(config, /externalSecure:\s*false/);

      // Verify default organization
      assert.match(config, /name:\s*"Acme Software Labs"/);
      assert.match(config, /orgId:\s*"11111111-1111-4111-8111-111111111111"/);

      // Verify client application configuration
      assert.match(config, /clientId:\s*"index0-ide"/);
      assert.match(config, /authMethodType:\s*"PKCE"/);
      assert.match(config, /appType:\s*"WEB"/);

      // Verify grant & response types
      assert.match(config, /- "CODE"/);
      assert.match(config, /- "AUTHORIZATION_CODE"/);
      assert.match(config, /- "REFRESH_TOKEN"/);

      // Verify redirect URIs
      assert.match(config, /- "http:\/\/localhost:5173\/auth\/callback"/);
      assert.match(config, /- "http:\/\/localhost:8000\/auth\/callback"/);
      assert.match(config, /- "http:\/\/localhost:3000\/callback"/);

      // Verify OIDC scopes
      assert.match(config, /- "openid"/);
      assert.match(config, /- "profile"/);
      assert.match(config, /- "email"/);
      assert.match(config, /- "urn:zitadel:iam:org:project:roles"/);
    });

    it("should define RBAC roles that match authoritative UserRole contracts", () => {
      const config = fs.readFileSync(zitadelConfigPath, "utf-8");
      const expectedRoles: UserRole[] = ["admin", "member", "viewer", "agent"];

      for (const role of expectedRoles) {
        assert.match(
          config,
          new RegExp(`-\\s+key:\\s+"${role}"`),
          `Zitadel init-config must declare role '${role}'`
        );
      }

      // Verify that contracts DEFAULT_ROLE_PERMISSIONS contains all these roles
      const contractRoles = Object.keys(DEFAULT_ROLE_PERMISSIONS) as UserRole[];
      for (const role of expectedRoles) {
        assert.ok(
          contractRoles.includes(role),
          `Contracts DEFAULT_ROLE_PERMISSIONS must include role '${role}'`
        );
      }
    });
  });

  describe("Docker Compose Graph & Parameter Alignment", () => {
    it("should mount zitadel init-config and configure external port 8000", () => {
      assert.ok(fs.existsSync(composePath), "docker-compose.yml must exist");
      const compose = fs.readFileSync(composePath, "utf-8");

      assert.match(
        compose,
        /\.\.\/zitadel\/init-config\.yaml:\/zitadel\/init-config\.yaml:ro/,
        "Zitadel must mount init-config.yaml read-only"
      );

      assert.match(
        compose,
        /command:\s*start-from-init\s+--config\s+\/zitadel\/init-config\.yaml/,
        "Zitadel command must pass --config /zitadel/init-config.yaml"
      );

      assert.match(
        compose,
        /ZITADEL_EXTERNALPORT:\s*\$\{ZITADEL_EXTERNALPORT:-8000\}/,
        "Zitadel EXTERNALPORT must default to 8000 for Gateway routing"
      );

      assert.match(
        compose,
        /ZITADEL_EXTERNALDOMAIN:\s*\$\{ZITADEL_EXTERNALDOMAIN:-localhost\}/,
        "Zitadel EXTERNALDOMAIN must default to localhost"
      );
    });

    it("should ensure gateway depends on zitadel and openhands", () => {
      const compose = fs.readFileSync(composePath, "utf-8");
      const gatewayBlockMatch = compose.match(/\n  gateway:([\s\S]+?)(?=\n[a-z0-9_-]+:|$)/);
      assert.ok(gatewayBlockMatch, "Must find gateway block in compose");
      const gatewayBlock = gatewayBlockMatch[1];

      assert.match(gatewayBlock, /depends_on:\s*\n\s*-\s*zitadel\s*\n\s*-\s*openhands/);
      assert.match(gatewayBlock, /"8000:8000"/, "Gateway must expose port 8000");
    });

    it("should connect all services to the isolated index0-net bridge", () => {
      const compose = fs.readFileSync(composePath, "utf-8");
      assert.match(compose, /networks:\s*\n\s*index0-net:\s*\n\s*name:\s*index0-net/);

      const services = ["postgres", "clickhouse", "temporal", "temporal-ui", "zitadel", "openhands", "gateway"];
      for (const service of services) {
        assert.match(
          compose,
          new RegExp(`${service}:[\\s\\S]+?networks:\\s*\\n\\s*-\\s*index0-net`),
          `Service '${service}' must connect to index0-net`
        );
      }
    });
  });

  describe("Option A Architecture Compliance (Zero Scratch-Built Code)", () => {
    it("should verify that no custom Go gateway source files exist in the repository", () => {
      const forbiddenPaths = [
        path.join(rootDir, "gateway/main.go"),
        path.join(rootDir, "cmd/gateway/main.go"),
        path.join(rootDir, "infra/gateway/main.go"),
        path.join(rootDir, "infra/gateway/gateway.go"),
      ];

      for (const forbidden of forbiddenPaths) {
        assert.ok(
          !fs.existsSync(forbidden),
          `Option A Violation: Forbidden custom Go gateway file exists at ${forbidden}`
        );
      }
    });
  });
});
