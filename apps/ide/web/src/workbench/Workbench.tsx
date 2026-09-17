import React, { useState } from 'react';
import { Explorer, type IWorkspaceFileNode } from '../components/Explorer.js';
import { Editor, type IEditorTab } from '../components/Editor.js';
import { AgentPanel, type IToolInvocation } from '../components/AgentPanel.js';
import { TerminalViewer, type ITerminalLine } from '../terminal/TerminalViewer.js';
import type { IAgentPlanStep, IAgentMessagePayload, AgentRunStatus } from '@index0/contracts';
import { GitBranch, Layers, ShieldCheck, Play } from 'lucide-react';

export interface IWorkbenchProps {
  initialFiles?: IWorkspaceFileNode[];
  initialTabs?: IEditorTab[];
  workspaceId?: string;
  projectName?: string;
  className?: string;
}

const DEFAULT_FILES: IWorkspaceFileNode[] = [
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

const DEFAULT_TABS: IEditorTab[] = [
  {
    path: '/src/index.ts',
    name: 'index.ts',
    content: `import { add, multiply } from "./math.js";\n\nconsole.log("INDEX0 AI Workspace Online");\nconsole.log("add(2, 3) =", add(2, 3));\n`
  }
];

export const Workbench: React.FC<IWorkbenchProps> = ({
  initialFiles = DEFAULT_FILES,
  initialTabs = DEFAULT_TABS,
  workspaceId = 'ws-main-dev',
  projectName = 'index0-core',
  className = ''
}) => {
  const [files] = useState<IWorkspaceFileNode[]>(initialFiles);
  const [tabs, setTabs] = useState<IEditorTab[]>(initialTabs);
  const [activeTabPath, setActiveTabPath] = useState<string>(initialTabs[0]?.path || '');
  const [showDiff, setShowDiff] = useState(false);

  // Terminal state
  const [terminalLines, setTerminalLines] = useState<ITerminalLine[]>([
    {
      id: 'term-init',
      timestamp: new Date().toLocaleTimeString(),
      command: 'index0 runtime status',
      output: 'Sovereign E2B MicroVM active on index0-net (Port 4001 via Gateway 8080)'
    }
  ]);

  // Agent state
  const [planSteps, setPlanSteps] = useState<IAgentPlanStep[]>([
    { id: 'step-1', title: 'Inspect workspace and math specifications', status: 'completed' },
    { id: 'step-2', title: 'Verify math utilities implementation in src/math.ts', status: 'in_progress' },
    { id: 'step-3', title: 'Run sandbox verification test suite', status: 'pending' }
  ]);

  const [agentMessages, setAgentMessages] = useState<IAgentMessagePayload[]>([
    {
      role: 'system',
      content: 'INDEX0 Autonomous Agent runtime initialized. Awaiting developer tasks.'
    },
    {
      role: 'assistant',
      content: 'I have analyzed the workspace structure. Let me know when to verify src/math.ts.'
    }
  ]);

  const [toolCalls] = useState<IToolInvocation[]>([
    {
      callId: 'call-001',
      tool: 'read_workspace_file',
      parameters: { path: '/src/math.ts' },
      result: { lines: 25, status: 'valid' }
    }
  ]);

  const [agentStatus, setAgentStatus] = useState<AgentRunStatus>('running');

  // File open handling
  const handleSelectFile = (path: string) => {
    const existing = tabs.find((t) => t.path === path);
    if (!existing) {
      const name = path.split('/').pop() || path;
      const newTab: IEditorTab = {
        path,
        name,
        content: `// Content for ${path}\n`
      };
      setTabs([...tabs, newTab]);
    }
    setActiveTabPath(path);
  };

  const handleCloseTab = (path: string) => {
    const filtered = tabs.filter((t) => t.path !== path);
    setTabs(filtered);
    if (activeTabPath === path && filtered.length > 0) {
      setActiveTabPath(filtered[0].path);
    }
  };

  const handleChangeContent = (path: string, newContent: string) => {
    setTabs(tabs.map((t) => (t.path === path ? { ...t, content: newContent, isDirty: true } : t)));
  };

  const handleSendMessage = (text: string) => {
    setAgentMessages((prev) => [...prev, { role: 'user', content: text }]);
    setTimeout(() => {
      setAgentMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Acknowledged: "${text}". Dispatching microVM execution workflow.`
        }
      ]);
      setTerminalLines((prev) => [
        ...prev,
        {
          id: `term-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          command: `agent execute --task "${text.slice(0, 20)}..."`,
          output: `[AGENT EVENT] Execution workflow started on ${workspaceId}`
        }
      ]);
    }, 300);
  };

  const handleConfirmStep = (stepId: string) => {
    setPlanSteps((prev) => {
      const updated = prev.map((step) =>
        step.id === stepId ? { ...step, status: 'completed' as const } : step
      );
      if (updated.every((s) => s.status === 'completed')) {
        setAgentStatus('completed');
      }
      return updated;
    });
    setTerminalLines((prev) => [
      ...prev,
      {
        id: `term-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        command: `agent confirm step ${stepId}`,
        output: `Step "${stepId}" approved by developer.`
      }
    ]);
  };

  return (
    <div className={`index0-workbench-container ${className}`} data-testid="workbench-container">
      {/* Top Navigation / Breadcrumbs Bar */}
      <div className="index0-workbench-topbar">
        <div className="index0-workbench-breadcrumbs">
          <Layers size={15} color="var(--accent-cyan)" />
          <strong>{projectName}</strong>
          <span>/</span>
          <span>{workspaceId}</span>
          <span style={{ marginLeft: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <GitBranch size={12} />
            <span style={{ color: '#fff' }}>main</span>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#34d399' }}>
            <ShieldCheck size={14} />
            <span>Gateway Connected (8080)</span>
          </div>

          <button
            onClick={() => handleSendMessage('Run test suite in sandbox')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'var(--accent-primary, #6366f1)',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              padding: '4px 10px',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <Play size={11} /> Run Agent Task
          </button>
        </div>
      </div>

      {/* Main 3-Pane Body */}
      <div className="index0-workbench-body">
        {/* Left Explorer */}
        <Explorer
          files={files}
          activeFilePath={activeTabPath}
          onSelectFile={handleSelectFile}
        />

        {/* Center Viewport (Editor + Bottom Terminal) */}
        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ flex: 1, minHeight: 0 }}>
            <Editor
              tabs={tabs}
              activeTabPath={activeTabPath}
              onSelectTab={setActiveTabPath}
              onCloseTab={handleCloseTab}
              onChangeContent={handleChangeContent}
              showDiff={showDiff}
              onToggleDiff={() => setShowDiff(!showDiff)}
              diffOriginalContent="// Original verified implementation\nexport function add(a, b) { return a + b; }\n"
            />
          </div>

          <div style={{ height: '200px', borderTop: '1px solid var(--border-subtle)' }}>
            <TerminalViewer
              title="INDEX0 Agent & Sandbox Terminal"
              lines={terminalLines}
              onClear={() => setTerminalLines([])}
            />
          </div>
        </div>

        {/* Right Agent Panel */}
        <AgentPanel
          planSteps={planSteps}
          messages={agentMessages}
          toolCalls={toolCalls}
          status={agentStatus}
          isStreaming={agentStatus === 'running'}
          onSendMessage={handleSendMessage}
          onConfirmStep={handleConfirmStep}
        />
      </div>
    </div>
  );
};
