"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Size of each range shown by the episode range selector. Mirrors the
 * 24-per-page default the external tracking APIs (AniList/Jikan) paginate by.
 */
export const EPISODE_CHUNK_SIZE = 24;

export interface EpisodeRange {
  /** 0-based first episode index in the range. */
  start: number;
  /** 0-based exclusive end index for `slice`. */
  end: number;
}

/**
 * Build the list of episode ranges (chunks) for a total episode count.
 * e.g. 120 → [{0,24},{24,48},{48,72},{72,96},{96,120}]
 * (labels rendered as "1-24", "25-48", ...).
 */
export function buildEpisodeRanges(total: number, chunkSize = EPISODE_CHUNK_SIZE): EpisodeRange[] {
  const ranges: EpisodeRange[] = [];
  const size = Math.max(1, Math.round(chunkSize));
  for (let i = 0; i < total; i += size) {
    ranges.push({ start: i, end: Math.min(i + size, total) });
  }
  return ranges;
}

/**
 * 0-based episode index of the range that contains a 1-based episode number.
 * Returns 0 (first range) when the episode falls outside any range or is unset.
 */
export function rangeStartForEpisode(active?: number, chunkSize = EPISODE_CHUNK_SIZE): number {
  if (!active || active < 1) return 0;
  return Math.floor((active - 1) / Math.max(1, Math.round(chunkSize))) * Math.max(1, Math.round(chunkSize));
}

/**
 * Compact episode range selector.
 *
 * Only meaningful for long-running titles (more than one `EPISODE_CHUNK_SIZE`
 * episodes). Renders lightweight number tabs like "1-24", "25-48", ... so users
 * can jump between chunks without rendering hundreds of episode cards at once.
 * The active range is highlighted automatically based on `activeEpisode`.
 */
export function EpisodeSelector({
  total,
  activeEpisode,
  initialStart = 0,
  onSelect,
}: {
  /** Total number of episodes. */
  total: number;
  /** 1-based active episode (used to auto-highlight its range). */
  activeEpisode?: number;
  /** Initial 0-based range start index (e.g. synced from the current episode). */
  initialStart?: number;
  /** Callback with the newly selected 0-based start index. */
  onSelect?: (start: number) => void;
}) {
  const ranges = buildEpisodeRanges(total, EPISODE_CHUNK_SIZE);
  // Nothing to paginate for a single page — render nothing.
  if (ranges.length <= 1) return null;

  const max = Math.floor((total - 1) / EPISODE_CHUNK_SIZE) * EPISODE_CHUNK_SIZE;
  const initial = Math.min(Math.max(initialStart, 0), max);
  const [start, setStart] = useState(initial);

  const select = (s: number) => {
    setStart(s);
    onSelect?.(s);
  };

  // `suppressHydrationWarning` guards against the single expected SSR/CSR
  // mismatch: `initialStart` may differ from the server-default range shown
  // during static generation when mounting on a deep watch page.
  return (
    <div
      role="tablist"
      aria-label="Episode range"
      suppressHydrationWarning
      className="mb-4 flex flex-wrap items-center gap-1.5"
    >
      {ranges.map((r) => {
        const isActive = start === r.start;
        const label = `${r.start + 1}-${r.end}`;
        return (
          <button
            key={r.start}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => select(r.start)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-bold tabular-nums transition-colors duration-300",
              isActive
                ? "bg-brand text-neutral-950"
                : "bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white"
            )}
          >
            <span dir="ltr">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
