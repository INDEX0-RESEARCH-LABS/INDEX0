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
import Link from "next/link";
import {
  IconCopy,
  IconCheck,
  IconArrowUpRight,
  IconCpu,
  IconGitCommit,
  IconLayersLinked,
  IconSparkles,
} from "@tabler/icons-react";
import { AsciiCanvas } from "@/components/ascii-canvas/AsciiCanvas";

export default function HomePage() {
  const [copiedInstall, setCopiedInstall] = useState(false);
  const [activeSandboxes, setActiveSandboxes] = useState(148);
  const [tokensProcessed, setTokensProcessed] = useState(84920412);

  // Live telemetry ticker fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSandboxes((prev) => prev + Math.floor(Math.random() * 3) - 1);
      setTokensProcessed((prev) => prev + Math.floor(Math.random() * 4200) + 1200);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const copyInstallCommand = () => {
    navigator.clipboard.writeText("curl -fsSL https://dl.ai.index0.in/install.sh | sh");
    setCopiedInstall(true);
    setTimeout(() => setCopiedInstall(false), 2000);
  };

  return (
    <main className="min-h-[100dvh] w-full bg-[var(--bg)] text-[var(--fg)] flex flex-col items-center">
      {/* ======================================================== */}
      {/* 1. HERO SECTION: Warm Editorial Luxury + 3D WebGL ASCII  */}
      {/* ======================================================== */}
      <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20 md:pt-20 md:pb-28 border-oklab-b">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Headlines & Call to Action */}
          <div className="lg:col-span-7 space-y-6">
            {/* Version & Security Chip */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border-oklab bg-[var(--surface-100)] text-xs font-mono text-[var(--muted)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
              <span>RELEASE 2.4.0</span>
              <span className="text-[var(--meta)]">/</span>
              <span className="text-[var(--fg)] font-semibold">SOVEREIGN AIR-GAP</span>
            </div>

            {/* 72px Display Headline (CursorGothic Tight Letter-Spacing) */}
            <h1 className="font-display-hero text-[var(--fg)] tracking-tight">
              Sovereign AI Engineering, Rendered in Code.
            </h1>

            {/* 19.2px jjannon Editorial Serif Body Voice */}
            <p className="font-editorial text-[var(--muted)] max-w-xl text-lg md:text-xl leading-relaxed">
              INDEX0 provides an autonomous multi-agent developer workstation running inside dedicated Firecracker microVM sandboxes. Full sovereignty, zero data retention, and instant AST diff synthesis.
            </p>

            {/* Installer Action Bar */}
            <div className="pt-2 space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                {/* Full Pill Primary CTA */}
                <Link
                  href="/downloads"
                  className="pill-btn flex items-center gap-2 px-6 py-3 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm font-sans font-medium tracking-wide shadow-atmospheric transition-all cursor-pointer"
                >
                  <span>Install Kilo Platform</span>
                  <IconArrowUpRight size={16} strokeWidth={2} />
                </Link>

                <Link
                  href="/marketplace"
                  className="pill-btn flex items-center gap-2 px-5 py-3 border-oklab hover:border-[var(--accent)] bg-[var(--surface-100)] hover:bg-[var(--surface-200)] text-[var(--fg)] text-sm font-sans font-medium transition-all cursor-pointer"
                >
                  <span>Explore MCPs</span>
                  <IconSparkles size={16} className="text-[var(--accent)]" />
                </Link>
              </div>

              {/* Copyable Install Script Block */}
              <div className="w-full max-w-lg p-2.5 rounded-xl border-oklab bg-[var(--surface-warm)] flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2 overflow-x-auto text-[var(--fg)]">
                  <span className="text-[var(--accent)] font-bold">$</span>
                  <span className="truncate">curl -fsSL https://dl.ai.index0.in/install.sh | sh</span>
                </div>
                <button
                  type="button"
                  onClick={copyInstallCommand}
                  className="ml-3 flex items-center gap-1.5 px-3 py-1 rounded-full border-oklab bg-[var(--surface-100)] hover:bg-[var(--surface-200)] text-[var(--fg)] font-mono text-[11px] transition-colors cursor-pointer shrink-0"
                  title="Copy command"
                >
                  {copiedInstall ? (
                    <>
                      <IconCheck size={13} className="text-[var(--accent)]" />
                      <span className="text-[var(--accent)] font-semibold">COPIED</span>
                    </>
                  ) : (
                    <>
                      <IconCopy size={13} />
                      <span>COPY</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* AI State Pastels Row */}
            <div className="pt-2 flex flex-wrap items-center gap-2 text-[11px] font-mono">
              <span className="text-[var(--meta)]">AGENT STATES:</span>
              <span className="px-2 py-0.5 rounded-full text-[#7a4830] bg-[#dfa88f]/30 border border-[#dfa88f]/50">THINKING</span>
              <span className="px-2 py-0.5 rounded-full text-[#36593a] bg-[#9fc9a2]/30 border border-[#9fc9a2]/50">GREP</span>
              <span className="px-2 py-0.5 rounded-full text-[#2c4e75] bg-[#9fbbe0]/30 border border-[#9fbbe0]/50">READ</span>
              <span className="px-2 py-0.5 rounded-full text-[#563878] bg-[#c0a8dd]/30 border border-[#c0a8dd]/50">EDIT</span>
              <span className="px-2 py-0.5 rounded-full text-[#754d19] bg-[#c08532]/30 border border-[#c08532]/50">DONE</span>
            </div>
          </div>

          {/* Right Column: Interactive 3D WebGL ASCII Canvas */}
          <div className="lg:col-span-5 relative w-full h-[400px] md:h-[500px] rounded-2xl border-oklab bg-[var(--surface-100)] shadow-atmospheric overflow-hidden flex items-center justify-center p-4">
            <div className="absolute top-3 left-4 text-[10px] font-mono text-[var(--meta)] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
              <span>GPU: GLSL_ASCII_PROCEDURAL_5x7</span>
            </div>
            <div className="absolute top-3 right-4 text-[10px] font-mono text-[var(--meta)]">
              [DEFLECTION: MOUSE KINETIC]
            </div>

            {/* The WebGL Canvas */}
            <AsciiCanvas />

            <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[10px] font-mono text-[var(--meta)] border-oklab-t pt-2">
              <span>MESH: TORUS_KNOT + ICOSAHEDRON</span>
              <span className="text-[var(--accent)] font-semibold">INTERACTIVE 3D</span>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 2. LIVE PERFORMANCE TICKER                               */}
      {/* ======================================================== */}
      <section className="w-full bg-[var(--surface-100)] border-oklab-b py-6 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 font-mono text-center">
          <div className="space-y-1">
            <div className="text-[11px] text-[var(--muted)]">ACTIVE MICROVMS</div>
            <div className="text-2xl font-bold text-[var(--fg)] font-sans">{activeSandboxes}</div>
            <div className="text-[10px] text-[var(--accent)] font-mono">FIRECRACKER 0.4ms BOOT</div>
          </div>
          <div className="space-y-1">
            <div className="text-[11px] text-[var(--muted)]">TOKENS SYNTHESIZED</div>
            <div className="text-2xl font-bold text-[var(--fg)] font-sans">
              {(tokensProcessed / 1000000).toFixed(1)}M
            </div>
            <div className="text-[10px] text-[var(--meta)] font-mono">CONTEXT CACHING ON</div>
          </div>
          <div className="space-y-1">
            <div className="text-[11px] text-[var(--muted)]">SWE-BENCH VERIFIED</div>
            <div className="text-2xl font-bold text-[var(--fg)] font-sans">54.8%</div>
            <div className="text-[10px] text-[var(--accent)] font-mono">SOTA AGENT FLEET</div>
          </div>
          <div className="space-y-1">
            <div className="text-[11px] text-[var(--muted)]">DATA RETENTION</div>
            <div className="text-2xl font-bold text-[var(--fg)] font-sans">0 B</div>
            <div className="text-[10px] text-[var(--meta)] font-mono">SOVEREIGN AIR-GAPPED</div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. THREE EDITORIAL PILLARS (Cursor Design System)       */}
      {/* ======================================================== */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-oklab-b">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="text-xs font-mono text-[var(--accent)] uppercase tracking-wider font-semibold">
            [ARCHITECTURE]
          </div>
          <h2 className="font-display-section text-[var(--fg)]">
            Engineered for Sovereign Velocity.
          </h2>
          <p className="font-editorial text-[var(--muted)] text-base leading-relaxed">
            Every agent decision, diff synthesis, and containerized compilation is governed by deterministic cryptographic guarantees.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="p-8 rounded-2xl border-oklab bg-[var(--surface-100)] shadow-sm space-y-4 hover:border-[var(--accent)] transition-all">
            <div className="w-10 h-10 rounded-full bg-[var(--surface-200)] flex items-center justify-center text-[var(--accent)]">
              <IconCpu size={20} strokeWidth={1.5} />
            </div>
            <h3 className="font-sans font-bold text-lg text-[var(--fg)]">
              01. Hardware MicroVM Isolation
            </h3>
            <p className="font-editorial text-sm leading-relaxed text-[var(--muted)]">
              Agent executions occur within ephemeral Firecracker microVMs with dedicated Linux network namespaces, seccomp filters, and cgroup hardware throttling.
            </p>
            <div className="pt-2 text-xs font-mono text-[var(--meta)] border-oklab-t">
              ISOLATION: LINUX_KERNEL_VETH
            </div>
          </div>

          {/* Card 2 */}
          <div className="p-8 rounded-2xl border-oklab bg-[var(--surface-100)] shadow-sm space-y-4 hover:border-[var(--accent)] transition-all">
            <div className="w-10 h-10 rounded-full bg-[var(--surface-200)] flex items-center justify-center text-[var(--accent)]">
              <IconGitCommit size={20} strokeWidth={1.5} />
            </div>
            <h3 className="font-sans font-bold text-lg text-[var(--fg)]">
              02. Atomic AST Patch Engine
            </h3>
            <p className="font-editorial text-sm leading-relaxed text-[var(--muted)]">
              Eliminates LLM hallucination by performing typed AST node replacements. Generates deterministic RFC 6902 JSON patches verified by automated typechecking.
            </p>
            <div className="pt-2 text-xs font-mono text-[var(--meta)] border-oklab-t">
              SYNTHESIS: ZERO_REGRESSION
            </div>
          </div>

          {/* Card 3 */}
          <div className="p-8 rounded-2xl border-oklab bg-[var(--surface-100)] shadow-sm space-y-4 hover:border-[var(--accent)] transition-all">
            <div className="w-10 h-10 rounded-full bg-[var(--surface-200)] flex items-center justify-center text-[var(--accent)]">
              <IconLayersLinked size={20} strokeWidth={1.5} />
            </div>
            <h3 className="font-sans font-bold text-lg text-[var(--fg)]">
              03. Sovereign MCP Ecosystem
            </h3>
            <p className="font-editorial text-sm leading-relaxed text-[var(--muted)]">
              Connect external databases, cloud services, and developer tooling through the Model Context Protocol without exporting source code outside your boundary.
            </p>
            <div className="pt-2 text-xs font-mono text-[var(--meta)] border-oklab-t">
              PROTOCOL: JSON_RPC_OVER_STDIO
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 4. CALL TO ACTION SECTION                                */}
      {/* ======================================================== */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-6">
        <div className="max-w-xl mx-auto space-y-4">
          <h2 className="font-display-section text-[var(--fg)]">
            Ready to deploy your sovereign AI fleet?
          </h2>
          <p className="font-editorial text-[var(--muted)] text-base leading-relaxed">
            Get started with our single-binary CLI or deploy the self-hosted cluster on your dedicated infrastructure.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            href="/downloads"
            className="pill-btn flex items-center gap-2 px-6 py-3.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm font-sans font-medium tracking-wide shadow-atmospheric transition-all"
          >
            <span>Download Kilo CLI</span>
            <IconArrowUpRight size={16} />
          </Link>
          <Link
            href="/pricing"
            className="pill-btn flex items-center gap-2 px-6 py-3.5 border-oklab bg-[var(--surface-100)] hover:bg-[var(--surface-200)] text-[var(--fg)] text-sm font-sans font-medium transition-all"
          >
            <span>View Pricing Plans</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
