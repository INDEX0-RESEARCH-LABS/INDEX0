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
  IconActivity,
  IconCheck,
  IconCode,
} from "@tabler/icons-react";

interface LogEntry {
  id: string;
  time: string;
  tag: "INFO" | "EXEC" | "DIFF" | "VERIFY";
  message: string;
}

const INITIAL_LOGS: LogEntry[] = [
  { id: "1", time: "16:04:11.204", tag: "INFO", message: "Swarm kernel initiated. Attaching to workspace /dev/incubator/INDEX0" },
  { id: "2", time: "16:04:11.512", tag: "EXEC", message: "Dispatching MicroVM sandbox container (veth: sbx-net-01, cgroup: 512MB)" },
  { id: "3", time: "16:04:12.180", tag: "DIFF", message: "AST tree parsed: 2,419 nodes. Identified zero-trust middleware insertion point" },
  { id: "4", time: "16:04:12.890", tag: "VERIFY", message: "Running typecheck --noEmit on generated patch: 0 errors detected" },
  { id: "5", time: "16:04:13.410", tag: "EXEC", message: "Executing automated test suite: 160/160 assertions passed (100% clean)" },
];

const THOUGHT_STREAMS = [
  { step: "01:PLAN", title: "AST ANALYSIS", text: "Parsing TypeScript abstract syntax tree to map export signatures across @index0/contracts and auth middleware." },
  { step: "02:REASON", title: "ISOLATION VERIFICATION", text: "Confirming sandbox hardware namespace isolation before executing untrusted external package dependencies." },
  { step: "03:SYNTHESIS", title: "ATOMIC DIFF EMISSION", text: "Generating Ed25519 cryptographic token verification routines with zero external runtime daemon requirements." },
  { step: "04:INTEGRATION", title: "TURBO PIPELINE VERIFY", text: "Running full monorepo typecheck and contracts conformance gates across all 4 platform pillars." },
];

