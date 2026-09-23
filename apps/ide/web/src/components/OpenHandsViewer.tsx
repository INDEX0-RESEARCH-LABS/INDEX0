/**
 * OpenHands Embedded Workbench — @index0/ide-web
 * Integrates OpenHands All-in-One Autonomous Agent Workbench via Caddy API Gateway (port 8000),
 * supporting multi-provider LLM profile selection, live health probes, and system guardrail injection.
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  ExternalLink,
  RefreshCw,
  Bot,
  ShieldCheck,
  AlertCircle,
  Cpu,
  FileText,
  Copy,
  Check,
  ChevronDown,
  X,
  Sparkles
} from 'lucide-react';
import {
  OpenHandsService,
  MANDATORY_GUARDRAILS,
  type ILLMProfile
} from '../services/openhandsClient.js';

export interface IOpenHandsViewerProps {
  gatewayUrl?: string;
  workspacePath?: string;
  className?: string;
  initialProfileId?: string;
}

export const OpenHandsViewer: React.FC<IOpenHandsViewerProps> = ({
  gatewayUrl = 'http://localhost:8000',
  workspacePath = '/opt/workspace_base',
  className = '',
  initialProfileId = 'anthropic-claude'
}) => {
  const service = useMemo(() => new OpenHandsService(), []);
  const profilesConfig = service.getProfiles();

  const [selectedProfileId, setSelectedProfileId] = useState<string>(initialProfileId);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isGuardrailsModalOpen, setIsGuardrailsModalOpen] = useState(false);
  const [isPromptDrawerOpen, setIsPromptDrawerOpen] = useState(false);
  const [quickPrompt, setQuickPrompt] = useState('');
  const [hasCopiedPrompt, setHasCopiedPrompt] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [gatewayStatus, setGatewayStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  const targetUrl = gatewayUrl.replace(/\/$/, '');
  const activeProfile: ILLMProfile = profilesConfig.profiles[selectedProfileId] || service.getDefaultProfile().profile;

  // Probe Gateway & OpenHands health on mount or URL change
  useEffect(() => {
    let isMounted = true;
    setGatewayStatus('checking');

    service.checkGatewayHealth(gatewayUrl).then((isHealthy) => {
      if (isMounted) {
        setGatewayStatus(isHealthy ? 'online' : 'offline');
      }
    });

    return () => {
      isMounted = false;
    };
  }, [service, gatewayUrl, reloadKey]);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleReload = () => {
    setIsLoading(true);
    setLoadError(false);
    setReloadKey((prev) => prev + 1);
  };

  const handleOpenExternal = () => {
    if (typeof window !== 'undefined') {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleCopyFormattedPrompt = () => {
    if (!quickPrompt.trim()) return;
    const formatted = service.formatAgentPrompt(quickPrompt);
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(formatted);
      setHasCopiedPrompt(true);
      setTimeout(() => setHasCopiedPrompt(false), 2000);
    }
  };

  return (
    <div
      className={`index0-openhands-viewer ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        background: '#0a0c14',
        overflow: 'hidden'
      }}
      data-testid="openhands-viewer"
    >
      {/* Top OpenHands Integration Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 16px',
          background: '#121524',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          fontSize: '0.75rem',
          color: '#e2e8f0'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Bot size={16} color="#f54e00" />
            <strong>INDEX0 AI Agent Canvas</strong>
            <span
              style={{
                background: 'rgba(245, 78, 0, 0.15)',
                color: '#f54e00',
                border: '1px solid rgba(245, 78, 0, 0.3)',
                borderRadius: '3px',
                padding: '0 5px',
                fontSize: '0.62rem',
                fontWeight: 700
              }}
            >
              v1.0.0
            </span>
          </div>

          <span style={{ color: '#64748b' }}>|</span>

          {/* Gateway Health Indicator */}
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: gatewayStatus === 'online' ? '#34d399' : gatewayStatus === 'checking' ? '#fbbf24' : '#f87171'
            }}
          >
            <ShieldCheck size={13} />
            <span>
              {gatewayStatus === 'online'
                ? 'Gateway Connected (Port 8000)'
                : gatewayStatus === 'checking'
                ? 'Probing Gateway...'
                : 'Gateway Offline'}
            </span>
          </span>

          <span style={{ color: '#64748b' }}>|</span>

          {/* Active LLM Profile Selector Dropdown */}
          <div ref={profileDropdownRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '4px',
                padding: '3px 8px',
                color: '#e2e8f0',
                fontSize: '0.7rem',
                cursor: 'pointer'
              }}
              title="Select LLM Inference Profile"
              data-testid="profile-selector-btn"
            >
              <Cpu size={12} color="#a78bfa" />
              <span>Model:</span>
              <strong>{activeProfile.model.split('/').pop() || activeProfile.model}</strong>
              {activeProfile.is_local && (
                <span
                  style={{
                    background: 'rgba(16, 185, 129, 0.2)',
                    color: '#34d399',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    borderRadius: '3px',
                    padding: '0 4px',
                    fontSize: '0.6rem',
                    fontWeight: 700
                  }}
                >
                  LOCAL
                </span>
              )}
              <ChevronDown size={11} color="#94a3b8" />
            </button>

            {isProfileDropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 4px)',
                  left: 0,
                  width: '320px',
                  background: '#121524',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '6px',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
                  zIndex: 100,
                  padding: '6px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}
              >
                <div style={{ fontSize: '0.65rem', color: '#64748b', padding: '4px 6px', fontWeight: 600 }}>
                  MULTI-PROVIDER LLM PROFILES (infra/openhands/llm-profiles.json)
                </div>
                {Object.entries(profilesConfig.profiles).map(([id, p]) => (
                  <button
                    key={id}
                    onClick={() => {
                      setSelectedProfileId(id);
                      setIsProfileDropdownOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      textAlign: 'left',
                      padding: '6px 8px',
                      background: id === selectedProfileId ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                      border: id === selectedProfileId ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid transparent',
                      borderRadius: '4px',
                      color: '#e2e8f0',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.72rem' }}>{id}</span>
                      {p.is_local ? (
                        <span style={{ color: '#34d399', fontSize: '0.62rem', fontWeight: 700 }}>SOVEREIGN LOCAL</span>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '0.62rem' }}>CLOUD API</span>
                      )}
                    </div>
                    <span style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '2px' }}>
                      {p.recommended_for}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Toolbar Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setIsGuardrailsModalOpen(true)}
            title="Inspect workspace architectural guardrails"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '4px',
              color: '#cbd5e1',
              padding: '4px 8px',
              fontSize: '0.7rem',
              cursor: 'pointer'
            }}
          >
            <FileText size={12} color="#38bdf8" /> Guardrails
          </button>

          <button
            onClick={() => setIsPromptDrawerOpen(!isPromptDrawerOpen)}
            title="Open Task Prompt Dispatcher"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: 'rgba(99, 102, 241, 0.15)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              borderRadius: '4px',
              color: '#a5b4fc',
              padding: '4px 8px',
              fontSize: '0.7rem',
              cursor: 'pointer'
            }}
          >
            <Sparkles size={12} /> Prompt Launcher
          </button>

          <button
            onClick={handleReload}
            title="Reload OpenHands session"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '4px',
              color: '#cbd5e1',
              padding: '4px 8px',
              fontSize: '0.7rem',
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={12} className={isLoading ? 'spin' : ''} /> Reload
          </button>

          <button
            onClick={handleOpenExternal}
            title="Open in new browser tab"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: 'var(--accent-primary, #6366f1)',
              border: 'none',
              borderRadius: '4px',
              color: '#fff',
              padding: '4px 8px',
              fontSize: '0.7rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <ExternalLink size={12} /> Fullscreen
          </button>
        </div>
      </div>

      {/* Quick Prompt Dispatcher Drawer */}
      {isPromptDrawerOpen && (
        <div
          style={{
            background: '#161a2e',
            borderBottom: '1px solid rgba(99, 102, 241, 0.3)',
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
          data-testid="prompt-launcher-drawer"
        >
          <div style={{ flex: 1 }}>
            <input
              type="text"
              value={quickPrompt}
              onChange={(e) => setQuickPrompt(e.target.value)}
              placeholder="Dispatch task with injected .openhands_instructions guardrails (e.g. 'Implement math tests')..."
              style={{
                width: '100%',
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '4px',
                padding: '6px 10px',
                color: '#fff',
                fontSize: '0.75rem',
                outline: 'none'
              }}
            />
          </div>

          <button
            onClick={handleCopyFormattedPrompt}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              background: hasCopiedPrompt ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '4px',
              color: hasCopiedPrompt ? '#34d399' : '#e2e8f0',
              padding: '6px 12px',
              fontSize: '0.72rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {hasCopiedPrompt ? <Check size={12} /> : <Copy size={12} />}
            <span>{hasCopiedPrompt ? 'Copied with Guardrails!' : 'Copy Guardrail Prompt'}</span>
          </button>

          <button
            onClick={() => setIsPromptDrawerOpen(false)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer'
            }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Embedded Iframe Container */}
      <div style={{ position: 'relative', flex: 1, width: '100%', minHeight: 0 }}>
        {isLoading && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#0a0c14',
              zIndex: 10,
              color: '#94a3b8',
              gap: '12px'
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                border: '3px solid rgba(56, 189, 248, 0.2)',
                borderTopColor: '#38bdf8',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite'
              }}
            />
            <div style={{ fontSize: '0.85rem' }}>
              Connecting to INDEX0 AI Agent Canvas on port 8000 ({activeProfile.model})...
            </div>
          </div>
        )}

        {loadError && (
          <div
            style={{
              position: 'absolute',
              top: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#1c1917',
              border: '1px solid #ef4444',
              borderRadius: '8px',
              padding: '16px 24px',
              color: '#f87171',
              zIndex: 20,
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              maxWidth: '500px'
            }}
          >
            <AlertCircle size={24} />
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>INDEX0 Agent Canvas Offline</div>
              <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '4px' }}>
                Ensure container <code>index0-openhands</code> / <code>index0-agent-canvas</code> is active via:
                <br />
                <code>docker compose -f infra/compose/docker-compose.yml up -d openhands</code>
              </div>
            </div>
          </div>
        )}

        <iframe
          key={reloadKey}
          ref={iframeRef}
          src={targetUrl}
          title="INDEX0 AI Autonomous Agent Canvas"
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setLoadError(true);
          }}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            background: '#0a0c14'
          }}
          allow="clipboard-read; clipboard-write"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
        />
      </div>

      {/* System Guardrails Modal */}
      {isGuardrailsModalOpen && (
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
          onClick={() => setIsGuardrailsModalOpen(false)}
        >
          <div
            style={{
              width: '540px',
              background: '#121524',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '8px',
              padding: '20px',
              color: '#e2e8f0',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)'
            }}
            onClick={(e) => e.stopPropagation()}
            data-testid="guardrails-modal"
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={18} color="#34d399" />
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>
                  Autonomous Agent Guardrails (workspace/.openhands_instructions)
                </h3>
              </div>
              <button
                onClick={() => setIsGuardrailsModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            </div>

            <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '0 0 14px 0' }}>
              OpenHands runs inside local containers with mounted workspace <code>{workspacePath}</code> adhering to:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {MANDATORY_GUARDRAILS.map((rule, idx) => (
                <div
                  key={rule}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 10px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '4px',
                    fontSize: '0.75rem'
                  }}
                >
                  <span
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: 'rgba(99, 102, 241, 0.2)',
                      color: '#a5b4fc',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.65rem',
                      fontWeight: 700
                    }}
                  >
                    {idx + 1}
                  </span>
                  <span style={{ fontWeight: 600 }}>{rule}</span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setIsGuardrailsModalOpen(false)}
                style={{
                  background: 'var(--accent-primary, #6366f1)',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '6px 14px',
                  color: '#fff',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const Index0AgentCanvas = OpenHandsViewer;
