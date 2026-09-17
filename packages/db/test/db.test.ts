import { describe, it } from "node:test";
import assert from "node:assert";
import { prisma, PrismaClient } from "../dist/index.js";
import type {
  IUser,
  IOrganization,
  IMembership,
  IProject,
  IRepository,
  IWorkspace,
  IAgentRunSummary,
  ICustomer,
  ISubscription,
  IInvoice,
  IUsageEvent
} from "@index0/contracts";

describe("@index0/db Package & Model Integrity", () => {
  it("should export a valid singleton PrismaClient instance", () => {
    assert.ok(prisma, "prisma singleton must be defined");
    assert.ok(prisma instanceof PrismaClient, "prisma must be an instance of PrismaClient");
  });

  it("should provide delegates for all 13 PostgreSQL domain models", () => {
    assert.ok(typeof prisma.user === "object", "User model delegate exists");
    assert.ok(typeof prisma.organization === "object", "Organization model delegate exists");
    assert.ok(typeof prisma.membership === "object", "Membership model delegate exists");
    assert.ok(typeof prisma.project === "object", "Project model delegate exists");
    assert.ok(typeof prisma.repository === "object", "Repository model delegate exists");
    assert.ok(typeof prisma.workspace === "object", "Workspace model delegate exists");
    assert.ok(typeof prisma.agentRun === "object", "AgentRun model delegate exists");
    assert.ok(typeof prisma.agentEvent === "object", "AgentEvent model delegate exists");
    assert.ok(typeof prisma.sandboxExecution === "object", "SandboxExecution model delegate exists");
    assert.ok(typeof prisma.usageEvent === "object", "UsageEvent model delegate exists");
    assert.ok(typeof prisma.customer === "object", "Customer model delegate exists");
    assert.ok(typeof prisma.subscription === "object", "Subscription model delegate exists");
    assert.ok(typeof prisma.invoice === "object", "Invoice model delegate exists");
  });

  it("should compile with contract type compatibility", () => {
    // Compile-time type assertion verifying contract compatibility
    const mockUser: Partial<IUser> = {
      id: "test-user-id",
      email: "engineer@index0.ai",
      name: "Index0 Engineer",
      emailVerified: true
    };
    assert.strictEqual(mockUser.email, "engineer@index0.ai");

    const mockOrg: Partial<IOrganization> = {
      id: "test-org-id",
      name: "Acme Corp",
      slug: "acme-corp",
      planTier: "pro"
    };
    assert.strictEqual(mockOrg.slug, "acme-corp");
  });
});
