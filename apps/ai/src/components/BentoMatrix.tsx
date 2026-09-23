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

import React, { useState, useRef, useCallback } from "react";
import {
  IconCpu,
  IconGauge,
  IconTerminal,
  IconServer,
  IconCode,
} from "@tabler/icons-react";

// ========================================================
// 1. EncryptedText Component (Cult UI / Aceternity pattern)
// Decodes from gibberish to clean text on hover
// ========================================================
interface EncryptedTextProps {
  text: string;
  className?: string;
  triggerOnHover?: boolean;
}

const GLYPHS = "01!@#$%^&*<>[]{}~=+-_/\\|";

export function EncryptedText({ text, className = "", triggerOnHover = true }: EncryptedTextProps) {
  const [displayText, setDisplayText] = useState(text);
  const [isScrambling, setIsScrambling] = useState(false);

  const scramble = useCallback(() => {
    if (isScrambling) return;
    setIsScrambling(true);

    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayText((_) =>
        text
          .split("")
          .map((char, index) => {
            if (char === " " || char === "\n") return char;
            if (index < iteration) {
              return text[index];
            }
            return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          })
          .join("")
      );

      if (iteration >= text.length) {
        clearInterval(interval);
        setIsScrambling(false);
        setDisplayText(text);
      }

      iteration += 1 / 2;
    }, 25);
  }, [text, isScrambling]);

  return (
    <span
      onMouseEnter={triggerOnHover ? scramble : undefined}
      className={`font-mono transition-colors ${className}`}
    >
      {displayText}
    </span>
  );
}

// ========================================================
// 2. GlowingEffect Card Container
// Subtle cursor-following radial border highlight
// ========================================================
interface GlowingCardProps {
  children: React.ReactNode;
  className?: string;
}

