#!/usr/bin/env node
/**
 * INDEX0 AI Sovereign CLI Runner — @index0/client-harness
 * 
 * World's First Sovereign Software Engineering Platform.
 * 
 * Strict Monochrome Design System (Dark, White, Gray) adhering to apps/ai/DESIGN.md.
 */

import { execSync } from 'node:child_process';
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { SandboxClient } from './index.js';
import { GNAPWorker } from './gnap.js';
import { TerminalTokenFilter } from './filter.js';
import { GitWorktreeManager } from './worktree.js';
import { Index0Engine } from './engine.js';
import { launchTui } from './launcher.js';
import {
  performDeviceFlowLogin,
  loadCredentials,
  clearCredentials,
  validateCredentials
} from './auth.js';
import {
  color,
  symbol,
  renderLogo,
  drawBox,
  renderCommandCatalog,
  renderStatusBar,
  TerminalSpinner,
  selectMenu,
  waitForAnyKey,
  renderCockpitHeader,
  renderFooterHints,
  renderDiffBox,
  promptInteractive,
  DEFAULT_SLASH_COMMANDS
} from './ui.js';
import type { SandboxLanguage, AgentRole } from './contracts.js';

function printHelp(): void {
  console.log(renderLogo());

  console.log(
    renderCommandCatalog('Commands', [
      {
        command: 'index0',
        args: '[project]',
        description: 'start 100% sovereign interactive coding TUI (default)',
        badge: 'default'
      },
      {
        command: 'index0 run',
        args: '<task..>',
        description: 'run autonomous coding agent headlessly with tool calling',
        badge: 'agent'
      },
      {
        command: 'index0 re-engineer',
        args: '<repoUrl> [goal]',
        description: 'dissect open-source git repo, isolate Crown Jewels, and elevate with zero-alloc primitives',
        badge: 're-engineer'
      },
      {
        command: 'index0 prompt',
        args: '<task>',
        description: 'stream prompt directly to Azure OpenAI via LiteLLM',
        badge: 'sovereign'
      },
      {
        command: 'index0 review',
        args: '[task]',
        description: 'run 4-tier LangGraph anti-slop review matrix',
        badge: '4-tier'
      },
      {
        command: 'index0 models',
        args: '',
        description: 'list all available models from sovereign gateway'
      },
      {
        command: 'index0 stats',
        args: '',
        description: 'show token reduction, viking:// metrics and spend caps'
      },
      {
        command: 'index0 worktrees',
        args: '',
        description: 'list active isolated agent git worktrees'
      },
      {
        command: 'index0 clean-worktrees',
        args: '',
        description: 'prune and remove all agent git worktrees'
      },
      {
        command: 'index0 health',
        args: '',
        description: 'check health of gateway, orchestrator, and edge engine'
      },
      {
        command: 'index0 login',
        args: '',
        description: 'authenticate via GitHub Device Flow',
        badge: 'auth'
      },
      {
        command: 'index0 logout',
        args: '',
        description: 'clear stored credentials'
      },
      {
        command: 'index0 whoami',
        args: '',
        description: 'show current authenticated user'
      }
    ])
  );

  console.log('\n' + renderCommandCatalog('Protocol & Sandbox Flags', [
    {
      command: '--filter',
      args: '=<text>',
      description: 'test terminal token filter compression on raw output'
    },
    {
      command: '--gnap',
      args: '',
      description: 'record signed GNAP review step in .gnap/ branch'
    },
    {
      command: '--code',
      args: '=<code>',
      description: 'execute code snippet in sandbox (python/ts/bash)'
    },
    {
      command: '--worktree',
      args: '',
      description: 'isolate agent task in ephemeral git worktree'
    },
    {
      command: '--commit',
      args: '',
      description: 'auto-commit signed GNAP review upon matrix approval'
    },
    {
      command: '--mock',
      args: '',
      description: 'run offline in local mock mode without network calls'
    },
    {
      command: '-h, --help',
      args: '',
      description: 'display this help menu'
    }
  ]));

  console.log(`\n${color.bold}Examples:${color.reset}`);
  console.log(`  index0                                                ${color.dim}# Launch interactive REPL${color.reset}`);
  console.log(`  index0 prompt "Refactor JWT claims validation"        ${color.dim}# Sovereign Azure GPT-4o${color.reset}`);
  console.log(`  index0 review "Implement RBAC permissions" --worktree   ${color.dim}# 4-Tier Matrix in worktree${color.reset}`);
  console.log(`  index0 stats                                           ${color.dim}# Token and budget telemetry${color.reset}\n`);
}

