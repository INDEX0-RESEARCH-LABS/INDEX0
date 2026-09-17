import React, { useRef, useEffect } from 'react';
import { Terminal, Trash2, Radio } from 'lucide-react';

export interface ITerminalLine {
  id: string;
  timestamp: string;
  command?: string;
  output: string;
  isError?: boolean;
}

export interface ITerminalViewerProps {
  title?: string;
  lines?: ITerminalLine[];
  activeEnvironment?: string;
  isStreaming?: boolean;
  onClear?: () => void;
  className?: string;
}

export const TerminalViewer: React.FC<ITerminalViewerProps> = ({
  title = 'INDEX0 MicroVM Terminal',
  lines = [],
  activeEnvironment = 'e2b-sandbox-microvm',
  isStreaming = false,
  onClear,
  className = ''
}) => {
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    }
  }, [lines]);

  return (
    <div className={`index0-card ${className}`} data-testid="terminal-viewer">
      {/* Terminal Titlebar Chrome */}
      <div className="index0-card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* macOS window dots */}
          <div className="index0-window-dots">
            <span className="index0-dot index0-dot-red" />
            <span className="index0-dot index0-dot-yellow" />
            <span className="index0-dot index0-dot-green" />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Terminal size={14} color="var(--accent-cyan)" />
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {title}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Active Env Pill */}
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              background: 'rgba(255,255,255,0.05)',
              padding: '2px 8px',
              borderRadius: '4px'
            }}
          >
            <span
              className="index0-pulse-dot"
              style={{
                background: isStreaming ? 'var(--color-warning)' : 'var(--color-success)'
              }}
            />
            {activeEnvironment}
          </span>

          {/* Streaming Indicator */}
          {isStreaming && (
            <span className="index0-badge index0-badge-warning" style={{ fontSize: '0.7rem' }}>
              <Radio size={10} />
              STREAMING
            </span>
          )}

          {/* Clear Button */}
          {onClear && (
            <button
              onClick={onClear}
              title="Clear Terminal"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                transition: 'color 0.15s ease'
              }}
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Terminal Viewport */}
      <div
        ref={viewportRef}
        className="index0-console-viewport"
        style={{ minHeight: '180px' }}
        data-testid="terminal-viewport"
      >
        {lines.length === 0 ? (
          <div style={{ color: 'var(--text-muted)' }}>
            <span style={{ color: 'var(--color-success)' }}>➜</span> Ready. Listening for sandbox execution output...
          </div>
        ) : (
          lines.map((item) => (
            <div key={item.id} style={{ marginBottom: '8px' }}>
              {item.command && (
                <div style={{ color: '#38bdf8', marginBottom: '2px' }}>
                  <span style={{ color: 'var(--color-success)' }}>➜</span> {item.command}
                </div>
              )}
              <div
                style={{
                  color: item.isError ? '#f87171' : '#e2e8f0',
                  paddingLeft: item.command ? '14px' : '0'
                }}
              >
                {item.output}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
