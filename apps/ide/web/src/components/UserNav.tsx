/**
 * User Navigation & Tenant Profile — @index0/ide-web
 * Displays active user profile, tenant organization, role badge, permissions, and session actions.
 */

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext.js';
import type { UserRole } from '@index0/contracts';
import { User, LogOut, Building, Key, ChevronDown } from 'lucide-react';

export interface IUserNavProps {
  className?: string;
}

const ROLE_COLORS: Record<UserRole, { bg: string; text: string; border: string }> = {
  admin: { bg: 'rgba(99, 102, 241, 0.15)', text: '#818cf8', border: 'rgba(99, 102, 241, 0.4)' },
  member: { bg: 'rgba(6, 182, 212, 0.15)', text: '#22d3ee', border: 'rgba(6, 182, 212, 0.4)' },
  viewer: { bg: 'rgba(148, 163, 184, 0.15)', text: '#94a3b8', border: 'rgba(148, 163, 184, 0.4)' },
  agent: { bg: 'rgba(16, 185, 129, 0.15)', text: '#34d399', border: 'rgba(16, 185, 129, 0.4)' }
};

export const UserNav: React.FC<IUserNavProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Safely consume auth context with fallback
  let authContext: ReturnType<typeof useAuth> | null = null;
  try {
    authContext = useAuth();
  } catch {
    // Rendered outside AuthProvider
  }

  const user = authContext?.user;
  const organization = authContext?.organization;
  const role = (authContext?.roles[0] || 'admin') as UserRole;
  const permissions = authContext?.permissions || [];
  const isAuthenticated = authContext?.isAuthenticated ?? true;
  const roleStyle = ROLE_COLORS[role] || ROLE_COLORS.admin;

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isAuthenticated) {
    return (
      <button
        onClick={() => authContext?.login()}
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
        <User size={13} /> Sign In
      </button>
    );
  }

  return (
    <div
      ref={dropdownRef}
      className={`index0-user-nav ${className}`}
      style={{ position: 'relative', display: 'inline-block' }}
      data-testid="user-nav"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '6px',
          padding: '4px 8px',
          color: 'var(--text-main, #e2e8f0)',
          cursor: 'pointer',
          fontSize: '0.75rem',
          transition: 'all 0.15s ease'
        }}
      >
        <div
          style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: 'var(--accent-primary, #6366f1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.65rem',
            fontWeight: 700,
            color: '#fff'
          }}
        >
          {user?.name ? user.name.charAt(0).toUpperCase() : 'D'}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>
          <span style={{ fontWeight: 600, fontSize: '0.75rem', lineHeight: 1.1 }}>
            {user?.name || 'Darion'}
          </span>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted, #94a3b8)', lineHeight: 1 }}>
            {organization?.name || 'Acme Software Labs'}
          </span>
        </div>

        <span
          style={{
            background: roleStyle.bg,
            color: roleStyle.text,
            border: `1px solid ${roleStyle.border}`,
            borderRadius: '4px',
            padding: '1px 5px',
            fontSize: '0.65rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.04em'
          }}
        >
          {role}
        </span>

        <ChevronDown size={12} color="var(--text-muted, #94a3b8)" />
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            width: '260px',
            background: '#121524',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '8px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
            zIndex: 1000,
            padding: '12px',
            color: '#e2e8f0'
          }}
        >
          {/* User & Org Details */}
          <div style={{ paddingBottom: '10px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{user?.name || 'Darion'}</div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{user?.email || 'darion@index0.internal'}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '6px', fontSize: '0.7rem', color: '#38bdf8' }}>
              <Building size={12} />
              <span>{organization?.name || 'Acme Software Labs'}</span>
            </div>
          </div>

          {/* Role & Permissions */}
          <div style={{ padding: '10px 0', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Role:</span>
              <span
                style={{
                  background: roleStyle.bg,
                  color: roleStyle.text,
                  border: `1px solid ${roleStyle.border}`,
                  borderRadius: '4px',
                  padding: '1px 6px',
                  fontSize: '0.65rem',
                  fontWeight: 700
                }}
              >
                {role.toUpperCase()}
              </span>
            </div>

            <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Key size={11} /> Granted Permissions:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxHeight: '70px', overflowY: 'auto' }}>
              {permissions.slice(0, 5).map((p) => (
                <span
                  key={p}
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '3px',
                    padding: '1px 4px',
                    fontSize: '0.62rem',
                    color: '#cbd5e1'
                  }}
                >
                  {p}
                </span>
              ))}
              {permissions.length > 5 && (
                <span style={{ fontSize: '0.62rem', color: '#64748b' }}>
                  +{permissions.length - 5} more
                </span>
              )}
            </div>
          </div>

          {/* Role Switcher Demo Controls */}
          {authContext?.loginAsDemoUser && (
            <div style={{ padding: '8px 0', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ fontSize: '0.65rem', color: '#64748b', marginBottom: '4px' }}>Switch Role (Demo):</div>
              <div style={{ display: 'flex', gap: '4px' }}>
                {(['admin', 'member', 'viewer', 'agent'] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      authContext?.loginAsDemoUser(r);
                      setIsOpen(false);
                    }}
                    style={{
                      flex: 1,
                      padding: '3px 0',
                      fontSize: '0.65rem',
                      borderRadius: '3px',
                      border: r === role ? '1px solid var(--accent-primary, #6366f1)' : '1px solid rgba(255, 255, 255, 0.1)',
                      background: r === role ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                      color: r === role ? '#a5b4fc' : '#94a3b8',
                      cursor: 'pointer'
                    }}
                  >
                    {r.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Session Actions */}
          <div style={{ paddingTop: '8px' }}>
            <button
              onClick={() => {
                authContext?.logout();
                setIsOpen(false);
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f87171',
                borderRadius: '4px',
                padding: '6px 0',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <LogOut size={13} /> Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