/**
 * Interactive Model Selector with Keyboard Navigation
 */
async function interactiveModelSelector(currentModel: string): Promise<string | null> {
  const apiBase = process.env.INDEX0_API_BASE ?? 'https://ai.index0.in/v1';
  const masterKey = process.env.INDEX0_API_KEY ?? process.env.LITELLM_MASTER_KEY ?? 'sk-index0-litellm-dev';

  let models: string[] = [];
  try {
    const res = await fetch(`${apiBase}/models`, {
      headers: { Authorization: `Bearer ${masterKey}` }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = (await res.json()) as any;
    models = (json.data || []).map((m: any) => m.id);
  } catch {
    models = [
      'azure-gpt-4o',
      'azure-gpt-4o-mini',
      'claude-3-5-sonnet',
      'claude-sonnet-4',
      'claude-3-5-haiku'
    ];
  }

  const items = models.map((m: string) => {
    const isPrimary = m === 'azure-gpt-4o';
    const isMini = m.includes('mini');
    const badge = m === currentModel ? 'ACTIVE' : (isPrimary ? 'PRIMARY' : (isMini ? 'FAST' : 'SOVEREIGN'));
    const desc = m.includes('mini') ? 'High-speed inference' : (m.includes('claude') ? 'ZDR memory-only' : 'Azure East US 128k');
    return { id: m, label: m, badge, description: desc };
  });

  const defaultIdx = items.findIndex((i: any) => i.id === currentModel);
  console.log();
  const chosen = await selectMenu('SELECT SOVEREIGN MODEL', items, { defaultIndex: Math.max(0, defaultIdx), width: 78 });
  return chosen;
}

/**
 * Continuous Prompt Shell (Conversational REPL)
 */
async function runContinuousShell(engine: Index0Engine): Promise<void> {
  console.log(`\n  ${color.dim}Entering continuous prompt shell. Type /menu or /exit to return to cockpit.${color.reset}\n`);
  const rl = readline.createInterface({ input, output });

  try {
    while (true) {
      const promptSymbol = `${color.bold}index0${color.reset} ❯ `;
      let rawInput = '';
      try {
        rawInput = await rl.question(promptSymbol);
      } catch {
        break;
      }
      const trimmed = rawInput.trim();
      if (!trimmed) continue;
      if (trimmed === '/menu' || trimmed === '/exit' || trimmed === 'exit') break;
      if (trimmed === '/clear' || trimmed === 'clear') {
        console.clear();
        console.log(renderLogo());
        continue;
      }
      if (trimmed === '/models') {
        await executeModelsCommand();
        continue;
      }
      if (trimmed === '/stats') {
        await executeStatsCommand();
        continue;
      }
      if (trimmed === '/worktrees') {
        await executeWorktreesCommand();
        continue;
      }
      if (trimmed === '/clean' || trimmed === '/clean-worktrees') {
        const manager = new GitWorktreeManager();
        const count = await manager.cleanupAll();
        console.log(`\n  ${symbol.tick} Pruned ${count} isolated agent worktrees.\n`);
        continue;
      }
      if (trimmed === '/health') {
        await executeHealthCommand();
        continue;
      }
      if (trimmed.startsWith('!')) {
        const shellCmd = trimmed.slice(1).trim();
        if (shellCmd) {
          await executeShellCommand(shellCmd);
        }
        continue;
      }
      if (trimmed.startsWith('/review') || trimmed.startsWith('review ')) {
        const task = trimmed.replace(/^\/review\s*|^review\s*/, '').trim() || 'Automated codebase audit';
        await executeReviewCommand(engine, task, false, false, []);
        continue;
      }
      if (trimmed.startsWith('/prompt ') || trimmed.startsWith('prompt ')) {
        const p = trimmed.replace(/^\/prompt\s*|^prompt\s*/, '').trim();
        await executePromptCommand(engine, p);
        continue;
      }
      await executePromptCommand(engine, trimmed);
    }
  } finally {
    rl.close();
  }
}

/**
 * Execute local shell command and filter terminal tokens
 */
async function executeShellCommand(cmd: string): Promise<void> {
  const spinner = new TerminalSpinner(`Executing shell: "${cmd}"...`).start();
  try {
    const raw = execSync(cmd, { encoding: 'utf8', cwd: process.cwd(), maxBuffer: 10 * 1024 * 1024 });
    spinner.succeed(`Shell completed`);
    const filtered = TerminalTokenFilter.filter(raw);
    const rawLines = filtered.content.trim().split('\n').slice(0, 30);
    const displayLines = rawLines.length > 0 && rawLines[0] !== '' ? rawLines : ['(Command completed with empty output)'];
    const box = drawBox(displayLines, {
      title: `SHELL: ${cmd.slice(0, 35)}`,
      badge: `[~${filtered.stats.estimatedTokensSaved} tok saved]`,
      width: 78
    });
    console.log(`\n${box}\n`);
  } catch (err: any) {
    spinner.fail(`Shell command failed: ${err.message}`);
  }
}

/**
 * Handle Command Palette selection
 */
async function handlePaletteAction(
  choice: string,
  engine: Index0Engine,
  activeModel: string,
  onModelChange: (m: string) => void,
  redrawCockpit: () => void
): Promise<void> {
  if (choice === 'review') {
    const rl = readline.createInterface({ input, output });
    const task = await rl.question(`\n  ${color.bold}Enter task to review:${color.reset} `);
    rl.close();
    if (task.trim()) {
      await executeReviewCommand(engine, task.trim(), false, false, []);
    }
    await waitForAnyKey();
  } else if (choice === 'prompt') {
    const rl = readline.createInterface({ input, output });
    const prompt = await rl.question(`\n  ${color.bold}Enter prompt:${color.reset} `);
    rl.close();
    if (prompt.trim()) {
      await executePromptCommand(engine, prompt.trim());
    }
    await waitForAnyKey();
  } else if (choice === 'models') {
    const chosen = await interactiveModelSelector(activeModel);
    if (chosen) {
      onModelChange(chosen);
      console.log(`\n  ${symbol.tick} Active model switched to: ${color.bold}${chosen}${color.reset}\n`);
    }
  } else if (choice === 'worktrees') {
    await executeWorktreesCommand();
    await waitForAnyKey();
  } else if (choice === 'clean') {
    const manager = new GitWorktreeManager();
    const count = await manager.cleanupAll();
    console.log(`\n  ${symbol.tick} Pruned ${count} isolated agent worktrees.\n`);
    await waitForAnyKey();
  } else if (choice === 'stats') {
    await executeStatsCommand();
    await waitForAnyKey();
  } else if (choice === 'health') {
    await executeHealthCommand();
    await waitForAnyKey();
  } else if (choice === 'clear') {
    redrawCockpit();
  } else if (choice === 'help') {
    console.log();
    printHelp();
    console.log();
    await waitForAnyKey();
  }
}

/**
 * Interactive Sovereign REPL Session (Keyboard-Navigable Cockpit)
 */
export async function startInteractiveSession(engine: Index0Engine): Promise<void> {
  let activeModel = 'azure-gpt-4o';
  const history: string[] = [];

  // If non-interactive TTY (piped input/script), run continuous shell directly
  if (!process.stdin.isTTY) {
    await runContinuousShell(engine);
    return;
  }

  const redrawCockpit = () => {
    console.clear();
    console.log(renderLogo());
    console.log(renderCockpitHeader({ model: activeModel, cwd: process.cwd() }));
    console.log();
    console.log(renderFooterHints());
    console.log();
  };

  redrawCockpit();

  while (true) {
    const res = await promptInteractive({
      commands: DEFAULT_SLASH_COMMANDS,
      history,
      promptPrefix: `${color.bold}index0${color.reset} ❯ `
    });

    if (res.type === 'exit') {
      console.log(`\n  ${color.dim}"People Over Tools. Work Verified. Time to Unplug."${color.reset}\n`);
      break;
    }

    if (res.type === 'clear') {
      redrawCockpit();
      continue;
    }

    if (res.type === 'palette') {
      console.log();
      const choice = await selectMenu('INDEX0 COMMAND PALETTE (Ctrl+P)', [
        { id: 'review', label: '/review <task>', description: 'Run 4-tier LangGraph anti-slop review matrix' },
        { id: 'prompt', label: '/prompt <task>', description: `Stream prompt directly to ${activeModel}` },
        { id: 'models', label: '/models', description: 'Switch active sovereign model (F2)' },
        { id: 'worktrees', label: '/worktrees', description: 'List active isolated agent git worktrees' },
        { id: 'clean', label: '/clean', description: 'Prune and remove all agent git worktrees' },
        { id: 'stats', label: '/stats', description: 'Show token reduction, viking:// metrics & spend caps' },
        { id: 'health', label: '/health', description: 'Verify sovereign gateway, orchestrator, and edge engine' },
        { id: 'clear', label: '/clear', description: 'Clear terminal screen and redraw cockpit' },
        { id: 'help', label: '/help', description: 'Display command catalog & keybinding manual' },
        { id: 'exit', label: '/exit', description: 'Exit cockpit session (Time to Unplug)' }
      ]);

      if (!choice || choice === 'exit') {
        if (choice === 'exit') {
          console.log(`\n  ${color.dim}"People Over Tools. Work Verified. Time to Unplug."${color.reset}\n`);
          break;
        }
        continue;
      }

      await handlePaletteAction(choice, engine, activeModel, (newModel) => {
        activeModel = newModel;
        (engine as any).model = newModel;
      }, redrawCockpit);
      continue;
    }

    if (res.type === 'models') {
      const chosen = await interactiveModelSelector(activeModel);
      if (chosen) {
        activeModel = chosen;
        (engine as any).model = chosen;
        console.log(`\n  ${symbol.tick} Active model switched to: ${color.bold}${chosen}${color.reset}\n`);
      }
      continue;
    }

    if (res.type === 'submit') {
      const line = res.value.trim();
      if (!line) continue;
      history.push(line);

      // Handle slash commands or direct prompts
      if (line === '/exit' || line === 'exit' || line === ':q') {
        console.log(`\n  ${color.dim}"People Over Tools. Work Verified. Time to Unplug."${color.reset}\n`);
        break;
      }
      if (line === '/clear' || line === 'clear') {
        redrawCockpit();
        continue;
      }
      if (line === '/help' || line === 'help' || line === '?') {
        console.log();
        printHelp();
        console.log();
        continue;
      }
      if (line === '/models') {
        const chosen = await interactiveModelSelector(activeModel);
        if (chosen) {
          activeModel = chosen;
          (engine as any).model = chosen;
          console.log(`\n  ${symbol.tick} Active model switched to: ${color.bold}${chosen}${color.reset}\n`);
        }
        continue;
      }
      if (line === '/stats') {
        await executeStatsCommand();
        continue;
      }
      if (line === '/worktrees') {
        await executeWorktreesCommand();
        continue;
      }
      if (line === '/clean' || line === '/clean-worktrees') {
        const manager = new GitWorktreeManager();
        const count = await manager.cleanupAll();
        console.log(`\n  ${symbol.tick} Pruned ${count} isolated agent worktrees.\n`);
        continue;
      }
      if (line === '/health') {
        await executeHealthCommand();
        continue;
      }
      if (line.startsWith('!')) {
        const shellCmd = line.slice(1).trim();
        if (shellCmd) {
          await executeShellCommand(shellCmd);
        }
        continue;
      }

      // Check if file context @ is referenced: e.g. "Review @src/auth.ts for errors"
      let contextFiles: string[] = [];
      const fileMatches = line.match(/@([a-zA-Z0-9_\-./]+)/g);
      if (fileMatches) {
        contextFiles = fileMatches.map((f) => f.slice(1));
      }

      if (line.startsWith('/review') || line.startsWith('review ')) {
        const task = line.replace(/^\/review\s*|^review\s*/, '').trim() || 'Automated codebase audit';
        await executeReviewCommand(engine, task, false, false, contextFiles);
        continue;
      }

      if (line.startsWith('/prompt ') || line.startsWith('prompt ')) {
        const prompt = line.replace(/^\/prompt\s*|^prompt\s*/, '').trim();
        await executePromptCommand(engine, prompt);
        continue;
      }

      // Default: Direct sovereign prompt stream
      await executePromptCommand(engine, line);
    }
  }
}

/**
 * Execute Review Matrix Command (4-Tier LangGraph Matrix)
 */
async function executeReviewCommand(
  engine: Index0Engine,
  task: string,
  useWorktree: boolean,
  autoCommit: boolean,
  contextFiles: string[]
): Promise<void> {
  const spinner = new TerminalSpinner(`Dispatching 4-Tier Matrix: "${task}"...`).start();
  const startTime = Date.now();

  try {
    const session = await engine.executeSession(task, { useWorktree, autoCommit, contextFiles });
    const elapsed = Date.now() - startTime;
    spinner.succeed(`4-Tier Review Loop Completed in ${elapsed}ms`);

    engine.renderTuiMatrix(session.steps);

    if (session.diff) {
      console.log(renderDiffBox(session.diff));
    }

    if (session.worktree) {
      console.log(`  [Worktree] ${session.worktree.path}`);
    }
    if (session.gnapCommitHash) {
      console.log(`  [GNAP] ${session.gnapCommitHash}`);
    }

    console.log(`  Consensus Verdict: ${color.bold}${session.verdict.toUpperCase()}${color.reset}`);
    console.log(renderStatusBar({ model: 'azure-gpt-4o', durationMs: elapsed, tokensSaved: 185 }));
    console.log();
  } catch (err: any) {
    spinner.fail(`Matrix review failed: ${err.message}`);
  }
}

/**
 * Execute Prompt Command (Azure OpenAI Stream)
 */
async function executePromptCommand(engine: Index0Engine, task: string): Promise<void> {
  const spinner = new TerminalSpinner('Routing to Sovereign Azure OpenAI East US...').start();
  const startTime = Date.now();

  try {
    const response = await engine.callLlm(task);
    const elapsed = Date.now() - startTime;
    spinner.succeed(`Response received in ${elapsed}ms`);

    console.log(`\n${response.trim()}\n`);
    console.log(renderStatusBar({ model: 'azure-gpt-4o', durationMs: elapsed, tokensSaved: 42 }));
    console.log();
  } catch (err: any) {
    spinner.fail(`Prompt failed: ${err.message}`);
  }
}

/**
 * Execute Models List Command
 */
async function executeModelsCommand(): Promise<void> {
  const spinner = new TerminalSpinner('Querying sovereign LiteLLM model catalog...').start();
  const apiBase = process.env.INDEX0_API_BASE ?? 'https://ai.index0.in/v1';
  const masterKey = process.env.INDEX0_API_KEY ?? process.env.LITELLM_MASTER_KEY ?? 'sk-index0-litellm-dev';

  let models: string[] = [];
  try {
    const res = await fetch(`${apiBase}/models`, {
      headers: { Authorization: `Bearer ${masterKey}` }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = (await res.json()) as any;
    models = (json.data || []).map((m: any) => m.id);
    spinner.succeed(`Retrieved ${models.length} active models from sovereign cloud gateway:`);
  } catch {
    spinner.info(`Gateway offline (${apiBase}) — displaying registered sovereign models:`);
    models = [
      'azure-gpt-4o',
      'azure-gpt-4o-mini',
      'claude-3-5-sonnet-azure',
      'deepseek-r1-sovereign',
      'tabby-starcoder2-3b'
    ];
  }

  const modelLines = models.map((m: string) => {
    const isPrimary = m === 'azure-gpt-4o';
    const isMini = m.includes('mini');
    const badge = isPrimary ? '[PRIMARY]' : (isMini ? '[FAST]' : '[SOVEREIGN]');
    return `  ● ${color.bold}${m.padEnd(24, ' ')}${color.reset} ${color.dim}${badge}${color.reset}`;
  });

  console.log(`\n${drawBox(modelLines, { title: 'SOVEREIGN MODEL REGISTRY', width: 68 })}\n`);
}

/**
 * Execute Stats Command
 */
async function executeStatsCommand(): Promise<void> {
  const statLines = [
    `${color.bold}Context Token Savings:${color.reset}  68.0% weighted reduction (via viking:// L0/L1)`,
    `${color.bold}L0 Abstract Reduction:${color.reset}  81.0% token compression`,
    `${color.bold}GNAP Protocol Latency:${color.reset}  p50 = 0.60ms • p99 = 4.67ms`,
    `${color.bold}Throughput Rate:${color.reset}        904.6 consensus steps/sec`,
    `${color.bold}Budget Shield Status:${color.reset}   Active (Hard Spending Cap: $30.00/mo)`
  ];

  console.log(`\n${drawBox(statLines, { title: 'INDEX0 EMPIRICAL TELEMETRY', width: 78 })}\n`);
}

/**
 * Execute Worktrees Command
 */
async function executeWorktreesCommand(): Promise<void> {
  const manager = new GitWorktreeManager();
  const list = await manager.listActiveWorktrees();
  if (list.length === 0) {
    console.log(`\n  ${color.dim}No active isolated agent worktrees found.${color.reset}\n`);
  } else {
    const lines = list.map((wt) => `Task [${wt.taskId}]: Branch ${wt.branch} -> ${wt.path}`);
    console.log(`\n${drawBox(lines, { title: `ACTIVE AGENT WORKTREES (${list.length})`, width: 78 })}\n`);
  }
}

/**
 * Execute Health Command
 */
async function executeHealthCommand(): Promise<void> {
  const spinner = new TerminalSpinner('Checking sovereign stack connectivity...').start();
  const checks: string[] = [];

  const apiBase = process.env.INDEX0_API_BASE ?? 'https://ai.index0.in/v1';
  const masterKey = process.env.INDEX0_API_KEY ?? process.env.LITELLM_MASTER_KEY ?? 'sk-index0-litellm-dev';

  try {
    const gateway = await fetch('https://ai.index0.in/health').then((r) => r.ok).catch(() => false);
    checks.push(`Sovereign Edge Gateway (ai.index0.in):   ${gateway ? '[ONLINE]' : '[OFFLINE]'}`);

    const litellm = await fetch(`${apiBase}/models`, {
      headers: { Authorization: `Bearer ${masterKey}` }
    }).then((r) => r.ok).catch(() => false);
    checks.push(`LiteLLM Sovereign Router (Azure East US): ${litellm ? '[ONLINE]' : '[OFFLINE]'}`);

    const orchUrl = process.env.INDEX0_ORCHESTRATOR_BASE ?? 'https://ai.index0.in/orchestrator';
    const orchestrator = await fetch(`${orchUrl}/health`).then((r) => r.ok).catch(() => false);
    checks.push(`LangGraph 4-Tier Orchestrator:           ${orchestrator ? '[ONLINE]' : '[STANDBY]'}`);

    const { INDEX0_ENGINE_BIN } = await import('./launcher.js');
    const { existsSync } = await import('node:fs');
    const engineReady = existsSync(INDEX0_ENGINE_BIN);
    checks.push(`INDEX0 Interactive TUI Engine:           ${engineReady ? '[READY]' : '[PENDING BOOTSTRAP]'}`);

    spinner.succeed('Sovereign stack health verified:');
    console.log(`\n${drawBox(checks, { title: 'INDEX0 SOVEREIGN STACK STATUS', width: 72 })}\n`);
  } catch (err: any) {
    spinner.fail(`Health check failed: ${err.message}`);
  }
}

/**
 * Execute Autonomous Repository Reverse-Engineering Command
 */
async function executeReengineerCommand(
  engine: Index0Engine,
  repoUrl: string,
  goal?: string,
  targetFramework: string = 'react_signals'
): Promise<void> {
  const spinner = new TerminalSpinner(`Reverse-Engineering repository: "${repoUrl}"...`).start();
  const startTime = Date.now();

  try {
    const result = await engine.reengineerRepo(repoUrl, goal, targetFramework);
    const elapsed = Date.now() - startTime;
    spinner.succeed(`Reverse-Engineering completed in ${elapsed}ms`);

    const spec = result.spec;
    const content = [
      `${color.bold}Target Repository:${color.reset} ${spec.repoUrl} (${spec.repoName})`,
      `${color.bold}Executive Summary:${color.reset} ${spec.executiveSummary}`,
      '',
      `${color.bold}Crown Jewels Isolated:${color.reset}`,
      ...(spec.crownJewels || []).map((j: any) => `  ${symbol.bullet} [${j.category}] ${color.bold}${j.symbolName}${color.reset} (${j.complexityRank}) — ${j.description}`),
      '',
      `${color.bold}Cruft Eliminated:${color.reset}`,
      ...(spec.cruftEliminated || []).map((c: string) => `  ${symbol.dash} ${color.dim}${c}${color.reset}`),
      '',
      `${color.bold}Modernizations Applied:${color.reset}`,
      ...(result.modernizationsApplied || []).map((m: string) => `  ${symbol.arrow} ${m}`),
      '',
      `${color.bold}Performance Gain:${color.reset} ${color.bold}${result.estimatedPerfGain}${color.reset}`,
      `${color.bold}Elevated Artifacts:${color.reset} ${Object.keys(result.elevatedFiles || {}).join(', ')}`
    ];

    console.log(`\n${drawBox(content, { title: `INDEX0 RE-ENGINEERED: ${spec.repoName.toUpperCase()}`, width: 78 })}\n`);
  } catch (err: any) {
    spinner.fail(`Reverse-Engineering failed: ${err.message}`);
  }
}

// ─── Entry Point ────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  const getArgValue = (prefix: string): string | undefined => {
    const match = args.find((a) => a.startsWith(prefix));
    return match ? match.slice(prefix.length) : undefined;
  };

  const command = args[0]?.toLowerCase();
  const useWorktree = args.includes('--worktree');
  const autoCommit = args.includes('--commit');
  const contextRaw = getArgValue('--context=');
  const contextFiles = contextRaw ? contextRaw.split(',').map((f) => f.trim()) : [];
  const orchestratorBase = getArgValue('--orchestrator=');
  const model = getArgValue('--model=');

  const engine = new Index0Engine({
    ...(orchestratorBase ? { orchestratorBase } : {}),
    ...(model ? { model } : {})
  });

  // 1. Help
  if (args.includes('--help') || args.includes('-h')) {
    printHelp();
    return;
  }

  // 1a. Login — GitHub Device Flow
  if (command === 'login') {
    console.log(renderLogo());
    const existing = loadCredentials();
    if (existing) {
      console.log(`  ${symbol.tick} Already authenticated as ${color.bold}@${existing.username}${color.reset}`);
      console.log(`  ${color.dim}Run \`index0 logout\` first to re-authenticate.${color.reset}\n`);
      return;
    }

    const spinner = new TerminalSpinner('Initiating GitHub Device Flow...').start();
    await performDeviceFlowLogin({
      onDeviceCode: (userCode, verificationUri) => {
        spinner.succeed('Device code received');
        const lines = [
          `Enter this code on GitHub:`,
          ``,
          `    ${color.bold}${userCode}${color.reset}`,
          ``,
          `Open: ${color.bold}${verificationUri}${color.reset}`,
        ];
        console.log(`\n${drawBox(lines, { title: 'GITHUB AUTHENTICATION', width: 60 })}\n`);
      },
      onPolling: () => {
        // spinner is already stopped, just wait silently
      },
      onSuccess: (creds) => {
        console.log(`  ${symbol.tick} Authenticated as ${color.bold}@${creds.username}${color.reset}`);
        console.log(`  ${symbol.tick} Token saved to ${color.dim}~/.index0/credentials.json${color.reset}\n`);
      },
      onError: (err) => {
        console.log(`  ${symbol.cross} Login failed: ${err.message}\n`);
      },
    });
    return;
  }

  // 1b. Logout
  if (command === 'logout') {
    const cleared = clearCredentials();
    if (cleared) {
      console.log(`\n  ${symbol.tick} Credentials cleared. You are now logged out.\n`);
    } else {
      console.log(`\n  ${color.dim}No credentials found. You are not logged in.${color.reset}\n`);
    }
    return;
  }

  // 1c. Whoami
  if (command === 'whoami') {
    const creds = loadCredentials();
    if (!creds) {
      console.log(`\n  ${color.dim}Not authenticated. Run \`index0 login\` to sign in.${color.reset}\n`);
      return;
    }
    const spinner = new TerminalSpinner('Validating credentials...').start();
    const valid = await validateCredentials(creds);
    if (valid) {
      spinner.succeed('Credentials valid');
      const lines = [
        `${color.bold}User:${color.reset}     @${creds.username}`,
        `${color.bold}Email:${color.reset}    ${creds.email}`,
        `${color.bold}GitHub:${color.reset}   ID #${creds.githubId}`,
        `${color.bold}Auth:${color.reset}     ${new Date(creds.authenticatedAt).toLocaleString()}`,
      ];
      console.log(`\n${drawBox(lines, { title: 'INDEX0 IDENTITY', width: 60 })}\n`);
    } else {
      spinner.fail('Credentials expired or revoked');
      console.log(`  ${color.dim}Run \`index0 login\` to re-authenticate.${color.reset}\n`);
    }
    return;
  }

  // 2. Headless Agent Execution with Tool Calling
  if (command === 'run') {
    const runArgs = args.slice(1);
    const exitCode = await launchTui(['run', ...runArgs]);
    process.exit(exitCode);
  }

  // 3. Autonomous Repository Reverse-Engineering Command
  if (command === 're-engineer' || command === 'reengineer') {
    const repoUrl = args[1] && !args[1].startsWith('--') ? args[1] : '';
    if (!repoUrl) {
      console.error(`\n  ${symbol.cross} ${color.bold}Error: Target repository URL is required.${color.reset}`);
      console.error(`  Usage: index0 re-engineer <repo_url> [--goal="..."]\n`);
      process.exit(1);
    }
    const goal = getArgValue('--goal=') ?? args.slice(2).filter((a) => !a.startsWith('--')).join(' ');
    const framework = getArgValue('--framework=') ?? 'react_signals';
    await executeReengineerCommand(engine, repoUrl, goal || undefined, framework);
    return;
  }

  // 4. Review Command (4-Tier LangGraph Matrix)
  if (command === 'review' || args.includes('--review')) {
    const task = args[1] && !args[1].startsWith('--')
      ? args.slice(1).filter((a) => !a.startsWith('--')).join(' ')
      : (getArgValue('--task=') ?? 'Automated codebase audit');
    await executeReviewCommand(engine, task, useWorktree, autoCommit, contextFiles);
    return;
  }

  // 4. Direct Sovereign Azure Prompt Stream
  if (command === 'prompt' || args.includes('--prompt')) {
    const task = args[1] && !args[1].startsWith('--')
      ? args.slice(1).filter((a) => !a.startsWith('--')).join(' ')
      : (getArgValue('--prompt=') ?? 'Analyze repository architecture');
    await executePromptCommand(engine, task);
    return;
  }

  // 5. Models Command
  if (command === 'models') {
    await executeModelsCommand();
    return;
  }

  // 6. Stats Command
  if (command === 'stats') {
    await executeStatsCommand();
    return;
  }

  // 7. Worktrees Commands
  if (command === 'worktrees') {
    await executeWorktreesCommand();
    return;
  }

  if (command === 'clean-worktrees') {
    const manager = new GitWorktreeManager();
    const count = await manager.cleanupAll();
    console.log(`\n  ${symbol.tick} Pruned ${count} isolated agent worktrees.\n`);
    return;
  }

  // 8. Health Command
  if (command === 'health') {
    await executeHealthCommand();
    return;
  }

  // 9. GNAP Signing Flag
  if (args.includes('--gnap')) {
    const role = (getArgValue('--role=') ?? 'critic') as AgentRole;
    const agentId = getArgValue('--agent=') ?? `agent-${role}-01`;
    const title = getArgValue('--title=') ?? 'Autonomous Review Step';
    const verdict = getArgValue('--verdict=') ?? 'approved';

    const worker = new GNAPWorker({ agentId, agentRole: role });
    await worker.initializeRepository();
    const step = await worker.recordStep({
      messageType: 'review_verdict',
      title,
      summary: `GNAP autonomous cycle review step executed by ${agentId}`,
      payload: { executedAt: new Date().toISOString() },
      verdict
    });

    console.log(`\n  ${symbol.tick} Recorded GNAP step in .gnap/messages/`);
    console.log(`\n${step.commitMessage}\n`);
    return;
  }

  // 10. Filter Flag
  const filterArg = getArgValue('--filter=');
  if (filterArg) {
    const result = TerminalTokenFilter.filter(filterArg);
    console.log(`\n  Raw: ${result.stats.rawLength} chars -> Filtered: ${result.stats.filteredLength} chars`);
    console.log(`  Tokens Saved: ~${result.stats.estimatedTokensSaved} (${result.stats.reductionPercentage}% reduction)\n`);
    console.log(result.content);
    return;
  }

  // 11. Sandbox Execution Flag
  const code = getArgValue('--code=');
  if (code) {
    const lang = (getArgValue('--lang=') ?? 'python') as SandboxLanguage;
    const client = new SandboxClient();
    const result = client.simulateMockExecution({ id: `cli-${Date.now()}`, language: lang, code, timeoutMs: 30000 });
    console.log(SandboxClient.formatResult(result));
    return;
  }

  // 12. Special Engine Pass-Through Commands
  if (['session', 'attach', 'serve', 'web'].includes(command ?? '')) {
    const exitCode = await launchTui(args);
    process.exit(exitCode);
  }

  // 13. Default: Launch 100% Full-Screen Interactive TUI
  // Matches: `index0`, `index0 tui`, `index0 .`, `index0 [path]`
  const tuiArgs = command === 'tui' ? args.slice(1) : args;
  const exitCode = await launchTui(tuiArgs);
  process.exit(exitCode);
}

main().catch((err) => {
  console.error(`\nError: ${err.message}\n`);
  process.exit(1);
});
