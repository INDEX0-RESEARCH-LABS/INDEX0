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

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  IconStar,
  IconCopy,
  IconCheck,
  IconSparkles,
  IconArrowUpRight,
  IconTerminal2,
} from "@tabler/icons-react";

interface MarketplaceItem {
  slug: string;
  name: string;
  category: "AGENT_MODE" | "MCP_SERVER" | "SKILL";
  description: string;
  stars: number;
  installCmd: string;
  version: string;
  author: string;
  isVerified: boolean;
  tags: string[];
}

const MARKETPLACE_ITEMS: MarketplaceItem[] = [
  {
    slug: "docker-sandbox-agent",
    name: "Docker MicroVM Sandbox Agent",
    category: "AGENT_MODE",
    description: "Autonomous sandbox manager orchestrating Firecracker microVMs and isolated Docker execution environments.",
    stars: 1240,
    installCmd: "index0 agent install @index0/sandbox-agent",
    version: "v1.4.2",
    author: "INDEX0 Core",
    isVerified: true,
    tags: ["firecracker", "sandbox", "hardware-isolation"],
  },
  {
    slug: "postgres-mcp",
    name: "PostgreSQL Sovereign MCP Server",
    category: "MCP_SERVER",
    description: "Model Context Protocol adapter providing schema introspection, read-only analytical queries, and migration validation.",
    stars: 890,
    installCmd: "index0 mcp add postgresql --dsn $DATABASE_URL",
    version: "v2.1.0",
    author: "INDEX0 Labs",
    isVerified: true,
    tags: ["mcp", "database", "postgres"],
  },
  {
    slug: "git-reviewer-bot",
    name: "Git Atomic Reviewer",
    category: "AGENT_MODE",
    description: "Automated code reviewer evaluating AST diff safety, typecheck gates, and git commit hygiene prior to merging.",
    stars: 1450,
    installCmd: "index0 agent install @index0/git-reviewer",
    version: "v1.8.0",
    author: "INDEX0 Core",
    isVerified: true,
    tags: ["git", "reviewer", "ast-diff"],
  },
  {
    slug: "lago-billing-mcp",
    name: "Lago Rating & Billing MCP",
    category: "MCP_SERVER",
    description: "Self-hosted Lago subscription and meter integration without external cloud dependencies. Option A compliant.",
    stars: 430,
    installCmd: "index0 mcp add lago --api-key $LAGO_KEY",
    version: "v1.12.0",
    author: "INDEX0 Finance",
    isVerified: true,
    tags: ["billing", "lago", "telemetry"],
  },
  {
    slug: "ed25519-auth-skill",
    name: "Ed25519 Zero-Trust Token Verification",
    category: "SKILL",
    description: "Curated skill playbook for migrating legacy HMAC tokens to asymmetric Ed25519 cryptographic signatures.",
    stars: 760,
    installCmd: "index0 skill add ed25519-auth",
    version: "v1.0.4",
    author: "INDEX0 Security",
    isVerified: true,
    tags: ["security", "crypto", "ed25519"],
  },
  {
    slug: "clickhouse-analytics-mcp",
    name: "ClickHouse High-Throughput MCP",
    category: "MCP_SERVER",
    description: "Ultra-fast telemetry and event log query engine for monitoring sub-millisecond agent execution metrics.",
    stars: 520,
    installCmd: "index0 mcp add clickhouse --url $CH_URL",
    version: "v1.3.1",
    author: "Community",
    isVerified: false,
    tags: ["clickhouse", "analytics", "logs"],
  },
];

