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
import { IconShieldCheck } from "@tabler/icons-react";

export function SystemFooter() {
  const [utcTime, setUtcTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcTime(now.toUTCString().replace("GMT", "UTC"));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="w-full bg-obsidian text-muted font-mono text-xs px-4 md:px-8 py-10">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ASCII Structural Divider */}
        <div className="text-dim text-[11px] select-none overflow-x-auto">
          <div>┌──────────────────────────────────────────────────────────────────────────────────────────┐</div>
          <div className="text-emerald-term">│ INDEX0 SOVEREIGN MULTI-AGENT RUNTIME // AIR-GAPPED &amp; HARDWARE-ISOLATED COCKPIT           │</div>
          <div>└──────────────────────────────────────────────────────────────────────────────────────────┘</div>
        </div>

        {/* Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-2">
          {/* Col 1: System Info */}
          <div className="space-y-2">
            <div className="text-offwhite font-bold text-sm tracking-wider flex items-center gap-2">
              <span className="text-emerald-term">INDEX0</span>
              <span className="text-dim">::</span>
              <span>ai.index0.in</span>
            </div>
            <p className="text-[11px] text-muted leading-relaxed">
              Sovereign multi-agent AI software engineering platform. Autonomous code generation, containerized sandboxes, and instant diff verification.
            </p>
          </div>

          {/* Col 2: Telemetry */}
          <div className="space-y-1.5 text-[11px]">
            <div className="text-offwhite font-bold mb-2">[CLUSTER_TELEMETRY]</div>
            <div className="flex justify-between border-b border-hairline pb-1">
              <span className="text-dim">NODE_CLUSTER:</span>
              <span className="text-offwhite">eu-central-1.prod</span>
            </div>
            <div className="flex justify-between border-b border-hairline pb-1">
              <span className="text-dim">BUILD_SHA:</span>
              <span className="text-emerald-term">e08f2a94</span>
            </div>
            <div className="flex justify-between border-b border-hairline pb-1">
              <span className="text-dim">ACTIVE_SANDBOXES:</span>
              <span className="text-offwhite">12 ONLINE</span>
            </div>
          </div>

          {/* Col 3: Architecture Pillars */}
          <div className="space-y-1.5 text-[11px]">
            <div className="text-offwhite font-bold mb-2">[FOUR_PILLARS]</div>
            <div className="text-muted hover:text-offwhite cursor-pointer">
              <span className="text-emerald-term">[01]</span> BUILD: MicroVM Sandboxes
            </div>
            <div className="text-muted hover:text-offwhite cursor-pointer">
              <span className="text-emerald-term">[02]</span> SHIP: Git Atomic Checkpoints
            </div>
            <div className="text-muted hover:text-offwhite cursor-pointer">
              <span className="text-emerald-term">[03]</span> SELL: Self-Hosted Lago Rating
            </div>
            <div className="text-muted hover:text-offwhite cursor-pointer">
              <span className="text-emerald-term">[04]</span> GROW: OpenMeter Telemetry
            </div>
          </div>

          {/* Col 4: Clock & Status */}
          <div className="space-y-2 text-[11px]">
            <div className="text-offwhite font-bold mb-2">[CLOCK_SYNCHRONIZATION]</div>
            <div className="p-2 bg-chrome border border-hairline">
              <div className="text-dim text-[10px]">CURRENT_UTC_TIME:</div>
              <div className="text-offwhite font-bold mt-0.5">{utcTime || "SYNCHRONIZING..."}</div>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-term text-[10px]">
              <IconShieldCheck size={14} strokeWidth={1.5} />
              <span>SOVEREIGN AIR-GAP VALIDATED</span>
            </div>
          </div>
        </div>

        {/* Bottom copyright / protocol bar */}
        <div className="pt-6 border-t border-hairline flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-dim">
          <div>
            (C) 2026 INDEX0 RESEARCH LABS. SOVEREIGN OPEN-SOURCE AI PLATFORM.
          </div>
          <div className="flex items-center gap-4">
            <span className="text-emerald-term">[STATUS: ALL SYSTEMS NOMINAL]</span>
            <span>V2.4.0-RELEASE</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
