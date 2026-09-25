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
import { useParams } from "next/navigation";
import {
  IconCopy,
  IconCheck,
  IconArrowLeft,
  IconShieldCheck,
  IconDownload,
} from "@tabler/icons-react";

export default function MarketplaceDetailPage() {
  const params = useParams();
  const slug = (params.slug as string) || "docker-sandbox-agent";
  const [activeTab, setActiveTab] = useState<"README" | "SCHEMA" | "VERSIONS">("README");
  const [copied, setCopied] = useState(false);

  const installCmd = `index0 mcp add @index0/${slug}`;

  const copyInstall = () => {
    navigator.clipboard.writeText(installCmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const schemaExample = {
    $schema: "http://json-schema.org/draft-07/schema#",
    title: `INDEX0_MCP_${slug.toUpperCase().replace(/-/g, "_")}`,
    type: "object",
    properties: {
      version: { type: "string", default: "1.4.2" },
      isolation: { type: "string", enum: ["firecracker_microvm", "docker_strict"] },
      capabilities: {
        type: "array",
        items: { type: "string" },
        default: ["exec", "diff_patch", "typecheck", "seccomp_audit"],
      },
      telemetry: {
        type: "object",
        properties: {
          meter_dimensions: { type: "array", items: { type: "string" } },
          lago_rating_plan: { type: "string", default: "plan_enterprise" },
        },
      },
    },
    required: ["version", "isolation", "capabilities"],
  };

  return (
    <main className="min-h-[100dvh] w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs font-mono text-[var(--muted)]">
        <Link href="/marketplace" className="hover:text-[var(--accent)] flex items-center gap-1">
          <IconArrowLeft size={13} />
          <span>$ cd /marketplace</span>
        </Link>
        <span>/</span>
        <span className="text-[var(--fg)] font-semibold">{slug}</span>
      </div>

      {/* Package Header Card */}
      <div className="p-8 rounded-2xl border-oklab bg-[var(--surface-100)] shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[var(--accent)] font-semibold mb-1">
              <IconShieldCheck size={16} />
              <span>[VERIFIED INDEX0 SOVEREIGN EXTENSION]</span>
            </div>
            <h1 className="font-mono font-bold text-2xl md:text-3xl text-[var(--fg)]">
              @{slug}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={copyInstall}
              className="pill-btn flex items-center gap-2 px-5 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--accent-fg)] text-xs font-mono font-medium shadow-sm transition-colors cursor-pointer"
            >
              {copied ? <IconCheck size={14} /> : <IconDownload size={14} />}
              <span>{copied ? "COPIED TO CLIPBOARD" : "INSTALL VIA CLI"}</span>
            </button>
          </div>
        </div>

        {/* Install Code Pill */}
        <div className="p-3 rounded-xl bg-[var(--surface-200)] border-oklab flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2 text-[var(--fg)]">
            <span className="text-[var(--accent)] font-bold">$</span>
            <span>{installCmd}</span>
          </div>
          <button
            type="button"
            onClick={copyInstall}
            className="text-[var(--muted)] hover:text-[var(--fg)] transition-colors"
          >
            {copied ? <IconCheck size={14} className="text-[var(--accent)]" /> : <IconCopy size={14} />}
          </button>
        </div>

        {/* Metadata Badges */}
        <div className="flex flex-wrap gap-4 pt-2 text-xs font-mono text-[var(--muted)] border-oklab-t">
          <div>VERSION: <strong className="text-[var(--fg)]">v1.4.2</strong></div>
          <div>LICENSE: <strong className="text-[var(--fg)]">PROPRIETARY</strong></div>
          <div>AUTHOR: <strong className="text-[var(--fg)]">INDEX0 AI Inc.</strong></div>
          <div>ISOLATION: <strong className="text-[var(--accent)]">HARDWARE_MICROVM</strong></div>
        </div>
      </div>

      {/* Tabbed Interface */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-oklab-b pb-2 font-mono text-xs">
          <button
            type="button"
            onClick={() => setActiveTab("README")}
            className={`px-4 py-2 rounded-t-lg transition-colors cursor-pointer ${
              activeTab === "README"
                ? "bg-[var(--surface-100)] text-[var(--accent)] font-bold border-oklab border-b-0"
                : "text-[var(--muted)] hover:text-[var(--fg)]"
            }`}
          >
            [01. README.md]
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("SCHEMA")}
            className={`px-4 py-2 rounded-t-lg transition-colors cursor-pointer ${
              activeTab === "SCHEMA"
                ? "bg-[var(--surface-100)] text-[var(--accent)] font-bold border-oklab border-b-0"
                : "text-[var(--muted)] hover:text-[var(--fg)]"
            }`}
          >
            [02. MCP_SCHEMA.json]
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("VERSIONS")}
            className={`px-4 py-2 rounded-t-lg transition-colors cursor-pointer ${
              activeTab === "VERSIONS"
                ? "bg-[var(--surface-100)] text-[var(--accent)] font-bold border-oklab border-b-0"
                : "text-[var(--muted)] hover:text-[var(--fg)]"
            }`}
          >
            [03. VERSIONS]
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 rounded-2xl border-oklab bg-[var(--surface-100)] shadow-sm">
          {activeTab === "README" && (
            <div className="space-y-4 font-editorial text-sm leading-relaxed text-[var(--fg)]">
              <h2 className="font-mono font-bold text-lg text-[var(--fg)]">Architecture Overview</h2>
              <p>
                The {slug} module integrates directly with the INDEX0 Kernel Orchestrator via standard Model Context Protocol (MCP) JSON-RPC over stdio. All execution boundaries are strictly enforced using Linux cgroups and seccomp profiles to prevent untrusted code escape.
              </p>
              <h3 className="font-mono font-bold text-base text-[var(--fg)] pt-2">Security Contract</h3>
              <ul className="list-disc list-inside space-y-1 font-mono text-xs text-[var(--muted)]">
                <li>Hardware microVM container isolation with 0 WAN outbound access.</li>
                <li>Zero data retention commitment: temporary storage purged on exit.</li>
                <li>All AST patch diffs verified with automated TypeScript compiler gates.</li>
              </ul>
            </div>
          )}

          {activeTab === "SCHEMA" && (
            <div className="space-y-2 font-mono text-xs">
              <div className="text-[11px] text-[var(--meta)] flex justify-between">
                <span>SCHEMA DEFINITION (DRAFT-07)</span>
                <span className="text-[var(--accent)]">JSON_RPC VALIDATED</span>
              </div>
              <pre className="p-4 rounded-xl bg-[var(--surface-200)] border-oklab overflow-x-auto text-[var(--fg)] leading-relaxed">
                {JSON.stringify(schemaExample, null, 2)}
              </pre>
            </div>
          )}

          {activeTab === "VERSIONS" && (
            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-[var(--surface-200)] border-oklab flex justify-between items-center">
                <div>
                  <span className="font-bold text-[var(--fg)]">v1.4.2 (Latest Release)</span>
                  <div className="text-[11px] text-[var(--muted)]">Firecracker 0.4ms boot optimization and seccomp v4 update.</div>
                </div>
                <span className="text-[var(--accent)] font-semibold">[CURRENT]</span>
              </div>
              <div className="p-3 rounded-xl bg-[var(--surface-200)] border-oklab flex justify-between items-center">
                <div>
                  <span className="font-bold text-[var(--fg)]">v1.4.0</span>
                  <div className="text-[11px] text-[var(--muted)]">Added zero-trust Ed25519 token validation capability.</div>
                </div>
                <span className="text-[var(--meta)]">STABLE</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
