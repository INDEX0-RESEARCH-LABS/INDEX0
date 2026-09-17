import { describe, it } from "node:test";
import assert from "node:assert";
import request from "supertest";
import { createApp } from "../dist/app.js";
import { ExecutionService } from "../dist/services/execution.service.js";
import { MockSandboxProvider } from "../dist/sandbox/mock-provider.js";

describe("GET /health Probe", () => {
  it("should return HTTP 200 with ISandboxHealthResponse contract structure", async () => {
    const mockProvider = new MockSandboxProvider();
    const service = new ExecutionService(mockProvider);
    const app = createApp(service);

    const response = await request(app).get("/health");

    assert.strictEqual(response.status, 200);
    assert.strictEqual(response.body.status, "healthy");
    assert.strictEqual(typeof response.body.activeSandboxes, "number");
    assert.strictEqual(response.body.activeSandboxes, 0);
    assert.ok(Date.parse(response.body.timestamp), "timestamp should be valid ISO string");
  });
});
