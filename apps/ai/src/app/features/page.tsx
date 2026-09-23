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
import {
  IconCpu,
  IconShieldLock,
  IconGitCommit,
  IconLayersLinked,
} from "@tabler/icons-react";

export default function FeaturesPage() {
  const [activeDiagram, setActiveDiagram] = useState<"SANDBOX" | "CACHING" | "ISOLATION">("SANDBOX");

  return (
    <main className="min-h-[100dvh] w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="text-xs font-mono text-[var(--accent)] font-semibold uppercase tracking-wider">
          [SYSTEM BLUEPRINT &amp; SPECS]
        </div>
        <h1 className="font-display-section text-[var(--fg)]">
          Architecture &amp; Token Economics.
        </h1>
        <p className="font-editorial text-[var(--muted)] text-base leading-relaxed">
          Deep-dive into the four sovereign platform pillars: hardware microVM sandboxing, prompt context caching, AST diff synthesis, and copyleft boundary isolation.
        </p>
      </div>

      {/* Interactive ASCII Architecture Flowcharts */}
      <div className="p-8 rounded-2xl border-oklab bg-[var(--surface-100)] shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-oklab-b pb-4">
          <div className="space-y-1">
            <div className="text-xs font-mono text-[var(--accent)] font-semibold">
              [INTERACTIVE ASCII FLOWCHART]
            </div>
            <h2 className="font-sans font-bold text-lg text-[var(--fg)]">
              Core Platform Topology
            </h2>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <button
              type="button"
              onClick={() => setActiveDiagram("SANDBOX")}
              className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                activeDiagram === "SANDBOX"
                  ? "bg-[var(--fg)] text-[var(--bg)] border-[var(--fg)] font-semibold"
                  : "border-oklab text-[var(--muted)] hover:text-[var(--fg)]"
              }`}
            >
              01. Firecracker Sandbox
            </button>
            <button
              type="button"
              onClick={() => setActiveDiagram("CACHING")}
              className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                activeDiagram === "CACHING"
                  ? "bg-[var(--fg)] text-[var(--bg)] border-[var(--fg)] font-semibold"
                  : "border-oklab text-[var(--muted)] hover:text-[var(--fg)]"
              }`}
            >
              02. Context Caching
            </button>
            <button
              type="button"
              onClick={() => setActiveDiagram("ISOLATION")}
              className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                activeDiagram === "ISOLATION"
                  ? "bg-[var(--fg)] text-[var(--bg)] border-[var(--fg)] font-semibold"
                  : "border-oklab text-[var(--muted)] hover:text-[var(--fg)]"
              }`}
            >
              03. AGPL Isolation
            </button>
          </div>
        </div>

        {/* ASCII Flowchart Render Canvas */}
        <div className="p-6 rounded-xl bg-[var(--surface-200)] border-oklab font-mono text-xs overflow-x-auto text-[var(--fg)] leading-relaxed">
          {activeDiagram === "SANDBOX" && (
            <pre className="text-[var(--accent)]">
{`┌──────────────────────────────────────────────────────────────────────────┐
│                   INDEX0 SOVEREIGN KERNEL ORCHESTRATOR                   │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  [API REQUEST] ──> [SECURITY AUDIT] ──> [CGROUP MEMORY / CPU ENVELOPE]    │
│                                                │                         │
│                                                ▼                         │
│  ┌─────────────────────────┐       ┌─────────────────────────┐          │
│  │   SANDBOX-ALPHA (0.4ms) │       │   SANDBOX-BETA (0.4ms)  │          │
│  │   - NetNS: veth-sbx-01  │       │   - NetNS: veth-sbx-02  │          │
│  │   - Seccomp: STRICT_V4  │ <───> │   - Seccomp: STRICT_V4  │          │
│  │   - IPC: UNIX Domain    │       │   - IPC: UNIX Domain    │          │
│  │   - Memory: 512MB Cgroup│       │   - Memory: 512MB Cgroup│          │
│  └─────────────────────────┘       └─────────────────────────┘          │
│               │                                 │                        │
│               ▼                                 ▼                        │
│  [ATOMIC AST DIFF VALIDATION] ──────> [AUTOMATED TYPECHECK ENGINE: 0 ERR]│
└──────────────────────────────────────────────────────────────────────────┘`}
            </pre>
          )}

          {activeDiagram === "CACHING" && (
            <pre className="text-[var(--accent)]">
{`┌──────────────────────────────────────────────────────────────────────────┐
│                 PROMPT CONTEXT CACHING & TOKEN ECONOMICS                 │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  [WORKSPACE AST INDEX] ──> [COMPACT PREFIX TREE] ──> [RAM CACHE (NVMe)]   │
│                                                            │             │
│                                                            ▼             │
│  PROMPT ROUND 01: [PREFIX: 48,000 TOKENS] + [PROMPT: 240 TOKENS]         │
│                   ├── Cache HIT: 48,000 Tokens (Cost: $0.00 / 0ms)      │
│                   └── Evaluated: 240 Tokens (Latency: 140ms)             │
│                                                                          │
│  PROMPT ROUND 02: [INCREMENTAL AST PATCH] ──> ZERO RE-READ PENALTY        │
│                   └── Hit Ratio: 94.2% Sustained Across Entire Agent Run │
└──────────────────────────────────────────────────────────────────────────┘`}
            </pre>
          )}

          {activeDiagram === "ISOLATION" && (
            <pre className="text-[var(--accent)]">
{`┌──────────────────────────────────────────────────────────────────────────┐
│                 PROPRIETARY / AGPL ISOLATION BOUNDARY                     │
├─────────────────────────────────────┬────────────────────────────────────┤
│ PROPRIETARY CLOSED-SOURCE CORE      │ THIRD-PARTY OPEN-SOURCE ENCLAVES   │
│ (ai.index0.in & @index0/* packages) │ (Isolated Docker Containers)       │
├─────────────────────────────────────┼────────────────────────────────────┤
│ - Next.js 15 Web Portal             │ [CONTAINER 01: Lago Rating v1.12]  │
│ - Agent Orchestrator Pipeline       │  - Network: index0-net (Port 3001) │
│ - WebGL ASCII GLSL Shader Pipeline  │  - Access: REST API ONLY           │
│ - Zero-Trust Ed25519 Gateway        │                                    │
│                                     │ [CONTAINER 02: OpenMeter v0.7]     │
│ [NO DIRECT IMPORT OR STATIC LINK]   │  - Network: index0-net (Port 8888) │
│       │                             │  - Access: gRPC Event Stream ONLY  │
│       ▼                             │                                    │
│ [STRICT NETWORK API GATEWAY ONLY]   │ [ZERO AGPL VIRAL CONTAMINATION]    │
└─────────────────────────────────────┴────────────────────────────────────┘`}
            </pre>
          )}
        </div>
      </div>

      {/* Feature Deep Dive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-8 rounded-2xl border-oklab bg-[var(--surface-100)] space-y-4">
          <div className="w-10 h-10 rounded-full bg-[var(--surface-200)] flex items-center justify-center text-[var(--accent)]">
            <IconCpu size={20} strokeWidth={1.5} />
          </div>
          <h3 className="font-sans font-bold text-lg text-[var(--fg)]">
            E2B Firecracker Ephemeral MicroVMs
          </h3>
          <p className="font-editorial text-sm leading-relaxed text-[var(--muted)]">
            Every agent session spins up a lightweight Firecracker microVM instance in under 0.4 milliseconds. Code is compiled and executed in complete kernel isolation with zero risk of filesystem bleed.
          </p>
        </div>

        <div className="p-8 rounded-2xl border-oklab bg-[var(--surface-100)] space-y-4">
          <div className="w-10 h-10 rounded-full bg-[var(--surface-200)] flex items-center justify-center text-[var(--accent)]">
            <IconGitCommit size={20} strokeWidth={1.5} />
          </div>
          <h3 className="font-sans font-bold text-lg text-[var(--fg)]">
            Deterministic AST Node Patching
          </h3>
          <p className="font-editorial text-sm leading-relaxed text-[var(--muted)]">
            Traditional AI assistants hallucinate entire files. INDEX0 identifies precise abstract syntax tree node locations and applies atomic RFC 6902 replacements verified by background typecheckers.
          </p>
        </div>

        <div className="p-8 rounded-2xl border-oklab bg-[var(--surface-100)] space-y-4">
          <div className="w-10 h-10 rounded-full bg-[var(--surface-200)] flex items-center justify-center text-[var(--accent)]">
            <IconShieldLock size={20} strokeWidth={1.5} />
          </div>
          <h3 className="font-sans font-bold text-lg text-[var(--fg)]">
            Zero Data Retention Guarantee
          </h3>
          <p className="font-editorial text-sm leading-relaxed text-[var(--muted)]">
            Your proprietary source code never leaves your VPC. Context is processed in volatile memory with cryptographic wipe cycles executed upon session completion.
          </p>
        </div>

        <div className="p-8 rounded-2xl border-oklab bg-[var(--surface-100)] space-y-4">
          <div className="w-10 h-10 rounded-full bg-[var(--surface-200)] flex items-center justify-center text-[var(--accent)]">
            <IconLayersLinked size={20} strokeWidth={1.5} />
          </div>
          <h3 className="font-sans font-bold text-lg text-[var(--fg)]">
            Model Context Protocol (MCP) Standard
          </h3>
          <p className="font-editorial text-sm leading-relaxed text-[var(--muted)]">
            Native support for MCP tools, external databases, issue trackers, and custom command executors communicating over typed JSON-RPC stdio pipes.
          </p>
        </div>
      </div>
    </main>
  );
}
