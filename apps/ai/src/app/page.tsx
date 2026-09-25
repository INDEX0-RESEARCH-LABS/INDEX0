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
  IconSparkles,
} from "@tabler/icons-react";
import { RetroComputerTerminal } from "@/components/RetroComputerTerminal";
import { AutoWideVideoBanner } from "@/components/AutoWideVideoBanner";

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
      {/* 1. HERO SECTION: Vintage Terminal + 3D WebGL ASCII Art   */}
      {/* ======================================================== */}
      <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20 md:pt-16 md:pb-24 border-oklab-b">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Interactive Retro Computer Terminal with 3D ASCII Motion Art Playing on Screen */}
          <div className="lg:col-span-6 order-2 lg:order-1 flex justify-center items-center w-full">
            <RetroComputerTerminal />
          </div>

          {/* Right Column: Headlines & Call to Action */}
          <div className="lg:col-span-6 order-1 lg:order-2 space-y-6">
            {/* Display Headline */}
            <h1 className="font-display-hero text-[var(--fg)] tracking-tight">
              Stop Babysitting AI.
              <br className="hidden sm:inline" /> Start Living Your Life.
            </h1>

            {/* 19.2px jjannon Editorial Serif Body Voice */}
            <p className="font-editorial text-[var(--muted)] max-w-xl text-lg md:text-xl leading-relaxed">
              Current AI tools keep you glued to your screen, acting as an unpaid auditor for unverified code. INDEX0 flips the paradigm: set your architectural vision, close your editor, and touch grass. Operating with zero data retention and hardware-isolated execution, background agents test, scan, and package verified pull requests while you catch your breath.
            </p>

            {/* Installer Action Bar */}
            <div className="pt-2 space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                {/* Full Pill Primary CTA */}
                <Link
                  href="/downloads"
                  className="pill-btn flex items-center gap-2 px-6 py-3 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--accent-fg)] text-sm font-mono font-medium tracking-wide transition-all cursor-pointer"
                >
                  <span>Install INDEX0 Platform</span>
                  <IconArrowUpRight size={16} strokeWidth={2} />
                </Link>

                <Link
                  href="/marketplace"
                  className="pill-btn flex items-center gap-2 px-5 py-3 border-oklab hover:border-[var(--accent)] bg-[var(--surface-100)] hover:bg-[var(--surface-200)] text-[var(--fg)] text-sm font-mono font-medium transition-all cursor-pointer"
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

            {/* AI State Row */}
            <div className="pt-2 flex flex-wrap items-center gap-2 text-[11px] font-mono">
              <span className="text-[var(--meta)]">AGENT STATES:</span>
              <span className="px-2 py-0.5 rounded-full text-[var(--fg)] bg-[var(--surface-200)] border border-oklab">THINKING</span>
              <span className="px-2 py-0.5 rounded-full text-[var(--fg)] bg-[var(--surface-200)] border border-oklab">GREP</span>
              <span className="px-2 py-0.5 rounded-full text-[var(--fg)] bg-[var(--surface-200)] border border-oklab">READ</span>
              <span className="px-2 py-0.5 rounded-full text-[var(--fg)] bg-[var(--surface-200)] border border-oklab">EDIT</span>
              <span className="px-2 py-0.5 rounded-full text-[var(--fg)] bg-[var(--surface-200)] border border-oklab">DONE</span>
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
            <div className="text-2xl font-bold text-[var(--fg)] font-mono">{activeSandboxes}</div>
            <div className="text-[10px] text-[var(--accent)] font-mono">FIRECRACKER 0.4ms BOOT</div>
          </div>
          <div className="space-y-1">
            <div className="text-[11px] text-[var(--muted)]">TOKENS SYNTHESIZED</div>
            <div className="text-2xl font-bold text-[var(--fg)] font-mono">
              {(tokensProcessed / 1000000).toFixed(1)}M
            </div>
            <div className="text-[10px] text-[var(--meta)] font-mono">CONTEXT CACHING ON</div>
          </div>
          <div className="space-y-1">
            <div className="text-[11px] text-[var(--muted)]">SWE-BENCH VERIFIED</div>
            <div className="text-2xl font-bold text-[var(--fg)] font-mono">54.8%</div>
            <div className="text-[10px] text-[var(--accent)] font-mono">SOTA AGENT FLEET</div>
          </div>
          <div className="space-y-1">
            <div className="text-[11px] text-[var(--muted)]">DATA RETENTION</div>
            <div className="text-2xl font-bold text-[var(--fg)] font-mono">0 B</div>
            <div className="text-[10px] text-[var(--meta)] font-mono">SOVEREIGN AIR-GAPPED</div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. FULL PAGE WIDTH AUTOMATIC WIDE VIDEO CAROUSEL         */}
      {/* ======================================================== */}
      <AutoWideVideoBanner />

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
            className="pill-btn flex items-center gap-2 px-6 py-3.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--accent-fg)] text-sm font-mono font-medium tracking-wide transition-all"
          >
            <span>Download INDEX0 CLI</span>
            <IconArrowUpRight size={16} />
          </Link>
          <Link
            href="/pricing"
            className="pill-btn flex items-center gap-2 px-6 py-3.5 border-oklab bg-[var(--surface-100)] hover:bg-[var(--surface-200)] text-[var(--fg)] text-sm font-mono font-medium transition-all"
          >
            <span>View Pricing Plans</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
