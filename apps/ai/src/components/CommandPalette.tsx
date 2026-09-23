/*
 * Copyright (c) 2026 INDEX0 AI Inc. All Rights Reserved.
 *
 * PROPRIETARY AND CONFIDENTIAL CODE.
 * NOTICE: All information contained herein is, and remains the property of INDEX0 AI Inc.
 * The intellectual and technical concepts contained herein are proprietary to INDEX0 AI Inc.
 * and may be covered by U.S. and Foreign Patents, patents in process, and are protected by
 * trade secret or copyright law. Dissemination of this information or reproduction of this
 * material is strictly forbidden unless prior written permission is obtained from INDEX0 AI Inc.
 */

"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  IconTerminal,
  IconCpu,
  IconFolderCode,
  IconShieldLock,
  IconGauge,
  IconSearch,
  IconCopy,
  IconCheck,
  IconX,
  IconSun,
  IconMoon,
} from "@tabler/icons-react";
import { useTheme } from "@/components/ThemeProvider";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction?: (actionId: string) => void;
}

interface CommandItem {
  id: string;
  category: string;
  title: string;
  shortcut: string;
  icon: React.ReactNode;
}

export function CommandPalette({ isOpen, onClose, onSelectAction }: CommandPaletteProps) {
  const { theme, toggleTheme } = useTheme();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const commandItems: CommandItem[] = [
    {
      id: "toggle-theme",
      category: "PREFERENCES",
      title: `Switch to ${theme === "dark" ? "Light" : "Dark"} Cockpit Theme`,
      shortcut: "⌥T",
      icon: theme === "dark" ? <IconSun size={16} strokeWidth={1.5} /> : <IconMoon size={16} strokeWidth={1.5} />,
    },
    {
      id: "launch-workspace",
      category: "WORKSPACE",
      title: "Launch Sovereign Agent Workspace",
      shortcut: "↵",
      icon: <IconFolderCode size={16} strokeWidth={1.5} />,
    },
    {
      id: "run-benchmarks",
      category: "TELEMETRY",
      title: "Run SWE-Bench Agent Evaluation Suite",
      shortcut: "⌥B",
      icon: <IconGauge size={16} strokeWidth={1.5} />,
    },
    {
      id: "inspect-sandboxes",
      category: "INFRASTRUCTURE",
      title: "Inspect Active MicroVM Sandboxes",
      shortcut: "⌥S",
      icon: <IconCpu size={16} strokeWidth={1.5} />,
    },
    {
      id: "verify-security",
      category: "SECURITY",
      title: "Zero-Trust Ed25519 Sandbox Audit",
      shortcut: "⌥A",
      icon: <IconShieldLock size={16} strokeWidth={1.5} />,
    },
    {
      id: "copy-init-cli",
      category: "CLI",
      title: "Copy CLI Bootstrapper: npx index0@latest init",
      shortcut: "⌥C",
      icon: <IconCopy size={16} strokeWidth={1.5} />,
    },
    {
      id: "view-terminal",
      category: "TERMINAL",
      title: "Focus Live Swarm Terminal Log Stream",
      shortcut: "⌥L",
      icon: <IconTerminal size={16} strokeWidth={1.5} />,
    },
  ];

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
      setQuery("");
    }
  }, [isOpen]);

  // Global keydown handler for Escape, ⌘K and ⌥T
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
      } else if (e.altKey && e.key.toLowerCase() === "t") {
        e.preventDefault();
        toggleTheme();
      } else if (e.key === "Escape" && isOpen) {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, toggleTheme]);

  const filteredItems = commandItems.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleKeyDownInInput = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filteredItems.length || 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % (filteredItems.length || 1));
    } else if (e.key === "Enter" && filteredItems.length > 0) {
      e.preventDefault();
      triggerAction(filteredItems[selectedIndex]?.id);
    }
  };

  const triggerAction = (actionId?: string) => {
    if (!actionId) return;
    if (actionId === "toggle-theme") {
      toggleTheme();
      onClose();
      return;
    }
    if (actionId === "copy-init-cli") {
      navigator.clipboard.writeText("npx index0@latest init");
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        onClose();
      }, 800);
      return;
    }
    onSelectAction?.(actionId);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
          {/* Overlay backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 bg-obsidian/80 backdrop-blur-sm"
          />

          {/* Modal Container: Origin-Aware Scale 0.95 -> 1.0 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 25,
            }}
            className="relative w-full max-w-xl bg-chrome border border-hairline shadow-2xl overflow-hidden z-10"
          >
            {/* Header / Search Input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-hairline">
              <IconSearch size={16} className="text-dim shrink-0" strokeWidth={1.5} />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={handleKeyDownInInput}
                placeholder="Type a command or search actions..."
                className="w-full bg-transparent text-sm text-offwhite placeholder:text-dim outline-none font-mono"
              />
              <button
                type="button"
                onClick={onClose}
                className="text-dim hover:text-offwhite transition-colors"
                title="Close"
              >
                <IconX size={16} strokeWidth={1.5} />
              </button>
            </div>

            {/* Command List */}
            <div className="max-h-80 overflow-y-auto p-2">
              {filteredItems.length === 0 ? (
                <div className="px-4 py-8 text-center text-xs text-muted">
                  [NO_MATCHING_COMMANDS_FOUND]
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredItems.map((item, idx) => {
                    const isSelected = idx === selectedIndex;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => triggerAction(item.id)}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors cursor-pointer text-left ${
                          isSelected
                            ? "bg-chrome-active text-offwhite border-l-2 border-emerald-term"
                            : "text-muted hover:text-offwhite"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className={isSelected ? "text-emerald-term" : "text-dim"}>
                            {item.icon}
                          </span>
                          <div className="truncate">
                            <span className="text-[10px] text-dim block font-mono">
                              [{item.category}]
                            </span>
                            <span className="font-mono text-offwhite">{item.title}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          {item.id === "copy-init-cli" && copied ? (
                            <span className="flex items-center gap-1 text-[11px] text-emerald-term font-mono">
                              <IconCheck size={13} strokeWidth={2} />
                              COPIED
                            </span>
                          ) : (
                            <kbd className="px-1.5 py-0.5 bg-obsidian border border-hairline text-[10px] text-dim font-mono">
                              {item.shortcut}
                            </kbd>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer Telemetry */}
            <div className="px-4 py-2 border-t border-hairline bg-obsidian/60 flex items-center justify-between text-[10px] text-dim font-mono">
              <div className="flex items-center gap-3">
                <span>[↑↓ NAVIGATE]</span>
                <span>[ENTER SELECT]</span>
                <span>[ESC CLOSE]</span>
              </div>
              <span className="text-emerald-term">THEME: {theme.toUpperCase()}</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
