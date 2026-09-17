import React, { useState } from 'react';
import { Explorer, type IWorkspaceFileNode } from '../components/Explorer.js';
import { Editor, type IEditorTab } from '../components/Editor.js';
import { AgentPanel, type IToolInvocation } from '../components/AgentPanel.js';
import { TerminalViewer, type ITerminalLine } from '../terminal/TerminalViewer.js';
import { UserNav } from '../components/UserNav.js';
import { OpenHandsViewer } from '../components/OpenHandsViewer.js';
import { MCPToolsPanel } from '../components/MCPToolsPanel.js';
import type { IAgentPlanStep, IAgentMessagePayload, AgentRunStatus } from '@index0/contracts';
import { GitBranch, Layers, ShieldCheck, Play, Bot, Code2, Wrench } from 'lucide-react';

export interface IWorkbenchProps {
  initialFiles?: IWorkspaceFileNode[];
  initialTabs?: IEditorTab[];
  initialMode?: 'workbench' | 'openhands';
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
  initialMode = 'workbench',
  workspaceId = 'ws-main-dev',
  projectName = 'index0-core',
  className = ''
}) => {
  const [viewMode, setViewMode] = useState<'workbench' | 'openhands'>(initialMode);
  const [showMcpPanel, setShowMcpPanel] = useState(false);
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
      output: 'Sovereign E2B MicroVM active on index0-net (Port 4001 via Gateway 8000)'
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

        {/* View Mode Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0, 0, 0, 0.3)', borderRadius: '6px', padding: '2px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <button
            onClick={() => setViewMode('workbench')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '4px 10px',
              borderRadius: '4px',
              border: 'none',
              background: viewMode === 'workbench' ? 'var(--accent-primary, #6366f1)' : 'transparent',
              color: viewMode === 'workbench' ? '#fff' : '#94a3b8',
              fontSize: '0.72rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <Code2 size={13} />
            <span>INDEX0 Editor</span>
          </button>
          <button
            onClick={() => setViewMode('openhands')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '4px 10px',
              borderRadius: '4px',
              border: 'none',
              background: viewMode === 'openhands' ? 'var(--accent-primary, #6366f1)' : 'transparent',
              color: viewMode === 'openhands' ? '#fff' : '#94a3b8',
              fontSize: '0.72rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <Bot size={13} />
            <span>OpenHands Agent</span>
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#34d399' }}>
            <ShieldCheck size={14} />
            <span>Gateway Connected (8000)</span>
          </div>

          <button
            onClick={() => setShowMcpPanel(!showMcpPanel)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: showMcpPanel ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.05)',
              border: showMcpPanel ? '1px solid var(--accent-primary, #6366f1)' : '1px solid rgba(255, 255, 255, 0.1)',
              color: showMcpPanel ? '#a5b4fc' : '#e2e8f0',
              borderRadius: '4px',
              padding: '4px 8px',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
            title="Inspect registered MCP tools & sandbox boundaries"
            data-testid="mcp-tools-toggle-btn"
          >
            <Wrench size={12} color="#818cf8" />
            <span>MCP Tools</span>
          </button>

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

          {/* User Nav and Profile */}
          <UserNav />
        </div>
      </div>

      {/* Main Viewport: Either OpenHands Embedded Viewer or Native 3-Pane Body */}
      {viewMode === 'openhands' ? (
        <OpenHandsViewer gatewayUrl="http://localhost:8000" workspacePath="/opt/workspace_base" />
      ) : (
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
      )}

      {/* MCP Tools Modal Overlay */}
      {showMcpPanel && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={() => setShowMcpPanel(false)}
        >
          <div
            style={{
              width: '780px',
              maxWidth: '90vw',
              height: '620px',
              maxHeight: '90vh',
              background: '#0a0c14',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <MCPToolsPanel onClose={() => setShowMcpPanel(false)} />
          </div>
        </div>
      )}
    </div>
  );
};
