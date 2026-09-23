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
  IconCopy,
  IconCheck,
  IconPlayerPlay,
  IconRotateClockwise,
  IconArrowRight,
  IconTerminal2,
  IconGitCommit,
  IconShieldLock,
  IconCpu,
} from "@tabler/icons-react";

interface HeroSectionProps {
  onOpenCommandPalette: () => void;
  onSelectAction?: (actionId: string) => void;
}

const DEFAULT_PROMPT = "Refactor auth middleware to zero-trust ed25519 JWT verification";

export function HeroSection({ onOpenCommandPalette, onSelectAction }: HeroSectionProps) {
  // Install pill copy state
  const [copiedInstall, setCopiedInstall] = useState(false);

  // Agent Prompt Shell State
  const [agentPrompt, setAgentPrompt] = useState(DEFAULT_PROMPT);
  const [agentStatus, setAgentStatus] = useState<"IDLE" | "RUNNING" | "COMPLETED">("RUNNING");
  const [progress, setProgress] = useState(80);
  const [activeStep, setActiveStep] = useState("DIFF_VERIFICATION");

  // Mouse radial glow state for IDE window
  const ideWindowRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0, isHovered: false });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!ideWindowRef.current) return;
    const rect = ideWindowRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      isHovered: true,
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setMousePos((prev) => ({ ...prev, isHovered: false }));
  }, []);

  const copyInstallCommand = () => {
    navigator.clipboard.writeText("npx index0@latest init");
    setCopiedInstall(true);
    setTimeout(() => setCopiedInstall(false), 2000);
  };

  const executeAgentTask = () => {
    setAgentStatus("RUNNING");
    setProgress(10);
    setActiveStep("PARSING_AST");

    const steps = [
      { p: 35, s: "MICROVM_SANDBOX_DISPATCH" },
      { p: 60, s: "GENERATING_ED25519_PATCH" },
      { p: 85, s: "RUNNING_TYPECHECK_VERIFICATION" },
      { p: 100, s: "ALL_TESTS_PASSING" },
    ];

    steps.forEach((step, idx) => {
      setTimeout(() => {
        setProgress(step.p);
        setActiveStep(step.s);
        if (idx === steps.length - 1) {
          setAgentStatus("COMPLETED");
        }
      }, (idx + 1) * 700);
    });
  };

  // Compute ASCII Progress Bar: 10 blocks total
  const renderAsciiProgressBar = (percent: number) => {
    const totalBlocks = 10;
    const filledBlocks = Math.round((percent / 100) * totalBlocks);
    const emptyBlocks = totalBlocks - filledBlocks;
    const bar = "█".repeat(filledBlocks) + "░".repeat(emptyBlocks);
    return `[${bar}] ${percent}%`;
  };

  return (
    <section className="relative min-h-[100dvh] w-full bg-obsidian bg-grid-cockpit flex flex-col justify-center px-4 md:px-8 py-10 overflow-hidden ascii-border-b">
      {/* Structural Cockpit Perimeter Coordinates */}
      <div className="absolute top-2 left-4 text-[10px] text-dim font-mono select-none">
        SEC_01 // COCKPIT_GRID_INIT :: 48.8566° N, 2.3522° E
      </div>
      <div className="absolute top-2 right-4 text-[10px] text-dim font-mono select-none">
        RUNTIME: DOCKER_MICROVM_SOVEREIGN
      </div>

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center pt-4">
        {/* ======================================================== */}
        {/* LEFT COLUMN: ASCII Banner + Short Value-Prop + Install   */}
        {/* ======================================================== */}
        <div className="lg:col-span-5 flex flex-col items-start gap-6">
          {/* Status Chip */}
          <div className="flex items-center gap-2 px-2.5 py-1 bg-chrome border border-hairline text-xs font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-term animate-emerald-pulse" />
            <span className="text-muted">INDEX0 PROTOCOL:</span>
            <span className="text-offwhite font-bold">SOVEREIGN AGENT SUITE</span>
          </div>

          {/* Responsive ASCII Character Art Banner */}
          <div className="w-full select-none font-mono text-[9px] sm:text-[11px] md:text-[12px] leading-none text-offwhite overflow-x-auto py-1">
            <pre className="text-emerald-term font-bold tracking-tight">
{`██╗███╗   ██╗██████╗ ███████╗██╗  ██╗ ██████╗ 
██║████╗  ██║██╔══██╗██╔════╝╚██╗██╔╝██╔═████╗
██║██╔██╗ ██║██║  ██║█████╗   ╚███╔╝ ██║██╔██║
██║██║╚██╗██║██║  ██║██╔══╝   ██╔██╗ ████╔╝██║
██║██║ ╚████║██████╔╝███████╗██╔╝ ██╗╚██████╔╝
╚═╝╚═╝  ╚═══╝╚═════╝ ╚══════╝╚═╝  ╚═╝ ╚═════╝ `}
            </pre>
            <div className="text-[10px] text-dim tracking-widest mt-1">
              ╔════════════════════════════════════════════════╗
            </div>
          </div>

          {/* Short Value-Prop (Strictly <= 20 words) */}
          <p className="text-base sm:text-lg text-offwhite font-mono leading-relaxed max-w-lg border-l-2 border-emerald-term pl-3">
            Sovereign multi-agent AI software engineering platform. Autonomous code generation, containerized sandboxes, and instant diff verification.
          </p>

          {/* Monospace Quick Metric Row */}
          <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-muted">
            <span className="px-2 py-0.5 bg-chrome border border-hairline flex items-center gap-1.5">
              <IconCpu size={13} className="text-emerald-term" strokeWidth={1.5} />
              <span>SANDBOXES: <strong className="text-offwhite">12 ONLINE</strong></span>
            </span>
            <span className="px-2 py-0.5 bg-chrome border border-hairline flex items-center gap-1.5">
              <IconShieldLock size={13} className="text-emerald-term" strokeWidth={1.5} />
              <span>ISOLATION: <strong className="text-offwhite">HARDWARE</strong></span>
            </span>
            <span className="px-2 py-0.5 bg-chrome border border-hairline flex items-center gap-1.5">
              <IconGitCommit size={13} className="text-emerald-term" strokeWidth={1.5} />
              <span>COMMITS: <strong className="text-offwhite">ATOMIC AST</strong></span>
            </span>
          </div>

          {/* Terminal Install Pill */}
          <div className="w-full max-w-md">
            <div className="text-[10px] text-dim mb-1 font-mono">
              [SYSTEM_BOOTSTRAP_CLI]
            </div>
            <div className="group flex items-center justify-between px-3.5 py-2.5 bg-chrome border border-hairline hover:border-emerald-term transition-colors">
              <div className="flex items-center gap-2 font-mono text-xs text-offwhite min-w-0">
                <span className="text-emerald-term font-bold">$</span>
                <span className="truncate">npx index0@latest init</span>
              </div>
              <button
                type="button"
                onClick={copyInstallCommand}
                className="ml-3 flex items-center gap-1 px-2 py-1 bg-obsidian border border-hairline hover:border-emerald-term text-muted hover:text-offwhite text-[11px] font-mono transition-colors cursor-pointer shrink-0"
                title="Copy install command"
              >
                {copiedInstall ? (
                  <>
                    <IconCheck size={13} className="text-emerald-term" strokeWidth={2} />
                    <span className="text-emerald-term">COPIED</span>
                  </>
                ) : (
                  <>
                    <IconCopy size={13} strokeWidth={1.5} />
                    <span>COPY</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* CTA Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              onClick={() => {
                onSelectAction?.("launch-workspace");
                onOpenCommandPalette();
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-term hover:bg-emerald-term/90 text-obsidian font-bold text-xs font-mono tracking-wide transition-colors cursor-pointer"
            >
              <span>[01: LAUNCH WORKSPACE]</span>
              <IconArrowRight size={15} strokeWidth={2} />
            </button>

            <a
              href="#matrix"
              className="flex items-center gap-2 px-4 py-2.5 bg-chrome hover:bg-chrome-active border border-hairline text-offwhite text-xs font-mono transition-colors cursor-pointer"
            >
              <span>[02: ARCHITECTURE SPEC]</span>
            </a>
          </div>
        </div>

        {/* ======================================================== */}
        {/* RIGHT COLUMN: Cursor IDE Window with Radial Hover Glow   */}
        {/* ======================================================== */}
        <div className="lg:col-span-7 w-full">
          <div
            ref={ideWindowRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="relative bg-chrome border border-hairline shadow-2xl overflow-hidden group select-none"
            style={{
              // Radial glow tracking mouse coordinates
              backgroundImage: mousePos.isHovered
                ? `radial-gradient(450px circle at ${mousePos.x}px ${mousePos.y}px, var(--accent-emerald-glow), transparent 80%)`
                : undefined,
            }}
          >
            {/* Window Title Bar */}
            <div className="h-9 px-3 bg-obsidian border-b border-hairline flex items-center justify-between text-xs font-mono">
              {/* Left Dots / Window Chrome */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-hairline" />
                  <span className="w-2.5 h-2.5 rounded-full bg-hairline" />
                  <span className="w-2.5 h-2.5 rounded-full bg-hairline" />
                </div>
                <div className="h-3 w-[1px] bg-hairline mx-1" />
                {/* Active Tab */}
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-chrome border border-hairline text-offwhite text-[11px]">
                  <IconTerminal2 size={13} className="text-emerald-term" strokeWidth={1.5} />
                  <span>[main*] agent_session_01.ts</span>
                </div>
              </div>

              {/* Right Status */}
              <div className="flex items-center gap-2 text-[11px]">
                <span className="text-dim hidden sm:inline">git(main): clean</span>
                <span className="px-1.5 py-0.2 bg-chrome border border-hairline text-emerald-term font-mono">
                  ● {agentStatus}
                </span>
              </div>
            </div>

            {/* Prompt Input Shell Bar */}
            <div className="p-3 border-b border-hairline bg-obsidian/40 flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
              <div className="flex items-center gap-2 flex-1 bg-chrome px-3 py-1.5 border border-hairline focus-within:border-emerald-term">
                <span className="text-emerald-term font-bold text-xs">❯</span>
                <input
                  type="text"
                  value={agentPrompt}
                  onChange={(e) => setAgentPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") executeAgentTask();
                  }}
                  className="w-full bg-transparent text-xs text-offwhite outline-none font-mono"
                  placeholder="Enter instructions for sovereign agent..."
                />
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={executeAgentTask}
                  disabled={agentStatus === "RUNNING"}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-chrome hover:bg-chrome-active border border-hairline hover:border-emerald-term text-offwhite text-xs font-mono disabled:opacity-50 cursor-pointer"
                  title="Run Agent Task"
                >
                  {agentStatus === "RUNNING" ? (
                    <IconRotateClockwise size={14} className="animate-spin text-emerald-term" strokeWidth={1.5} />
                  ) : (
                    <IconPlayerPlay size={14} className="text-emerald-term" strokeWidth={1.5} />
                  )}
                  <span>RUN</span>
                  <kbd className="px-1 py-0.2 bg-obsidian border border-hairline text-[9px] text-dim font-mono">↵</kbd>
                </button>
              </div>
            </div>

            {/* Live ASCII Progress Gauge */}
            <div className="px-4 py-2 bg-chrome border-b border-hairline flex flex-wrap items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="text-dim">AGENT_PROGRESS:</span>
                <span className="text-emerald-term font-bold">{renderAsciiProgressBar(progress)}</span>
              </div>
              <div className="text-[11px] text-muted">
                STEP: <span className="text-offwhite font-mono">[{activeStep}]</span>
              </div>
            </div>

            {/* Code Diff Preview Box */}
            <div className="p-3 bg-obsidian font-mono text-[11px] leading-5 overflow-x-auto max-h-72">
              <div className="text-dim pb-1 mb-2 border-b border-hairline text-[10px] flex justify-between">
                <span>diff --git a/services/auth/jwt.ts b/services/auth/jwt.ts</span>
                <span className="text-emerald-term">+14 / -4 lines</span>
              </div>

              {/* Code lines with syntax diff styling */}
              <div className="space-y-0.5 select-text font-mono">
                <div className="text-dim flex">
                  <span className="w-8 text-right pr-3 select-none text-dim">12</span>
                  <span>import &#123; createRemoteJWKSet, jwtVerify &#125; from &quot;jose&quot;;</span>
                </div>
                <div className="text-dim flex">
                  <span className="w-8 text-right pr-3 select-none text-dim">13</span>
                  <span>import &#123; ISovereignTokenPayload &#125; from &quot;@index0/contracts&quot;;</span>
                </div>
                <div className="text-dim flex">
                  <span className="w-8 text-right pr-3 select-none text-dim">14</span>
                  <span></span>
                </div>

                {/* Removed lines */}
                <div className="bg-[var(--diff-removed-bg)] text-diff-del flex border-l-2 border-diff-del">
                  <span className="w-8 text-right pr-3 select-none opacity-60">15</span>
                  <span>- export function verifyLegacyHmac(token: string, secret: string) &#123;</span>
                </div>
                <div className="bg-[var(--diff-removed-bg)] text-diff-del flex border-l-2 border-diff-del">
                  <span className="w-8 text-right pr-3 select-none opacity-60">16</span>
                  <span>-   return crypto.createHmac(&quot;sha256&quot;, secret).update(token).digest();</span>
                </div>

                {/* Added lines */}
                <div className="bg-[var(--diff-added-bg)] text-diff-add flex border-l-2 border-diff-add">
                  <span className="w-8 text-right pr-3 select-none opacity-60">15</span>
                  <span>+ export async function verifyEd25519Signature(token: string): Promise&lt;boolean&gt; &#123;</span>
                </div>
                <div className="bg-[var(--diff-added-bg)] text-diff-add flex border-l-2 border-diff-add">
                  <span className="w-8 text-right pr-3 select-none opacity-60">16</span>
                  <span>+   const publicKey = await loadSovereignPublicKey();</span>
                </div>
                <div className="bg-[var(--diff-added-bg)] text-diff-add flex border-l-2 border-diff-add">
                  <span className="w-8 text-right pr-3 select-none opacity-60">17</span>
                  <span>+   const &#123; payload &#125; = await jwtVerify(token, publicKey, &#123;</span>
                </div>
                <div className="bg-[var(--diff-added-bg)] text-diff-add flex border-l-2 border-diff-add">
                  <span className="w-8 text-right pr-3 select-none opacity-60">18</span>
                  <span>+     algorithms: [&quot;EdDSA&quot;],</span>
                </div>
                <div className="bg-[var(--diff-added-bg)] text-diff-add flex border-l-2 border-diff-add">
                  <span className="w-8 text-right pr-3 select-none opacity-60">19</span>
                  <span>+     issuer: &quot;urn:index0:sovereign:auth&quot;,</span>
                </div>
                <div className="bg-[var(--diff-added-bg)] text-diff-add flex border-l-2 border-diff-add">
                  <span className="w-8 text-right pr-3 select-none opacity-60">20</span>
                  <span>+   &#125;);</span>
                </div>
                <div className="bg-[var(--diff-added-bg)] text-diff-add flex border-l-2 border-diff-add">
                  <span className="w-8 text-right pr-3 select-none opacity-60">21</span>
                  <span>+   return payload.sub !== undefined;</span>
                </div>
                <div className="bg-[var(--diff-added-bg)] text-diff-add flex border-l-2 border-diff-add">
                  <span className="w-8 text-right pr-3 select-none opacity-60">22</span>
                  <span>+ &#125;</span>
                </div>

                <div className="text-dim flex">
                  <span className="w-8 text-right pr-3 select-none text-dim">23</span>
                  <span></span>
                </div>
                <div className="text-dim flex">
                  <span className="w-8 text-right pr-3 select-none text-dim">24</span>
                  <span>export default verifyEd25519Signature;</span>
                </div>
              </div>
            </div>

            {/* Bottom Telemetry Bar */}
            <div className="h-7 px-3 bg-chrome border-t border-hairline flex items-center justify-between text-[10px] text-dim font-mono">
              <div className="flex items-center gap-3">
                <span className="text-emerald-term">[SANDBOX: #sbx-9921b]</span>
                <span>CPU: 1.4%</span>
                <span>MEM: 128MB</span>
              </div>
              <div className="flex items-center gap-2">
                <span>AST_DIFF: VALIDATED</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-term" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
