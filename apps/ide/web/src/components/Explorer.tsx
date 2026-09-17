import React, { useState } from 'react';
import { Folder, FolderOpen, FileCode, FileText, Search, ChevronRight, ChevronDown } from 'lucide-react';

export interface IWorkspaceFileNode {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  children?: IWorkspaceFileNode[];
}

export interface IExplorerProps {
  files: IWorkspaceFileNode[];
  activeFilePath?: string;
  onSelectFile: (path: string) => void;
  className?: string;
}

const FileTreeNode: React.FC<{
  node: IWorkspaceFileNode;
  activeFilePath?: string;
  onSelectFile: (path: string) => void;
  depth: number;
}> = ({ node, activeFilePath, onSelectFile, depth }) => {
  const [isOpen, setIsOpen] = useState(true);
  const isDirectory = node.type === 'directory';
  const isActive = activeFilePath === node.path;

  const handleClick = () => {
    if (isDirectory) {
      setIsOpen(!isOpen);
    } else {
      onSelectFile(node.path);
    }
  };

  const getFileIcon = (name: string) => {
    if (isDirectory) {
      return isOpen ? <FolderOpen size={14} color="#f59e0b" /> : <Folder size={14} color="#f59e0b" />;
    }
    if (name.endsWith('.ts') || name.endsWith('.tsx') || name.endsWith('.js')) {
      return <FileCode size={14} color="#38bdf8" />;
    }
    return <FileText size={14} color="#94a3b8" />;
  };

  return (
    <div>
      <div
        className={`index0-tree-node ${isActive ? 'active' : ''}`}
        style={{ paddingLeft: `${depth * 14 + 10}px` }}
        onClick={handleClick}
        data-testid={`tree-node-${node.name}`}
      >
        {isDirectory && (
          <span style={{ display: 'inline-flex', opacity: 0.6 }}>
            {isOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </span>
        )}
        {getFileIcon(node.name)}
        <span style={{ fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {node.name}
        </span>
      </div>

      {isDirectory && isOpen && node.children && (
        <div>
          {node.children.map((child) => (
            <FileTreeNode
              key={child.id}
              node={child}
              activeFilePath={activeFilePath}
              onSelectFile={onSelectFile}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const Explorer: React.FC<IExplorerProps> = ({
  files,
  activeFilePath,
  onSelectFile,
  className = ''
}) => {
  const [filter, setFilter] = useState('');

  const filterNodes = (nodes: IWorkspaceFileNode[]): IWorkspaceFileNode[] => {
    if (!filter) return nodes;
    return nodes
      .map((node) => {
        if (node.type === 'directory' && node.children) {
          const filteredChildren = filterNodes(node.children);
          if (filteredChildren.length > 0) {
            return { ...node, children: filteredChildren };
          }
        }
        if (node.name.toLowerCase().includes(filter.toLowerCase())) {
          return node;
        }
        return null;
      })
      .filter(Boolean) as IWorkspaceFileNode[];
  };

  const displayedFiles = filterNodes(files);

  return (
    <div className={`index0-explorer-panel ${className}`} data-testid="explorer-panel">
      <div className="index0-panel-titlebar">
        <span>Workspace Explorer</span>
      </div>

      {/* Filter Input */}
      <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--border-subtle)' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(0,0,0,0.3)',
            borderRadius: '4px',
            padding: '4px 8px',
            border: '1px solid var(--border-subtle)'
          }}
        >
          <Search size={12} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search files..."
            value={filter}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilter(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#fff',
              fontSize: '0.75rem',
              width: '100%'
            }}
          />
        </div>
      </div>

      {/* Tree Viewport */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '6px 0' }}>
        {displayedFiles.map((node) => (
          <FileTreeNode
            key={node.id}
            node={node}
            activeFilePath={activeFilePath}
            onSelectFile={onSelectFile}
            depth={0}
          />
        ))}
      </div>
    </div>
  );
};
