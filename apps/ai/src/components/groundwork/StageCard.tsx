"use client";

import { SourceBadge } from "@/components/chat/SourceBadge";

export type StageStatus = "waiting" | "running" | "done" | "failed";

export interface StageLayer {
  name: string;
  status: StageStatus;
  findings?: string[];
  sources?: { label: string; url: string }[];
}

export interface StageData {
  id: number;
  name: string;
  description: string;
  status: StageStatus;
  progress?: number;
  layers?: StageLayer[];
  sourcesFound?: number;
  confirmedFacts?: number;
}

const statusIcon: Record<StageStatus, string> = {
  waiting: "○",
  running: "⏳",
  done: "✅",
  failed: "✗",
};

const statusColor: Record<StageStatus, string> = {
  waiting: "text-[var(--muted)]",
  running: "text-amber-400",
  done: "text-emerald-400",
  failed: "text-red-400",
};

export function StageCard({ stage }: { stage: StageData }) {
  const isActive = stage.status === "running";
  const isDone = stage.status === "done";

  return (
    <div
      className={`rounded-xl border p-4 transition-all ${
        isActive
          ? "border-[var(--border-oklab-strong)] bg-[var(--surface-100)]"
          : isDone
          ? "border-[var(--border-oklab)] bg-[var(--surface-warm)]"
          : "border-[var(--border-oklab)] bg-transparent opacity-50"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`text-sm ${statusColor[stage.status]}`}>
            {statusIcon[stage.status]}
          </span>
          <span className="text-sm font-mono font-semibold text-[var(--fg)]">
            Stage {stage.id} · {stage.name}
          </span>
        </div>
        {stage.sourcesFound !== undefined && isDone && (
          <span className="text-xs font-mono text-[var(--muted)]">
            {stage.sourcesFound} sources · {stage.confirmedFacts} confirmed
          </span>
        )}
      </div>

      {/* Progress bar */}
      {isActive && stage.progress !== undefined && (
        <div className="mb-3">
          <div className="h-1 bg-[var(--surface-200)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--fg)] rounded-full transition-all duration-500"
              style={{ width: `${stage.progress}%` }}
            />
          </div>
          <p className="text-xs font-mono text-[var(--muted)] mt-1">
            {stage.description}
          </p>
        </div>
      )}

      {/* Layers */}
      {stage.layers && stage.layers.length > 0 && (
        <div className="space-y-2">
          {stage.layers.map((layer, i) => (
            <div key={i} className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs ${statusColor[layer.status]}`}
                >
                  {statusIcon[layer.status]}
                </span>
                <span className="text-xs font-mono text-[var(--muted)]">
                  {layer.name}
                </span>
              </div>

              {/* Findings */}
              {layer.findings && layer.findings.length > 0 && (
                <div className="ml-4 space-y-0.5">
                  {layer.findings.slice(0, 3).map((f, j) => (
                    <p
                      key={j}
                      className="text-xs font-mono text-[var(--fg)] opacity-80 leading-relaxed"
                    >
                      › {f}
                    </p>
                  ))}
                </div>
              )}

              {/* Sources */}
              {layer.sources && layer.sources.length > 0 && (
                <div className="ml-4 flex flex-wrap gap-1 mt-1">
                  {layer.sources.map((s, j) => (
                    <SourceBadge key={j} label={s.label} url={s.url} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Waiting state */}
      {stage.status === "waiting" && (
        <p className="text-xs font-mono text-[var(--muted)]">
          {stage.description}
        </p>
      )}
    </div>
  );
}
