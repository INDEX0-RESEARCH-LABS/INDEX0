import { describe, it } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

describe("OpenHands Autonomous Agent Runtime & Workbench Conformance", () => {
  const currentDir = path.dirname(fileURLToPath(import.meta.url));
  const rootDir = path.resolve(currentDir, "../..");
  const composePath = path.join(rootDir, "infra/compose/docker-compose.yml");
  const caddyfilePath = path.join(rootDir, "infra/gateway/Caddyfile");
  const instructionsPath = path.join(rootDir, "workspace/.openhands_instructions");
  const profilesPath = path.join(rootDir, "infra/openhands/llm-profiles.json");

  describe("Docker Compose OpenHands Service Definition", () => {
    it("should declare openhands service with correct image and container name", () => {
      assert.ok(fs.existsSync(composePath), "docker-compose.yml must exist");
      const content = fs.readFileSync(composePath, "utf-8");
      assert.match(content, /openhands:/, "Must declare openhands service");
      assert.match(content, /image:\s*ghcr\.io\/all-hands-ai\/openhands:0\.18/, "Must use official OpenHands 0.18 image");
      assert.match(content, /container_name:\s*index0-openhands/);
    });

    it("should mount docker socket and workspace base for self-contained runtime", () => {
      const content = fs.readFileSync(composePath, "utf-8");
      assert.match(content, /\/var\/run\/docker\.sock:\/var\/run\/docker\.sock/, "Must mount Docker socket for local execution");
      assert.match(content, /\.\.\/\.\.\/workspace:\/opt\/workspace_base/, "Must mount workspace to /opt/workspace_base");
    });

    it("should configure local sandbox runtime container image and environment", () => {
      const content = fs.readFileSync(composePath, "utf-8");
      assert.match(content, /SANDBOX_RUNTIME_CONTAINER_IMAGE=docker\.all-hands\.dev\/all-hands-ai\/runtime:0\.18-nikolaik/);
      assert.match(content, /WORKSPACE_BASE=\/opt\/workspace_base/);
      assert.match(content, /LOG_ALL_EVENTS=true/);
      assert.match(content, /LLM_MODEL=\$\{LLM_MODEL:-anthropic\/claude-3-5-sonnet-20241022\}/);
    });

    it("should connect openhands to index0-net bridge network", () => {
      const content = fs.readFileSync(composePath, "utf-8");
      assert.match(content, /openhands:[\s\S]*?networks:[\s\S]*?- index0-net/);
    });
  });

  describe("Caddy Gateway Reverse-Proxy to OpenHands", () => {
    it("should proxy root traffic to openhands:3000 with unbuffered streaming", () => {
      assert.ok(fs.existsSync(caddyfilePath), "Caddyfile must exist");
      const content = fs.readFileSync(caddyfilePath, "utf-8");
      assert.match(content, /reverse_proxy\s+openhands:3000\s*\{/);
      assert.match(content, /flush_interval\s+-1/, "Must configure flush_interval -1 for real-time SSE streaming");
    });

    it("should forward sanitized host and IP headers to OpenHands", () => {
      const content = fs.readFileSync(caddyfilePath, "utf-8");
      assert.match(content, /header_up\s+Host\s+\{host\}/);
      assert.match(content, /header_up\s+X-Real-IP\s+\{remote_host\}/);
      assert.match(content, /header_up\s+X-Forwarded-For\s+\{remote_host\}/);
      assert.match(content, /header_up\s+X-Forwarded-Proto\s+\{scheme\}/);
    });
  });

  describe("Workspace Instructions & Autonomous Agent Guardrails", () => {
    it("should exist at workspace/.openhands_instructions", () => {
      assert.ok(fs.existsSync(instructionsPath), "workspace/.openhands_instructions must exist");
    });

    it("should contain non-negotiable architectural principles", () => {
      const content = fs.readFileSync(instructionsPath, "utf-8");
      assert.match(content, /Contract First/, "Must enforce Contract First");
      assert.match(content, /@index0\/contracts/, "Must reference @index0/contracts");
      assert.match(content, /Option A Architecture Compliance/, "Must enforce Option A");
      assert.match(content, /Caddy API Gateway on port 8000/, "Must enforce Gateway port 8000 routing");
      assert.match(content, /Tests Are Mandatory/, "Must require automated test execution");
      assert.match(content, /Zero Secrets in Git/, "Must enforce secret safety");
    });
  });

  describe("Multi-Provider LLM Connection Profiles", () => {
    it("should exist and parse as valid JSON configuration", () => {
      assert.ok(fs.existsSync(profilesPath), "llm-profiles.json must exist");
      const raw = fs.readFileSync(profilesPath, "utf-8");
      const data = JSON.parse(raw);
      assert.strictEqual(data.version, "1.0");
      assert.strictEqual(data.default_profile, "anthropic-claude");
      assert.ok(data.profiles, "Must have profiles map");
    });

    it("should define Anthropic, OpenAI, DeepSeek, Ollama, and vLLM profiles", () => {
      const raw = fs.readFileSync(profilesPath, "utf-8");
      const data = JSON.parse(raw);
      const expectedProfiles = [
        "anthropic-claude",
        "openai-gpt4o",
        "deepseek-coder",
        "local-ollama",
        "local-vllm"
      ];
      for (const profile of expectedProfiles) {
        assert.ok(data.profiles[profile], `Must define profile: ${profile}`);
        assert.ok(data.profiles[profile].model, `${profile} must define a model string`);
      }
      assert.strictEqual(data.profiles["local-ollama"].base_url, "http://host.docker.internal:11434");
      assert.strictEqual(data.profiles["local-vllm"].base_url, "http://host.docker.internal:8000/v1");
    });
  });
});
