import { describe, it } from "node:test";
import assert from "node:assert";
import request from "supertest";
import { createApp } from "../dist/app.js";
import { ExecutionService } from "../dist/services/execution.service.js";
import { MockSandboxProvider } from "../dist/sandbox/mock-provider.js";

describe("POST /execute Route & Contract Conformance", () => {
  it("should execute Python code and return ISandboxExecutionResult", async () => {
    const mockProvider = new MockSandboxProvider();
    const service = new ExecutionService(mockProvider);
    const app = createApp(service);

    const res = await request(app)
      .post("/execute")
      .send({
        id: "test-py-01",
        code: "print(2+2)",
        language: "python",
        timeoutMs: 5000
      });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.id, "test-py-01");
    assert.strictEqual(res.body.data.exitCode, 0);
    assert.strictEqual(res.body.data.stdout, "4\n");
    assert.ok(typeof res.body.data.durationMs === "number");
    assert.strictEqual(res.body.data.timedOut, false);
    assert.ok(res.body.requestId);
  });

  it("should execute TypeScript code successfully", async () => {
    const mockProvider = new MockSandboxProvider();
    const service = new ExecutionService(mockProvider);
    const app = createApp(service);

    const res = await request(app)
      .post("/execute")
      .send({
        id: "test-ts-01",
        code: "console.log(2+2)",
        language: "typescript",
        timeoutMs: 5000
      });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.exitCode, 0);
    assert.strictEqual(res.body.data.stdout, "4\n");
  });

  it("should execute Bash commands successfully", async () => {
    const mockProvider = new MockSandboxProvider();
    const service = new ExecutionService(mockProvider);
    const app = createApp(service);

    const res = await request(app)
      .post("/execute")
      .send({
        id: "test-bash-01",
        code: "echo hello",
        language: "bash",
        timeoutMs: 5000
      });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.exitCode, 0);
    assert.strictEqual(res.body.data.stdout, "hello\n");
  });

  it("should reject invalid language with RFC 7807 problem details (HTTP 400)", async () => {
    const mockProvider = new MockSandboxProvider();
    const service = new ExecutionService(mockProvider);
    const app = createApp(service);

    const res = await request(app)
      .post("/execute")
      .send({
        id: "test-invalid-lang",
        code: "println!(\"Hello\");",
        language: "rust" // Unsupported language
      });

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.success, false);
    assert.strictEqual(res.body.error.title, "Validation Error");
    assert.strictEqual(res.body.error.status, 400);
    assert.ok(Array.isArray(res.body.error.invalidParams));
    assert.strictEqual(res.body.error.invalidParams[0].name, "language");
  });

  it("should reject timeout exceeding max quota (300,000ms) with HTTP 400", async () => {
    const mockProvider = new MockSandboxProvider();
    const service = new ExecutionService(mockProvider);
    const app = createApp(service);

    const res = await request(app)
      .post("/execute")
      .send({
        id: "test-excessive-timeout",
        code: "print(1)",
        language: "python",
        timeoutMs: 500_000 // Exceeds 300,000ms max quota
      });

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.success, false);
    assert.strictEqual(res.body.error.status, 400);
    assert.strictEqual(res.body.error.invalidParams[0].name, "timeoutMs");
  });
});
