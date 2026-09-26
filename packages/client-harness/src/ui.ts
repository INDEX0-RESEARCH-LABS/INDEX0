/**
 * INDEX0 AI Terminal UI Styler & Component Engine — @index0/client-harness
 * 
 * Strict Monochrome Design System (Dark, White, Gray) adhering to apps/ai/DESIGN.md:
 * - High-contrast monochromatic palette (zero chromatic colors)
 * - Retro-futuristic ASCII box drawing with pixel-perfect column alignment
 * - Clean monospace data density (Cursor IDE chrome aesthetic)
 * - Universal legibility across both Dark (black background) and Light (white background) terminals
 */

import * as readline from 'node:readline';

// ─── ANSI Styling Codes (Monochrome / Adaptive) ────────────────────────────

export const color = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  italic: '\x1b[3m',
  underline: '\x1b[4m',
  inverse: '\x1b[7m',

  // Semantic mappings adhering to monochrome standard
  primary: '\x1b[1m',     // High-contrast primary (bold)
  secondary: '\x1b[0m',   // Normal text
  muted: '\x1b[2m',       // Dimmed / gray metadata
  border: '\x1b[2m',      // Hairline divider border
};

export const symbol = {
  tick: '[OK]',
  cross: '[FAIL]',
  bullet: '●',
  arrow: '❯',
  dash: '-',
  bar: '│',
};

// ─── Precise Monospace Column Width Measurement ─────────────────────────────

export function stringWidth(str: string): number {
  // Strip all ANSI escape sequences
  const clean = str.replace(/\x1b\[[0-9;?]*[a-zA-Z]/g, '');
  let width = 0;
  for (const ch of clean) {
    const cp = ch.codePointAt(0) ?? 0;
    // East Asian wide characters and emoji code points count as 2 columns
    if (
      (cp >= 0x1100 && cp <= 0x115f) ||
      (cp >= 0x2329 && cp <= 0x232a) ||
      (cp >= 0x2e80 && cp <= 0xa4cf && cp !== 0x303f) ||
      (cp >= 0xac00 && cp <= 0xd7a3) ||
      (cp >= 0xf900 && cp <= 0xfaff) ||
      (cp >= 0xfe10 && cp <= 0xfe19) ||
      (cp >= 0xfe30 && cp <= 0xfe6f) ||
      (cp >= 0xff00 && cp <= 0xff60) ||
      (cp >= 0xffe0 && cp <= 0xffe6) ||
      (cp >= 0x1f000 && cp <= 0x1f9ff)
    ) {
      width += 2;
    } else {
      width += 1;
    }
  }
  return width;
}

// ─── Block ASCII Logo (Monochrome) ──────────────────────────────────────────

export function renderLogo(): string {
  const lines = [
    '   ▄           ▄                         ▄  ',
    '   █   █▀▀▄ █▀▀█ █▀▀█ █  █ █▀▀█    █▀▀█  █  ',
    '   █   █  █ █  █ █▀▀▀  ▀▀  █/ █    █▀▀█  █  ',
    '   ▀▀  ▀  ▀ ▀▀▀▀ ▀▀▀▀ █  █ ▀▀▀▀    ▀  ▀  ▀▀ '
  ];

  const header = [
    '',
    `${color.bold}${lines.join('\n')}${color.reset}`,
    '',
    `  ${color.bold}INDEX0 AI${color.reset} ${color.dim}// Sovereign Software Engineering Operating System${color.reset}`,
    `  ${color.dim}"People Over Tools. Work Verified. Time to Unplug." 🌿${color.reset}`,
    ''
  ];

  return header.join('\n');
}

// ─── Pixel-Perfect Box Drawing ──────────────────────────────────────────────

export interface BoxOptions {
  title?: string;
  badge?: string;
  width?: number;
}

export function drawBox(lines: string[], options: BoxOptions = {}): string {
  const width = options.width ?? 78;
  const innerWidth = width - 4; // 2 border characters + 2 spaces padding

  let top = '┌─';
  if (options.title) {
    top += ` ${options.title} `;
    const badgeStr = options.badge ? ` ${options.badge} ` : '';
    const titleW = stringWidth(options.title) + 2;
    const badgeW = options.badge ? stringWidth(options.badge) + 2 : 0;
    const remainingDashes = width - 2 - 2 - titleW - badgeW;
    top += '─'.repeat(Math.max(0, remainingDashes)) + badgeStr + '─┐';
  } else {
    top += '─'.repeat(width - 2) + '┐';
  }

  const renderedLines = lines.map((line) => {
    const printableWidth = stringWidth(line);
    const pad = Math.max(0, innerWidth - printableWidth);
    return `│  ${line}${' '.repeat(pad)}│`;
  });

  const bottom = '└' + '─'.repeat(width - 2) + '┘';

  return [
    `${color.border}${top}${color.reset}`,
    ...renderedLines,
    `${color.border}${bottom}${color.reset}`
  ].join('\n');
}

// ─── Animated Terminal Spinner (Monochrome) ─────────────────────────────────

export class TerminalSpinner {
  private static frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  private frameIndex = 0;
  private intervalId: NodeJS.Timeout | null = null;
  private currentText: string;

  constructor(initialText: string) {
    this.currentText = initialText;
  }

  public start(): this {
    if (process.stdout.isTTY) {
      process.stdout.write('\x1b[?25l'); // hide cursor
      this.intervalId = setInterval(() => {
        const frame = TerminalSpinner.frames[this.frameIndex];
        this.frameIndex = (this.frameIndex + 1) % TerminalSpinner.frames.length;
        process.stdout.write(`\r${color.bold}${frame}${color.reset} ${color.dim}${this.currentText}${color.reset}\x1b[K`);
      }, 80);
    } else {
      console.log(`[..] ${this.currentText}`);
    }
    return this;
  }

  public update(text: string): void {
    this.currentText = text;
  }

  public succeed(text?: string): void {
    this.stop();
    const msg = text ?? this.currentText;
    console.log(`\r${color.bold}[OK]${color.reset} ${msg}\x1b[K`);
  }

  public fail(text?: string): void {
    this.stop();
    const msg = text ?? this.currentText;
    console.log(`\r${color.bold}[FAIL]${color.reset} ${msg}\x1b[K`);
  }

  public info(text?: string): void {
    this.stop();
    const msg = text ?? this.currentText;
    console.log(`\r${color.bold}[INFO]${color.reset} ${msg}\x1b[K`);
  }

  public stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (process.stdout.isTTY) {
      process.stdout.write('\x1b[?25h'); // show cursor
    }
  }
}

