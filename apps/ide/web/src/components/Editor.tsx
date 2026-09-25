import React, { useState, useEffect, useRef } from 'react';
import { X, GitCompare, Code, Sparkles, Zap } from 'lucide-react';
import { TabbyClient, defaultTabbyClient } from '../services/tabbyClient.js';

export interface IEditorTab {
  path: string;
  name: string;
  content: string;
  isDirty?: boolean;
}

export interface IEditorProps {
  tabs: IEditorTab[];
  activeTabPath: string;
  onSelectTab: (path: string) => void;
  onCloseTab: (path: string) => void;
  onChangeContent?: (path: string, newContent: string) => void;
  showDiff?: boolean;
  onToggleDiff?: () => void;
  diffOriginalContent?: string;
  className?: string;
  tabbyClient?: TabbyClient;
}

const detectLanguage = (filename: string): string => {
  if (filename.endsWith('.ts') || filename.endsWith('.tsx')) return 'typescript';
  if (filename.endsWith('.js') || filename.endsWith('.jsx')) return 'javascript';
  if (filename.endsWith('.py')) return 'python';
  if (filename.endsWith('.rs')) return 'rust';
  if (filename.endsWith('.go')) return 'go';
  if (filename.endsWith('.json')) return 'json';
  if (filename.endsWith('.html')) return 'html';
  if (filename.endsWith('.css')) return 'css';
  return 'plaintext';
};