export default function MarketplacePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut '/' to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const filteredItems = MARKETPLACE_ITEMS.filter((item) => {
    const matchesCategory =
      selectedCategory === "ALL" || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const copyCmd = (cmd: string, slug: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 1500);
  };

  return (
    <main className="min-h-[100dvh] w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 text-xs font-mono text-[var(--accent)] font-semibold uppercase tracking-wider">
          <IconSparkles size={15} />
          <span>[MCP &amp; PLUGIN HUB]</span>
        </div>
        <h1 className="font-display-section text-[var(--fg)]">
          INDEX0 Marketplace &amp; Ecosystem.
        </h1>
        <p className="font-editorial text-[var(--muted)] text-base max-w-2xl leading-relaxed">
          Discover verified Agent Modes, Model Context Protocol (MCP) servers, and sovereign skills to extend your autonomous development fleet.
        </p>
      </div>

      {/* Search Bar with oklab() Border + Keyboard Trigger */}
      <div className="w-full relative">
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl border-oklab bg-[var(--surface-100)] focus-within:border-[var(--accent)] transition-all shadow-sm">
          <IconTerminal2 size={18} className="text-[var(--accent)] shrink-0" strokeWidth={1.5} />
          <span className="text-xs font-mono text-[var(--meta)]">$ index0 search</span>
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search agents, MCP servers, skills... (Press '/' to focus)"
            className="flex-1 bg-transparent text-sm font-mono text-[var(--fg)] placeholder:text-[var(--meta)] outline-none"
          />
          <kbd className="hidden sm:inline px-2 py-0.5 rounded border-oklab bg-[var(--surface-200)] text-[11px] font-mono text-[var(--meta)]">
            /
          </kbd>
        </div>
      </div>

      {/* Category Filter Tags with Full-Pill Geometry */}
      <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
        <span className="text-[var(--meta)] text-[11px] mr-2">CATEGORIES:</span>
        {[
          { id: "ALL", label: "All Packages" },
          { id: "AGENT_MODE", label: "Agent Modes" },
          { id: "MCP_SERVER", label: "MCP Servers" },
          { id: "SKILL", label: "Skills & Playbooks" },
        ].map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`pill-btn px-4 py-1.5 transition-all cursor-pointer border ${
                isSelected
                  ? "bg-[var(--fg)] text-[var(--bg)] border-[var(--fg)] font-semibold shadow-sm"
                  : "bg-[var(--surface-100)] text-[var(--muted)] border-oklab hover:text-[var(--fg)]"
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Product Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.length === 0 ? (
          <div className="col-span-full py-16 text-center text-sm font-mono text-[var(--muted)]">
            [NO_MATCHING_PACKAGES_FOUND]
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.slug}
              className="p-6 rounded-2xl border-oklab bg-[var(--surface-100)] hover:border-[var(--accent)] transition-all shadow-sm flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Header Badge */}
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="px-2 py-0.5 rounded-full bg-[var(--surface-200)] text-[var(--fg)] font-medium">
                    {item.category.replace("_", " ")}
                  </span>
                  {item.isVerified && (
                    <span className="text-[var(--accent)] font-semibold text-[10px]">
                      [VERIFIED INDEX0]
                    </span>
                  )}
                </div>

                {/* Name */}
                <Link
                  href={`/marketplace/${item.slug}`}
                  className="font-mono font-bold text-base text-[var(--fg)] hover:text-[var(--accent)] transition-colors flex items-center justify-between group"
                >
                  <span>{item.name}</span>
                  <IconArrowUpRight size={16} className="opacity-0 group-hover:opacity-100 text-[var(--accent)] transition-opacity" />
                </Link>

                {/* Description */}
                <p className="font-editorial text-sm leading-relaxed text-[var(--muted)] line-clamp-2">
                  {item.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 text-[10px] font-mono rounded bg-[var(--surface-200)] text-[var(--meta)]"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Footer Install Command + Stars */}
              <div className="space-y-2 pt-3 border-oklab-t">
                <div className="flex items-center justify-between text-xs font-mono text-[var(--muted)]">
                  <div className="flex items-center gap-1 text-[var(--fg)]">
                    <IconStar size={14} className="text-[var(--fg)] fill-[var(--fg)]" />
                    <span>{item.stars}</span>
                  </div>
                  <span>{item.version}</span>
                </div>

                {/* Install Block */}
                <div className="p-2 rounded-lg bg-[var(--surface-200)] flex items-center justify-between text-[11px] font-mono">
                  <span className="truncate text-[var(--fg)] mr-2">{item.installCmd}</span>
                  <button
                    type="button"
                    onClick={() => copyCmd(item.installCmd, item.slug)}
                    className="text-[var(--muted)] hover:text-[var(--fg)] transition-colors shrink-0"
                    title="Copy install command"
                  >
                    {copiedSlug === item.slug ? (
                      <IconCheck size={14} className="text-[var(--accent)]" />
                    ) : (
                      <IconCopy size={14} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
