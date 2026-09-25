#!/usr/bin/env node
/**
 * INDEX0 AI & OpenCode CLI Runner — @index0/client-harness
 * 
 * Command-line interface for:
 * - OpenCode Terminal Agent Harness (LSP verification, 4-tier LangGraph TUI)
 * - Git Worktree isolated parallel agent sessions
 * - Terminal Token Filter (ANSI & progress squashing)
 * - GNAP (Git-Native Agent Protocol) signed commits
 * - Sandbox execution testing and benchmarks
 */

import { SandboxClient } from './index.js';
import { GNAPWorker } from './gnap.js';
import { TerminalTokenFilter } from './filter.js';
import { GitWorktreeManager } from './worktree.js';
import { OpenCodeEngine } from './opencode.js';
import type { SandboxLanguage, ISandboxRequest, AgentRole } from '@index0/contracts';

function printHelp(): void {
  console.log(`
\x1b[1;36mINDEX0 AI ── OpenCode Sovereign Terminal Harness\x1b[0m

\x1b[1mUsage:\x1b[0m
  opencode [command] [options]
  index0 [command] [options]

\x1b[1mOpenCode Agent Commands:\x1b[0m
  prompt <task>        Execute sovereign task prompt via Azure OpenAI
  review [task]        Run 4-tier LangGraph Anti-Slop Matrix (Architect → Developer → Critic → QA)
  worktrees            List active isolated agent git worktrees
  clean-worktrees      Prune and remove all agent worktrees

\x1b[1mSandbox & Protocol Commands:\x1b[0m
  --code=<code>        Execute code snippet in sandbox (default: python)
  --lang=<language>    Runtime language: python, typescript, bash
  --filter=<file/text> Test terminal token filter compression on output
  --gnap               Record autonomous GNAP review step in .gnap/ branch
  --role=<role>        GNAP agent role: architect, developer, critic, qa
  --verdict=<verdict>  GNAP review verdict: approved, rejected, needs_qa
  --health             Check health of sandbox manager
  --help, -h           Display this help message

\x1b[1mOptions:\x1b[0m
  --worktree           Run agent task in an isolated git worktree (.index0/worktrees/)
  --commit             Automatically record signed GNAP commit on review approval
  --url=<url>          API base URL (default: https://ai.index0.in/v1 or local)
  --mock               Run in local mock mode without network calls

\x1b[1mExamples:\x1b[0m
  opencode prompt "Refactor JWT claims validation in src/auth"
  opencode review "Implement RBAC permissions check" --worktree --commit
  opencode worktrees
  index0 --code="print('Hello from sovereign sandbox')" --mock
`);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h') || args.length === 0) {
    printHelp();
    return;
  }

  const getArgValue = (prefix: string): string | undefined => {
    const match = args.find((a) => a.startsWith(prefix));
    return match ? match.slice(prefix.length) : undefined;
  };

  const command = args[0]?.toLowerCase();
  const isMock = args.includes('--mock');
  const isHealth = args.includes('--health');
  const isGnap = args.includes('--gnap');
  const useWorktree = args.includes('--worktree');
  const autoCommit = args.includes('--commit');

  // 1. OpenCode Review Command (4-Tier Anti-Slop Matrix)
  if (command === 'review' || args.includes('--review')) {
    const task = args[1] && !args[1].startsWith('--') ? args[1] : (getArgValue('--task=') ?? 'Automated codebase audit');
    console.log(`\x1b[1;36m[OpenCode]\x1b[0m Dispatching 4-Tier LangGraph Matrix for: "${task}"...`);

    const engine = new OpenCodeEngine();
    const session = await engine.executeSession(task, { useWorktree, autoCommit });

    engine.renderTuiMatrix(session.steps);

    if (session.worktree) {
      console.log(`\x1b[33m[Worktree]\x1b[0m Task isolated in: \x1b[1m${session.worktree.path}\x1b[0m`);
    }
    if (session.gnapCommitHash) {
      console.log(`\x1b[32m[GNAP]\x1b[0m Signed review commit created: \x1b[1m${session.gnapCommitHash}\x1b[0m`);
    }

    console.log(`Final Matrix Verdict: ${session.verdict === 'approved' ? '\x1b[32mAPPROVED\x1b[0m' : '\x1b[31mREJECTED\x1b[0m'}`);
    process.exit(session.verdict === 'approved' ? 0 : 1);
  }

  // 2. OpenCode Prompt Command
  if (command === 'prompt' || args.includes('--prompt')) {
    const task = args[1] && !args[1].startsWith('--') ? args[1] : (getArgValue('--prompt=') ?? 'Analyze repository architecture');
    console.log(`\x1b[1;36m[OpenCode]\x1b[0m Routing prompt to Sovereign Azure OpenAI...`);

    const engine = new OpenCodeEngine();
    try {
      const response = await engine.callLlm(task);
      console.log(`\n\x1b[1mResponse:\x1b[0m\n${response}\n`);
      process.exit(0);
    } catch (err: any) {
      console.error(`Prompt failed: ${err.message}`);
      process.exit(1);
    }
  }

  // 3. Worktree Management Commands
  if (command === 'worktrees' || args.includes('--worktrees')) {
    const manager = new GitWorktreeManager();
    const list = await manager.listActiveWorktrees();
    console.log(`\x1b[1mActive INDEX0 Agent Worktrees (${list.length}):\x1b[0m`);
    if (list.length === 0) {
      console.log('  No active agent worktrees.');
    } else {
      for (const wt of list) {
        console.log(`  • Task [${wt.taskId}]: Branch \x1b[36m${wt.branch}\x1b[0m -> ${wt.path}`);
      }
    }
    return;
  }

  // 4. Token Filter Diagnostic
  const filterArg = getArgValue('--filter=');
  if (filterArg) {
    console.log('\x1b[1mTesting Terminal Token Filter...\x1b[0m');
    const result = TerminalTokenFilter.filter(filterArg);
    console.log(`Raw: ${result.stats.rawLength} chars -> Filtered: ${result.stats.filteredLength} chars`);
    console.log(`Tokens Saved: ~${result.stats.estimatedTokensSaved} (${result.stats.reductionPercentage}% reduction)`);
    console.log(`Output:\n${result.content}`);
    return;
  }

  // 5. GNAP Commit Recording
  if (isGnap) {
    const role = (getArgValue('--role=') ?? 'critic') as AgentRole;
    const agentId = getArgValue('--agent=') ?? `agent-${role}-01`;
    const title = getArgValue('--title=') ?? 'Autonomous Review Step';
    const verdict = getArgValue('--verdict=') ?? 'approved';

    console.log(`\x1b[36m[GNAP]\x1b[0m Initializing Git-Native Agent Protocol worker (${role})...`);
    const worker = new GNAPWorker({ agentId, agentRole: role });
    await worker.initializeRepository();
    const step = await worker.recordStep({
      messageType: 'review_verdict',
      title,
      summary: `GNAP autonomous cycle review step executed by ${agentId}`,
      payload: { executedAt: new Date().toISOString() },
      verdict
    });

    console.log(`\x1b[32m[OK]\x1b[0m Recorded step in .gnap/messages/`);
    console.log(`\x1b[1mGenerated Git Commit Message with Trailers:\x1b[0m\n\n${step.commitMessage}\n`);
    return;
  }

  // 6. Sandbox Execution Testing (Backward Compatibility)
  const url = getArgValue('--url=') ?? 'http://localhost:4001';
  const lang = (getArgValue('--lang=') ?? 'python') as SandboxLanguage;
  const code = getArgValue('--code=') ?? "print('INDEX0 Sandbox execution OK')";
  const timeoutMs = Number(getArgValue('--timeout=') ?? '30000');

  const client = new SandboxClient({ baseUrl: url });

  if (isHealth) {
    console.log(`Checking health at ${url}/health...`);
    try {
      const health = await client.checkHealth();
      console.log(`Health Status: \x1b[32m${health.status}\x1b[0m`);
      console.log(`Active Sandboxes: ${health.activeSandboxes}`);
      console.log(`Timestamp: ${health.timestamp}`);
    } catch (err) {
      console.error(`Health check failed: ${(err as Error).message}`);
      process.exit(1);
    }
    return;
  }

  const request: ISandboxRequest = {
    id: `cli-${Date.now()}`,
    language: lang,
    code,
    timeoutMs
  };

  console.log(`\x1b[1mExecuting [${lang}] snippet...\x1b[0m`);

  if (isMock) {
    const result = client.simulateMockExecution(request);
    console.log(SandboxClient.formatResult(result));
    process.exit(result.exitCode);
  } else {
    try {
      const apiResponse = await client.execute(request);
      if (apiResponse.success && apiResponse.data) {
        console.log(SandboxClient.formatResult(apiResponse.data));
        process.exit(apiResponse.data.exitCode);
      } else {
        console.error(`Execution failed: ${apiResponse.error?.detail ?? 'Unknown error'}`);
        process.exit(1);
      }
    } catch (err) {
      console.error(`Connection error to ${url}: ${(err as Error).message}`);
      process.exit(1);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
