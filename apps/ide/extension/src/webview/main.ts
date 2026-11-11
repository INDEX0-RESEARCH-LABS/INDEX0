// INDEX0 Webview — Cursor-style agent chat panel
// Runs inside VS Code's webview sandbox, communicates via postMessage.

declare function acquireVsCodeApi(): {
  postMessage(msg: unknown): void;
  getState(): unknown;
  setState(state: unknown): void;
};

const vscode = acquireVsCodeApi();

// ─── State ──────────────────────────────────────────────────────────────────

type MsgRole = 'user' | 'assistant' | 'system' | 'architect' | 'developer' | 'critic' | 'qa';

interface ChatMessage {
  id: string;
  role: MsgRole;
  content: string;
  diff?: string;
  testOutput?: string;
  passed?: boolean;
  iteration?: number;
  timestamp: number;
  isStreaming?: boolean;
}

interface Step {
  role: string;
  action: string;
  status: 'pending' | 'running' | 'done' | 'failed';
  summary?: string;
}

interface AppState {
  messages: ChatMessage[];
  steps: Step[];
  status: 'idle' | 'running' | 'done' | 'error';
  currentTask: string;
}

let state: AppState = { messages: [], steps: [], status: 'idle', currentTask: '' };

// ─── Utils ───────────────────────────────────────────────────────────────────

const uid = () => Math.random().toString(36).slice(2, 10);

function escHtml(s: string): string {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function formatDiff(diff: string): string {
  if (!diff.trim()) return '';
  const lines = diff.split('\n').map(line => {
    if (line.startsWith('+++') || line.startsWith('---')) return `<span class="diff-meta">${escHtml(line)}</span>`;
    if (line.startsWith('@@')) return `<span class="diff-hunk">${escHtml(line)}</span>`;
    if (line.startsWith('+')) return `<span class="diff-add">${escHtml(line)}</span>`;
    if (line.startsWith('-')) return `<span class="diff-del">${escHtml(line)}</span>`;
    return `<span class="diff-ctx">${escHtml(line)}</span>`;
  });
  return `<div class="diff-block"><pre>${lines.join('\n')}</pre></div>`;
}

function formatTestOutput(output: string): string {
  if (!output.trim()) return '';
  const lines = output.split('\n').slice(0, 20);
  const html = lines.map(l => {
    if (l.includes('ok ') || l.includes('pass') || l.match(/✔|passed/)) return `<span class="test-pass">${escHtml(l)}</span>`;
    if (l.includes('not ok') || l.includes('fail') || l.match(/✖|failed/)) return `<span class="test-fail">${escHtml(l)}</span>`;
    return `<span class="test-info">${escHtml(l)}</span>`;
  });
  return `<div class="test-output"><pre>${html.join('\n')}</pre></div>`;
}

function roleIcon(role: MsgRole): string {
  const icons: Record<MsgRole, string> = {
    user: '▸', assistant: '◆', system: '⊕',
    architect: '◈', developer: '⌥', critic: '◉', qa: '✓'
  };
  return icons[role] ?? '◆';
}

function roleLabel(role: MsgRole): string {
  const labels: Record<MsgRole, string> = {
    user: 'You', assistant: 'INDEX0', system: 'System',
    architect: 'Architect', developer: 'Developer', critic: 'Critic', qa: 'QA'
  };
  return labels[role] ?? role;
}

// ─── Render ──────────────────────────────────────────────────────────────────

function render() {
  const app = document.getElementById('app')!;
  app.innerHTML = `
    <div class="chat-container">
      <div class="chat-header">
        <div class="header-logo">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <polygon points="12,2 2,7 12,12 22,7" fill="var(--accent)"/>
            <polyline points="2,17 12,22 22,17" stroke="var(--accent)" stroke-width="2" fill="none"/>
            <polyline points="2,12 12,17 22,12" stroke="var(--accent)" stroke-width="2" fill="none" opacity="0.6"/>
          </svg>
          <span class="header-title">INDEX0</span>
        </div>
        <div class="header-status ${state.status}">
          ${state.status === 'running' ? '<span class="spinner"></span>' : ''}
          <span>${state.status === 'running' ? 'Running…' : state.status === 'done' ? '✓ Done' : state.status === 'error' ? '✕ Error' : 'Ready'}</span>
        </div>
      </div>

      ${state.messages.length === 0 ? renderEmpty() : ''}

      <div class="messages" id="messages">
        ${state.messages.map(renderMessage).join('')}
      </div>

      ${state.steps.length > 0 && state.status === 'running' ? renderSteps() : ''}

      <div class="input-area">
        <div class="input-row">
          <textarea
            id="task-input"
            placeholder="Ask INDEX0 to fix, build, or explain anything…"
            rows="3"
            ${state.status === 'running' ? 'disabled' : ''}
          ></textarea>
        </div>
        <div class="input-footer">
          <div class="input-hints">
            <kbd>Enter</kbd> send &nbsp;·&nbsp; <kbd>Shift+Enter</kbd> newline
          </div>
          <button class="run-btn ${state.status === 'running' ? 'running' : ''}"
            id="run-btn"
            ${state.status === 'running' ? 'disabled' : ''}>
            ${state.status === 'running'
              ? '<span class="spinner-sm"></span> Running'
              : '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg> Run'}
          </button>
        </div>
      </div>
    </div>
  `;

  // Bind events
  const textarea = document.getElementById('task-input') as HTMLTextAreaElement;
  const runBtn = document.getElementById('run-btn') as HTMLButtonElement;

  textarea?.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendTask(textarea.value.trim());
    }
  });

  runBtn?.addEventListener('click', () => {
    sendTask(textarea?.value.trim() ?? '');
  });

  // Bind apply diff buttons
  document.querySelectorAll('.apply-diff-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const diff = (btn as HTMLElement).dataset.diff ?? '';
      vscode.postMessage({ type: 'applyDiff', payload: { diff } });
    });
  });

  // Scroll to bottom
  const msgs = document.getElementById('messages');
  if (msgs) msgs.scrollTop = msgs.scrollHeight;
}

