/**
 * Database Seeder — @index0/db
 * Populates PostgreSQL 16 database with idempotent demo tenants, users, projects, workspaces, and telemetry.
 */

import { prisma, PrismaClient } from "./index.js";

export const DEMO_IDS = {
  orgId: "11111111-1111-4111-8111-111111111111",
  adminUserId: "22222222-2222-4222-8222-222222222221",
  memberUserId: "22222222-2222-4222-8222-222222222222",
  agentUserId: "22222222-2222-4222-8222-222222222223",
  projectId: "33333333-3333-4333-8333-333333333333",
  repositoryId: "44444444-4444-4444-8444-444444444444",
  workspaceActiveId: "55555555-5555-4555-8555-555555555551",
  workspaceIdleId: "55555555-5555-4555-8555-555555555552",
  agentRunCompletedId: "66666666-6666-4666-8666-666666666661",
  agentRunActiveId: "66666666-6666-4666-8666-666666666662",
  customerId: "77777777-7777-4777-8777-777777777777",
  subscriptionId: "88888888-8888-4888-8888-888888888888",
  invoiceId: "99999999-9999-4999-8999-999999999999"
} as const;

export async function seedDatabase(client: PrismaClient = prisma) {
  console.log("[db:seed] Starting database seeding...");

  // 1. Demo Organization
  const org = await client.organization.upsert({
    where: { slug: "acme-labs" },
    update: {
      name: "Acme Software Labs",
      planTier: "pro"
    },
    create: {
      id: DEMO_IDS.orgId,
      name: "Acme Software Labs",
      slug: "acme-labs",
      planTier: "pro"
    }
  });
  console.log(`[db:seed] Seeded organization: ${org.name} (${org.slug})`);

  // 2. Demo Users
  const adminUser = await client.user.upsert({
    where: { email: "darion@index0.ai" },
    update: { name: "Darion (Lead Architect)", emailVerified: true },
    create: {
      id: DEMO_IDS.adminUserId,
      email: "darion@index0.ai",
      name: "Darion (Lead Architect)",
      avatarUrl: "https://index0.ai/avatars/darion.png",
      emailVerified: true
    }
  });

  const memberUser = await client.user.upsert({
    where: { email: "alex@index0.ai" },
    update: { name: "Alex (Systems Engineer)", emailVerified: true },
    create: {
      id: DEMO_IDS.memberUserId,
      email: "alex@index0.ai",
      name: "Alex (Systems Engineer)",
      avatarUrl: "https://index0.ai/avatars/alex.png",
      emailVerified: true
    }
  });

  const agentUser = await client.user.upsert({
    where: { email: "agent-runner@index0.ai" },
    update: { name: "Antigravity Agent Runtime", emailVerified: true },
    create: {
      id: DEMO_IDS.agentUserId,
      email: "agent-runner@index0.ai",
      name: "Antigravity Agent Runtime",
      avatarUrl: "https://index0.ai/avatars/agent.png",
      emailVerified: true
    }
  });
  console.log(`[db:seed] Seeded users: admin, member, agent`);

  // 3. Organization Memberships
  await client.membership.upsert({
    where: {
      userId_organizationId: {
        userId: adminUser.id,
        organizationId: org.id
      }
    },
    update: { role: "admin" },
    create: {
      userId: adminUser.id,
      organizationId: org.id,
      role: "admin"
    }
  });

  await client.membership.upsert({
    where: {
      userId_organizationId: {
        userId: memberUser.id,
        organizationId: org.id
      }
    },
    update: { role: "member" },
    create: {
      userId: memberUser.id,
      organizationId: org.id,
      role: "member"
    }
  });

  await client.membership.upsert({
    where: {
      userId_organizationId: {
        userId: agentUser.id,
        organizationId: org.id
      }
    },
    update: { role: "agent" },
    create: {
      userId: agentUser.id,
      organizationId: org.id,
      role: "agent"
    }
  });
  console.log(`[db:seed] Seeded organization memberships`);

  // 4. Demo Project
  const project = await client.project.upsert({
    where: {
      organizationId_slug: {
        organizationId: org.id,
        slug: "index0-core"
      }
    },
    update: {
      name: "INDEX0 Core Platform",
      description: "Sovereign Multi-Agent AI Software Engineering Platform",
      defaultBranch: "main"
    },
    create: {
      id: DEMO_IDS.projectId,
      organizationId: org.id,
      name: "INDEX0 Core Platform",
      slug: "index0-core",
      description: "Sovereign Multi-Agent AI Software Engineering Platform",
      defaultBranch: "main"
    }
  });
  console.log(`[db:seed] Seeded project: ${project.name}`);

  // 5. Demo Repository
  const repository = await client.repository.upsert({
    where: { id: DEMO_IDS.repositoryId },
    update: {
      remoteUrl: "https://github.com/index0-ai/index0-core.git",
      defaultBranch: "main"
    },
    create: {
      id: DEMO_IDS.repositoryId,
      projectId: project.id,
      remoteUrl: "https://github.com/index0-ai/index0-core.git",
      provider: "github",
      defaultBranch: "main",
      isPrivate: true
    }
  });
  console.log(`[db:seed] Seeded repository: ${repository.remoteUrl}`);

  // 6. Demo Workspaces
  const activeWorkspace = await client.workspace.upsert({
    where: { id: DEMO_IDS.workspaceActiveId },
    update: {
      status: "active",
      branch: "main"
    },
    create: {
      id: DEMO_IDS.workspaceActiveId,
      projectId: project.id,
      repositoryId: repository.id,
      branch: "main",
      status: "active",
      containerId: "e2b-sandbox-active-001",
      portAllocations: { web: 3000, api: 8080 }
    }
  });

  const idleWorkspace = await client.workspace.upsert({
    where: { id: DEMO_IDS.workspaceIdleId },
    update: {
      status: "idle",
      branch: "feature/sandbox-v2"
    },
    create: {
      id: DEMO_IDS.workspaceIdleId,
      projectId: project.id,
      repositoryId: repository.id,
      branch: "feature/sandbox-v2",
      status: "idle"
    }
  });
  console.log(`[db:seed] Seeded workspaces: ${activeWorkspace.id} (active), ${idleWorkspace.id} (idle)`);

  // 7. Historical & Active Agent Runs
  const completedRun = await client.agentRun.upsert({
    where: { id: DEMO_IDS.agentRunCompletedId },
    update: {
      status: "completed",
      durationMs: 4200,
      totalTokens: 1420
    },
    create: {
      id: DEMO_IDS.agentRunCompletedId,
      workspaceId: activeWorkspace.id,
      prompt: "Add health check endpoint and unit tests to Sandbox Manager",
      status: "completed",
      model: "claude-3-5-sonnet-20241022",
      durationMs: 4200,
      totalTokens: 1420,
      createdAt: new Date(Date.now() - 3600000),
      completedAt: new Date(Date.now() - 3595800)
    }
  });

  await client.agentRun.upsert({
    where: { id: DEMO_IDS.agentRunActiveId },
    update: {
      status: "running"
    },
    create: {
      id: DEMO_IDS.agentRunActiveId,
      workspaceId: activeWorkspace.id,
      prompt: "Integrate Monaco Editor multi-tab navigation with File Explorer",
      status: "running",
      model: "gemini-1.5-pro",
      createdAt: new Date()
    }
  });
  console.log(`[db:seed] Seeded agent runs: ${completedRun.id} (completed), active run`);

  // 8. Agent Event & Sandbox Execution Fixtures
  await client.agentEvent.upsert({
    where: { id: "event-001-started" },
    update: {},
    create: {
      id: "event-001-started",
      runId: completedRun.id,
      type: "agent.started",
      payload: { prompt: completedRun.prompt, model: completedRun.model },
      timestamp: new Date(Date.now() - 3600000)
    }
  });

  await client.agentEvent.upsert({
    where: { id: "event-002-completed" },
    update: {},
    create: {
      id: "event-002-completed",
      runId: completedRun.id,
      type: "agent.completed",
      payload: { summary: "All endpoints and unit tests created successfully", totalSteps: 4 },
      timestamp: new Date(Date.now() - 3595800)
    }
  });

  await client.sandboxExecution.upsert({
    where: { id: "sandbox-exec-001" },
    update: {},
    create: {
      id: "sandbox-exec-001",
      runId: completedRun.id,
      workspaceId: activeWorkspace.id,
      language: "typescript",
      code: "console.log('Health check test passed');",
      exitCode: 0,
      stdout: "Health check test passed\n",
      stderr: "",
      durationMs: 145
    }
  });

  // 9. Billing & Metered Usage Entities
  const customer = await client.customer.upsert({
    where: { organizationId: org.id },
    update: { currency: "USD" },
    create: {
      id: DEMO_IDS.customerId,
      organizationId: org.id,
      externalCustomerId: "cus_stripe_acme_labs_001",
      email: "billing@acme.com",
      name: "Acme Labs Finance",
      currency: "USD"
    }
  });

  const subscription = await client.subscription.upsert({
    where: { id: DEMO_IDS.subscriptionId },
    update: { status: "active", tier: "pro" },
    create: {
      id: DEMO_IDS.subscriptionId,
      customerId: customer.id,
      planId: "plan_pro_monthly",
      status: "active",
      tier: "pro",
      currentPeriodStart: new Date(Date.now() - 86400000 * 15),
      currentPeriodEnd: new Date(Date.now() + 86400000 * 15),
      cancelAtPeriodEnd: false
    }
  });

  await client.usageEvent.upsert({
    where: { id: "usage-001-tokens" },
    update: {},
    create: {
      id: "usage-001-tokens",
      organizationId: org.id,
      dimension: "tokens.total",
      quantity: 1420,
      unit: "tokens",
      metadata: { runId: completedRun.id, model: completedRun.model }
    }
  });

  await client.invoice.upsert({
    where: { id: DEMO_IDS.invoiceId },
    update: {},
    create: {
      id: DEMO_IDS.invoiceId,
      customerId: customer.id,
      subscriptionId: subscription.id,
      amountDue: 4900,
      amountPaid: 4900,
      currency: "USD",
      status: "paid",
      dueDate: new Date(Date.now() - 86400000 * 15)
    }
  });
  console.log(`[db:seed] Seeded billing: customer, subscription (pro), usage event, invoice`);

  console.log("[db:seed] ✅ Database seeding completed successfully.");
  return {
    organization: org,
    users: [adminUser, memberUser, agentUser],
    project,
    repository,
    workspaces: [activeWorkspace, idleWorkspace],
    customer,
    subscription
  };
}

// Auto-run if executed directly
if (process.argv[1]?.endsWith("seed.js") || process.argv[1]?.endsWith("seed.ts")) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("[db:seed] Seeding failed:", err);
      process.exit(1);
    });
}
