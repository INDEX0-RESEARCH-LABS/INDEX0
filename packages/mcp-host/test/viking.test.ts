import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { VikingContextCache, VikingContextProvider, VikingMCPServer } from "../dist/index.js";

describe("VikingContextCache", () => {
  it("should store, retrieve, and evict cache entries", () => {
    const cache = new VikingContextCache(3600);
    cache.set("src/index.ts", "L0_ABSTRACT", "abstract-content", 25);

    const hit = cache.get("src/index.ts", "L0_ABSTRACT");
    assert.ok(hit);
    assert.strictEqual(hit.content, "abstract-content");
    assert.strictEqual(hit.tokenCount, 25);

    const stats = cache.getStats();
    assert.strictEqual(stats.hits, 1);
    assert.strictEqual(stats.size, 1);

    const invalidated = cache.invalidate("src/index.ts");
    assert.strictEqual(invalidated, 1);
    assert.strictEqual(cache.get("src/index.ts", "L0_ABSTRACT"), undefined);
  });
});

describe("VikingContextProvider", () => {
  it("should parse viking:// URIs correctly", () => {
    const provider = new VikingContextProvider();
    assert.strictEqual(
      provider.parseVikingUri("viking://packages/contracts/src/v1/auth/index.ts"),
      "packages/contracts/src/v1/auth/index.ts"
    );
  });

  it("should resolve L0, L1, and L2 context for repository files", async () => {
    const provider = new VikingContextProvider();
    const res = await provider.resolveContext({
      requestId: "test-req-01",
      path: "packages/contracts/src/v1/sandbox/index.ts",
      tier: "L0_ABSTRACT",
      timestamp: new Date().toISOString()
    });

    assert.strictEqual(res.requestId, "test-req-01");
    assert.strictEqual(res.tier, "L0_ABSTRACT");
    assert.ok(res.tokenCount > 0);
    assert.strictEqual(res.cached, false);

    // Second call should hit cache
    const cachedRes = await provider.resolveContext({
      requestId: "test-req-02",
      path: "packages/contracts/src/v1/sandbox/index.ts",
      tier: "L0_ABSTRACT",
      timestamp: new Date().toISOString()
    });
    assert.strictEqual(cachedRes.cached, true);
  });
});

describe("VikingMCPServer", () => {
  it("should expose tools and handle tool calls", async () => {
    const server = new VikingMCPServer();
    const tools = server.listTools();
    assert.strictEqual(tools.length, 3);
    assert.ok(tools.find((t) => t.name === "viking_get_context"));

    const result = await server.handleToolCall({
      name: "viking_cache_stats",
      arguments: {}
    });
    assert.strictEqual(result.isError, undefined);
    assert.ok(result.content[0].text.includes("hits"));
  });
});
