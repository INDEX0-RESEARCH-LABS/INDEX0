import React, { useState } from 'react';
import { Explorer, type IWorkspaceFileNode } from '../components/Explorer.js';
import { Editor, type IEditorTab } from '../components/Editor.js';
import { AgentPanel, type IToolInvocation } from '../components/AgentPanel.js';
import { TerminalViewer, type ITerminalLine } from '../terminal/TerminalViewer.js';
import {
  DEMO_FILES,
  DEMO_TABS,
  DEMO_TERMINAL_LINES,
  DEMO_PLAN_STEPS,
  DEMO_AGENT_MESSAGES,
  DEMO_TOOL_CALLS
} from './demoFixtures.js';
import { UserNav } from '../components/UserNav.js';

import { MCPToolsPanel } from '../components/MCPToolsPanel.js';
import { TelemetryUsagePanel } from '../components/TelemetryUsagePanel.js';
import { SubscriptionPlanModal } from '../components/SubscriptionPlanModal.js';
import { VoiceAgentModal } from '../components/VoiceAgentModal.js';
import { PhoneVerificationModal } from '../components/PhoneVerificationModal.js';

// Orchestrator URL — set VITE_ORCHESTRATOR_URL to override in dev or production.
const ORCHESTRATOR_URL = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_ORCHESTRATOR_URL)
  || 'http://localhost:8000';
import type { IAgentPlanStep, IAgentMessagePayload, AgentRunStatus } from '@index0/contracts';
import { GitBranch, Layers, ShieldCheck, Play, Wrench, Activity, CreditCard, Mic, Smartphone } from 'lucide-react';

export interface IWorkbenchProps {
  initialFiles?: IWorkspaceFileNode[];
  initialTabs?: IEditorTab[];
  initialMode?: 'workbench';
  workspaceId?: string;
  projectName?: string;
  className?: string;
  // When true, the workbench renders the demo fixtures and simulates an agent.
  // Production workbenches must leave this false (default): they start empty and
  // never fabricate agent responses. See demoFixtures.ts.
  demo?: boolean;
}

