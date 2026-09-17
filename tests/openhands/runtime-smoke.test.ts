import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

describe("Dev 2 Platform: OpenHands Autonomous Agent Runtime & Sandbox Smoke Tests", () => {
  const currentDir = path.dirname(fileURLToPath(import.meta.url));
  const rootDir = path.resolve(currentDir, "../..");
  const composePath = path.join(rootDir, "infra/compose/docker-compose.yml");
  const caddyfilePath = path.join(rootDir, "infra/gateway/Caddyfile");
  const workspacePath = path.join(rootDir, "workspace");
  const instructionsPath = path.join(rootDir, "workspace/.openhands_instructions");
  const profilesPath = path.join(rootDir, "infra/openhands/llm-profiles.json");

  describe("Docker Compose Runtime & Sandboxing Definition", () => {
    it("should define openhands container with official image and host isolation", () => {
      assert.ok(fs.existsSync(composePath), "docker-compose.yml must exist");
      const compose = fs.readFileSync(composePath, "utf-8");

      assert.match(compose, /openhands:\s*\n\s*image:\s*ghcr\.io\/all-hands-ai\/openhands:0\.18/);
      assert.match(compose, /container_name:\s*index0-openhands/);
      assert.match(compose, /restart:\s*unless-stopped/);
      assert.match(compose, /"3000:3000"/, "OpenHands must publish workbench port 3000");
    });

    it("should mount docker socket and workspace base for self-contained runtime", () => {
      const compose = fs.readFileSync(composePath, "utf-8");
      assert.match(
        compose,
        /\/var\/run\/docker\.sock:\/var\/run\/docker\.sock/,
        "Docker socket must be mounted for local sibling container execution"
      );
      assert.match(
        compose,
        /\.\.\/\.\.\/workspace:\/opt\/workspace_base/,
        "Workspace must be mounted to /opt/workspace_base"
      );
    });

    it("should configure sandboxed runtime environment variables and healthcheck", () => {
      const compose = fs.readFileSync(composePath, "utf-8");
      assert.match(
        compose,
        /SANDBOX_RUNTIME_CONTAINER_IMAGE=docker\.all-hands\.dev\/all-hands-ai\/runtime:0\.18-nikolaik/,
        "Must specify official local runtime sandbox container"
      );
      assert.match(compose, /WORKSPACE_BASE=\/opt\/workspace_base/);
      assert.match(compose, /LOG_ALL_EVENTS=true/);
      assert.match(compose, /LLM_MODEL=\$\{LLM_MODEL:-anthropic\/claude-3-5-sonnet-20241022\}/);

      // Verify healthcheck definition
      assert.match(compose, /healthcheck:\s*\n\s*test:\s*\["CMD-SHELL",\s*"wget --no-verbose --tries=1 --spider http:\/\/localhost:3000\/ \|\| exit 1"\]/);
      assert.match(compose, /interval:\s*10s/);
      assert.match(compose, /timeout:\s*5s/);
      assert.match(compose, /retries:\s*5/);
    });

    it("should route through index0-net bridge with host gateway access", () => {
      const compose = fs.readFileSync(composePath, "utf-8");
      assert.match(compose, /"host\.docker\.internal:host-gateway"/, "Must configure host.docker.internal mapping");
      assert.match(compose, /openhands:[\s\S]*?networks:\s*\n\s*-\s*index0-net/);
    });
  });

  describe("Gateway Reverse-Proxy & Low-Latency Streaming Delivery", () => {
    it("should reverse-proxy default traffic to openhands:3000 with unbuffered flush", () => {
      assert.ok(fs.existsSync(caddyfilePath), "Caddyfile must exist");
      const caddyfile = fs.readFileSync(caddyfilePath, "utf-8");

      assert.match(caddyfile, /reverse_proxy\s+openhands:3000\s*\{/);
      assert.match(
        caddyfile,
        /flush_interval\s+-1/,
        "Must configure flush_interval -1 to prevent buffering SSE events and terminal streams"
      );
    });

    it("should pass sanitized forwarding headers to OpenHands", () => {
      const caddyfile = fs.readFileSync(caddyfilePath, "utf-8");
      const openhandsBlockMatch = caddyfile.match(/reverse_proxy\s+openhands:3000\s*\{([\s\S]+?)\n\s*\}/);
      assert.ok(openhandsBlockMatch, "Must find OpenHands reverse_proxy block");
      const openhandsBlock = openhandsBlockMatch[1];

      assert.match(openhandsBlock, /header_up\s+Host\s+\{host\}/);
      assert.match(openhandsBlock, /header_up\s+X-Real-IP\s+\{remote_host\}/);
      assert.match(openhandsBlock, /header_up\s+X-Forwarded-For\s+\{remote_host\}/);
      assert.match(openhandsBlock, /header_up\s+X-Forwarded-Proto\s+\{scheme\}/);
    });

    it("should allow same-origin iframe embedding and strip server identity", () => {
      const caddyfile = fs.readFileSync(caddyfilePath, "utf-8");
      assert.match(caddyfile, /X-Frame-Options\s+"SAMEORIGIN"/, "Must permit SAMEORIGIN for Web IDE OpenHandsViewer");
      assert.match(caddyfile, /-Server/, "Must strip Server header for security obfuscation");
    });
  });

  describe("Local Sovereign Sandbox & Multi-Provider Profile Matrix", () => {
    it("should parse llm-profiles.json and validate structure", () => {
      assert.ok(fs.existsSync(profilesPath), "infra/openhands/llm-profiles.json must exist");
      const content = fs.readFileSync(profilesPath, "utf-8");
      const parsed = JSON.parse(content);

      assert.strictEqual(parsed.version, "1.0");
      assert.strictEqual(parsed.default_profile, "anthropic-claude");
      assert.ok(typeof parsed.profiles === "object" && parsed.profiles !== null);
    });

    it("should configure offline sovereign local inference without external network calls", () => {
      const content = fs.readFileSync(profilesPath, "utf-8");
      const parsed = JSON.parse(content);

      // Verify local Ollama profile
      const ollama = parsed.profiles["local-ollama"];
      assert.ok(ollama, "local-ollama profile must exist");
      assert.strictEqual(ollama.provider, "ollama");
      assert.strictEqual(ollama.base_url, "http://host.docker.internal:11434");
      assert.strictEqual(ollama.api_key_env, null);

      // Verify local vLLM profile
      const vllm = parsed.profiles["local-vllm"];
      assert.ok(vllm, "local-vllm profile must exist");
      assert.strictEqual(vllm.provider, "vllm");
      assert.strictEqual(vllm.base_url, "http://host.docker.internal:8000/v1");
      assert.strictEqual(vllm.api_key_env, null);
    });

    it("should configure standard cloud model providers with env-based credentials", () => {
      const content = fs.readFileSync(profilesPath, "utf-8");
      const parsed = JSON.parse(content);

      const cloudProfiles = ["anthropic-claude", "openai-gpt4o", "deepseek-coder"];
      for (const name of cloudProfiles) {
        const profile = parsed.profiles[name];
        assert.ok(profile, `${name} profile must exist`);
        assert.strictEqual(profile.api_key_env, "LLM_API_KEY", `${name} must bind LLM_API_KEY`);
        assert.ok(profile.max_tokens > 0, `${name} max_tokens must be positive`);
        assert.ok(typeof profile.temperature === "number", `${name} temperature must be numeric`);
      }
    });
  });

  describe("Workspace Guardrails & File System Permissions", () => {
    it("should ensure workspace directory exists and is accessible", () => {
      assert.ok(fs.existsSync(workspacePath), "workspace/ directory must exist");
      const stats = fs.statSync(workspacePath);
      assert.ok(stats.isDirectory(), "workspace must be a directory");
    });

    it("should verify workspace/.openhands_instructions contains core platform principles", () => {
      assert.ok(fs.existsSync(instructionsPath), "workspace/.openhands_instructions must exist");
      const instructions = fs.readFileSync(instructionsPath, "utf-8");

      assert.match(instructions, /# INDEX0 AI — Autonomous Agent Workbench Instructions/);
      assert.match(instructions, /### 1\. Contract First/);
      assert.match(instructions, /### 2\. Option A Architecture Compliance/);
      assert.match(instructions, /### 3\. Execution Sandboxing/);
      assert.match(instructions, /### 4\. Tests Are Mandatory/);
      assert.match(instructions, /### 5\. Zero Secrets in Git/);
      assert.match(instructions, /### 6\. Small, Atomic Commits/);
    });
  });

  describe("Option A Architecture Compliance (Zero Scratch-Built Code)", () => {
    it("should verify that no custom Go gateway or scratch agent loop code exists", () => {
      const forbiddenPaths = [
        path.join(rootDir, "gateway/main.go"),
        path.join(rootDir, "cmd/gateway/main.go"),
        path.join(rootDir, "infra/gateway/gateway.go"),
        path.join(rootDir, "services/agent-loop"),
        path.join(rootDir, "services/agent"),
      ];

      for (const forbidden of forbiddenPaths) {
        assert.ok(
          !fs.existsSync(forbidden),
          `Option A Violation: Forbidden custom component exists at ${forbidden}`
        );
      }
    });
  });
});
