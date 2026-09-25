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
  IconDownload,
  IconCopy,
  IconCheck,
  IconBrandApple,
  IconBrandWindows,
  IconTerminal2,
  IconPackage,
  IconShieldCheck,
} from "@tabler/icons-react";

interface BinaryPackage {
  os: string;
  arch: string;
  icon: React.ReactNode;
  version: string;
  filename: string;
  size: string;
  sha256: string;
  downloadUrl: string;
}

const BINARIES: BinaryPackage[] = [
  {
    os: "macOS",
    arch: "Apple Silicon (arm64)",
    icon: <IconBrandApple size={22} />,
    version: "v2.4.0",
    filename: "index0-darwin-arm64.tar.gz",
    size: "28.4 MB",
    sha256: "e08f2a947bc382a910dc81729bca21e49120bc7102938172bc91028371629abc",
    downloadUrl: "https://dl.ai.index0.in/v2.4.0/index0-darwin-arm64.tar.gz",
  },
  {
    os: "Linux",
    arch: "x86_64 / amd64",
    icon: <IconTerminal2 size={22} />,
    version: "v2.4.0",
    filename: "index0-linux-amd64.tar.gz",
    size: "31.2 MB",
    sha256: "9182371928bc8192731928371928371928371928371928371928371928371928",
    downloadUrl: "https://dl.ai.index0.in/v2.4.0/index0-linux-amd64.tar.gz",
  },
  {
    os: "Windows",
    arch: "x64 (WSL2 / Native)",
    icon: <IconBrandWindows size={22} />,
    version: "v2.4.0",
    filename: "index0-windows-x64.zip",
    size: "33.8 MB",
    sha256: "8712938192837192837192837192837192837192837192837192837192837192",
    downloadUrl: "https://dl.ai.index0.in/v2.4.0/index0-windows-x64.zip",
  },
];

