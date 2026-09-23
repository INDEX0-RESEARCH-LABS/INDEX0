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
import { usePathname } from "next/navigation";
import {
  IconTerminal2,
  IconSun,
  IconMoon,
  IconMenu2,
  IconX,
  IconArrowUpRight,
} from "@tabler/icons-react";
import { useTheme } from "@/components/ThemeProvider";

interface NavbarProps {
  onOpenCommandPalette?: () => void;
}

const NAV_LINKS = [
  { href: "/marketplace", label: "Marketplace" },
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/docs", label: "Docs" },
  { href: "/blog", label: "Blog" },
  { href: "/downloads", label: "Downloads" },
];

export function Navbar({ onOpenCommandPalette }: NavbarProps) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-40 w-full bg-[var(--bg)]/90 backdrop-blur-md border-oklab-b transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <span className="font-sans font-bold text-lg tracking-tight text-[var(--fg)] group-hover:text-[var(--accent)] transition-colors">
            INDEX0
          </span>
          <span className="px-2 py-0.5 text-[10px] font-mono font-medium rounded-full bg-[var(--accent)] text-white tracking-wider">
            AI INC.
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-6 text-sm font-sans font-medium text-[var(--muted)]">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-colors hover:text-[var(--hover-crimson)] ${
                  isActive ? "text-[var(--fg)] font-semibold" : ""
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Right Section: Theme Toggle + ⌘K + CTA */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Theme Switcher */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-1.5 rounded-full border-oklab text-[var(--muted)] hover:text-[var(--fg)] transition-colors cursor-pointer"
            title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
          >
            {theme === "dark" ? <IconSun size={15} strokeWidth={1.5} /> : <IconMoon size={15} strokeWidth={1.5} />}
          </button>

          {/* ⌘K Command Trigger */}
          {onOpenCommandPalette && (
            <button
              type="button"
              onClick={onOpenCommandPalette}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono rounded-full border-oklab text-[var(--muted)] hover:text-[var(--fg)] transition-colors cursor-pointer"
            >
              <IconTerminal2 size={13} strokeWidth={1.5} />
              <span>⌘K</span>
            </button>
          )}

          {/* Full-Pill CTA Button */}
          <Link
            href="/downloads"
            className="pill-btn flex items-center gap-1.5 px-4 py-1.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-sans font-medium tracking-wide shadow-sm transition-colors"
          >
            <span>Install Kilo</span>
            <IconArrowUpRight size={14} strokeWidth={2} />
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="p-1.5 rounded-full border-oklab text-[var(--muted)]"
          >
            {theme === "dark" ? <IconSun size={15} /> : <IconMoon size={15} />}
          </button>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[var(--fg)]"
          >
            {mobileMenuOpen ? <IconX size={20} /> : <IconMenu2 size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-4 space-y-2 border-oklab-t bg-[var(--surface-100)] text-sm font-sans">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-[var(--fg)] hover:bg-[var(--surface-200)]"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-oklab">
            <Link
              href="/downloads"
              onClick={() => setMobileMenuOpen(false)}
              className="pill-btn w-full flex items-center justify-center gap-2 py-2 bg-[var(--accent)] text-white text-xs font-medium"
            >
              <span>Install Kilo CLI</span>
              <IconArrowUpRight size={14} />
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
