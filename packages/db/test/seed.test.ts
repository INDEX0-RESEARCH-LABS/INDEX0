import { describe, it } from "node:test";
import assert from "node:assert";
import { DEMO_IDS, seedDatabase } from "../dist/seed.js";

describe("Database Seeder & Fixture Structure (@index0/db)", () => {
  it("should export deterministic DEMO_IDS with valid UUID formatting", () => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    assert.ok(uuidRegex.test(DEMO_IDS.orgId), "orgId should be a valid UUID");
    assert.ok(uuidRegex.test(DEMO_IDS.adminUserId), "adminUserId should be a valid UUID");
    assert.ok(uuidRegex.test(DEMO_IDS.memberUserId), "memberUserId should be a valid UUID");
    assert.ok(uuidRegex.test(DEMO_IDS.agentUserId), "agentUserId should be a valid UUID");
    assert.ok(uuidRegex.test(DEMO_IDS.projectId), "projectId should be a valid UUID");
    assert.ok(uuidRegex.test(DEMO_IDS.repositoryId), "repositoryId should be a valid UUID");
    assert.ok(uuidRegex.test(DEMO_IDS.workspaceActiveId), "workspaceActiveId should be a valid UUID");
    assert.ok(uuidRegex.test(DEMO_IDS.workspaceIdleId), "workspaceIdleId should be a valid UUID");
    assert.ok(uuidRegex.test(DEMO_IDS.agentRunCompletedId), "agentRunCompletedId should be a valid UUID");
    assert.ok(uuidRegex.test(DEMO_IDS.agentRunActiveId), "agentRunActiveId should be a valid UUID");
    assert.ok(uuidRegex.test(DEMO_IDS.customerId), "customerId should be a valid UUID");
    assert.ok(uuidRegex.test(DEMO_IDS.subscriptionId), "subscriptionId should be a valid UUID");
    assert.ok(uuidRegex.test(DEMO_IDS.invoiceId), "invoiceId should be a valid UUID");
  });

  it("should export seedDatabase as a callable function", () => {
    assert.strictEqual(typeof seedDatabase, "function");
  });
});
