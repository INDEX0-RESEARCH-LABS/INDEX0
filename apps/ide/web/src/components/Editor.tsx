import React from 'react';
import { X, GitCompare, Code } from 'lucide-react';

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
}

export const Editor: React.FC<IEditorProps> = ({
  tabs,
  activeTabPath,
  onSelectTab,
  onCloseTab,
  onChangeContent,
  showDiff = false,
  onToggleDiff,
  diffOriginalContent,
  className = ''
}) => {
  const activeTab = tabs.find((t) => t.path === activeTabPath) || tabs[0];
  const content = activeTab ? activeTab.content : '';
  const lines = content.split('\n');

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
        <div className="index0-code-container">
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
              <div className="index0-code-lines">
                <textarea
                  value={content}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                    if (onChangeContent) {
                      onChangeContent(activeTab.path, e.target.value);
                    }
                  }}
                  spellCheck={false}
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
    </div>
  );
};
