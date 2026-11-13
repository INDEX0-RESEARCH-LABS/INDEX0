"use client";

interface SourceBadgeProps {
  label: string;
  url?: string;
  verified?: boolean;
}

export function SourceBadge({ label, url, verified = true }: SourceBadgeProps) {
  const inner = (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--surface-200)] border border-[var(--border-oklab)] text-xs font-mono text-[var(--muted)] hover:text-[var(--fg)] transition-colors">
      <span className={`w-1.5 h-1.5 rounded-full ${verified ? "bg-emerald-500" : "bg-amber-400"}`} />
      {label}
    </span>
  );

  if (url) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer">
        {inner}
      </a>
    );
  }
  return inner;
}