export function GlowingCard({ children, className = "" }: GlowingCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0, isHovered: false });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      isHovered: true,
    });
  };

  const handleMouseLeave = () => {
    setMousePos((prev) => ({ ...prev, isHovered: false }));
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative bg-chrome border border-hairline overflow-hidden transition-colors ${className}`}
      style={{
        backgroundImage: mousePos.isHovered
          ? `radial-gradient(350px circle at ${mousePos.x}px ${mousePos.y}px, var(--accent-emerald-glow), transparent 80%)`
          : undefined,
      }}
    >
      {children}
    </div>
  );
}

// ========================================================
// 3. Interactive Terminal Component
// Accepts commands: help, status, agents, sandboxes, diff, clear
// ========================================================
export function InteractiveTerminal() {
  const [commandInput, setCommandInput] = useState("");
  const [history, setHistory] = useState<Array<{ cmd?: string; res: string | React.ReactNode }>>([
    { cmd: "index0 status", res: "[01:GATEWAY_ONLINE] 9 services connected across 4 pillars." },
    { cmd: "openhands agents", res: "[RUNNING] Planner: ACTIVE | Coder: ACTIVE | Reviewer: IDLE" },
  ]);

  const handleRunCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = commandInput.trim().toLowerCase();
    if (!trimmed) return;

    if (trimmed === "clear") {
      setHistory([]);
      setCommandInput("");
      return;
    }

    let response: React.ReactNode = "";

    if (trimmed === "help") {
      response = (
        <div className="text-[11px] text-muted space-y-0.5">
          <div>AVAILABLE COMMANDS:</div>
          <div>  help         : Display command manifest</div>
          <div>  status       : Query cluster node health</div>
          <div>  agents       : Inspect active swarm topology</div>
          <div>  sandboxes    : List MicroVM container fleet</div>
          <div>  telemetry    : View Lago rating meters</div>
          <div>  clear        : Wipe terminal screen</div>
        </div>
      );
    } else if (trimmed === "status") {
      response = "[CLUSTER_OK] Node: index0-prod-eu1 | Latency: 8ms | CPU: 14% | Mem: 4.1GB/32GB";
    } else if (trimmed === "agents") {
      response = "[SWARM_MAP] Architect(v2) -> Planner(v3) -> OpenHands Coder(v1) -> Git Reviewer";
    } else if (trimmed === "sandboxes") {
      response = "[ISOLATION_FLEET] 12 active containers | Network: Isolated veth | Seccomp: STRICT";
    } else if (trimmed === "telemetry") {
      response = "[LAGO_RATING] Plan: Sovereign Enterprise | OpenMeter sync: 0.8ms | Quota: 94.2% available";
    } else {
      response = `Command not recognized: "${trimmed}". Type "help" for manifest.`;
    }

    setHistory((prev) => [...prev, { cmd: commandInput, res: response }]);
    setCommandInput("");
  };

  return (
    <div className="w-full bg-obsidian border border-hairline font-mono text-xs flex flex-col h-56">
      <div className="px-3 py-1.5 bg-chrome border-b border-hairline flex items-center justify-between text-[10px] text-dim">
        <div className="flex items-center gap-1.5">
          <IconTerminal size={12} className="text-emerald-term" strokeWidth={1.5} />
          <span className="text-offwhite">bash // sovereign-shell</span>
        </div>
        <span>TTY: /dev/pts/4</span>
      </div>

      <div className="flex-1 p-3 overflow-y-auto space-y-2 text-[11px]">
        {history.map((item, idx) => (
          <div key={idx} className="space-y-0.5">
            {item.cmd && (
              <div className="flex items-center gap-1.5 text-offwhite">
                <span className="text-emerald-term">$</span>
                <span>{item.cmd}</span>
              </div>
            )}
            <div className="text-muted pl-3">{item.res}</div>
          </div>
        ))}
      </div>

      <form onSubmit={handleRunCommand} className="p-2 border-t border-hairline bg-obsidian flex items-center gap-2">
        <span className="text-emerald-term font-bold text-xs">$</span>
        <input
          type="text"
          value={commandInput}
          onChange={(e) => setCommandInput(e.target.value)}
          placeholder="Try 'help', 'status', 'agents', 'sandboxes'..."
          className="flex-1 bg-transparent text-offwhite text-xs outline-none font-mono placeholder:text-dim"
        />
      </form>
    </div>
  );
}

// ========================================================
// 4. Bento Grid Feature Matrix
// ========================================================
export function BentoMatrix() {
  return (
    <section id="matrix" className="relative w-full bg-obsidian px-4 md:px-8 py-16 ascii-border-b">
      {/* Monospace Section Header with ASCII Dividers */}
      <div className="max-w-7xl mx-auto mb-10">
        <div className="flex items-center gap-2 text-xs font-mono text-dim mb-2">
          <span>┌────────────────────────────────────────────────────────┐</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-mono text-emerald-term font-bold mb-1">
              [SEC_02: ARCHITECTURE SPEC]
            </div>
            <h2 className="text-2xl md:text-4xl font-bold uppercase tracking-tighter font-mono text-offwhite">
              SOVEREIGN MULTI-AGENT COCKPIT
            </h2>
          </div>
          <p className="text-xs font-mono text-muted max-w-md">
            Four structural pillars engineered for sovereign AI software execution with strict container isolation and sub-millisecond telemetry.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-dim mt-2">
          <span>└────────────────────────────────────────────────────────┘</span>
        </div>
      </div>

      {/* Bento Grid: Asymmetric Layout */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* =================================================== */}
        {/* CELL 1 (Col Span 2): Sovereign MicroVM Fleet        */}
        {/* =================================================== */}
        <div className="lg:col-span-2">
          <GlowingCard className="h-full p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 border-b border-hairline pb-3">
                <div className="flex items-center gap-2">
                  <IconCpu size={18} className="text-emerald-term" strokeWidth={1.5} />
                  <span className="text-xs font-mono font-bold text-offwhite tracking-wider">
                    <EncryptedText text="01 // SOVEREIGN MICROVM FLEET" />
                  </span>
                </div>
                <span className="px-2 py-0.5 bg-obsidian border border-hairline text-[10px] font-mono text-emerald-term">
                  ISOLATION: HARDWARE
                </span>
              </div>

              <p className="text-xs font-mono text-muted leading-relaxed mb-6">
                Zero-overhead isolated execution environments. Every agent task runs inside dedicated Linux network namespaces with seccomp profile confinement and cgroup memory throttling.
              </p>

              {/* ASCII Architecture Topology Chart */}
              <div className="p-3 bg-obsidian border border-hairline font-mono text-[10px] text-muted overflow-x-auto">
                <pre className="text-emerald-term">
{`┌──────────────────────────────────────────────────────────────────────────┐
│                   INDEX0 SOVEREIGN KERNEL ORCHESTRATOR                   │
├────────────────────────────────┬─────────────────────────────────────────┤
│ [SANDBOX-ALPHA]                │ [SANDBOX-BETA]                          │
│  - Engine: Docker/MicroVM      │  - Engine: Docker/MicroVM               │
│  - Memory: 512MB Cgroup Bound  │  - Memory: 512MB Cgroup Bound           │
│  - NetNS: veth_sbx_01 (No WAN) │  - NetNS: veth_sbx_02 (No WAN)          │
│  - Status: ACTIVE [PID 28419]  │  - Status: READY [PID 28420]           │
└────────────────────────────────┴─────────────────────────────────────────┘`}
                </pre>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-hairline flex flex-wrap items-center justify-between text-[11px] font-mono text-dim gap-2">
              <span>ROOTFS: ALPINE_SECCOMP_V4</span>
              <span>BOOT_LATENCY: 0.4ms</span>
              <span className="text-emerald-term font-bold">[12 / 12 FLEET NOMINAL]</span>
            </div>
          </GlowingCard>
        </div>

        {/* =================================================== */}
        {/* CELL 2 (Col Span 1): Multi-Agent Swarm Orchestrator */}
        {/* =================================================== */}
        <div className="lg:col-span-1">
          <GlowingCard className="h-full p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 border-b border-hairline pb-3">
                <div className="flex items-center gap-2">
                  <IconServer size={18} className="text-emerald-term" strokeWidth={1.5} />
                  <span className="text-xs font-mono font-bold text-offwhite tracking-wider">
                    <EncryptedText text="02 // SWARM TOPOLOGY" />
                  </span>
                </div>
                <span className="px-2 py-0.5 bg-obsidian border border-hairline text-[10px] font-mono text-emerald-term">
                  ROLES: 4
                </span>
              </div>

              <p className="text-xs font-mono text-muted leading-relaxed mb-4">
                Decentralized multi-agent state machines communicating via typed gRPC and event contracts.
              </p>

              {/* Agent Role Nodes */}
              <div className="space-y-2 font-mono text-xs">
                <div className="p-2 bg-obsidian border border-hairline flex items-center justify-between">
                  <span className="text-offwhite font-medium">ARCHITECT AGENT</span>
                  <span className="text-[10px] text-emerald-term">[SYS_DESIGN]</span>
                </div>
                <div className="p-2 bg-obsidian border border-hairline flex items-center justify-between">
                  <span className="text-offwhite font-medium">PLANNER AGENT</span>
                  <span className="text-[10px] text-emerald-term">[TASK_GRAPH]</span>
                </div>
                <div className="p-2 bg-obsidian border border-hairline flex items-center justify-between">
                  <span className="text-offwhite font-medium">CODER AGENT</span>
                  <span className="text-[10px] text-emerald-term">[AST_SYNTH]</span>
                </div>
                <div className="p-2 bg-obsidian border border-hairline flex items-center justify-between">
                  <span className="text-offwhite font-medium">REVIEWER AGENT</span>
                  <span className="text-[10px] text-emerald-term">[TEST_GATE]</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-hairline text-[10px] font-mono text-dim flex justify-between">
              <span>PROTOCOL: CONTRACTS_V1</span>
              <span className="text-emerald-term">STATUS: RECURSIVE_LOOP</span>
            </div>
          </GlowingCard>
        </div>

        {/* =================================================== */}
        {/* CELL 3 (Col Span 1): Sovereign Lago Rating Engine   */}
        {/* =================================================== */}
        <div className="lg:col-span-1">
          <GlowingCard className="h-full p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 border-b border-hairline pb-3">
                <div className="flex items-center gap-2">
                  <IconGauge size={18} className="text-emerald-term" strokeWidth={1.5} />
                  <span className="text-xs font-mono font-bold text-offwhite tracking-wider">
                    <EncryptedText text="03 // SOVEREIGN TELEMETRY" />
                  </span>
                </div>
                <span className="px-2 py-0.5 bg-obsidian border border-hairline text-[10px] font-mono text-emerald-term">
                  LAGO + OPENMETER
                </span>
              </div>

              <p className="text-xs font-mono text-muted leading-relaxed mb-4">
                Self-hosted Lago rating engine linked directly to OpenMeter event dimensions. Complete privacy with zero external billing SaaS dependencies.
              </p>

              {/* Live Metric Meters */}
              <div className="space-y-2 font-mono text-xs">
                <div className="p-2 bg-obsidian border border-hairline">
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-offwhite">SANDBOX_CPU_TIME</span>
                    <span className="text-emerald-term">1,420 SEC</span>
                  </div>
                  <div className="w-full bg-chrome h-1 overflow-hidden">
                    <div className="bg-emerald-term h-full w-[65%]" />
                  </div>
                </div>

                <div className="p-2 bg-obsidian border border-hairline">
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-offwhite">AST_PATCHES_GENERATED</span>
                    <span className="text-emerald-term">84 COMMITS</span>
                  </div>
                  <div className="w-full bg-chrome h-1 overflow-hidden">
                    <div className="bg-emerald-term h-full w-[42%]" />
                  </div>
                </div>

                <div className="p-2 bg-obsidian border border-hairline">
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-offwhite">TOKEN_STREAM_INGEST</span>
                    <span className="text-emerald-term">92.4k T/s</span>
                  </div>
                  <div className="w-full bg-chrome h-1 overflow-hidden">
                    <div className="bg-emerald-term h-full w-[80%]" />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-hairline text-[10px] font-mono text-dim flex justify-between">
              <span>METER_PORT: 3001:3000</span>
              <span className="text-emerald-term">AUDIT: OPTION_A_CLEAN</span>
            </div>
          </GlowingCard>
        </div>

        {/* =================================================== */}
        {/* CELL 4 (Col Span 2): AST Diff Engine & Terminal     */}
        {/* =================================================== */}
        <div className="lg:col-span-2">
          <GlowingCard className="h-full p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 border-b border-hairline pb-3">
                <div className="flex items-center gap-2">
                  <IconCode size={18} className="text-emerald-term" strokeWidth={1.5} />
                  <span className="text-xs font-mono font-bold text-offwhite tracking-wider">
                    <EncryptedText text="04 // AST PATCHING & INTERACTIVE SHELL" />
                  </span>
                </div>
                <span className="px-2 py-0.5 bg-obsidian border border-hairline text-[10px] font-mono text-emerald-term">
                  SHIKI_SYNTAX_ENGINE
                </span>
              </div>

              <p className="text-xs font-mono text-muted leading-relaxed mb-4">
                Interactive shell console with real-time parser telemetry. Test platform diagnostics directly below.
              </p>

              {/* Interactive Terminal */}
              <InteractiveTerminal />
            </div>

            <div className="mt-4 pt-3 border-t border-hairline text-[10px] font-mono text-dim flex flex-wrap justify-between gap-2">
              <span>PATCH_FORMAT: RFC_6902_JSON_PATCH</span>
              <span>VERIFICATION: AUTOMATED_TYPECHECK</span>
              <span className="text-emerald-term">GIT_INTEGRATION: HEAD_VERIFIED</span>
            </div>
          </GlowingCard>
        </div>
      </div>
    </section>
  );
}
