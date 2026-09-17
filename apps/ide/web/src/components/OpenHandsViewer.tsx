/**
 * OpenHands Embedded Workbench — @index0/ide-web
 * Integrates OpenHands All-in-One Autonomous Agent Workbench via Caddy API Gateway (port 8000).
 */

import React, { useState, useRef } from 'react';
import { ExternalLink, RefreshCw, Bot, ShieldCheck, AlertCircle } from 'lucide-react';

export interface IOpenHandsViewerProps {
  gatewayUrl?: string;
  workspacePath?: string;
  className?: string;
}

export const OpenHandsViewer: React.FC<IOpenHandsViewerProps> = ({
  gatewayUrl = 'http://localhost:8000',
  workspacePath = '/opt/workspace_base',
  className = ''
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const targetUrl = gatewayUrl.replace(/\/$/, '');

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
      {/* OpenHands Integration Toolbar */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Bot size={16} color="#38bdf8" />
          <strong>OpenHands Autonomous Agent Runtime</strong>
          <span style={{ color: '#64748b' }}>|</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#34d399' }}>
            <ShieldCheck size={13} />
            Gateway Stream Active (Port 8000)
          </span>
          <span style={{ color: '#64748b' }}>|</span>
          <span style={{ color: '#94a3b8' }}>
            Workspace: <code>{workspacePath}</code>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
            <RefreshCw size={12} className={isLoading ? 'spin' : ''} /> Reload Session
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
            <ExternalLink size={12} /> Open Fullscreen
          </button>
        </div>
      </div>

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
            <div style={{ fontSize: '0.85rem' }}>Connecting to OpenHands agent container on port 8000...</div>
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
              <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>OpenHands Container Offline</div>
              <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '4px' }}>
                Ensure container <code>index0-openhands</code> is running via:
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
          title="OpenHands Autonomous Agent"
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
    </div>
  );
};
