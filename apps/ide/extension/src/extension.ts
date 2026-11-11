import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

// ─── Message types (extension ↔ webview) ───────────────────────────────────

export interface ToWebview {
  type: 'cycleStart' | 'cycleProgress' | 'cycleDone' | 'cycleError' | 'init';
  payload?: unknown;
}

export interface FromWebview {
  type: 'runTask' | 'applyDiff' | 'ready';
  payload?: unknown;
}

// ─── Orchestrator client ────────────────────────────────────────────────────

function orchUrl(): string {
  return vscode.workspace.getConfiguration('index0').get<string>('orchestratorUrl', 'http://localhost:8000');
}

async function runCycle(
  task: string,
  contextFiles: string[],
  repoRoot: string,
  onProgress: (msg: string) => void
): Promise<{
  status: string; iteration: number; passed: boolean;
  testOutput: string; diff: string; criticComments: string;
  history: Array<{ role: string; action: string; summary?: string; decision?: string }>;
}> {
  const controller = new AbortController();
  const tid = setTimeout(() => controller.abort(), 180_000);

  try {
    const res = await fetch(`${orchUrl()}/cycles/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Client': 'index0-vscode' },
      body: JSON.stringify({
        taskId: `vscode-${Date.now().toString(36)}`,
        userPrompt: task,
        repositoryRoot: repoRoot,
        contextFiles,
        maxIterations: 5,
      }),
      signal: controller.signal,
    });

    if (!res.ok) throw new Error(`Orchestrator HTTP ${res.status}: ${res.statusText}`);
    const c = await res.json() as {
      status: string; iteration: number;
      architecturePlan?: string;
      implementationDiff?: string;
      criticVerdict?: { decision: string; comments: string; findings?: unknown[] };
      qaResults?: { passed: boolean; testOutput?: string; tests_passed?: number; tests_failed?: number; duration_ms?: number; sandboxMode?: string };
      history?: Array<{ role: string; action: string; summary?: string; decision?: string }>;
    };

    return {
      status: c.status,
      iteration: c.iteration,
      passed: c.qaResults?.passed ?? false,
      testOutput: c.qaResults?.testOutput ?? '',
      diff: c.implementationDiff ?? '',
      criticComments: c.criticVerdict?.comments ?? '',
      history: c.history ?? [],
    };
  } finally {
    clearTimeout(tid);
  }
}

// ─── Webview HTML factory ───────────────────────────────────────────────────

function getWebviewHtml(webview: vscode.Webview, extensionUri: vscode.Uri): string {
  const scriptUri = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, 'dist', 'webview.js')
  );
  const nonce = crypto.randomUUID().replace(/-/g, '');
  return /* html */`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<meta http-equiv="Content-Security-Policy"
  content="default-src 'none';
           script-src 'nonce-${nonce}';
           style-src ${webview.cspSource} 'unsafe-inline';
           img-src ${webview.cspSource} data:;
           connect-src http://localhost:* https:;"/>
<title>INDEX0</title>
</head>
<body>
<div id="root"></div>
<script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
}

// ─── Sidebar panel provider ─────────────────────────────────────────────────

class Index0SidebarProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView;

  constructor(private readonly _extensionUri: vscode.Uri) {}

  resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.joinPath(this._extensionUri, 'dist')],
    };
    webviewView.webview.html = getWebviewHtml(webviewView.webview, this._extensionUri);

    webviewView.webview.onDidReceiveMessage(async (msg: FromWebview) => {
      if (msg.type === 'ready') {
        this._send({ type: 'init', payload: { orchestratorUrl: orchUrl() } });
      }
      if (msg.type === 'runTask') {
        const { task, contextFiles } = msg.payload as { task: string; contextFiles: string[] };
        await this._runTask(task, contextFiles);
      }
      if (msg.type === 'applyDiff') {
        const { diff } = msg.payload as { diff: string };
        await applyDiff(diff);
      }
    });
  }

  async runTaskFromCommand(task: string) {
    const contextFiles = getOpenFiles();
    await this._runTask(task, contextFiles);
    this._view?.show?.(true);
  }

  private async _runTask(task: string, contextFiles: string[]) {
    const repoRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? '.';
    this._send({ type: 'cycleStart', payload: { task, contextFiles, repoRoot } });

    try {
      const result = await runCycle(task, contextFiles, repoRoot, (msg) => {
        this._send({ type: 'cycleProgress', payload: { message: msg } });
      });
      this._send({ type: 'cycleDone', payload: result });

      if (result.passed) {
        const action = await vscode.window.showInformationMessage(
          `✅ INDEX0: Tests passed (${result.iteration} iteration${result.iteration === 1 ? '' : 's'})`,
          'Apply Diff', 'Dismiss'
        );
        if (action === 'Apply Diff' && result.diff) {
          await applyDiff(result.diff);
        }
      } else {
        vscode.window.showWarningMessage(`⚠️ INDEX0: Cycle finished — status: ${result.status}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this._send({ type: 'cycleError', payload: { message: msg } });
      vscode.window.showErrorMessage(`INDEX0: ${msg}`);
    }
  }

  private _send(msg: ToWebview) {
    this._view?.webview.postMessage(msg);
  }
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function getOpenFiles(): string[] {
  const root = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (!root) return [];
  return vscode.workspace.textDocuments
    .filter(d => !d.isUntitled && d.uri.scheme === 'file' && d.uri.fsPath.startsWith(root))
    .map(d => path.relative(root, d.uri.fsPath))
    .slice(0, 10);
}

async function applyDiff(diff: string) {
  const root = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (!root || !diff.trim()) return;

  // Parse unified diff and apply changes file by file
  const fileBlocks = diff.split(/^diff --git /m).filter(Boolean);
  for (const block of fileBlocks) {
    const toMatch = block.match(/^\+\+\+ b\/(.+)$/m);
    if (!toMatch) continue;
    const relPath = toMatch[1];
    const absPath = path.join(root, relPath);
    const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(absPath)).catch(() => null);
    if (!doc) continue;

    // Extract added lines from the diff hunk (simple apply: replace file content)
    const lines = block.split('\n');
    const newLines: string[] = [];
    let inHunk = false;
    for (const line of lines) {
      if (line.startsWith('@@')) { inHunk = true; continue; }
      if (!inHunk) continue;
      if (line.startsWith('+')) { newLines.push(line.slice(1)); continue; }
      if (line.startsWith('-')) continue;
      newLines.push(line.slice(1));
    }

    const edit = new vscode.WorkspaceEdit();
    edit.replace(doc.uri, new vscode.Range(0, 0, doc.lineCount, 0), newLines.join('\n'));
    await vscode.workspace.applyEdit(edit);
    await vscode.window.showTextDocument(doc, { preview: false });
  }
  vscode.window.showInformationMessage('INDEX0: Diff applied to workspace.');
}

// ─── Activation ─────────────────────────────────────────────────────────────

export function activate(context: vscode.ExtensionContext) {
  const provider = new Index0SidebarProvider(context.extensionUri);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('index0.agentPanel', provider, {
      webviewOptions: { retainContextWhenHidden: true },
    })
  );

  // Command: run on selected text / input box
  context.subscriptions.push(
    vscode.commands.registerCommand('index0.startAgentRun', async () => {
      const editor = vscode.window.activeTextEditor;
      const selected = editor?.document.getText(editor.selection).trim();
      const task = await vscode.window.showInputBox({
        prompt: 'What should INDEX0 fix or build?',
        value: selected || '',
        placeHolder: 'e.g. Fix divide(a,b) to throw RangeError when b is 0',
      });
      if (!task) return;
      await provider.runTaskFromCommand(task);
    })
  );

  // Command: run on current file with quick description
  context.subscriptions.push(
    vscode.commands.registerCommand('index0.runOnCurrentFile', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return vscode.window.showWarningMessage('Open a file first.');
      const root = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? '.';
      const rel = path.relative(root, editor.document.uri.fsPath);
      const task = await vscode.window.showInputBox({
        prompt: `Task for ${rel}`,
        placeHolder: 'Describe what to fix or implement',
      });
      if (!task) return;
      await provider.runTaskFromCommand(task);
    })
  );

  // Status bar
  const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBar.text = '$(sparkle) INDEX0';
  statusBar.tooltip = 'Run INDEX0 Agent (Ctrl+Shift+I)';
  statusBar.command = 'index0.startAgentRun';
  statusBar.show();
  context.subscriptions.push(statusBar);
}

export function deactivate() {}