export const Editor: React.FC<IEditorProps> = ({
  tabs,
  activeTabPath,
  onSelectTab,
  onCloseTab,
  onChangeContent,
  showDiff = false,
  onToggleDiff,
  diffOriginalContent,
  className = '',
  tabbyClient = defaultTabbyClient
}) => {
  const activeTab = tabs.find((t) => t.path === activeTabPath) || tabs[0];
  const content = activeTab ? activeTab.content : '';
  const lines = content.split('\n');

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [cursorPos, setCursorPos] = useState<number>(0);
  const [ghostText, setGhostText] = useState<string>('');
  const [ghostStatus, setGhostStatus] = useState<'idle' | 'fetching' | 'ready' | 'offline'>('idle');
  const [edgeLatency, setEdgeLatency] = useState<number | null>(null);

  // Debounced GhostText inline completion trigger
  useEffect(() => {
    if (!activeTab || showDiff) {
      setGhostText('');
      return;
    }

    const timer = setTimeout(async () => {
      const prefix = content.slice(0, cursorPos);
      const suffix = content.slice(cursorPos);

      // Only request completion if we have at least some prefix content on the current line
      if (prefix.trim().length === 0) {
        setGhostText('');
        setGhostStatus('idle');
        return;
      }

      const lang = detectLanguage(activeTab.name);
      setGhostStatus('fetching');

      try {
        const start = Date.now();
        const choices = await tabbyClient.getCompletions({ prefix, suffix }, lang);
        if (choices.length > 0 && choices[0].text) {
          setGhostText(choices[0].text);
          setEdgeLatency(Date.now() - start);
          setGhostStatus('ready');
        } else {
          setGhostText('');
          setGhostStatus('idle');
        }
      } catch {
        setGhostText('');
        setGhostStatus('offline');
      }
    }, 120);

    return () => clearTimeout(timer);
  }, [content, cursorPos, activeTab?.path, showDiff, tabbyClient]);

  // Handle Tab key acceptance of GhostText
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab' && ghostText) {
      e.preventDefault();
      const before = content.slice(0, cursorPos);
      const after = content.slice(cursorPos);
      const newContent = before + ghostText + after;

      if (onChangeContent && activeTab) {
        onChangeContent(activeTab.path, newContent);
      }

      const nextCursor = cursorPos + ghostText.length;
      setGhostText('');
      setGhostStatus('idle');

      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = nextCursor;
          textareaRef.current.selectionEnd = nextCursor;
          setCursorPos(nextCursor);
        }
      }, 0);
    } else if (e.key === 'Escape') {
      setGhostText('');
      setGhostStatus('idle');
    }
  };

  const handleSelectOrChange = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    setCursorPos(target.selectionStart);
  };

  return (
    <div className={`index0-editor-viewport ${className}`} data-testid="editor-viewport">
      {/* Tab Bar */}
      <div className="index0-tab-bar">
        <div style={{ display: 'flex', flex: 1, overflowX: 'auto' }}>
          {tabs.map((tab) => {
            const isActive = tab.path === activeTabPath;
            return (
              <div
                key={tab.path}
                className={`index0-tab ${isActive ? 'active' : ''}`}
                onClick={() => onSelectTab(tab.path)}
                data-testid={`editor-tab-${tab.name}`}
              >
                <span>{tab.name}</span>
                {tab.isDirty && (
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: 'var(--accent-cyan)'
                    }}
                  />
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseTab(tab.path);
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  title="Close tab"
                >
                  <X size={12} />
                </button>
              </div>
            );
          })}
        </div>

        {/* Diff Toggle Action */}
        {onToggleDiff && activeTab && (
          <button
            onClick={onToggleDiff}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 10px',
              marginRight: '8px',
              borderRadius: '4px',
              background: showDiff ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
              border: '1px solid var(--border-subtle)',
              color: showDiff ? '#818cf8' : 'var(--text-secondary)',
              fontSize: '0.75rem',
              cursor: 'pointer'
            }}
            title="Toggle Diff View"
          >
            {showDiff ? <Code size={12} /> : <GitCompare size={12} />}
            {showDiff ? 'Code View' : 'Diff View'}
          </button>
        )}
      </div>

      {/* Code Editor Body */}
      {activeTab ? (
        <div className="index0-code-container" style={{ position: 'relative' }}>
          {showDiff && diffOriginalContent !== undefined ? (
            /* Diff Split View */
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', width: '100%', height: '100%' }}>
              <div style={{ borderRight: '1px solid var(--border-subtle)', padding: '12px 16px', overflow: 'auto' }}>
                <div style={{ fontSize: '0.75rem', color: '#f87171', marginBottom: '8px', fontWeight: 600 }}>
                  Original Version
                </div>
                <pre style={{ margin: 0, color: '#94a3b8' }}>{diffOriginalContent}</pre>
              </div>
              <div style={{ padding: '12px 16px', overflow: 'auto' }}>
                <div style={{ fontSize: '0.75rem', color: '#34d399', marginBottom: '8px', fontWeight: 600 }}>
                  Agent Proposed Changes
                </div>
                <pre style={{ margin: 0, color: '#e2e8f0' }}>{content}</pre>
              </div>
            </div>
          ) : (
            /* Standard Code View with Line Numbers */
            <>
              <div className="index0-gutter">
                {lines.map((_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>
              <div className="index0-code-lines" style={{ position: 'relative' }}>
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                    handleSelectOrChange(e);
                    if (onChangeContent) {
                      onChangeContent(activeTab.path, e.target.value);
                    }
                  }}
                  onSelect={handleSelectOrChange}
                  onKeyUp={handleSelectOrChange}
                  onClick={handleSelectOrChange}
                  onKeyDown={handleKeyDown}
                  spellCheck={false}
                  data-testid="editor-textarea"
                  style={{
                    width: '100%',
                    height: '100%',
                    minHeight: '400px',
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: '#e2e8f0',
                    fontFamily: 'inherit',
                    fontSize: 'inherit',
                    lineHeight: 'inherit',
                    resize: 'none',
                    padding: 0
                  }}
                />

                {/* GhostText Suggestion Floating Bar */}
                {ghostText && (
                  <div
                    data-testid="ghosttext-pill"
                    style={{
                      position: 'absolute',
                      bottom: '16px',
                      right: '24px',
                      background: 'rgba(15, 23, 42, 0.95)',
                      border: '1px solid rgba(99, 102, 241, 0.4)',
                      borderRadius: '6px',
                      padding: '8px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
                      zIndex: 10,
                      maxWidth: '480px'
                    }}
                  >
                    <Sparkles size={14} color="#818cf8" />
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                      Tabby GhostText: <code style={{ color: '#e2e8f0', background: 'rgba(255,255,255,0.06)', padding: '2px 4px', borderRadius: '3px' }}>{ghostText.length > 30 ? ghostText.slice(0, 30) + '...' : ghostText}</code>
                    </span>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        background: 'rgba(99, 102, 241, 0.2)',
                        color: '#a5b4fc',
                        padding: '2px 6px',
                        borderRadius: '3px',
                        fontWeight: 600
                      }}
                    >
                      Press Tab ⇥
                    </span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      ) : (
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted)',
            fontSize: '0.9rem'
          }}
        >
          Select a file from the explorer to begin editing
        </div>
      )}

      {/* Editor Status Footer with Tabby Edge Indicator */}
      {activeTab && (
        <div
          style={{
            height: '24px',
            background: 'rgba(10, 12, 20, 0.95)',
            borderTop: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 12px',
            fontSize: '0.7rem',
            color: 'var(--text-muted, #64748b)'
          }}
          data-testid="editor-statusbar"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span>Lines: {lines.length}</span>
            <span>Language: {detectLanguage(activeTab.name)}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={11} color={ghostStatus === 'ready' ? '#34d399' : '#64748b'} />
            <span style={{ color: ghostStatus === 'ready' ? '#34d399' : 'inherit' }}>
              Tabby Edge: {ghostStatus === 'ready' ? `Active (${edgeLatency ?? 16}ms)` : ghostStatus === 'fetching' ? 'Predicting...' : 'Standby'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
