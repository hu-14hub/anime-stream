import type { Dictionary } from "@/i18n/get-dictionary";
import type { ListStatus } from "@/types";

/**
 * Centralized watchlist-status color system.
 *
 * This is the SINGLE source of truth for how each watchlist status is colored
 * anywhere in the app — the status button on the anime detail page
 * (`watchlist-button.tsx`) and the status pill on the profile watchlist cards
 * (`profile-client.tsx`) BOTH consume this exact map, so a status (e.g.
 * "Dropped") can never look rose on one page and cyan on another again.
 *
 * Add a new status here once and every surface stays in sync.
 *
 * Semantic color coding:
 *  - watching   → Cyan      (active / now watching)
 *  - completed  → Emerald   (done)
 *  - onhold     → Amber     (paused)
 *  - dropped    → Rose      (gave up)
 *  - plan       → Blue      (not started yet)
 *  - favorite   → Red       (hearted, matches the independent Favorites heart)
 *
 * Each entry is a full Tailwind pill recipe (`bg` + `text` + `border` +
 * `border-width`) so it drops cleanly onto a rounded pill, a button, an overlay badge
 * (combined with a base like `bg-black/60 backdrop-blur`), or any other element.
 */
export const STATUS_COLORS: Record<ListStatus, string> = {
  watching: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  completed: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  onhold: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  dropped: "bg-rose-500/20 text-rose-400 border-rose-500/30",
  plan: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  favorite: "bg-red-500/20 text-red-400 border-red-500/30",
};

/**
 * Full, copy-paste-ready class string for a given status (color + 1px border
 * width). Use this wherever a status needs to be rendered as a self-contained
 * pill / button / overlay badge.
 */
export function statusColorClasses(status: ListStatus): string {
  return `${STATUS_COLORS[status]} border`;
}

/** Localized human-readable label for a status (falls back to the raw key). */
export function statusLabel(dict: Dictionary, status: ListStatus): string {
  return (dict.watchlist as Record<string, string>)[status] ?? status;
}