// ─── Command Table Styler (Monochrome) ──────────────────────────────────────

export interface CommandEntry {
  command: string;
  args?: string;
  description: string;
  badge?: string;
}

export function renderCommandCatalog(title: string, commands: CommandEntry[]): string {
  const lines: string[] = [
    `${color.bold}${title}:${color.reset}`
  ];

  for (const cmd of commands) {
    const cmdPart = `  ${color.bold}${cmd.command}${color.reset}${cmd.args ? ` ${cmd.args}` : ''}`;
    const rawCmdLen = stringWidth(cmd.command + (cmd.args ? ` ${cmd.args}` : '')) + 2;
    const pad = Math.max(2, 32 - rawCmdLen);
    const badgePart = cmd.badge ? `  ${color.dim}[${cmd.badge}]${color.reset}` : '';
    lines.push(`${cmdPart}${' '.repeat(pad)}${color.dim}${cmd.description}${color.reset}${badgePart}`);
  }

  return lines.join('\n');
}

// ─── Status Badge Bar (Monochrome) ──────────────────────────────────────────

export function renderStatusBar(info: {
  model: string;
  tokensSaved?: number;
  durationMs?: number;
  budgetStatus?: string;
  privacy?: string;
}): string {
  const parts: string[] = [];

  parts.push(`[Model: ${color.bold}${info.model}${color.reset}]`);

  if (info.tokensSaved !== undefined) {
    parts.push(`[Viking: ~${info.tokensSaved} tok saved]`);
  }

  if (info.durationMs !== undefined) {
    parts.push(`[Latency: ${info.durationMs}ms]`);
  }

  parts.push(`[Privacy: ${info.privacy ?? 'ZDR 100%'}]`);

  return `  ${color.dim}${parts.join(' • ')}${color.reset}`;
}

// ─── Interactive Keyboard Menu Selector ─────────────────────────────────────

export interface MenuItem {
  id: string;
  label: string;
  badge?: string;
  description?: string;
}

