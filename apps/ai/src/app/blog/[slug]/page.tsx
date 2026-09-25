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

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { IconArrowLeft, IconCalendar, IconClock, IconShare } from "@tabler/icons-react";

export default function BlogPostDetailPage() {
  const params = useParams();
  const slug = (params.slug as string) || "zero-overhead-microvm-sandboxing";

  return (
    <main className="min-h-[100dvh] w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      {/* Back Button */}
      <div>
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-[var(--muted)] hover:text-[var(--accent)] transition-colors"
        >
          <IconArrowLeft size={14} />
          <span>$ cd /blog</span>
        </Link>
      </div>

      {/* Article Header */}
      <header className="space-y-6 border-oklab-b pb-8">
        <div className="flex items-center gap-3 text-xs font-mono text-[var(--meta)]">
          <span className="px-2.5 py-0.5 rounded-full bg-[var(--surface-200)] text-[var(--fg)] font-semibold">
            ENGINEERING DISPATCH :: {slug}
          </span>
          <div className="flex items-center gap-1.5">
            <IconCalendar size={14} />
            <span>2026-09-18</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1.5">
            <IconClock size={14} />
            <span>6 MIN READ</span>
          </div>
        </div>

        <h1 className="font-display-section text-[var(--fg)]">
          Zero-Overhead MicroVM Sandboxing: Booting Firecracker in 0.4ms.
        </h1>

        <div className="flex items-center justify-between text-xs font-mono text-[var(--muted)] pt-2">
          <div>AUTHOR: <strong className="text-[var(--fg)]">INDEX0 Systems Guild</strong></div>
          <button
            type="button"
            onClick={() => navigator.clipboard.writeText(window.location.href)}
            className="flex items-center gap-1 text-[var(--accent)] hover:underline cursor-pointer"
          >
            <IconShare size={14} />
            <span>SHARE</span>
          </button>
        </div>
      </header>

      {/* Article Body in 19.2px jjannon Editorial Serif */}
      <article className="space-y-6 font-editorial text-lg leading-relaxed text-[var(--fg)]">
        <p>
          Executing untrusted, AI-generated code on bare-metal host operating systems has long been the primary vulnerability vector for autonomous software engineering platforms. Containers provide basic process namespacing, yet remain susceptible to kernel escape attacks under permissive seccomp configurations.
        </p>

        <p>
          At INDEX0, we designed our execution tier around microVM instances powered by Amazon Firecracker. Each virtual machine instance provides a dedicated Linux guest kernel, hardware virtualization bounds (KVM), and strict cgroup resource throttling.
        </p>

        <h2 className="font-mono font-bold text-2xl text-[var(--fg)] pt-4">
          The 0.4ms Pre-Warm Pool Architecture
        </h2>

        <p>
          Standard virtual machine boot sequences incur latencies of 150ms to 400ms, which stalls high-frequency AST patch iteration. To eliminate this overhead, the INDEX0 Kernel Orchestrator maintains an ephemeral pool of pre-warmed, paused microVM snapshots.
        </p>

        {/* Technical Code Diff Block */}
        <div className="p-4 rounded-xl bg-[var(--surface-200)] border-oklab font-mono text-xs text-[var(--fg)] overflow-x-auto space-y-1 my-6">
          <div className="text-[var(--meta)] pb-1 border-b border-oklab mb-2 flex justify-between">
            <span>services/sandbox/kernel_pool.rs</span>
            <span className="text-[var(--accent)]">SOVEREIGN RUST RUNTIME</span>
          </div>
          <div>pub struct MicroVmPool &#123;</div>
          <div className="pl-4">warm_instances: Arc&lt;ArrayQueue&lt;PreWarmedVm&gt;&gt;,</div>
          <div className="pl-4">seccomp_filter: Arc&lt;BpfProgram&gt;,</div>
          <div>&#125;</div>
          <div className="text-[var(--accent)] pt-2">// Instant socket acquisition with zero cold start latency</div>
          <div>impl MicroVmPool &#123;</div>
          <div className="pl-4">pub async fn acquire_sandbox(&amp;self) -&gt; Result&lt;ActiveVm, VmError&gt; &#123;</div>
          <div className="pl-8">let vm = self.warm_instances.pop().ok_or(VmError::Exhausted)?;</div>
          <div className="pl-8">vm.unpause_kvm().await?; // Elapsed: 0.38ms</div>
          <div className="pl-8">Ok(vm)</div>
          <div className="pl-4">&#125;</div>
          <div>&#125;</div>
        </div>

        <p>
          When an agent issues a diff compilation task, the orchestrator acquires an already initialized microVM in 0.38 milliseconds, mounts the workspace copy-on-write snapshot, and returns the execution stream to the client.
        </p>
      </article>

      {/* Footer Navigation */}
      <div className="pt-8 border-oklab-t flex items-center justify-between font-mono text-xs">
        <Link href="/blog" className="text-[var(--accent)] hover:underline flex items-center gap-1">
          <IconArrowLeft size={14} />
          <span>Back to All Articles</span>
        </Link>
        <Link href="/features" className="hover:text-[var(--fg)] text-[var(--muted)]">
          Explore Architecture Blueprint →
        </Link>
      </div>
    </main>
  );
}
