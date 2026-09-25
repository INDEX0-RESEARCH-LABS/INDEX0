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

import React, { useState } from "react";
import Link from "next/link";
import { IconCheck, IconCalculator } from "@tabler/icons-react";

export default function PricingPage() {
  const [tokensPerMonth, setTokensPerMonth] = useState(50); // Millions of tokens (10M to 200M)
  const [seats, setSeats] = useState(5);

  // Compute ASCII progress bar for slider (10 blocks total)
  const renderAsciiBar = (percent: number) => {
    const total = 10;
    const filled = Math.min(total, Math.max(0, Math.round((percent / 100) * total)));
    const empty = total - filled;
    return `[${"█".repeat(filled)}${"░".repeat(empty)}] ${percent}%`;
  };

  const sliderPercent = Math.round(((tokensPerMonth - 10) / 190) * 100);

  // Estimated cost calculation
  const estimatedCost = seats * 20 + Math.round((tokensPerMonth - 20) * 1.5);
  const estimatedSandboxHours = seats * 120 + tokensPerMonth * 8;

  return (
    <main className="min-h-[100dvh] w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="text-xs font-mono text-[var(--accent)] font-semibold uppercase tracking-wider">
          [SOVEREIGN TOKEN ECONOMICS]
        </div>
        <h1 className="font-display-section text-[var(--fg)]">
          Predictable Pricing. Zero Cloud Lock-In.
        </h1>
        <p className="font-editorial text-[var(--muted)] text-base leading-relaxed">
          Deploy on your sovereign infrastructure with self-hosted Lago rating engine or select our managed sovereign VPC deployment.
        </p>
      </div>

      {/* Pricing Tiers Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Tier 1: Community */}
        <div className="p-8 rounded-2xl border-oklab bg-[var(--surface-100)] flex flex-col justify-between space-y-6 shadow-sm hover:border-oklab-strong transition-all">
          <div className="space-y-4">
            <div className="text-xs font-mono text-[var(--meta)]">[TIER_01: COMMUNITY]</div>
            <h2 className="font-mono font-bold text-2xl text-[var(--fg)]">Self-Hosted</h2>
            <div className="flex items-baseline gap-1 font-mono">
              <span className="text-3xl font-bold text-[var(--fg)]">$0</span>
              <span className="text-xs text-[var(--muted)]">/ forever free</span>
            </div>
            <p className="font-editorial text-xs leading-relaxed text-[var(--muted)]">
              Full open-source core stack for individual engineers running on local Linux or Docker.
            </p>

            <ul className="space-y-2 text-xs font-mono text-[var(--fg)] pt-2 border-oklab-t">
              <li className="flex items-center gap-2">
                <IconCheck size={14} className="text-[var(--accent)]" />
                <span>Single-binary INDEX0 CLI</span>
              </li>
              <li className="flex items-center gap-2">
                <IconCheck size={14} className="text-[var(--accent)]" />
                <span>Local Docker container sandboxes</span>
              </li>
              <li className="flex items-center gap-2">
                <IconCheck size={14} className="text-[var(--accent)]" />
                <span>Community MCP server access</span>
              </li>
              <li className="flex items-center gap-2">
                <IconCheck size={14} className="text-[var(--accent)]" />
                <span>Self-hosted Lago metering</span>
              </li>
            </ul>
          </div>

          <Link
            href="/downloads"
            className="pill-btn w-full py-2.5 text-center text-xs font-mono font-medium border-oklab hover:bg-[var(--surface-200)] text-[var(--fg)] transition-colors"
          >
            Download Free Binary
          </Link>
        </div>

        {/* Tier 2: Developer Pro (Featured) */}
        <div className="p-8 rounded-2xl border-2 border-[var(--accent)] bg-[var(--surface-100)] flex flex-col justify-between space-y-6 shadow-atmospheric relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[var(--accent)] text-[var(--accent-fg)] text-[10px] font-mono font-bold tracking-wider">
            RECOMMENDED
          </div>

          <div className="space-y-4">
            <div className="text-xs font-mono text-[var(--accent)]">[TIER_02: DEVELOPER PRO]</div>
            <h2 className="font-mono font-bold text-2xl text-[var(--fg)]">Team Swarm</h2>
            <div className="flex items-baseline gap-1 font-mono">
              <span className="text-3xl font-bold text-[var(--fg)]">$20</span>
              <span className="text-xs text-[var(--muted)]">/ seat / month</span>
            </div>
            <p className="font-editorial text-xs leading-relaxed text-[var(--muted)]">
              Multi-agent coordination with hardware-accelerated Firecracker microVM sandboxes.
            </p>

            <ul className="space-y-2 text-xs font-mono text-[var(--fg)] pt-2 border-oklab-t">
              <li className="flex items-center gap-2">
                <IconCheck size={14} className="text-[var(--accent)]" />
                <span>Everything in Community</span>
              </li>
              <li className="flex items-center gap-2">
                <IconCheck size={14} className="text-[var(--accent)]" />
                <span>0.4ms Firecracker microVM boot</span>
              </li>
              <li className="flex items-center gap-2">
                <IconCheck size={14} className="text-[var(--accent)]" />
                <span>Multi-agent swarm planner + coder</span>
              </li>
              <li className="flex items-center gap-2">
                <IconCheck size={14} className="text-[var(--accent)]" />
                <span>Automated AST patch verification</span>
              </li>
              <li className="flex items-center gap-2">
                <IconCheck size={14} className="text-[var(--accent)]" />
                <span>OpenMeter sub-ms token metrics</span>
              </li>
            </ul>
          </div>

          <Link
            href="/downloads"
            className="pill-btn w-full py-2.5 text-center text-xs font-mono font-medium bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--accent-fg)] transition-colors shadow-sm"
          >
            Start 14-Day Free Trial
          </Link>
        </div>

        {/* Tier 3: Sovereign Enterprise */}
        <div className="p-8 rounded-2xl border-oklab bg-[var(--surface-100)] flex flex-col justify-between space-y-6 shadow-sm hover:border-oklab-strong transition-all">
          <div className="space-y-4">
            <div className="text-xs font-mono text-[var(--meta)]">[TIER_03: ENTERPRISE]</div>
            <h2 className="font-mono font-bold text-2xl text-[var(--fg)]">Sovereign VPC</h2>
            <div className="flex items-baseline gap-1 font-mono">
              <span className="text-3xl font-bold text-[var(--fg)]">Custom</span>
              <span className="text-xs text-[var(--muted)]">/ dedicated cluster</span>
            </div>
            <p className="font-editorial text-xs leading-relaxed text-[var(--muted)]">
              Air-gapped on-prem or isolated dedicated VPC with zero data retention guarantee.
            </p>

            <ul className="space-y-2 text-xs font-mono text-[var(--fg)] pt-2 border-oklab-t">
              <li className="flex items-center gap-2">
                <IconCheck size={14} className="text-[var(--accent)]" />
                <span>Dedicated hardware enclave</span>
              </li>
              <li className="flex items-center gap-2">
                <IconCheck size={14} className="text-[var(--accent)]" />
                <span>Custom model fine-tuning &amp; weights</span>
              </li>
              <li className="flex items-center gap-2">
                <IconCheck size={14} className="text-[var(--accent)]" />
                <span>Zero Data Retention SLA (99.99%)</span>
              </li>
              <li className="flex items-center gap-2">
                <IconCheck size={14} className="text-[var(--accent)]" />
                <span>24/7 dedicated engineering pod</span>
              </li>
            </ul>
          </div>

          <a
            href="mailto:enterprise@index0.ai"
            className="pill-btn w-full py-2.5 text-center text-xs font-mono font-medium border-oklab hover:bg-[var(--surface-200)] text-[var(--fg)] transition-colors"
          >
            Contact Sovereign Sales
          </a>
        </div>
      </div>

      {/* Interactive Token & Sandbox Cost Calculator */}
      <div className="p-8 rounded-2xl border-oklab bg-[var(--surface-100)] shadow-sm space-y-6">
        <div className="flex items-center justify-between border-oklab-b pb-4">
          <div className="flex items-center gap-2 text-xs font-mono text-[var(--accent)] font-semibold">
            <IconCalculator size={16} />
            <span>[INTERACTIVE TOKEN &amp; SANDBOX CALCULATOR]</span>
          </div>
          <div className="text-xs font-mono text-[var(--meta)]">
            GAUGE: {renderAsciiBar(sliderPercent)}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Controls */}
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-[var(--fg)]">ESTIMATED TOKENS PER MONTH:</span>
                <span className="font-bold text-[var(--accent)]">{tokensPerMonth}M TOKENS</span>
              </div>
              <input
                type="range"
                min="10"
                max="200"
                step="5"
                value={tokensPerMonth}
                onChange={(e) => setTokensPerMonth(Number(e.target.value))}
                className="w-full accent-[var(--accent)] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-[var(--meta)]">
                <span>10M (Light Team)</span>
                <span>100M</span>
                <span>200M (Autonomous Fleet)</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-[var(--fg)]">ENGINEER SEATS:</span>
                <span className="font-bold text-[var(--accent)]">{seats} DEVELOPERS</span>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                step="1"
                value={seats}
                onChange={(e) => setSeats(Number(e.target.value))}
                className="w-full accent-[var(--accent)] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-[var(--meta)]">
                <span>1 Seat</span>
                <span>25 Seats</span>
                <span>50 Seats</span>
              </div>
            </div>
          </div>

          {/* Calculator Output Display */}
          <div className="p-6 rounded-xl bg-[var(--surface-200)] border-oklab space-y-4 font-mono">
            <div className="text-xs text-[var(--meta)]">[MONTHLY QUOTA PROJECTION]</div>
            <div className="flex justify-between items-baseline border-oklab-b pb-3">
              <span className="text-sm text-[var(--fg)]">Estimated Monthly Invoice:</span>
              <span className="text-3xl font-bold text-[var(--accent)] font-mono">${estimatedCost}</span>
            </div>
            <div className="space-y-1.5 text-xs text-[var(--muted)]">
              <div className="flex justify-between">
                <span>Firecracker Sandbox Hours:</span>
                <strong className="text-[var(--fg)]">{estimatedSandboxHours.toLocaleString()} hrs</strong>
              </div>
              <div className="flex justify-between">
                <span>Prompt Context Caching Rate:</span>
                <strong className="text-[var(--accent)]">94.2% Hit Ratio</strong>
              </div>
              <div className="flex justify-between">
                <span>AST Patch Conformance Gate:</span>
                <strong className="text-[var(--fg)]">100% Guaranteed</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
