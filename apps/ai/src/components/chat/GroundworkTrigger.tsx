"use client";

import { useRouter } from "next/navigation";

interface Props {
  prompt: string;
  onDismiss: () => void;
}

export function GroundworkTrigger({ prompt, onDismiss }: Props) {
  const router = useRouter();

  const handleRun = () => {
    const params = new URLSearchParams({ prompt });
    router.push(`/groundwork?${params.toString()}`);
  };

  return (
    <div className="mx-4 mb-3 p-4 rounded-xl border border-[var(--border-oklab-strong)] bg-[var(--surface-100)]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono font-semibold text-[var(--fg)]">
              GROUNDWORK available
            </span>
          </div>
          <p className="text-xs font-mono text-[var(--muted)] leading-relaxed">
            Run deep market research before development — 8-layer intelligence,
            real sources, verified architecture. No model memory.
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={onDismiss}
            className="px-3 py-1.5 text-xs font-mono text-[var(--muted)] hover:text-[var(--fg)] border border-[var(--border-oklab)] rounded-lg transition-colors"
          >
            Skip
          </button>
          <button
            onClick={handleRun}
            className="px-3 py-1.5 text-xs font-mono font-semibold bg-[var(--accent)] text-[var(--accent-fg)] rounded-lg hover:bg-[var(--accent-hover)] transition-colors"
          >
            Run GROUNDWORK →
          </button>
        </div>
      </div>
    </div>
  );
}
