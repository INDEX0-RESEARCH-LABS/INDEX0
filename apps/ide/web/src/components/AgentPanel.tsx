import React, { useState } from 'react';
import type {
  IAgentPlanStep,
  IAgentMessagePayload,
  AgentRunStatus
} from '@index0/contracts';
import {
  Bot,
  User,
  Send,
  CheckCircle2,
  Clock,
  AlertCircle,
  Wrench,
  Radio,
  Check,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export interface IToolInvocation {
  callId: string;
  tool: string;
  parameters: Record<string, unknown>;
  result?: unknown;
  isError?: boolean;
}

export interface IAgentPanelProps {
  planSteps: IAgentPlanStep[];
  messages: IAgentMessagePayload[];
  toolCalls?: IToolInvocation[];
  status?: AgentRunStatus;
  isStreaming?: boolean;
  onSendMessage: (content: string) => void;
  onConfirmStep?: (stepId: string) => void;
  className?: string;
}

export const AgentPanel: React.FC<IAgentPanelProps> = ({
  planSteps,
  messages,
  toolCalls = [],
  status = 'pending',
  isStreaming = false,
  onSendMessage,
  onConfirmStep,
  className = ''
}) => {
  const [inputPrompt, setInputPrompt] = useState('');
  const [expandedTools, setExpandedTools] = useState<Record<string, boolean>>({});

  const handleSend = () => {
    if (!inputPrompt.trim()) return;
    onSendMessage(inputPrompt.trim());
    setInputPrompt('');
  };

  const toggleTool = (callId: string) => {
    setExpandedTools((prev) => ({ ...prev, [callId]: !prev[callId] }));
  };

  const getStepStatusIcon = (stepStatus: IAgentPlanStep['status']) => {
    switch (stepStatus) {
      case 'completed':
        return <CheckCircle2 size={14} color="#10b981" />;
      case 'in_progress':
        return <Clock size={14} color="#06b6d4" className="index0-pulse-dot" />;
      case 'failed':
        return <AlertCircle size={14} color="#ef4444" />;
      default:
        return <Clock size={14} color="#64748b" />;
    }
  };

  return (
    <div className={`index0-agent-panel ${className}`} data-testid="agent-panel">
      {/* Panel Header */}
      <div className="index0-panel-titlebar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Bot size={15} color="var(--accent-primary, #6366f1)" />
          <span>INDEX0 Autonomous Agent</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {isStreaming && (
            <span className="index0-badge index0-badge-warning" style={{ fontSize: '0.65rem' }}>
              <Radio size={10} />
              RUNNING
            </span>
          )}
          <span className="index0-badge index0-badge-neutral" style={{ fontSize: '0.65rem' }}>
            {status}
          </span>
        </div>
      </div>

      {/* Plan Stepper Section */}
      {planSteps.length > 0 && (
        <div
          style={{
            padding: '12px 14px',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'rgba(0,0,0,0.2)'
          }}
          data-testid="agent-plan-section"
        >
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
            Execution Plan ({planSteps.filter((s) => s.status === 'completed').length}/{planSteps.length})
          </div>

          <div style={{ maxHeight: '160px', overflowY: 'auto' }}>
            {planSteps.map((step) => (
              <div
                key={step.id}
                className={`index0-plan-step ${step.status}`}
                data-testid={`plan-step-${step.id}`}
              >
                <span style={{ marginTop: '2px' }}>{getStepStatusIcon(step.status)}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500 }}>{step.title}</div>
                  {step.description && (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>{step.description}</div>
                  )}
                </div>

                {step.status === 'in_progress' && onConfirmStep && (
                  <button
                    onClick={() => onConfirmStep(step.id)}
                    style={{
                      background: 'var(--color-success)',
                      color: '#000',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '2px 6px',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2px'
                    }}
                    title="Confirm and complete step"
                  >
                    <Check size={10} /> Approve
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tool Calls Viewport */}
      {toolCalls.length > 0 && (
        <div style={{ padding: '8px 14px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
            Active Tool Invocations
          </div>
          {toolCalls.map((tool) => {
            const isExpanded = !!expandedTools[tool.callId];
            return (
              <div key={tool.callId} className="index0-tool-card">
                <div
                  onClick={() => toggleTool(tool.callId)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-cyan)' }}>
                    <Wrench size={12} />
                    <span>{tool.tool}</span>
                  </div>
                  {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </div>

                {isExpanded && (
                  <div style={{ marginTop: '6px', fontSize: '0.7rem', color: '#94a3b8' }}>
                    <div>Params: {JSON.stringify(tool.parameters)}</div>
                    {tool.result !== undefined && (
                      <div style={{ color: tool.isError ? '#f87171' : '#34d399', marginTop: '4px' }}>
                        Result: {JSON.stringify(tool.result)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Message Chat Feed */}
      <div
        style={{
          flex: 1,
          padding: '12px 14px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}
        data-testid="agent-chat-feed"
      >
        {messages.map((msg, i) => {
          const isUser = msg.role === 'user';
          const isSystem = msg.role === 'system';

          return (
            <div
              key={i}
              style={{
                display: 'flex',
                gap: '8px',
                alignItems: 'flex-start',
                alignSelf: isUser ? 'flex-end' : 'flex-start',
                maxWidth: '90%'
              }}
            >
              {!isUser && (
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: isSystem ? 'rgba(255,255,255,0.1)' : 'rgba(99, 102, 241, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Bot size={14} color={isSystem ? '#94a3b8' : '#818cf8'} />
                </div>
              )}

              <div
                style={{
                  background: isUser ? 'var(--accent-primary, #6366f1)' : 'rgba(255,255,255,0.05)',
                  color: '#fff',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  lineHeight: 1.5,
                  wordBreak: 'break-word',
                  border: isUser ? 'none' : '1px solid var(--border-subtle)'
                }}
              >
                {msg.content}
              </div>

              {isUser && (
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: 'rgba(16, 185, 129, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <User size={14} color="#34d399" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Prompt Input */}
      <div
        style={{
          padding: '10px 14px',
          borderTop: '1px solid var(--border-subtle)',
          background: 'rgba(10, 12, 20, 0.9)'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(0,0,0,0.4)',
            borderRadius: '6px',
            padding: '6px 10px',
            border: '1px solid var(--border-subtle)'
          }}
        >
          <input
            type="text"
            placeholder="Instruct the autonomous agent..."
            value={inputPrompt}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#fff',
              fontSize: '0.8rem',
              flex: 1
            }}
          />
          <button
            onClick={handleSend}
            disabled={!inputPrompt.trim()}
            style={{
              background: 'var(--accent-primary, #6366f1)',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              padding: '6px',
              cursor: inputPrompt.trim() ? 'pointer' : 'not-allowed',
              opacity: inputPrompt.trim() ? 1 : 0.5,
              display: 'flex',
              alignItems: 'center'
            }}
            title="Send instruction"
          >
            <Send size={12} />
          </button>
        </div>
      </div>
    </div>
  );
};
