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
import { IconShieldCheck, IconLock } from "@tabler/icons-react";

export default function PrivacyPage() {
  return (
    <main className="min-h-[100dvh] w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      {/* Header */}
      <div className="space-y-3 border-oklab-b pb-8">
        <div className="inline-flex items-center gap-2 text-xs font-mono text-[var(--accent)] font-semibold uppercase tracking-wider">
          <IconLock size={16} />
          <span>[SECURITY &amp; PRIVACY COMMITMENT]</span>
        </div>
        <h1 className="font-display-section text-[var(--fg)]">
          Privacy Policy &amp; Zero Data Retention.
        </h1>
        <div className="text-xs font-mono text-[var(--meta)]">
          REVISION: 2026.09.18 • AIR-GAP ZERO-TRUST STANDARD
        </div>
      </div>

      {/* Security Seal */}
      <div className="p-6 rounded-2xl border-oklab bg-[var(--surface-warm)] font-mono text-xs text-[var(--fg)] space-y-3 leading-relaxed">
        <div className="flex items-center gap-2 text-[var(--accent)] font-bold">
          <IconShieldCheck size={18} />
          <span>SOVEREIGN PRIVACY COMMITMENT</span>
        </div>
        <p>
          INDEX0 AI Inc. is engineered from the kernel up to guarantee that your proprietary software IP, proprietary training weights, and private customer databases are never ingested into third-party foundation models.
        </p>
      </div>

      {/* Privacy Commitments */}
      <div className="space-y-8 font-editorial text-base leading-relaxed text-[var(--fg)]">
        <section className="space-y-3">
          <h2 className="font-sans font-bold text-xl text-[var(--fg)]">
            1. Zero Source Code Storage
          </h2>
          <p>
            When an autonomous agent indexes your repository, all file tokens are parsed into an in-memory prefix tree within your local Firecracker microVM or on-premise compute cluster. No source code or AST representations are ever uploaded to INDEX0 cloud servers.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-sans font-bold text-xl text-[var(--fg)]">
            2. Ephemeral Virtual Machine Isolation
          </h2>
          <p>
            Each agent execution runs in a sandboxed guest operating system with a dedicated RAM allotment. Upon task completion, the microVM instance is torn down, and the allocated memory pages are zero-overwritten by the host kernel.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-sans font-bold text-xl text-[var(--fg)]">
            3. Sovereign Telemetry &amp; Anonymity
          </h2>
          <p>
            Usage meters tracking token consumption and microVM compute seconds are processed locally via self-hosted Lago and OpenMeter containers. Only aggregated numerical billing units are reported, with zero payload or code snippet data attached.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-sans font-bold text-xl text-[var(--fg)]">
            4. Compliance &amp; Certifications
          </h2>
          <p>
            INDEX0 supports SOC 2 Type II, ISO 27001, and HIPAA-compliant enterprise deployment models with full air-gapped cryptographic attestation.
          </p>
        </section>
      </div>

      {/* Footer Navigation */}
      <div className="pt-8 border-oklab-t flex items-center justify-between font-mono text-xs text-[var(--meta)]">
        <Link href="/terms" className="text-[var(--accent)] hover:underline">
          ← View Terms of Service
        </Link>
        <span>DATA SECURITY SLA: ZERO_RETENTION_VERIFIED</span>
      </div>
    </main>
  );
}