export const Workbench: React.FC<IWorkbenchProps> = ({
  initialFiles,
  initialTabs,
  workspaceId = 'ws-main-dev',
  projectName = 'index0-core',
  className = '',
  demo = false
}) => {
  // Production defaults are EMPTY. Demo fixtures are opt-in via `demo`.
  const resolvedFiles = initialFiles ?? (demo ? DEMO_FILES : []);
  const resolvedTabs = initialTabs ?? (demo ? DEMO_TABS : []);

  const [showMcpPanel, setShowMcpPanel] = useState(false);
  const [showTelemetryPanel, setShowTelemetryPanel] = useState(false);
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [verifiedPhone, setVerifiedPhone] = useState<string | null>(null);
  const [currentPlanCode, setCurrentPlanCode] = useState('plan_free');
  const [theme, _setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('index0_theme');
      if (saved === 'light' || saved === 'dark') return saved;
      const htmlTheme = document.documentElement.getAttribute('data-theme');
      if (htmlTheme === 'light' || htmlTheme === 'dark') return htmlTheme;
    }
    return 'dark';
  });
  const [files] = useState<IWorkspaceFileNode[]>(resolvedFiles);
  const [tabs, setTabs] = useState<IEditorTab[]>(resolvedTabs);
  const [activeTabPath, setActiveTabPath] = useState<string>(resolvedTabs[0]?.path || '');
  const [showDiff, setShowDiff] = useState(false);

  // Terminal state. Production starts empty; demo seeds a status line.
  const [terminalLines, setTerminalLines] = useState<ITerminalLine[]>(demo ? DEMO_TERMINAL_LINES : []);

  // Agent state. Production starts empty; no simulated plan/messages/tool calls.
  const [planSteps, setPlanSteps] = useState<IAgentPlanStep[]>(demo ? DEMO_PLAN_STEPS : []);
  const [agentMessages, setAgentMessages] = useState<IAgentMessagePayload[]>(demo ? DEMO_AGENT_MESSAGES : []);
  const toolCalls: IToolInvocation[] = demo ? DEMO_TOOL_CALLS : [];

  const [agentStatus, setAgentStatus] = useState<AgentRunStatus>(demo ? 'running' : 'pending');

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
    if (!demo) {
      // Production: call the real orchestrator. Fail visibly if unreachable.
      setAgentStatus('running');
      setTerminalLines((prev) => [
        ...prev,
        {
          id: `term-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          command: `agent run --task "${text.slice(0, 40)}..."`,
          output: `[INDEX0] Dispatching to orchestrator at ${ORCHESTRATOR_URL} …`
        }
      ]);

      fetch(`${ORCHESTRATOR_URL}/cycles/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: `web-${Date.now().toString(36)}`,
          userPrompt: text,
          repositoryRoot: workspaceId,
          contextFiles: [],
          maxIterations: 3
        }),
        signal: AbortSignal.timeout(180_000)
      })
        .then((res) => {
          if (!res.ok) throw new Error(`Orchestrator HTTP ${res.status}`);
          return res.json() as Promise<{
            cycleId: string;
            status: string;
            iteration: number;
            criticVerdict?: { decision: string; comments: string };
            qaResults?: { passed: boolean; testOutput?: string };
            history: Array<{ role: string; action?: string; decision?: string }>;
            implementationDiff?: string;
          }>;
        })
        .then((cycle) => {
          const passed = cycle.qaResults?.passed ?? false;
          const verdict = cycle.criticVerdict?.decision ?? cycle.status;
          const output = [
            `[INDEX0] Cycle ${cycle.cycleId} complete — ${cycle.status} (${cycle.iteration} iteration${cycle.iteration === 1 ? '' : 's'})`,
            `[INDEX0] Critic: ${verdict}`,
            cycle.qaResults?.testOutput
              ? `[QA] ${cycle.qaResults.testOutput.split('\n').slice(0, 3).join(' | ')}`
              : '[QA] No test output',
          ].join('\n');

          setTerminalLines((prev) => [
            ...prev,
            {
              id: `term-${Date.now()}`,
              timestamp: new Date().toLocaleTimeString(),
              command: 'cycle complete',
              output
            }
          ]);
          setAgentMessages((prev) => [
            ...prev,
            {
              role: 'assistant' as const,
              content: passed
                ? `✅ Cycle complete — tests passed (${cycle.iteration} iteration${cycle.iteration === 1 ? '' : 's'}).\n\n${cycle.implementationDiff ? `Diff applied:\n\`\`\`\n${cycle.implementationDiff.slice(0, 400)}\n\`\`\`` : ''}`
                : `⚠️ Cycle finished but QA did not pass. Status: ${cycle.status}.\n${cycle.qaResults?.testOutput ?? ''}`
            }
          ]);
          setAgentStatus(passed ? 'completed' : 'failed');
        })
        .catch((err: Error) => {
          const msg = err.name === 'TimeoutError'
            ? `[ERROR] Orchestrator timed out after 3 minutes.`
            : `[ERROR] Orchestrator unreachable at ${ORCHESTRATOR_URL}: ${err.message}.\nStart it with: ./demo/run-demo.sh --no-start`;
          setTerminalLines((prev) => [
            ...prev,
            {
              id: `term-${Date.now()}`,
              timestamp: new Date().toLocaleTimeString(),
              command: 'cycle error',
              output: msg
            }
          ]);
          setAgentMessages((prev) => [...prev, { role: 'assistant' as const, content: msg }]);
          setAgentStatus('failed');
        });
      return;
    }
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
            onClick={() => setShowTelemetryPanel(!showTelemetryPanel)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: showTelemetryPanel ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255, 255, 255, 0.05)',
              border: showTelemetryPanel ? '1px solid var(--accent-cyan, #38bdf8)' : '1px solid rgba(255, 255, 255, 0.1)',
              color: showTelemetryPanel ? '#38bdf8' : '#e2e8f0',
              borderRadius: '4px',
              padding: '4px 8px',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
            title="Inspect real-time token usage, cost estimations & ClickHouse metrics"
            data-testid="telemetry-panel-toggle-btn"
          >
            <Activity size={12} color="#38bdf8" />
            <span>Telemetry</span>
          </button>

          <button
            onClick={() => setShowBillingModal(!showBillingModal)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: showBillingModal ? 'rgba(245, 158, 11, 0.25)' : 'rgba(255, 255, 255, 0.05)',
              border: showBillingModal ? '1px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.1)',
              color: showBillingModal ? '#fbbf24' : '#e2e8f0',
              borderRadius: '4px',
              padding: '4px 8px',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
            title="View sovereign subscription tiers, quotas & Lago rating engine"
            data-testid="subscription-plan-toggle-btn"
          >
            <CreditCard size={12} color="#f59e0b" />
            <span>Plans</span>
          </button>

          <button
            onClick={() => setShowVoiceModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: showVoiceModal ? 'rgba(245, 78, 0, 0.25)' : 'rgba(255, 255, 255, 0.05)',
              border: showVoiceModal ? '1px solid #f54e00' : '1px solid rgba(255, 255, 255, 0.1)',
              color: showVoiceModal ? '#f54e00' : '#e2e8f0',
              borderRadius: '4px',
              padding: '4px 8px',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
            title="Start real-time WebRTC voice session (<100ms LiveKit SFU)"
            data-testid="voice-modal-toggle-btn"
          >
            <Mic size={12} color="#f54e00" />
            <span>Voice Agent</span>
          </button>

          <button
            onClick={() => setShowPhoneModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: phoneVerified ? 'rgba(52, 211, 153, 0.15)' : 'rgba(99, 102, 241, 0.15)',
              border: phoneVerified ? '1px solid rgba(52, 211, 153, 0.4)' : '1px solid rgba(99, 102, 241, 0.4)',
              color: phoneVerified ? '#34d399' : '#a5b4fc',
              borderRadius: '4px',
              padding: '4px 8px',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
            title="Anchor sovereign identity to a unique mobile phone number"
            data-testid="phone-verify-toggle-btn"
          >
            <Smartphone size={12} color={phoneVerified ? "#34d399" : "#818cf8"} />
            <span>{phoneVerified ? (verifiedPhone ? `📱 ${verifiedPhone}` : '📱 Verified Phone') : '📱 Verify Mobile'}</span>
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

      {/* Telemetry & Usage Modal Overlay */}
      {showTelemetryPanel && (
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
          onClick={() => setShowTelemetryPanel(false)}
          data-testid="telemetry-modal-overlay"
        >
          <div
            style={{
              width: '920px',
              maxWidth: '92vw',
              height: '680px',
              maxHeight: '92vh',
              background: '#0a0c14',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <TelemetryUsagePanel onClose={() => setShowTelemetryPanel(false)} />
          </div>
        </div>
      )}

      {/* Subscription & Lago Rating Modal Overlay */}
      {showBillingModal && (
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
          onClick={() => setShowBillingModal(false)}
          data-testid="subscription-modal-overlay"
        >
          <div
            style={{
              width: '980px',
              maxWidth: '95vw',
              height: '720px',
              maxHeight: '92vh',
              background: '#0a0c14',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '10px',
              overflow: 'hidden',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.85)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <SubscriptionPlanModal
              currentPlanCode={currentPlanCode}
              onSelectPlan={(plan) => setCurrentPlanCode(plan)}
              onClose={() => setShowBillingModal(false)}
            />
          </div>
        </div>
      )}

      {/* Real-Time LiveKit WebRTC Voice Agent Modal */}
      <VoiceAgentModal
        isOpen={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
        theme={theme}
        onDispatchToOrchestrator={(prompt) => {
          handleSendMessage(prompt);
        }}
      />

      {/* Sovereign Phone Verification & Anti-Sybil Modal */}
      {showPhoneModal && (
        <PhoneVerificationModal
          isOpen={showPhoneModal}
          initialPhoneNumber={verifiedPhone || '+91'}
          onVerified={(num) => {
            setPhoneVerified(true);
            setVerifiedPhone(num);
          }}
          onClose={() => setShowPhoneModal(false)}
        />
      )}
    </div>
  );
};
