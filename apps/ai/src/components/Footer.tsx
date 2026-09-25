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
import { IconShieldCheck } from "@tabler/icons-react";

export function Footer() {
  const [utcTime, setUtcTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcTime(now.toUTCString().replace("GMT", "UTC"));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="w-full bg-[var(--surface-100)] border-oklab-t text-[var(--muted)] font-mono text-xs px-4 md:px-8 py-12 transition-colors">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Purpose */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-base font-mono font-bold text-[var(--fg)]">
              <span>INDEX0</span>
              <span className="px-1.5 py-0.2 text-[10px] font-mono bg-[var(--accent)] text-[var(--accent-fg)] rounded-full">
                AI
              </span>
            </div>
            <p className="font-editorial text-sm leading-relaxed text-[var(--fg)]">
              Sovereign AI software engineering platform. Autonomous code generation, containerized Firecracker microVM sandboxes, and instant diff verification.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-[var(--accent)]">
              <IconShieldCheck size={15} strokeWidth={1.5} />
              <span>AIR-GAP VALIDATED</span>
            </div>
          </div>

          {/* Navigation */}
          <div className="space-y-2 text-xs">
            <div className="font-mono font-semibold text-[var(--fg)] mb-2 uppercase tracking-wider text-[11px]">
              Platform
            </div>
            <div><Link href="/marketplace" className="hover:text-[var(--hover-crimson)]">Marketplace &amp; MCPs</Link></div>
            <div><Link href="/features" className="hover:text-[var(--hover-crimson)]">Architecture &amp; Features</Link></div>
            <div><Link href="/pricing" className="hover:text-[var(--hover-crimson)]">Pricing &amp; Calculator</Link></div>
            <div><Link href="/downloads" className="hover:text-[var(--hover-crimson)]">INDEX0 CLI Downloads</Link></div>
          </div>

          {/* Resources */}
          <div className="space-y-2 text-xs">
            <div className="font-mono font-semibold text-[var(--fg)] mb-2 uppercase tracking-wider text-[11px]">
              Resources
            </div>
            <div><Link href="/docs" className="hover:text-[var(--hover-crimson)]">Documentation</Link></div>
            <div><Link href="/blog" className="hover:text-[var(--hover-crimson)]">Engineering Changelog</Link></div>
            <div><Link href="/terms" className="hover:text-[var(--hover-crimson)]">Terms of Service</Link></div>
            <div><Link href="/privacy" className="hover:text-[var(--hover-crimson)]">Privacy &amp; Data Policy</Link></div>
          </div>

          {/* Telemetry */}
          <div className="space-y-2 text-xs">
            <div className="font-mono font-semibold text-[var(--fg)] mb-2 uppercase tracking-wider text-[11px]">
              Telemetry
            </div>
            <div className="p-3 bg-[var(--surface-200)] border-oklab rounded-lg space-y-1">
              <div className="text-[10px] text-[var(--meta)]">CLUSTER NODE:</div>
              <div className="text-[var(--fg)] font-bold">eu-central-1.prod.index0.ai</div>
              <div className="text-[10px] text-[var(--meta)] pt-1">CLOCK:</div>
              <div className="text-[var(--fg)] font-medium text-[11px]">{utcTime || "SYNC..."}</div>
            </div>
          </div>
        </div>

        {/* Bottom Attribution */}
        <div className="pt-6 border-oklab-t flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[var(--meta)]">
          <div>
            Copyright (c) 2026 INDEX0 AI Inc. All Rights Reserved. Proprietary and Confidential.
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[var(--accent)]">[SYSTEM STATUS: 100% NOMINAL]</span>
            <span>v2.4.0-RELEASE</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