export async function selectMenu(
  title: string,
  items: MenuItem[],
  options: { width?: number; defaultIndex?: number } = {}
): Promise<string | null> {
  let selected = options.defaultIndex ?? 0;
  const width = options.width ?? 78;
  const innerWidth = width - 4;

  if (!process.stdin.isTTY) {
    // Non-interactive fallback (e.g. piped input or scripts)
    return items[0]?.id ?? null;
  }

  return new Promise((resolve) => {
    readline.emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);
    process.stdout.write('\x1b[?25l'); // hide cursor

    const render = (first = false) => {
      if (!first) {
        process.stdout.write(`\x1b[${items.length + 3}A\r`);
      }

      let top = '┌─';
      top += ` ${title} `;
      const titleW = stringWidth(title) + 2;
      const rem = width - 2 - 2 - titleW;
      top += '─'.repeat(Math.max(0, rem)) + '─┐';

      const lines: string[] = [];
      lines.push(`${color.border}${top}${color.reset}`);

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const isCurrent = i === selected;
        const pointer = isCurrent ? `${color.bold}❯${color.reset}` : ' ';
        const num = `${color.dim}[${i + 1}]${color.reset}`;
        const labelText = isCurrent
          ? `${color.bold}${item.label}${color.reset}`
          : `${color.secondary}${item.label}${color.reset}`;
        const descText = item.description ? `  ${color.dim}${item.description}${color.reset}` : '';
        const badgeText = item.badge ? ` ${color.dim}[${item.badge}]${color.reset}` : '';

        const fullContent = `  ${pointer} ${num} ${labelText}${badgeText}${descText}`;
        const printableW = stringWidth(fullContent);
        const pad = Math.max(0, innerWidth - printableW);
        lines.push(`│${fullContent}${' '.repeat(pad)}  │`);
      }

      const bottom = '└' + '─'.repeat(width - 2) + '┘';
      lines.push(`${color.border}${bottom}${color.reset}`);
      lines.push(`  ${color.dim}Use ↑/↓ arrows or 1-${items.length} to navigate, Enter to select, Esc to exit.${color.reset}`);

      process.stdout.write(lines.join('\n') + '\n');
    };

    render(true);

    const onKey = (chunk: string | undefined, key: readline.Key | undefined) => {
      if (!key) return;

      if (key.name === 'up' || key.name === 'k') {
        selected = (selected - 1 + items.length) % items.length;
        render(false);
      } else if (key.name === 'down' || key.name === 'j') {
        selected = (selected + 1) % items.length;
        render(false);
      } else if (key.name === 'return') {
        cleanup();
        resolve(items[selected].id);
      } else if (key.name === 'escape' || (key.ctrl && key.name === 'c')) {
        cleanup();
        resolve(null);
      } else if (chunk && /^[1-9]$/.test(chunk)) {
        const idx = Number(chunk) - 1;
        if (idx < items.length) {
          selected = idx;
          render(false);
        }
      }
    };

    const cleanup = () => {
      process.stdin.removeListener('keypress', onKey);
      process.stdin.setRawMode(false);
      process.stdout.write('\x1b[?25h'); // restore cursor
    };

    process.stdin.on('keypress', onKey);
  });
}

export async function waitForAnyKey(promptText = 'Press any key to return to cockpit...'): Promise<void> {
  if (!process.stdin.isTTY) return;
  process.stdout.write(`\n  ${color.dim}${promptText}${color.reset}`);
  return new Promise((resolve) => {
    readline.emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);
    const onKey = () => {
      process.stdin.removeListener('keypress', onKey);
      process.stdin.setRawMode(false);
      process.stdout.write('\n');
      resolve();
    };
    process.stdin.once('keypress', onKey);
  });
}

// ─── Cockpit Header & Frame (INDEX0 Style) ───────────────────────────────

export function renderCockpitHeader(options: {
  model: string;
  cwd?: string;
  width?: number;
}): string {
  const width = options.width ?? 78;
  const currentDir = options.cwd ?? process.cwd();
  const displayDir = currentDir.length > 52 ? '...' + currentDir.slice(-49) : currentDir;

  const lines = [
    `${color.bold}Workspace:${color.reset}   ${displayDir}`,
    `${color.bold}Model:${color.reset}       ${options.model} (Azure East US)    ${color.bold}Privacy:${color.reset} ZDR 100% (Memory)`,
    `${color.bold}Matrix:${color.reset}      LangGraph 4-Tier + TextGrad      ${color.bold}Edge:${color.reset}    TabbyML (<20ms)`,
    `${color.bold}Context:${color.reset}     viking:// (68%-81% Saved)        ${color.bold}Budget:${color.reset}  $30.00/mo [OK]`
  ];

  return drawBox(lines, {
    title: 'INDEX0 AI // SOVEREIGN COCKPIT',
    badge: '[CONNECTED]',
    width
  });
}