export default function DownloadsPage() {
  const [copiedSha, setCopiedSha] = useState<string | null>(null);

  const copySha = (sha: string) => {
    navigator.clipboard.writeText(sha);
    setCopiedSha(sha);
    setTimeout(() => setCopiedSha(null), 1500);
  };

  return (
    <main className="min-h-[100dvh] w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      {/* Header */}
      <div className="space-y-3 border-oklab-b pb-8">
        <div className="inline-flex items-center gap-2 text-xs font-mono text-[var(--accent)] font-semibold uppercase tracking-wider">
          <IconDownload size={16} />
          <span>[BINARY CDN &amp; EXTENSIONS]</span>
        </div>
        <h1 className="font-display-section text-[var(--fg)]">
          Download INDEX0 Platform Binaries.
        </h1>
        <p className="font-editorial text-[var(--muted)] text-base max-w-2xl leading-relaxed">
          Standalone statically linked binaries compiled with zero runtime dependencies. Verified with cryptographic SHA256 checksums.
        </p>
      </div>

      {/* Universal Curl Bootstrapper */}
      <div className="p-8 rounded-2xl border-oklab bg-[var(--surface-warm)] space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-xs font-mono text-[var(--accent)] font-bold">
            UNIVERSAL ONE-LINE INSTALLER
          </div>
          <div className="flex items-center gap-1.5 text-xs font-mono text-[var(--meta)]">
            <IconShieldCheck size={14} className="text-[var(--accent)]" />
            <span>GPG SIGNED</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[var(--surface-100)] border-oklab flex items-center justify-between font-mono text-xs text-[var(--fg)]">
          <div className="flex items-center gap-2 truncate mr-3">
            <span className="text-[var(--accent)] font-bold">$</span>
            <span className="truncate">curl -fsSL https://dl.ai.index0.in/install.sh | sh</span>
          </div>
          <button
            type="button"
            onClick={() => copySha("curl -fsSL https://dl.ai.index0.in/install.sh | sh")}
            className="pill-btn px-4 py-1.5 bg-[var(--accent)] text-[var(--accent-fg)] font-medium hover:bg-[var(--accent-hover)] transition-colors cursor-pointer shrink-0"
          >
            {copiedSha === "curl -fsSL https://dl.ai.index0.in/install.sh | sh" ? "COPIED" : "COPY SCRIPT"}
          </button>
        </div>
      </div>

      {/* Standalone OS Binaries Grid */}
      <div className="space-y-6">
        <h2 className="font-mono font-bold text-2xl text-[var(--fg)]">
          Operating System Packages
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {BINARIES.map((pkg) => (
            <div
              key={pkg.os}
              className="p-6 rounded-2xl border-oklab bg-[var(--surface-100)] shadow-sm space-y-6 flex flex-col justify-between hover:border-[var(--accent)] transition-all"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-full bg-[var(--surface-200)] flex items-center justify-center text-[var(--fg)]">
                    {pkg.icon}
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[var(--surface-200)] text-[var(--meta)]">
                    {pkg.version}
                  </span>
                </div>

                <div>
                  <h3 className="font-mono font-bold text-lg text-[var(--fg)]">{pkg.os}</h3>
                  <div className="text-xs font-mono text-[var(--muted)]">{pkg.arch}</div>
                </div>

                <div className="text-xs font-mono text-[var(--meta)] space-y-1 pt-2 border-oklab-t">
                  <div>FILE: <span className="text-[var(--fg)]">{pkg.filename}</span></div>
                  <div>SIZE: <span className="text-[var(--fg)]">{pkg.size}</span></div>
                </div>

                {/* SHA256 Verification Pill */}
                <div className="p-2 rounded-lg bg-[var(--surface-200)] text-[10px] font-mono text-[var(--meta)] space-y-1">
                  <div className="flex items-center justify-between">
                    <span>SHA256:</span>
                    <button
                      type="button"
                      onClick={() => copySha(pkg.sha256)}
                      className="text-[var(--accent)] hover:underline flex items-center gap-1"
                    >
                      {copiedSha === pkg.sha256 ? <IconCheck size={11} /> : <IconCopy size={11} />}
                      <span>{copiedSha === pkg.sha256 ? "COPIED" : "COPY HASH"}</span>
                    </button>
                  </div>
                  <div className="truncate text-[var(--fg)]">{pkg.sha256}</div>
                </div>
              </div>

              <a
                href={pkg.downloadUrl}
                download
                className="pill-btn w-full py-2.5 flex items-center justify-center gap-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--accent-fg)] text-xs font-mono font-medium transition-colors shadow-sm"
              >
                <IconDownload size={15} />
                <span>Download for {pkg.os}</span>
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* IDE Extension Package (.VSIX) */}
      <div className="p-8 rounded-2xl border-oklab bg-[var(--surface-100)] shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[var(--surface-200)] flex items-center justify-center text-[var(--accent)]">
            <IconPackage size={24} strokeWidth={1.5} />
          </div>
          <div>
            <div className="text-xs font-mono text-[var(--meta)]">CURSOR &amp; VS CODE EXTENSION</div>
            <h3 className="font-mono font-bold text-lg text-[var(--fg)]">
              INDEX0 Companion Extension (.vsix)
            </h3>
            <p className="font-editorial text-xs text-[var(--muted)]">
              Directly attaches your IDE editor tabs to sovereign MicroVM sandboxes with live AST diff rendering.
            </p>
          </div>
        </div>

        <a
          href="https://dl.ai.index0.in/v2.4.0/index0-companion-2.4.0.vsix"
          download
          className="pill-btn px-6 py-2.5 border-oklab hover:border-[var(--accent)] bg-[var(--surface-200)] hover:bg-[var(--surface-warm)] text-[var(--fg)] text-xs font-mono font-medium transition-all shrink-0 flex items-center gap-2"
        >
          <IconDownload size={14} />
          <span>DOWNLOAD .VSIX (v2.4.0)</span>
        </a>
      </div>
    </main>
  );
}
