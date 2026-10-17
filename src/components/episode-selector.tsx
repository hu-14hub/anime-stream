"use client";

import { useState } from "react";

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
 * Compact episode range selector — rendered as a single clean dropdown.
 *
 * Only meaningful for long-running titles (more than one `EPISODE_CHUNK_SIZE`
 * episodes). Instead of a cluster of "1-24 / 25-48 / ..." range pills (which
 * crowdes the layout on huge catalogs like One Piece ~1100+), we surface ONE
 * minimal dropdown so the episode grid/list stays uncluttered while still
 * letting users jump between chunks without mounting hundreds of cards at once.
 *
 * State & props are unchanged from the previous pill implementation — the
 * active chunk is always derived from `initialStart` (synced to the current
 * episode), and `onSelect` reports the newly chosen 0-based chunk start.
 */
export function EpisodeSelector({
  total,
  activeEpisode,
  initialStart = 0,
  onSelect,
}: {
  /** Total number of episodes. */
  total: number;
  /** 1-based active episode (kept for API parity with the callers). */
  activeEpisode?: number;
  /** Initial 0-based range start index (e.g. synced from the current episode). */
  initialStart?: number;
  /** Callback with the newly selected 0-based start index. */
  onSelect?: (start: number) => void;
}) {
  const ranges = buildEpisodeRanges(total, EPISODE_CHUNK_SIZE);
  // Nothing to paginate for a single page — render nothing.
  if (ranges.length <= 1) return null;
  void activeEpisode; // reserved for API parity with the two callers

  const max = Math.floor((total - 1) / EPISODE_CHUNK_SIZE) * EPISODE_CHUNK_SIZE;
  const initial = Math.min(Math.max(initialStart, 0), max);
  const [start, setStart] = useState(initial);

  const select = (s: number) => {
    setStart(s);
    onSelect?.(s);
  };

  return (
    <div className="mb-4 flex items-center gap-2" suppressHydrationWarning>
      <label
        htmlFor="episode-range-select"
        className="text-[10px] font-bold uppercase tracking-widest text-neutral-500"
      >
        Episodes
      </label>
      <select
        id="episode-range-select"
        value={start}
        onChange={(e) => select(Number(e.target.value))}
        className="h-9 max-w-[11rem] cursor-pointer rounded-lg border border-white/10 bg-white/5 px-3 text-xs font-bold tabular-nums text-neutral-200 outline-none transition-colors duration-300 hover:bg-white/10 focus:border-brand/40 focus:ring-1 focus:ring-brand/30"
      >
        {ranges.map((r) => (
          <option
            key={r.start}
            value={r.start}
            className="bg-neutral-900 text-neutral-100"
          >
            <span dir="ltr">{`${r.start + 1}–${r.end}`}</span>
          </option>
        ))}
      </select>
    </div>
  );
}
