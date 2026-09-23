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

import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Newsreader } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-editorial-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "INDEX0 AI // Sovereign AI Software Engineering Platform",
  description: "Sovereign AI engineering, rendered in code. Autonomous multi-agent software platform with hardware-isolated Firecracker microVM sandboxes.",
  keywords: ["INDEX0", "AI", "Agent", "Sovereign AI", "Cursor", "Firecracker", "MCP"],
  authors: [{ name: "INDEX0 AI Inc." }],
  openGraph: {
    title: "INDEX0 AI // Sovereign AI Software Engineering Platform",
    description: "Sovereign AI engineering, rendered in code. Autonomous multi-agent software platform with hardware-isolated Firecracker microVM sandboxes.",
    url: "https://ai.index0.in",
    siteName: "ai.index0.in",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#141311" },
    { media: "(prefers-color-scheme: light)", color: "#f2f1ed" },
  ],
};

const themeInitScript = `
  try {
    const saved = localStorage.getItem('index0_theme');
    const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    const theme = (saved === 'light' || saved === 'dark') ? saved : (prefersLight ? 'light' : 'dark');
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {}
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${jetbrainsMono.variable} ${newsreader.variable}`} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="bg-[var(--bg)] text-[var(--fg)] font-sans antialiased selection:bg-[var(--accent)] selection:text-white min-h-[100dvh] flex flex-col overflow-x-hidden">
        <ThemeProvider>
          <Navbar />
          <div className="flex-1 w-full">{children}</div>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