export function AgentExecutionMonitor() {
  const [logs, setLogs] = useState<LogEntry[]>(INITIAL_LOGS);
  const [activeTab, setActiveTab] = useState<"LOGS" | "THOUGHTS" | "DIFF">("LOGS");
  const [activeThoughtIdx, setActiveThoughtIdx] = useState(2);

  // Periodic log stream generation for cockpit density
  useEffect(() => {
    const extraMessages = [
      { tag: "INFO" as const, msg: "OpenMeter dimension heartbeat: 12 events synchronized with Lago rating engine" },
      { tag: "VERIFY" as const, msg: "Memory footprint verified at 42.1% (within nominal operating envelope)" },
      { tag: "DIFF" as const, msg: "Atomic patch snapshot saved to .index0/checkpoints/day-08" },
      { tag: "EXEC" as const, msg: "Healthcheck ping returned 200 OK from gateway node eu-central-1" },
    ];

    let count = 0;
    const interval = setInterval(() => {
      if (count < extraMessages.length) {
        const item = extraMessages[count];
        const now = new Date();
        const timeStr = now.toTimeString().split(" ")[0] + "." + String(now.getMilliseconds()).padStart(3, "0");
        setLogs((prev) => [
          ...prev.slice(-8),
          { id: String(Date.now()), time: timeStr, tag: item.tag, message: item.msg },
        ]);
        count++;
      }
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative w-full bg-obsidian px-4 md:px-8 py-16 ascii-border-b">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex items-center gap-2 text-xs font-mono text-dim mb-2">
          <span>┌────────────────────────────────────────────────────────┐</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-mono text-emerald-term font-bold mb-1">
              [SEC_03: EXECUTION MONITOR]
            </div>
            <h2 className="text-2xl md:text-4xl font-bold uppercase tracking-tighter font-mono text-offwhite">
              AUTONOMOUS EXECUTION TELEMETRY
            </h2>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="px-2.5 py-1 bg-chrome border border-hairline text-emerald-term flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-term animate-emerald-pulse" />
              <span>LIVE_STREAM: ACTIVE</span>
            </span>
          </div>
        </div>

        {/* Cockpit Monitor Frame */}
        <div className="bg-chrome border border-hairline overflow-hidden">
          {/* Top Bar Tabs */}
          <div className="px-3 py-2 bg-obsidian border-b border-hairline flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveTab("LOGS")}
                className={`px-3 py-1 flex items-center gap-1.5 cursor-pointer border ${
                  activeTab === "LOGS"
                    ? "bg-chrome border-emerald-term text-emerald-term"
                    : "border-transparent text-muted hover:text-offwhite"
                }`}
              >
                <IconTerminal2 size={13} strokeWidth={1.5} />
                <span>TERMINAL_LOGS</span>
                <span className="text-[10px] text-dim font-mono">[{logs.length}]</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("THOUGHTS")}
                className={`px-3 py-1 flex items-center gap-1.5 cursor-pointer border ${
                  activeTab === "THOUGHTS"
                    ? "bg-chrome border-emerald-term text-emerald-term"
                    : "border-transparent text-muted hover:text-offwhite"
                }`}
              >
                <IconActivity size={13} strokeWidth={1.5} />
                <span>THOUGHT_STREAM</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("DIFF")}
                className={`px-3 py-1 flex items-center gap-1.5 cursor-pointer border ${
                  activeTab === "DIFF"
                    ? "bg-chrome border-emerald-term text-emerald-term"
                    : "border-transparent text-muted hover:text-offwhite"
                }`}
              >
                <IconCode size={13} strokeWidth={1.5} />
                <span>SYNTAX_DIFF</span>
              </button>
            </div>

            <div className="flex items-center gap-3 text-[11px] text-dim">
              <span>SANDBOX: sbx-9921b</span>
              <span>PID: 41829</span>
            </div>
          </div>

          {/* Panel Content */}
          <div className="p-4 bg-obsidian font-mono text-xs min-h-[300px]">
            {activeTab === "LOGS" && (
              <div className="space-y-2 font-mono">
                {logs.map((log) => (
                  <div key={log.id} className="flex flex-col sm:flex-row sm:items-baseline gap-2 text-[11px] leading-relaxed">
                    <span className="text-dim shrink-0">[{log.time}]</span>
                    <span
                      className={`px-1.5 py-0.2 text-[10px] font-bold shrink-0 ${
                        log.tag === "INFO"
                          ? "bg-chrome text-muted border border-hairline"
                          : log.tag === "EXEC"
                          ? "bg-emerald-dim text-emerald-term border border-emerald-term/40"
                          : log.tag === "DIFF"
                          ? "bg-chrome text-offwhite border border-hairline"
                          : "bg-chrome text-emerald-term border border-emerald-term"
                      }`}
                    >
                      [{log.tag}]
                    </span>
                    <span className="text-offwhite break-all">{log.message}</span>
                  </div>
                ))}
                <div className="flex items-center gap-2 text-[11px] text-emerald-term pt-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-term animate-emerald-pulse" />
                  <span className="text-dim">Awaiting next telemetry dispatch from sandbox agent...</span>
                </div>
              </div>
            )}

            {activeTab === "THOUGHTS" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {THOUGHT_STREAMS.map((item, idx) => {
                  const isCurrent = idx === activeThoughtIdx;
                  return (
                    <div
                      key={item.step}
                      onClick={() => setActiveThoughtIdx(idx)}
                      className={`p-4 border cursor-pointer transition-colors ${
                        isCurrent
                          ? "bg-chrome border-emerald-term text-offwhite"
                          : "bg-obsidian border-hairline text-muted hover:border-hairline-subtle"
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] mb-2">
                        <span className="text-emerald-term font-bold">{item.step}</span>
                        <span className="text-dim font-mono">[{item.title}]</span>
                      </div>
                      <p className="text-xs leading-relaxed font-mono text-offwhite">
                        {item.text}
                      </p>
                      {isCurrent && (
                        <div className="mt-3 pt-2 border-t border-hairline flex items-center justify-between text-[10px] text-emerald-term">
                          <span>AGENT_CONFIDENCE: 99.4%</span>
                          <span>SYNTHESIZING...</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {activeTab === "DIFF" && (
              <div className="space-y-1 text-[11px]">
                <div className="text-dim pb-2 mb-2 border-b border-hairline flex justify-between">
                  <span>File: packages/contracts/src/v1/billing/lago.ts</span>
                  <span className="text-emerald-term">+8 / -0 lines</span>
                </div>
                <div className="bg-emerald-dim text-emerald-term p-1 border-l-2 border-emerald-term">
                  + export interface ILagoBillableMetric &#123;
                </div>
                <div className="bg-emerald-dim text-emerald-term p-1 border-l-2 border-emerald-term">
                  +   code: string;
                </div>
                <div className="bg-emerald-dim text-emerald-term p-1 border-l-2 border-emerald-term">
                  +   name: string;
                </div>
                <div className="bg-emerald-dim text-emerald-term p-1 border-l-2 border-emerald-term">
                  +   aggregation_type: &quot;count_agg&quot; | &quot;sum_agg&quot; | &quot;max_agg&quot;;
                </div>
                <div className="bg-emerald-dim text-emerald-term p-1 border-l-2 border-emerald-term">
                  +   field_name?: string;
                </div>
                <div className="bg-emerald-dim text-emerald-term p-1 border-l-2 border-emerald-term">
                  + &#125;
                </div>
              </div>
            )}
          </div>

          {/* Cockpit Status Footer */}
          <div className="px-4 py-2 bg-chrome border-t border-hairline flex flex-wrap items-center justify-between text-[11px] text-dim font-mono gap-2">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <IconCheck size={13} className="text-emerald-term" />
                <span>AST_VALIDATED</span>
              </span>
              <span>CONTRACTS: v1.12.0</span>
            </div>
            <div className="flex items-center gap-2 text-offwhite">
              <span>SOVEREIGN CLUSTER:</span>
              <span className="text-emerald-term">index0-net (HEALTHY)</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
