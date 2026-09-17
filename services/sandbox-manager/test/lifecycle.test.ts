import { describe, it } from "node:test";
import assert from "node:assert";
import { ExecutionService } from "../dist/services/execution.service.js";
import { MockSandboxProvider } from "../dist/sandbox/mock-provider.js";

describe("Guaranteed Lifecycle & Teardown Verification", () => {
  it("should deallocate and close session in finally block on successful execution", async () => {
    const mockProvider = new MockSandboxProvider();
    const service = new ExecutionService(mockProvider);

    const result = await service.execute({
      id: "lifecycle-success-01",
      code: "print('success')",
      language: "python",
      timeoutMs: 5000
    });

    assert.strictEqual(result.exitCode, 0);
    assert.strictEqual(service.getActiveSandboxesCount(), 0);

    const createdSession = mockProvider.sessions.find((s) => s.id === "lifecycle-success-01");
    assert.ok(createdSession, "Session should have been created");
    assert.strictEqual(createdSession.isClosed, true, "Session must be closed in finally block");
  });

  it("should deallocate and close session in finally block when code execution fails", async () => {
    const mockProvider = new MockSandboxProvider();
    const service = new ExecutionService(mockProvider);

    const result = await service.execute({
      id: "lifecycle-error-01",
      code: "raise Exception('boom')",
      language: "python",
      timeoutMs: 5000
    });

    assert.strictEqual(result.exitCode, 1);
    assert.ok(result.error);
    assert.strictEqual(service.getActiveSandboxesCount(), 0);

    const createdSession = mockProvider.sessions.find((s) => s.id === "lifecycle-error-01");
    assert.ok(createdSession, "Session should have been created");
    assert.strictEqual(createdSession.isClosed, true, "Session must be closed in finally block even on error");
  });

  it("should deallocate and close session in finally block when execution times out", async () => {
    const mockProvider = new MockSandboxProvider();
    const service = new ExecutionService(mockProvider);

    const result = await service.execute({
      id: "lifecycle-timeout-01",
      code: "__SIMULATE_TIMEOUT__",
      language: "python",
      timeoutMs: 200 // Short timeout
    });

    assert.strictEqual(result.exitCode, 124);
    assert.strictEqual(result.timedOut, true);
    assert.strictEqual(service.getActiveSandboxesCount(), 0);

    const createdSession = mockProvider.sessions.find((s) => s.id === "lifecycle-timeout-01");
    assert.ok(createdSession, "Session should have been created");
    assert.strictEqual(createdSession.isClosed, true, "Session must be closed in finally block upon timeout");
  });

  it("should guarantee zero dangling sessions across concurrent executions", async () => {
    const mockProvider = new MockSandboxProvider();
    const service = new ExecutionService(mockProvider);

    const promises = Array.from({ length: 5 }).map((_, idx) =>
      service.execute({
        id: `concurrent-${idx}`,
        code: `print(${idx})`,
        language: "python",
        timeoutMs: 5000
      })
    );

    const results = await Promise.all(promises);
    assert.strictEqual(results.length, 5);
    assert.strictEqual(service.getActiveSandboxesCount(), 0);

    // Verify all 5 sessions are closed
    assert.strictEqual(mockProvider.sessions.length, 5);
    for (const session of mockProvider.sessions) {
      assert.strictEqual(session.isClosed, true, `Session ${session.id} must be closed`);
    }
  });
});