function renderEmpty(): string {
  return `
    <div class="empty-state">
      <div class="empty-logo">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
          <polygon points="12,2 2,7 12,12 22,7" fill="var(--accent)" opacity="0.9"/>
          <polyline points="2,17 12,22 22,17" stroke="var(--accent)" stroke-width="1.5" fill="none"/>
          <polyline points="2,12 12,17 22,12" stroke="var(--accent)" stroke-width="1.5" fill="none" opacity="0.5"/>
        </svg>
      </div>
      <div class="empty-title">INDEX0 AI</div>
      <div class="empty-sub">People Over Tools. Work Verified.</div>
      <div class="empty-hints">
        <div class="hint-row"><kbd>Ctrl+Shift+I</kbd> Run agent on selection</div>
        <div class="hint-row">Type below to fix, build, or explain</div>
      </div>
    </div>
  `;
}

function renderMessage(msg: ChatMessage): string {
  const isUser = msg.role === 'user';
  return `
    <div class="message ${isUser ? 'message-user' : 'message-agent'} ${msg.isStreaming ? 'streaming' : ''}">
      <div class="message-header">
        <span class="role-badge role-${msg.role}">${roleIcon(msg.role)} ${roleLabel(msg.role)}</span>
        ${msg.passed !== undefined ? `<span class="result-badge ${msg.passed ? 'pass' : 'fail'}">${msg.passed ? '✓ Tests passed' : '✕ Failed'}</span>` : ''}
        ${msg.iteration !== undefined ? `<span class="iteration-badge">${msg.iteration} iter</span>` : ''}
      </div>
      <div class="message-body">
        ${msg.content ? `<div class="message-text">${formatContent(msg.content)}</div>` : ''}
        ${msg.diff ? `
          <div class="diff-section">
            <div class="section-label">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
              Proposed changes
              <button class="apply-diff-btn" data-diff="${escHtml(msg.diff)}">Apply</button>
            </div>
            ${formatDiff(msg.diff)}
          </div>
        ` : ''}
        ${msg.testOutput ? `
          <div class="test-section">
            <div class="section-label">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
              Test results
            </div>
            ${formatTestOutput(msg.testOutput)}
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

function formatContent(text: string): string {
  // Code blocks
  let html = escHtml(text);
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  html = html.replace(/\n/g, '<br>');
  return html;
}

function renderSteps(): string {
  return `
    <div class="steps-track">
      ${state.steps.map(s => `
        <div class="step step-${s.status}">
          <div class="step-dot"></div>
          <div class="step-info">
            <span class="step-role">${s.role}</span>
            <span class="step-action">${s.action}</span>
            ${s.summary ? `<span class="step-summary">${escHtml(s.summary.slice(0, 60))}</span>` : ''}
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

// ─── Actions ─────────────────────────────────────────────────────────────────

function sendTask(task: string) {
  if (!task || state.status === 'running') return;

  state.messages.push({ id: uid(), role: 'user', content: task, timestamp: Date.now() });
  state.status = 'running';
  state.currentTask = task;
  state.steps = [
    { role: 'architect', action: 'Analysing task…', status: 'running' },
    { role: 'developer', action: 'Waiting', status: 'pending' },
    { role: 'critic', action: 'Waiting', status: 'pending' },
    { role: 'qa', action: 'Waiting', status: 'pending' },
  ];

  vscode.postMessage({ type: 'runTask', payload: { task, contextFiles: [] } });
  render();

  // Clear textarea
  const ta = document.getElementById('task-input') as HTMLTextAreaElement;
  if (ta) ta.value = '';
}

// ─── Message handler ─────────────────────────────────────────────────────────

window.addEventListener('message', (event: MessageEvent) => {
  const msg = event.data as { type: string; payload?: unknown };

  if (msg.type === 'init') {
    render();
    return;
  }

  if (msg.type === 'cycleStart') {
    state.status = 'running';
    render();
    return;
  }

  if (msg.type === 'cycleProgress') {
    const { message } = msg.payload as { message: string };
    // Update steps based on role keywords
    if (message.toLowerCase().includes('architect')) {
      state.steps[0] = { ...state.steps[0], status: 'running', summary: message };
    } else if (message.toLowerCase().includes('developer')) {
      state.steps[0].status = 'done';
      state.steps[1] = { ...state.steps[1], status: 'running', summary: message };
    } else if (message.toLowerCase().includes('critic')) {
      state.steps[1].status = 'done';
      state.steps[2] = { ...state.steps[2], status: 'running', summary: message };
    } else if (message.toLowerCase().includes('qa')) {
      state.steps[2].status = 'done';
      state.steps[3] = { ...state.steps[3], status: 'running', summary: message };
    }
    render();
    return;
  }

  if (msg.type === 'cycleDone') {
    const result = msg.payload as {
      status: string; iteration: number; passed: boolean;
      testOutput: string; diff: string; criticComments: string;
      history: Array<{ role: string; action: string; summary?: string; decision?: string }>;
    };

    // Mark all steps done
    state.steps = state.steps.map(s => ({ ...s, status: 'done' as const }));

    // Build history messages from actual cycle history
    if (result.history?.length) {
      for (const h of result.history) {
        const role = h.role as MsgRole;
        let content = h.summary ?? h.action ?? '';
        if (h.decision) content += ` → ${h.decision}`;
        if (content) {
          state.messages.push({ id: uid(), role, content, timestamp: Date.now() });
        }
      }
    }

    // Final result message
    if (result.passed) {
      state.messages.push({
        id: uid(), role: 'qa',
        content: `Tests passed in ${result.iteration} iteration${result.iteration === 1 ? '' : 's'}.`,
        diff: result.diff,
        testOutput: result.testOutput,
        passed: true,
        iteration: result.iteration,
        timestamp: Date.now(),
      });
    } else {
      state.messages.push({
        id: uid(), role: 'assistant',
        content: `Cycle ended with status: ${result.status}${result.criticComments ? '\n\nCritic: ' + result.criticComments.slice(0, 200) : ''}`,
        passed: false,
        timestamp: Date.now(),
      });
    }

    state.status = result.passed ? 'done' : 'error';
    state.steps = [];
    render();
    return;
  }

  if (msg.type === 'cycleError') {
    const { message } = msg.payload as { message: string };
    state.messages.push({
      id: uid(), role: 'assistant',
      content: `Error: ${message}`,
      passed: false,
      timestamp: Date.now(),
    });
    state.status = 'error';
    state.steps = [];
    render();
    return;
  }
});

// ─── Boot ─────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  render();
  vscode.postMessage({ type: 'ready' });
});
