import { describe, it } from "node:test";
import assert from "node:assert";
import type { AgentEventType, IAgentEvent, IAgentPlanStep } from "@index0/contracts";
import {
  createMockAgentRun,
  createMockAgentEventSequence,
  createMockFailureEventSequence,
  simulateSSEStream,
  MOCK_WORKSPACE_FILE_TREE,
  findFileNode,
  getFileContent,
  flattenFileTree
} from "./index.ts";

describe("Agent Event Streams & Workspace Fixtures (tests/fixtures)", () => {
  it("should create a valid IAgentRun contract object", () => {
    const run = createMockAgentRun({ prompt: "Custom user prompt" });

    assert.ok(run.id);
    assert.strictEqual(run.prompt, "Custom user prompt");
    assert.strictEqual(run.status, "completed");
    assert.ok(Array.isArray(run.plan));
    assert.ok(run.createdAt);
  });

  it("should generate a realistic 9-step event sequence covering all happy-path AgentEventType variants", () => {
    const runId = "test-run-42";
    const events = createMockAgentEventSequence(runId);

    assert.strictEqual(events.length, 9);

    const types = events.map((e) => e.type);
    const expectedTypes: AgentEventType[] = [
      "agent.started",
      "agent.plan",
      "agent.message",
      "tool.called",
      "tool.result",
      "sandbox.started",
      "sandbox.completed",
      "agent.message",
      "agent.completed"
    ];

    assert.deepStrictEqual(types, expectedTypes);

    for (const event of events) {
      assert.strictEqual(event.runId, runId);
      assert.ok(event.id.startsWith(runId));
      assert.ok(event.payload && typeof event.payload === "object");
      assert.ok(Date.parse(event.timestamp));
    }
  });

  it("should generate a failure event sequence terminating in agent.failed", () => {
    const runId = "fail-run-99";
    const events = createMockFailureEventSequence(runId);

    const failEvent = events.find((e) => e.type === "agent.failed");
    assert.ok(failEvent, "Must contain agent.failed event");
    assert.strictEqual((failEvent.payload as { recoverable: boolean }).recoverable, false);
  });

  it("should yield SSE event envelopes via simulateSSEStream generator", async () => {
    const events = createMockAgentEventSequence("sse-test");
    const sseEnvelopes = [];

    for await (const envelope of simulateSSEStream(events, 0)) {
      sseEnvelopes.push(envelope);
    }

    assert.strictEqual(sseEnvelopes.length, 9);
    assert.strictEqual(sseEnvelopes[0].event, "agent.started");
    assert.strictEqual(sseEnvelopes[8].event, "agent.completed");

    // Validate JSON parsing of data payload
    const parsedData: IAgentEvent = JSON.parse(sseEnvelopes[0].data);
    assert.strictEqual(parsedData.type, "agent.started");
    assert.strictEqual(parsedData.runId, "sse-test");
  });

  it("should provide valid workspace file tree nodes and content lookups", () => {
    assert.ok(Array.isArray(MOCK_WORKSPACE_FILE_TREE));
    assert.ok(MOCK_WORKSPACE_FILE_TREE.length > 0);

    const mathFile = findFileNode(MOCK_WORKSPACE_FILE_TREE, "/src/math.ts");
    assert.ok(mathFile, "Should locate /src/math.ts");
    assert.strictEqual(mathFile?.type, "file");
    assert.strictEqual(mathFile?.name, "math.ts");

    const content = getFileContent("/src/math.ts");
    assert.ok(content, "Content must exist");
    assert.ok(content.includes("export function add"), "Content must include add function");

    const allNodes = flattenFileTree(MOCK_WORKSPACE_FILE_TREE);
    assert.ok(allNodes.length >= 6, "Flattened tree should contain all file and directory nodes");
  });
});
