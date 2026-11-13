"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { StageCard, StageData, StageStatus } from "./StageCard";

const STAGE_DEFINITIONS = [
  {
    id: 1,
    name: "Deep Market Intelligence",
    description: "8 layers: competitors, user voice, business models, dynamics, regulation, distribution, failures, opportunity gaps",
  },
  {
    id: 2,
    name: "Architecture Discovery",
    description: "Real production architectures from engineering blogs, GitHub, and case studies",
  },
  {
    id: 3,
    name: "Frontend Design System + Branding",
    description: "3A: emotional design from real apps · 3B: every page and component locked",
  },
  {
    id: 4,
    name: "Backend Architecture",
    description: "Every API endpoint, every data model — sourced from real production systems",
  },
  {
    id: 5,
    name: "Infrastructure & Payments",
    description: "Region-specific cloud, real payment providers verified for your market",
  },
  {
    id: 6,
    name: "Plan Lock",
    description: "Critic cross-checks all 5 stages for consistency. Locks BUILD_PLAN.md",
  },
];

interface Props {
  initialPrompt: string;
}

export function GroundworkDashboard({ initialPrompt }: Props) {
  const router = useRouter();
  const [planId, setPlanId] = useState<string | null>(null);
  const [stages, setStages] = useState<StageData[]>(
    STAGE_DEFINITIONS.map((s) => ({ ...s, status: "waiting" as StageStatus }))
  );
  const [totalSources, setTotalSources] = useState(0);
  const [confirmedFacts, setConfirmedFacts] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStage, setCurrentStage] = useState(0);

  const pollStatus = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/research?planId=${id}`);
      if (!res.ok) return;
      const data = await res.json();

      setCurrentStage(data.stage || 0);
      setTotalSources(data.sources_found || 0);
      setConfirmedFacts(data.confirmed_facts || 0);

      setStages((prev) =>
        prev.map((s) => {
          if (s.id < data.stage) {
            return {
              ...s,
              status: "done",
              sourcesFound: data.stage_sources?.[s.id] || 0,
              confirmedFacts: data.stage_confirmed?.[s.id] || 0,
            };
          }
          if (s.id === data.stage) {
            return {
              ...s,
              status: data.status === "failed" ? "failed" : "running",
              progress: data.layer_progress || 0,
              layers: data.current_layers || [],
            };
          }
          return { ...s, status: "waiting" };
        })
      );

      if (data.status === "locked") {
        setIsLocked(true);
        setStages((prev) => prev.map((s) => ({ ...s, status: "done" })));
      }
    } catch {
      // poll silently
    }
  }, []);

  useEffect(() => {
    if (!planId) return;
    if (isLocked) return;

    const interval = setInterval(() => pollStatus(planId), 2000);
    return () => clearInterval(interval);
  }, [planId, isLocked, pollStatus]);

  const startResearch = async () => {
    setIsStarted(true);
    setError(null);

    // Set stage 1 to running immediately
    setStages((prev) =>
      prev.map((s) =>
        s.id === 1 ? { ...s, status: "running", progress: 5 } : s
      )
    );

    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userPrompt: initialPrompt }),
      });

      if (!res.ok) {
        setError("Research agent is not running. Start it with: cd services/research-agent && python -m uvicorn src.main:app");
        setIsStarted(false);
        setStages((prev) =>
          prev.map((s) => (s.id === 1 ? { ...s, status: "waiting" } : s))
        );
        return;
      }

      const data = await res.json();
      setPlanId(data.plan_id);
    } catch {
      setError("Could not connect to research agent. Is it running on port 8001?");
      setIsStarted(false);
      setStages((prev) =>
        prev.map((s) => (s.id === 1 ? { ...s, status: "waiting" } : s))
      );
    }
  };

  const goToDev = () => {
    router.push(`/chat?planId=${planId}`);
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] font-mono">
      {/* Header */}
      <div className="border-b border-[var(--border-oklab)] px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-[var(--muted)] uppercase tracking-widest">
              GROUNDWORK
            </span>
            {isStarted && !isLocked && (
              <span className="flex items-center gap-1.5 text-xs text-amber-400">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                LIVE
              </span>
            )}
            {isLocked && (
              <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                LOCKED
              </span>
            )}
          </div>
          <div className="flex items-center gap-6 text-xs text-[var(--muted)]">
            <span>{totalSources} sources</span>
            <span>{confirmedFacts} confirmed</span>
            <span>Stage {currentStage}/6</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Prompt */}
        <div className="mb-8">
          <p className="text-xs text-[var(--muted)] mb-2 uppercase tracking-widest">
            Research target
          </p>
          <p className="text-lg text-[var(--fg)] leading-snug">
            {initialPrompt}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 rounded-xl border border-red-500/30 bg-red-500/5">
            <p className="text-xs text-red-400 font-mono">{error}</p>
          </div>
        )}

        {/* Start button */}
        {!isStarted && (
          <div className="mb-8">
            <button
              onClick={startResearch}
              className="px-6 py-3 bg-[var(--accent)] text-[var(--accent-fg)] rounded-xl text-sm font-mono font-semibold hover:bg-[var(--accent-hover)] transition-colors"
            >
              Start GROUNDWORK Research →
            </button>
            <p className="text-xs text-[var(--muted)] mt-2">
              8-layer market intelligence · verified sources · ~25 minutes
            </p>
          </div>
        )}

        {/* Two-column layout: stages + live feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stages (left, 2/3) */}
          <div className="lg:col-span-2 space-y-3">
            {stages.map((stage) => (
              <StageCard key={stage.id} stage={stage} />
            ))}
          </div>

          {/* Stats sidebar (right, 1/3) */}
          <div className="space-y-4">
            {/* Verification status */}
            <div className="rounded-xl border border-[var(--border-oklab)] p-4">
              <p className="text-xs text-[var(--muted)] uppercase tracking-widest mb-3">
                Verification
              </p>
              <div className="space-y-2">
                {[
                  { label: "Confirmed", value: confirmedFacts, color: "text-emerald-400" },
                  { label: "Sources", value: totalSources, color: "text-[var(--fg)]" },
                  { label: "Flagged", value: 0, color: "text-amber-400" },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between items-center">
                    <span className="text-xs text-[var(--muted)]">{item.label}</span>
                    <span className={`text-sm font-semibold ${item.color}`}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Core rule */}
            <div className="rounded-xl border border-[var(--border-oklab)] p-4">
              <p className="text-xs text-[var(--muted)] uppercase tracking-widest mb-2">
                Core Rule
              </p>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                Every decision in BUILD_PLAN.md has a source URL. Zero model memory.
              </p>
            </div>

            {/* Lock and go to dev */}
            {isLocked && (
              <button
                onClick={goToDev}
                className="w-full px-4 py-3 bg-[var(--accent)] text-[var(--accent-fg)] rounded-xl text-sm font-mono font-semibold hover:bg-[var(--accent-hover)] transition-colors"
              >
                Start Development →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
