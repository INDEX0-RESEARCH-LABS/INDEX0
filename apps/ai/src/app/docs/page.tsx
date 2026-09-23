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
import { IconCopy, IconCheck, IconTerminal, IconBook } from "@tabler/icons-react";

export default function DocsPage() {
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(text);
    setTimeout(() => setCopiedCmd(null), 1500);
  };

  const CLI_COMMANDS = [
    {
      cmd: "kilo init",
      desc: "Initializes a sovereign INDEX0 workspace in the current directory with contracts and sandbox bounds.",
      flags: "--template [react|node|rust|python] --air-gap",
    },
    {
      cmd: "kilo agent run [prompt]",
      desc: "Dispatches an autonomous multi-agent task through the Architect -> Planner -> Coder loop.",
      flags: "--model [claude-3-7|gpt-4o] --sandbox microvm --timeout 300s",
    },
    {
      cmd: "kilo sandbox inspect",
      desc: "Lists all running Firecracker microVM instances and active memory/cgroup allocations.",
      flags: "--json --watch",
    },
    {
      cmd: "kilo mcp add [server]",
      desc: "Connects an external Model Context Protocol server over stdio or SSE transport.",
      flags: "--env KEY=VAL --strict-schema",
    },
    {
      cmd: "kilo diff review",
      desc: "Interactively inspects generated AST diffs, runs background typechecks, and generates atomic git commits.",
      flags: "--apply --interactive",
    },
  ];

  return (
    <main className="min-h-[100dvh] w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      {/* Header */}
      <div className="space-y-3 border-oklab-b pb-8">
        <div className="inline-flex items-center gap-2 text-xs font-mono text-[var(--accent)] font-semibold uppercase tracking-wider">
          <IconBook size={16} />
          <span>[KILO CLI DOCUMENTATION]</span>
        </div>
        <h1 className="font-display-section text-[var(--fg)]">
          Developer Manual &amp; Command Reference.
        </h1>
        <p className="font-editorial text-[var(--muted)] text-base max-w-2xl leading-relaxed">
          The Kilo CLI is the primary developer interface for coordinating sovereign agents, dispatching Firecracker sandboxes, and auditing AST diffs.
        </p>
      </div>

      {/* Quickstart 3-Step Guide */}
      <div className="p-8 rounded-2xl border-oklab bg-[var(--surface-100)] shadow-sm space-y-6">
        <h2 className="font-sans font-bold text-xl text-[var(--fg)] flex items-center gap-2">
          <IconTerminal size={20} className="text-[var(--accent)]" />
          <span>Quickstart in 60 Seconds</span>
        </h2>

        <div className="space-y-4 font-mono text-xs">
          {/* Step 1 */}
          <div className="p-4 rounded-xl bg-[var(--surface-200)] border-oklab flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-[var(--meta)] text-[10px]">STEP 01: INSTALL KILO BINARY</div>
              <div className="text-[var(--fg)] font-bold">curl -fsSL https://dl.ai.index0.in/install.sh | sh</div>
            </div>
            <button
              type="button"
              onClick={() => copy("curl -fsSL https://dl.ai.index0.in/install.sh | sh")}
              className="text-[var(--muted)] hover:text-[var(--fg)]"
            >
              {copiedCmd === "curl -fsSL https://dl.ai.index0.in/install.sh | sh" ? <IconCheck size={16} className="text-[var(--accent)]" /> : <IconCopy size={16} />}
            </button>
          </div>

          {/* Step 2 */}
          <div className="p-4 rounded-xl bg-[var(--surface-200)] border-oklab flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-[var(--meta)] text-[10px]">STEP 02: BOOTSTRAP WORKSPACE</div>
              <div className="text-[var(--fg)] font-bold">kilo init --air-gap</div>
            </div>
            <button
              type="button"
              onClick={() => copy("kilo init --air-gap")}
              className="text-[var(--muted)] hover:text-[var(--fg)]"
            >
              {copiedCmd === "kilo init --air-gap" ? <IconCheck size={16} className="text-[var(--accent)]" /> : <IconCopy size={16} />}
            </button>
          </div>

          {/* Step 3 */}
          <div className="p-4 rounded-xl bg-[var(--surface-200)] border-oklab flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-[var(--meta)] text-[10px]">STEP 03: DISPATCH FIRST AGENT TASK</div>
              <div className="text-[var(--fg)] font-bold">kilo agent run &quot;Refactor auth middleware to zero-trust ed25519&quot;</div>
            </div>
            <button
              type="button"
              onClick={() => copy("kilo agent run \"Refactor auth middleware to zero-trust ed25519\"")}
              className="text-[var(--muted)] hover:text-[var(--fg)]"
            >
              {copiedCmd === "kilo agent run \"Refactor auth middleware to zero-trust ed25519\"" ? <IconCheck size={16} className="text-[var(--accent)]" /> : <IconCopy size={16} />}
            </button>
          </div>
        </div>
      </div>

      {/* CLI Command Reference Grid */}
      <div className="space-y-6">
        <h2 className="font-sans font-bold text-2xl text-[var(--fg)]">
          Command Line Reference
        </h2>

        <div className="grid grid-cols-1 gap-4">
          {CLI_COMMANDS.map((item) => (
            <div
              key={item.cmd}
              className="p-6 rounded-2xl border-oklab bg-[var(--surface-100)] shadow-sm space-y-3 font-mono"
            >
              <div className="flex items-center justify-between border-oklab-b pb-2">
                <div className="flex items-center gap-2 text-sm font-bold text-[var(--accent)]">
                  <span>$</span>
                  <span>{item.cmd}</span>
                </div>
                <button
                  type="button"
                  onClick={() => copy(item.cmd)}
                  className="text-xs text-[var(--muted)] hover:text-[var(--fg)] flex items-center gap-1 cursor-pointer"
                >
                  {copiedCmd === item.cmd ? <IconCheck size={13} className="text-[var(--accent)]" /> : <IconCopy size={13} />}
                  <span>{copiedCmd === item.cmd ? "COPIED" : "COPY"}</span>
                </button>
              </div>

              <p className="font-editorial text-sm text-[var(--muted)] leading-relaxed">
                {item.desc}
              </p>

              <div className="p-2.5 rounded-lg bg-[var(--surface-200)] text-xs text-[var(--meta)] flex items-center gap-2 overflow-x-auto">
                <span className="text-[var(--fg)] font-semibold">FLAGS:</span>
                <span>{item.flags}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
