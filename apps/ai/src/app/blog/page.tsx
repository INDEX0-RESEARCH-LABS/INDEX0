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
import {
  IconRss,
  IconArrowUpRight,
  IconMail,
  IconChartBar,
  IconCheck,
} from "@tabler/icons-react";

interface BlogPost {
  slug: string;
  title: string;
  date: string;
  readingTime: string;
  excerpt: string;
  category: "ENGINEERING" | "BENCHMARKS" | "RELEASE";
  author: string;
}

const POSTS: BlogPost[] = [
  {
    slug: "zero-overhead-microvm-sandboxing",
    title: "Zero-Overhead MicroVM Sandboxing: Booting Firecracker in 0.4ms",
    date: "2026-09-18",
    readingTime: "6 min read",
    excerpt: "How we eliminated container cold starts by maintaining an ephemeral warm pool of Linux network namespaces with seccomp profile pre-validation.",
    category: "ENGINEERING",
    author: "Architecture Team",
  },
  {
    slug: "swe-bench-state-of-the-art",
    title: "SWE-bench Verified 54.8%: Why Typed AST Patches Beat Full-File Generation",
    date: "2026-09-12",
    readingTime: "8 min read",
    excerpt: "Comprehensive evaluation of deterministic AST tree rewriting versus generative file replacement across 500 real-world GitHub issues.",
    category: "BENCHMARKS",
    author: "Evaluation Guild",
  },
  {
    slug: "release-v2-4-0-sovereign-billing",
    title: "INDEX0 v2.4.0: Sovereign Lago Rating Engine & OpenMeter Alignment",
    date: "2026-09-04",
    readingTime: "4 min read",
    excerpt: "Eliminating SaaS billing dependencies with self-hosted Lago containers on index0-net with sub-millisecond event streaming.",
    category: "RELEASE",
    author: "Core Release Team",
  },
];

export default function BlogPage() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setTimeout(() => {
      setEmail("");
      setSubscribed(false);
    }, 3000);
  };

  return (
    <main className="min-h-[100dvh] w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-oklab-b pb-8">
        <div className="space-y-3">
          <div className="text-xs font-mono text-[var(--accent)] font-semibold uppercase tracking-wider">
            [INDEX0 ENGINEERING READS]
          </div>
          <h1 className="font-display-section text-[var(--fg)]">
            Changelog &amp; Architecture.
          </h1>
          <p className="font-editorial text-[var(--muted)] text-base max-w-xl leading-relaxed">
            Technical write-ups, SWE-bench performance benchmarks, and release notes from the INDEX0 engineering laboratory.
          </p>
        </div>

        <button
          type="button"
          onClick={() => alert("RSS feed endpoint: https://ai.index0.in/feed.xml")}
          className="pill-btn flex items-center gap-2 px-4 py-2 border-oklab hover:border-[var(--accent)] bg-[var(--surface-100)] text-xs font-mono text-[var(--fg)] transition-all shrink-0 cursor-pointer"
        >
          <IconRss size={15} className="text-[var(--accent)]" />
          <span>RSS FEED</span>
        </button>
      </div>

      {/* Benchmark Metric Highlight */}
      <div className="p-6 rounded-2xl border-oklab bg-[var(--surface-100)] shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[var(--surface-200)] flex items-center justify-center text-[var(--accent)]">
            <IconChartBar size={24} strokeWidth={1.5} />
          </div>
          <div>
            <div className="text-xs font-mono text-[var(--meta)]">LATEST SWE-BENCH VERIFIED RUN</div>
            <div className="font-sans font-bold text-lg text-[var(--fg)]">54.8% Pass Rate at Resolved Issues</div>
          </div>
        </div>

        <div className="text-right font-mono text-xs text-[var(--muted)]">
          <div>DATASET: 500 PYTHON TASKS</div>
          <div className="text-[var(--accent)] font-semibold">STATE OF THE ART (SOVEREIGN)</div>
        </div>
      </div>

      {/* Article Stream */}
      <div className="space-y-8">
        {POSTS.map((post) => (
          <article
            key={post.slug}
            className="p-8 rounded-2xl border-oklab bg-[var(--surface-100)] hover:border-[var(--accent)] transition-all shadow-sm space-y-4 group"
          >
            <div className="flex items-center justify-between text-xs font-mono text-[var(--meta)]">
              <span className="px-2.5 py-0.5 rounded-full bg-[var(--surface-200)] text-[var(--fg)] font-semibold">
                {post.category}
              </span>
              <div className="flex items-center gap-3">
                <span>{post.date}</span>
                <span>•</span>
                <span>{post.readingTime}</span>
              </div>
            </div>

            <Link href={`/blog/${post.slug}`} className="block group">
              <h2 className="font-sans font-bold text-xl md:text-2xl text-[var(--fg)] group-hover:text-[var(--accent)] transition-colors flex items-center justify-between">
                <span>{post.title}</span>
                <IconArrowUpRight size={20} className="opacity-0 group-hover:opacity-100 text-[var(--accent)] transition-opacity shrink-0 ml-2" />
              </h2>
            </Link>

            <p className="font-editorial text-base leading-relaxed text-[var(--muted)]">
              {post.excerpt}
            </p>

            <div className="pt-2 flex items-center justify-between text-xs font-mono text-[var(--meta)] border-oklab-t">
              <span>AUTHOR: {post.author}</span>
              <Link href={`/blog/${post.slug}`} className="text-[var(--accent)] font-semibold hover:underline">
                Read Article →
              </Link>
            </div>
          </article>
        ))}
      </div>

      {/* Listmonk Newsletter Subscription Box */}
      <div className="p-8 rounded-2xl border-oklab bg-[var(--surface-warm)] text-center space-y-4">
        <div className="inline-flex items-center gap-2 text-xs font-mono text-[var(--accent)] font-semibold">
          <IconMail size={16} />
          <span>[LISTMONK SOVEREIGN NEWSLETTER]</span>
        </div>
        <h3 className="font-sans font-bold text-xl text-[var(--fg)]">
          Subscribe to Engineering Dispatches.
        </h3>
        <p className="font-editorial text-sm text-[var(--muted)] max-w-md mx-auto leading-relaxed">
          Zero marketing spam. Only deeply technical architecture breakdowns, benchmark updates, and release manifests.
        </p>

        <form onSubmit={handleSubscribe} className="max-w-md mx-auto flex gap-2 pt-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="engineer@company.com"
            required
            className="flex-1 px-4 py-2.5 rounded-full border-oklab bg-[var(--surface-100)] text-sm font-sans text-[var(--fg)] placeholder:text-[var(--meta)] outline-none focus:border-[var(--accent)]"
          />
          <button
            type="submit"
            className="pill-btn px-6 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-sans font-medium tracking-wide shadow-sm transition-colors cursor-pointer"
          >
            {subscribed ? (
              <span className="flex items-center gap-1">
                <IconCheck size={14} /> Subscribed
              </span>
            ) : (
              "Subscribe"
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
