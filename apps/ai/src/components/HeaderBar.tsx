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

import React, { useState, useEffect } from "react";
import {
  IconTerminal2,
  IconCpu,
  IconActivity,
  IconSun,
  IconMoon,
} from "@tabler/icons-react";
import { useTheme } from "@/components/ThemeProvider";

interface HeaderBarProps {
  onOpenCommandPalette: () => void;
}

export function HeaderBar({ onOpenCommandPalette }: HeaderBarProps) {
  const { theme, toggleTheme } = useTheme();
  const [latency, setLatency] = useState(8);
  const [memory, setMemory] = useState(42);

  // Micro-fluctuation for realistic cockpit telemetry
  useEffect(() => {
    const interval = setInterval(() => {
      setLatency((prev) => {
        const delta = Math.floor(Math.random() * 3) - 1;
        return Math.max(6, Math.min(12, prev + delta));
      });
      setMemory((prev) => {
        const delta = Math.floor(Math.random() * 3) - 1;
        return Math.max(40, Math.min(45, prev + delta));
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-50 h-14 w-full bg-obsidian/90 backdrop-blur-md ascii-border-b px-4 md:px-6 flex items-center justify-between select-none">
      {/* Left: Brand + Status Telemetry */}
      <div className="flex items-center gap-3 md:gap-5 text-xs">
        {/* System identifier */}
        <div className="flex items-center gap-2 font-bold tracking-wider text-offwhite">
          <span className="text-emerald-term">INDEX0</span>
          <span className="text-dim hidden sm:inline">::</span>
          <span className="text-muted hidden sm:inline">ai.index0.in</span>
        </div>

        <div className="h-3 w-[1px] bg-hairline hidden md:block" />

        {/* Telemetry indicators */}
        <div className="flex items-center gap-2 md:gap-3 text-[11px]">
          {/* SYS_ONLINE */}
          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-chrome border border-hairline text-offwhite">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-term animate-emerald-pulse" />
            <span className="font-mono font-medium text-emerald-term">[01:SYS_ONLINE]</span>
          </div>

          {/* Latency */}
          <div className="hidden sm:flex items-center gap-1 text-muted">
            <IconActivity size={13} className="text-dim" strokeWidth={1.5} />
            <span>LATENCY:</span>
            <span className="text-offwhite font-mono">{latency}ms</span>
          </div>

          {/* Memory */}
          <div className="hidden md:flex items-center gap-1 text-muted">
            <IconCpu size={13} className="text-dim" strokeWidth={1.5} />
            <span>MEMORY:</span>
            <span className="text-offwhite font-mono">{memory}%</span>
          </div>
        </div>
      </div>

      {/* Right: Theme Switcher + Release Badge + Command Trigger */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Monospace Theme Toggle Button */}
        <button
          type="button"
          onClick={toggleTheme}
          className="flex items-center gap-1.5 px-2.5 py-1 bg-chrome hover:bg-chrome-active border border-hairline hover:border-emerald-term text-xs text-muted hover:text-offwhite transition-colors duration-150 cursor-pointer font-mono"
          title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
        >
          {theme === "dark" ? (
            <>
              <IconSun size={13} className="text-emerald-term" strokeWidth={1.5} />
              <span className="text-[11px] text-offwhite">[LIGHT ☼]</span>
            </>
          ) : (
            <>
              <IconMoon size={13} className="text-emerald-term" strokeWidth={1.5} />
              <span className="text-[11px] text-offwhite">[DARK ☾]</span>
            </>
          )}
        </button>

        {/* Release Version Badge */}
        <div className="hidden lg:flex items-center gap-1 px-2 py-0.5 bg-chrome border border-hairline text-[11px] text-muted">
          <span className="text-dim">RELEASE:</span>
          <span className="text-offwhite font-mono">[v2.4.0-RELEASE]</span>
        </div>

        {/* ⌘K Trigger Button */}
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="group flex items-center gap-2 px-2.5 py-1 bg-chrome hover:bg-chrome-active border border-hairline hover:border-emerald-term text-xs text-muted hover:text-offwhite transition-colors duration-150 cursor-pointer"
          title="Open Command Palette (⌘K)"
        >
          <IconTerminal2 size={14} className="text-emerald-term" strokeWidth={1.5} />
          <span className="hidden sm:inline text-offwhite">COMMAND</span>
          <kbd className="flex items-center gap-0.5 px-1.5 py-0.2 bg-obsidian border border-hairline text-[10px] text-muted group-hover:text-emerald-term font-mono">
            <span>⌘</span>
            <span>K</span>
          </kbd>
        </button>
      </div>
    </header>
  );
}