// ─── INDEX0 Footer Hints Bar ────────────────────────────────────────────────

export function renderFooterHints(_width = 78): string {
  const hints = [
    `${color.bold}[Enter]${color.reset} Send`,
    `${color.bold}[/]${color.reset} Commands`,
    `${color.bold}[@]${color.reset} Files`,
    `${color.bold}[Ctrl+P]${color.reset} Palette`,
    `${color.bold}[F2]${color.reset} Model`,
    `${color.bold}[Ctrl+L]${color.reset} Clear`,
    `${color.bold}[Ctrl+C]${color.reset} Exit`
  ];
  return `  ${color.dim}${hints.join('  •  ')}${color.reset}`;
}

// ─── Monochrome Diff Viewer ────────────────────────────────────────────────

export function renderDiffBox(diffText: string, width = 78): string {
  const lines = diffText.trim().split('\n');
  const formatted = lines.map((l) => {
    if (l.startsWith('+') && !l.startsWith('+++')) {
      return `${color.bold}${l}${color.reset}`;
    }
    if (l.startsWith('-') && !l.startsWith('---')) {
      return `${color.dim}${l}${color.reset}`;
    }
    if (l.startsWith('@@')) {
      return `${color.dim}${l}${color.reset}`;
    }
    return l;
  });

  return drawBox(formatted, {
    title: 'GENERATED AST DIFF',
    width
  });
}

// ─── Slash Commands Definition ─────────────────────────────────────────────

export interface SlashCommand {
  name: string;
  args?: string;
  description: string;
}

export const DEFAULT_SLASH_COMMANDS: SlashCommand[] = [
  { name: '/review', args: '<task>', description: 'Run 4-tier LangGraph anti-slop review matrix' },
  { name: '/prompt', args: '<task>', description: 'Stream prompt directly to Azure OpenAI via LiteLLM' },
  { name: '/models', description: 'Interactive sovereign model selector' },
  { name: '/stats', description: 'Show token reduction, viking:// metrics & spend caps' },
  { name: '/worktrees', description: 'List active isolated agent git worktrees' },
  { name: '/clean', description: 'Prune and remove all agent git worktrees' },
  { name: '/health', description: 'Verify sovereign gateway, orchestrator, and edge engine' },
  { name: '/clear', description: 'Clear terminal screen and redraw cockpit' },
  { name: '/help', description: 'Display command catalog & keybinding manual' },
  { name: '/exit', description: 'Exit cockpit session (Time to Unplug)' }
];

// ─── Interactive Prompt Composer (INDEX0 Engine) ────────────────────────────

export type PromptResult =
  | { type: 'submit'; value: string }
  | { type: 'palette' }
  | { type: 'models' }
  | { type: 'clear' }
  | { type: 'exit' };

