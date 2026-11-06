// Demo-only fixtures for the INDEX0 web workbench.
//
// These exist to make the workbench render something useful in a demo or a
// screenshot. They are NOT production data and must never be the default for a
// real workspace: a production Workbench starts empty and is populated by the
// orchestrator (see Workbench.tsx `demo` prop).
//
// Nothing in this module may be imported by production code paths other than
// the explicit `demo === true` branch.

import type { IWorkspaceFileNode } from '../components/Explorer.js';
import type { IEditorTab } from '../components/Editor.js';
import type { IAgentPlanStep, IAgentMessagePayload } from '@index0/contracts';
import type { IToolInvocation } from '../components/AgentPanel.js';
import type { ITerminalLine } from '../terminal/TerminalViewer.js';

export const DEMO_FILES: IWorkspaceFileNode[] = [
  {
    id: 'root-src',
    name: 'src',
    path: '/src',
    type: 'directory',
    children: [
      { id: 'file-index', name: 'index.ts', path: '/src/index.ts', type: 'file' },
      { id: 'file-math', name: 'math.ts', path: '/src/math.ts', type: 'file' }
    ]
  },
  { id: 'file-pkg', name: 'package.json', path: '/package.json', type: 'file' },
  { id: 'file-readme', name: 'README.md', path: '/README.md', type: 'file' }
];

export const DEMO_TABS: IEditorTab[] = [
  {
    path: '/src/index.ts',
    name: 'index.ts',
    content: `import { add, multiply } from "./math.js";\n\nconsole.log("INDEX0 AI Workspace Online");\nconsole.log("add(2, 3) =", add(2, 3));\n`
  }
];

export const DEMO_TERMINAL_LINES: ITerminalLine[] = [
  {
    id: 'term-init',
    timestamp: new Date().toLocaleTimeString(),
    command: 'index0 runtime status',
    output: 'Sovereign E2B MicroVM active on index0-net (Port 4001 via Gateway 8000)'
  }
];

export const DEMO_PLAN_STEPS: IAgentPlanStep[] = [
  { id: 'step-1', title: 'Inspect workspace and math specifications', status: 'completed' },
  { id: 'step-2', title: 'Verify math utilities implementation in src/math.ts', status: 'in_progress' },
  { id: 'step-3', title: 'Run sandbox verification test suite', status: 'pending' }
];

export const DEMO_AGENT_MESSAGES: IAgentMessagePayload[] = [
  {
    role: 'system',
    content: 'INDEX0 Autonomous Agent runtime initialized. Awaiting developer tasks.'
  },
  {
    role: 'assistant',
    content: 'I have analyzed the workspace structure. Let me know when to verify src/math.ts.'
  }
];

export const DEMO_TOOL_CALLS: IToolInvocation[] = [
  {
    callId: 'call-001',
    tool: 'read_workspace_file',
    parameters: { path: '/src/math.ts' },
    result: { lines: 25, status: 'valid' }
  }
];
