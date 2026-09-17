/**
 * MCP Tools Panel — @index0/ide-web
 * High-fidelity workbench component displaying registered MCP tools, category groupings,
 * sandbox confinement status, and workspace boundary containment rules.
 */

import React, { useState, useMemo } from 'react';
import {
  Wrench,
  ShieldCheck,
  Folder,
  Search,
  Terminal,
  Globe,
  Lock,
  X
} from 'lucide-react';
import type { MCPToolCategory, IMCPToolDefinition } from '@index0/contracts';
import { MCPToolService, CATEGORY_COLORS } from '../services/mcpToolService.js';

export interface IMCPToolsPanelProps {
  onClose?: () => void;
  className?: string;
}

const CATEGORY_ICONS: Record<MCPToolCategory, React.ReactNode> = {
  filesystem: <Folder size={14} color="#38bdf8" />,
  search: <Search size={14} color="#c084fc" />,
  execution: <Terminal size={14} color="#34d399" />,
  inspection: <Globe size={14} color="#fbbf24" />
};

export const MCPToolsPanel: React.FC<IMCPToolsPanelProps> = ({ onClose, className = '' }) => {
  const service = useMemo(() => new MCPToolService(), []);
  const boundary = service.getBoundaryRules();
  const metrics = service.getToolCount();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MCPToolCategory | 'all'>('all');

  const filteredTools = useMemo(
    () => service.filterTools(searchQuery, selectedCategory),
    [service, searchQuery, selectedCategory]
  );

  const groupedTools = useMemo(() => {
    const map: Record<MCPToolCategory, IMCPToolDefinition[]> = {
      filesystem: [],
      search: [],
      execution: [],
      inspection: []
    };
    for (const tool of filteredTools) {
      if (map[tool.category]) {
        map[tool.category].push(tool);
      }
    }
    return map;
  }, [filteredTools]);

  return (
    <div
      className={`index0-mcp-panel ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        background: '#0a0c14',
        color: '#e2e8f0',
        overflow: 'hidden'
      }}
      data-testid="mcp-tools-panel"
    >
      {/* Top Header Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          background: '#121524',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Wrench size={16} color="#818cf8" />
          <strong style={{ fontSize: '0.9rem' }}>Model Context Protocol (MCP) Tools</strong>
          <span
            style={{
              background: 'rgba(99, 102, 241, 0.2)',
              color: '#a5b4fc',
              border: '1px solid rgba(99, 102, 241, 0.4)',
              borderRadius: '4px',
              padding: '1px 6px',
              fontSize: '0.68rem',
              fontWeight: 700
            }}
          >
            {metrics.total} Registered
          </span>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Main Body Scrollable Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Workspace Boundary Rules Containment Summary Card */}
        <div
          style={{
            background: 'rgba(18, 21, 36, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}
          data-testid="boundary-rules-card"
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600 }}>
              <ShieldCheck size={15} color="#34d399" />
              <span>Workspace Boundary Confinement</span>
            </div>
            <span style={{ fontSize: '0.68rem', color: '#34d399', fontWeight: 600 }}>ENFORCED</span>
          </div>

          <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
            Root: <code style={{ color: '#e2e8f0', background: 'rgba(0, 0, 0, 0.3)', padding: '2px 4px', borderRadius: '3px' }}>{boundary.workspaceRoot}</code>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Denied Paths:</span>
            {boundary.denyPaths.map((deny) => (
              <span
                key={deny}
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  color: '#f87171',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '3px',
                  padding: '1px 5px',
                  fontSize: '0.62rem',
                  fontWeight: 600
                }}
              >
                {deny}
              </span>
            ))}
            <span
              style={{
                marginLeft: 'auto',
                fontSize: '0.65rem',
                color: '#fbbf24',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Lock size={11} /> Symlinks: Deny
            </span>
          </div>
        </div>

        {/* Search & Category Filter Bar */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search
              size={13}
              color="#64748b"
              style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tools by name or purpose..."
              style={{
                width: '100%',
                padding: '6px 10px 6px 30px',
                background: '#121524',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '0.75rem',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '4px' }}>
            {(['all', 'filesystem', 'search', 'execution', 'inspection'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '4px 8px',
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  borderRadius: '4px',
                  border: selectedCategory === cat ? '1px solid var(--accent-primary, #6366f1)' : '1px solid rgba(255, 255, 255, 0.08)',
                  background: selectedCategory === cat ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                  color: selectedCategory === cat ? '#fff' : '#94a3b8',
                  cursor: 'pointer',
                  textTransform: 'capitalize'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Category Tool Sections */}
        {(['filesystem', 'search', 'execution', 'inspection'] as MCPToolCategory[]).map((category) => {
          const tools = groupedTools[category];
          if (tools.length === 0 && selectedCategory !== 'all') return null;

          const catColor = CATEGORY_COLORS[category];

          return (
            <div key={category} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 600 }}>
                {CATEGORY_ICONS[category]}
                <span style={{ textTransform: 'uppercase', letterSpacing: '0.04em', color: catColor.text }}>
                  {category}
                </span>
                <span style={{ fontSize: '0.65rem', color: '#64748b' }}>({tools.length})</span>
              </div>

              {tools.length === 0 ? (
                <div style={{ fontSize: '0.7rem', color: '#64748b', fontStyle: 'italic', padding: '4px 0' }}>
                  No tools found in this category matching search query.
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '8px' }}>
                  {tools.map((tool) => (
                    <div
                      key={tool.name}
                      style={{
                        background: '#121524',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '6px',
                        padding: '10px 12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px'
                      }}
                      data-testid={`tool-card-${tool.name}`}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <code style={{ fontSize: '0.75rem', fontWeight: 700, color: '#e2e8f0' }}>
                          {tool.name}
                        </code>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <span
                            style={{
                              background: tool.isNative ? 'rgba(99, 102, 241, 0.2)' : 'rgba(168, 85, 247, 0.2)',
                              color: tool.isNative ? '#a5b4fc' : '#d8b4fe',
                              border: tool.isNative ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid rgba(168, 85, 247, 0.4)',
                              borderRadius: '3px',
                              padding: '1px 5px',
                              fontSize: '0.6rem',
                              fontWeight: 700
                            }}
                          >
                            {tool.transport.toUpperCase()}
                          </span>
                          <span
                            style={{
                              background: tool.sandboxed ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                              color: tool.sandboxed ? '#34d399' : '#fbbf24',
                              border: tool.sandboxed ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(245, 158, 11, 0.4)',
                              borderRadius: '3px',
                              padding: '1px 5px',
                              fontSize: '0.6rem',
                              fontWeight: 700
                            }}
                          >
                            {tool.sandboxed ? 'SANDBOXED' : 'EXTERNAL'}
                          </span>
                        </div>
                      </div>

                      <div style={{ fontSize: '0.7rem', color: '#94a3b8', lineHeight: 1.3 }}>
                        {tool.description}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
