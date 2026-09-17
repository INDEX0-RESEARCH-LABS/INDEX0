import React, { useState } from 'react';
import type { ISandboxExecutionResult, SandboxLanguage } from '@index0/contracts';
import { CheckCircle2, AlertCircle, Clock, Copy, Check, Terminal, ShieldAlert } from 'lucide-react';

export interface IExecutionResultProps {
  result: ISandboxExecutionResult;
  language?: SandboxLanguage;
  title?: string;
  className?: string;
}

export const ExecutionResult: React.FC<IExecutionResultProps> = ({
  result,
  language,
  title = 'Sandbox Execution Output',
  className = ''
}) => {
  const [copied, setCopied] = useState(false);

  const isSuccess = result.exitCode === 0 && !result.timedOut;
  const isTimeout = !!result.timedOut;

  const handleCopy = async () => {
    const textToCopy = result.stdout || result.stderr || result.error || '';
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={`index0-card ${className}`} data-testid="execution-result-card">
      {/* Header */}
      <div className="index0-card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Terminal size={16} color="var(--accent-cyan)" />
          <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{title}</span>
          {language && (
            <span className="index0-badge index0-badge-neutral" style={{ textTransform: 'uppercase' }}>
              {language}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Status Badge */}
          {isTimeout ? (
            <span className="index0-badge index0-badge-warning" data-testid="status-timeout">
              <Clock size={12} />
              Timed Out
            </span>
          ) : isSuccess ? (
            <span className="index0-badge index0-badge-success" data-testid="status-success">
              <CheckCircle2 size={12} />
              Exit 0
            </span>
          ) : (
            <span className="index0-badge index0-badge-error" data-testid="status-error">
              <AlertCircle size={12} />
              Exit {result.exitCode}
            </span>
          )}

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            title="Copy Output"
            style={{
              background: 'transparent',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              color: copied ? 'var(--color-success)' : 'var(--text-secondary)',
              padding: '4px 8px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.75rem',
              transition: 'all 0.15s ease'
            }}
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Metadata Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          padding: '6px 16px',
          background: 'rgba(15, 23, 42, 0.4)',
          borderBottom: '1px solid var(--border-subtle)',
          fontSize: '0.75rem',
          color: 'var(--text-muted)'
        }}
      >
        <span>
          ID: <code style={{ color: 'var(--text-secondary)' }}>{result.id}</code>
        </span>
        <span>
          Duration: <span style={{ color: 'var(--color-warning)' }}>{result.durationMs}ms</span>
        </span>
      </div>

      {/* Output Console */}
      <div className="index0-console-viewport" data-testid="stdout-viewport">
        {result.stdout ? (
          <div>{result.stdout}</div>
        ) : (
          !result.stderr && !result.error && (
            <div style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
              (No stdout output produced)
            </div>
          )
        )}

        {/* Stderr Diagnostics */}
        {result.stderr && (
          <div
            style={{
              marginTop: result.stdout ? '10px' : '0',
              paddingTop: result.stdout ? '8px' : '0',
              borderTop: result.stdout ? '1px dashed rgba(239, 68, 68, 0.3)' : 'none',
              color: '#f87171'
            }}
            data-testid="stderr-viewport"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <ShieldAlert size={14} />
              <span style={{ fontWeight: 600, fontSize: '0.75rem' }}>STDERR</span>
            </div>
            <div>{result.stderr}</div>
          </div>
        )}

        {/* Execution Error */}
        {result.error && (
          <div
            style={{
              marginTop: '8px',
              color: '#fb7185',
              fontSize: '0.8rem'
            }}
          >
            <strong>Error:</strong> {result.error}
          </div>
        )}
      </div>
    </div>
  );
};