export async function promptInteractive(options: {
  commands?: SlashCommand[];
  history?: string[];
  width?: number;
  promptPrefix?: string;
}): Promise<PromptResult> {
  const width = options.width ?? 78;
  const innerWidth = width - 4;
  const commands = options.commands ?? DEFAULT_SLASH_COMMANDS;
  const history = options.history ?? [];
  const promptPrefix = options.promptPrefix ?? 'index0 ❯ ';

  if (!process.stdin.isTTY) {
    // Non-interactive fallback
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const answer = await new Promise<string>((resolve) => {
      rl.question(promptPrefix, (ans) => {
        rl.close();
        resolve(ans);
      });
    });
    return { type: 'submit', value: answer.trim() };
  }

  return new Promise<PromptResult>((resolve) => {
    let buffer = '';
    let cursor = 0;
    let historyIdx = history.length;
    let activeSuggestions: SlashCommand[] = [];
    let selectedSuggestionIdx = 0;
    let renderedRows = 0;

    readline.emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);
    process.stdout.write('\x1b[?25h'); // show cursor

    const clearRenderedLines = () => {
      if (renderedRows > 0) {
        process.stdout.write(`\r\x1b[${renderedRows}A\x1b[0J`);
        renderedRows = 0;
      } else {
        process.stdout.write('\r\x1b[2K');
      }
    };

    const updateSuggestions = () => {
      if (buffer.startsWith('/')) {
        const query = buffer.toLowerCase();
        activeSuggestions = commands.filter((c) => c.name.toLowerCase().startsWith(query));
        if (selectedSuggestionIdx >= activeSuggestions.length) {
          selectedSuggestionIdx = 0;
        }
      } else {
        activeSuggestions = [];
        selectedSuggestionIdx = 0;
      }
    };

    const render = () => {
      clearRenderedLines();

      const outputLines: string[] = [];

      // 1. If suggestions active, render INDEX0-style dropdown box above prompt
      if (activeSuggestions.length > 0) {
        let top = '┌─ Commands ';
        const titleW = stringWidth(' Commands ') + 2;
        const rem = width - 2 - titleW;
        top += '─'.repeat(Math.max(0, rem)) + '┐';
        outputLines.push(`${color.border}${top}${color.reset}`);

        for (let i = 0; i < Math.min(6, activeSuggestions.length); i++) {
          const item = activeSuggestions[i];
          const isSelected = i === selectedSuggestionIdx;
          const pointer = isSelected ? `${color.bold}❯${color.reset}` : ' ';
          const cmdPart = isSelected
            ? `${color.bold}${item.name}${color.reset}${item.args ? ` ${item.args}` : ''}`
            : `${color.secondary}${item.name}${color.reset}${item.args ? ` ${item.args}` : ''}`;
          const rawCmdLen = stringWidth(item.name + (item.args ? ` ${item.args}` : '')) + 2;
          const pad = Math.max(2, 28 - rawCmdLen);
          const lineContent = `  ${pointer} ${cmdPart}${' '.repeat(pad)}${color.dim}${item.description}${color.reset}`;
          const pW = stringWidth(lineContent);
          const rightPad = Math.max(0, innerWidth - pW);
          outputLines.push(`│${lineContent}${' '.repeat(rightPad)}  │`);
        }

        const bottom = '└' + '─'.repeat(width - 2) + '┘';
        outputLines.push(`${color.border}${bottom}${color.reset}`);
      }

      // 2. Render Enclosed INDEX0 Prompt Box
      let promptTitle = ' Ask anything (or / for commands, @ for files, ! for shell) ';
      let promptTop = '┌─' + promptTitle;
      const titleW = stringWidth(promptTitle) + 2;
      const rem = width - 2 - titleW;
      promptTop += '─'.repeat(Math.max(0, rem)) + '┐';
      outputLines.push(`${color.border}${promptTop}${color.reset}`);

      const inputDisplay = `> ${buffer}`;
      const inputPrintW = stringWidth(inputDisplay);
      const pad = Math.max(0, innerWidth - inputPrintW);
      outputLines.push(`│  ${color.bold}> ${color.reset}${buffer}${' '.repeat(pad)}│`);

      const promptBottom = '└' + '─'.repeat(width - 2) + '┘';
      outputLines.push(`${color.border}${promptBottom}${color.reset}`);

      // Write everything out
      process.stdout.write(outputLines.join('\n'));
      renderedRows = outputLines.length - 2;

      // Position cursor precisely on the prompt line (1 line above bottom border)
      const cursorTargetCol = 4 + cursor + 1;
      process.stdout.write(`\x1b[1A\r\x1b[${cursorTargetCol}C`);
    };

    render();

    const cleanup = () => {
      process.stdin.removeListener('keypress', onKey);
      process.stdin.setRawMode(false);
      clearRenderedLines();
    };

    const onKey = (chunk: string | undefined, key: readline.Key | undefined) => {
      if (!key) {
        if (chunk) {
          buffer = buffer.slice(0, cursor) + chunk + buffer.slice(cursor);
          cursor += chunk.length;
          updateSuggestions();
          render();
        }
        return;
      }

      // Ctrl+C: Cancel input or exit
      if (key.ctrl && key.name === 'c') {
        if (buffer.length > 0) {
          buffer = '';
          cursor = 0;
          updateSuggestions();
          render();
        } else {
          cleanup();
          process.stdout.write('\n');
          resolve({ type: 'exit' });
        }
        return;
      }

      // Ctrl+D: Exit
      if (key.ctrl && key.name === 'd') {
        cleanup();
        process.stdout.write('\n');
        resolve({ type: 'exit' });
        return;
      }

      // Ctrl+P: Command Palette
      if (key.ctrl && key.name === 'p') {
        cleanup();
        process.stdout.write('\n');
        resolve({ type: 'palette' });
        return;
      }

      // F2: Model Switcher
      if (key.name === 'f2') {
        cleanup();
        process.stdout.write('\n');
        resolve({ type: 'models' });
        return;
      }

      // Ctrl+L: Clear Screen
      if (key.ctrl && key.name === 'l') {
        cleanup();
        resolve({ type: 'clear' });
        return;
      }

      // Enter
      if (key.name === 'return') {
        if (activeSuggestions.length > 0 && selectedSuggestionIdx < activeSuggestions.length) {
          const chosen = activeSuggestions[selectedSuggestionIdx];
          if (chosen.args) {
            buffer = chosen.name + ' ';
            cursor = buffer.length;
            updateSuggestions();
            render();
            return;
          }
          cleanup();
          process.stdout.write(`\r${promptPrefix}${chosen.name}\n`);
          resolve({ type: 'submit', value: chosen.name });
          return;
        }

        cleanup();
        process.stdout.write(`\r${promptPrefix}${buffer}\n`);
        resolve({ type: 'submit', value: buffer });
        return;
      }

      // Tab: Autocomplete current suggestion
      if (key.name === 'tab') {
        if (activeSuggestions.length > 0 && selectedSuggestionIdx < activeSuggestions.length) {
          const chosen = activeSuggestions[selectedSuggestionIdx];
          buffer = chosen.name + (chosen.args ? ' ' : '');
          cursor = buffer.length;
          updateSuggestions();
          render();
        }
        return;
      }

      // Esc: Dismiss suggestions
      if (key.name === 'escape') {
        if (activeSuggestions.length > 0) {
          activeSuggestions = [];
          render();
        } else {
          cleanup();
          process.stdout.write('\n');
          resolve({ type: 'exit' });
        }
        return;
      }

      // Arrow Up
      if (key.name === 'up') {
        if (activeSuggestions.length > 0) {
          selectedSuggestionIdx =
            (selectedSuggestionIdx - 1 + activeSuggestions.length) % activeSuggestions.length;
          render();
        } else if (history.length > 0 && historyIdx > 0) {
          historyIdx--;
          buffer = history[historyIdx];
          cursor = buffer.length;
          updateSuggestions();
          render();
        }
        return;
      }

      // Arrow Down
      if (key.name === 'down') {
        if (activeSuggestions.length > 0) {
          selectedSuggestionIdx = (selectedSuggestionIdx + 1) % activeSuggestions.length;
          render();
        } else if (historyIdx < history.length - 1) {
          historyIdx++;
          buffer = history[historyIdx];
          cursor = buffer.length;
          updateSuggestions();
          render();
        } else if (historyIdx === history.length - 1) {
          historyIdx = history.length;
          buffer = '';
          cursor = 0;
          updateSuggestions();
          render();
        }
        return;
      }

      // Arrow Left
      if (key.name === 'left') {
        if (cursor > 0) {
          cursor--;
          render();
        }
        return;
      }

      // Arrow Right
      if (key.name === 'right') {
        if (cursor < buffer.length) {
          cursor++;
          render();
        }
        return;
      }

      // Home
      if (key.name === 'home') {
        cursor = 0;
        render();
        return;
      }

      // End
      if (key.name === 'end') {
        cursor = buffer.length;
        render();
        return;
      }

      // Backspace
      if (key.name === 'backspace') {
        if (cursor > 0) {
          buffer = buffer.slice(0, cursor - 1) + buffer.slice(cursor);
          cursor--;
          updateSuggestions();
          render();
        }
        return;
      }

      // Delete
      if (key.name === 'delete') {
        if (cursor < buffer.length) {
          buffer = buffer.slice(0, cursor) + buffer.slice(cursor + 1);
          updateSuggestions();
          render();
        }
        return;
      }

      // Normal printable text input
      if (chunk && !key.ctrl && !key.meta) {
        buffer = buffer.slice(0, cursor) + chunk + buffer.slice(cursor);
        cursor += chunk.length;
        updateSuggestions();
        render();
      }
    };

    process.stdin.on('keypress', onKey);
  });
}



