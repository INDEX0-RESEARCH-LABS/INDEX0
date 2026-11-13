"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { GroundworkDashboard } from "@/components/groundwork/GroundworkDashboard";
import { Navbar } from "@/components/Navbar";

function GroundworkContent() {
  const searchParams = useSearchParams();
  const prompt = searchParams.get("prompt") || "";

  if (!prompt) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center font-mono">
        <div className="text-center space-y-4 max-w-md px-6">
          <p className="text-[var(--muted)] text-sm">No research target specified.</p>
          <a
            href="/chat"
            className="inline-block px-5 py-2.5 bg-[var(--accent)] text-[var(--accent-fg)] rounded-xl text-sm font-semibold hover:bg-[var(--accent-hover)] transition-colors"
          >
            ← Back to Chat
          </a>
        </div>
      </div>
    );
  }

  return <GroundworkDashboard initialPrompt={prompt} />;
}

export default function GroundworkPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[var(--bg)]">
      <Navbar />
      <div className="flex-1">
        <Suspense fallback={
          <div className="flex items-center justify-center h-64">
            <span className="text-[var(--muted)] text-sm font-mono">Loading...</span>
          </div>
        }>
          <GroundworkContent />
        </Suspense>
      </div>
    </div>
  );
}
