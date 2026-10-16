"use client";

import type { Anime, LibraryEntry, ListStatus, WatchProgress } from "@/types";
import { KEYS, read, setCollection } from "@/lib/store";

/* ------------------------------------------------------------------ */
/* Legacy migration                                                    */
/* ------------------------------------------------------------------ */

let migrated = false;

/**
 * One-time lazy migration. The legacy combined library
 * (`anime-stream-library`) held watchlist entries and favorites in a single
 * array. Split it into the dedicated `anime_watchlist` / `anime_favorites`
 * collections. Writes directly (not via `setCollection`) because this runs
 * during the first render pass, before subscribers attach — notifying here
 * would trigger setState on other components mid-render.
 */
export function ensureMigrated(): void {
  if (migrated || typeof window === "undefined") return;
  migrated = true;
  let legacy: LibraryEntry[] = [];
  try {
    const raw = localStorage.getItem(KEYS.library);
    if (!raw) return;
    const parsed: unknown = JSON.parse(raw);
    legacy = Array.isArray(parsed) ? (parsed as LibraryEntry[]) : [];
  } catch {
    legacy = [];
  }
  try {
    const watchlist = read<LibraryEntry[]>(KEYS.watchlist, []);
    const favorites = read<LibraryEntry[]>(KEYS.favorites, []);
    for (const e of legacy) {
      if (!e || typeof e.slug !== "string") continue;
      const favorited = Boolean(e.favorited) || e.status === "favorite";
      // Entries whose only status was "favorite" never had a real list status.
      const status: ListStatus = e.status === "favorite" ? "plan" : (e.status ?? "plan");
      if (!watchlist.some((w) => w.slug === e.slug)) {
        watchlist.push({ ...e, status, favorited: undefined });
      }
      if (favorited && !favorites.some((f) => f.slug === e.slug)) {
        favorites.push({ ...e, status, favorited: true });
      }
    }
    localStorage.setItem(KEYS.watchlist, JSON.stringify(watchlist));
    localStorage.setItem(KEYS.favorites, JSON.stringify(favorites));
  } catch {
    /* ignore malformed legacy data */
  }
  try {
    localStorage.removeItem(KEYS.library);
  } catch {
    /* ignore */
  }
}

/* ------------------------------------------------------------------ */
/* Snapshots                                                           */
/* ------------------------------------------------------------------ */

/**
 * Build a complete, self-contained library snapshot from an Anime so the
 * profile can render cards (title, cover, score, format, year, episodes)
 * without any catalog lookup — including AniList/Jikan-sourced titles that
 * are not part of the static mock catalogue.
 */
export function toLibraryEntry(
  anime: Anime,
  patch: Partial<LibraryEntry> = {}
): LibraryEntry {
  return {
    slug: anime.slug,
    anilistId: anime.anilistId,
    title: anime.title.en,
    titleAr: anime.title.ar,
    cover: anime.cover,
    rating: typeof anime.rating === "number" ? anime.rating : undefined,
    format: anime.format,
    year: anime.year,
    episodes: anime.episodeCount,
    status: "plan",
    ...patch,
    updatedAt: Date.now(),
  };
}

/* ------------------------------------------------------------------ */
/* Watchlist                                                           */
/* ------------------------------------------------------------------ */

export function getWatchlist(): LibraryEntry[] {
  ensureMigrated();
  return read<LibraryEntry[]>(KEYS.watchlist, []);
}

export function upsertWatchlist(entry: LibraryEntry): LibraryEntry[] {
  const list = getWatchlist().filter((e) => e.slug !== entry.slug);
  list.unshift({ ...entry, updatedAt: Date.now() });
  setCollection<LibraryEntry[]>(KEYS.watchlist, list);
  return list;
}

export function removeFromWatchlist(slug: string): LibraryEntry[] {
  const list = getWatchlist().filter((e) => e.slug !== slug);
  setCollection<LibraryEntry[]>(KEYS.watchlist, list);
  return list;
}

/* ------------------------------------------------------------------ */
/* Favorites                                                           */
/* ------------------------------------------------------------------ */

export function getFavorites(): LibraryEntry[] {
  ensureMigrated();
  return read<LibraryEntry[]>(KEYS.favorites, []);
}

export function addFavorite(entry: LibraryEntry): LibraryEntry[] {
  const list = getFavorites().filter((e) => e.slug !== entry.slug);
  list.unshift({ ...entry, favorited: true, updatedAt: Date.now() });
  setCollection<LibraryEntry[]>(KEYS.favorites, list);
  return list;
}

export function removeFavorite(slug: string): LibraryEntry[] {
  const list = getFavorites().filter((e) => e.slug !== slug);
  setCollection<LibraryEntry[]>(KEYS.favorites, list);
  return list;
}

/**
 * Full removal: watchlist entry + favorite. Used by the dropdown's
 * "Remove" action to preserve the historical "remove everything" behavior.
 */
export function removeFromLibrary(slug: string): void {
  removeFromWatchlist(slug);
  removeFavorite(slug);
}

/* ------------------------------------------------------------------ */
/* Watch progress / history                                            */
/* ------------------------------------------------------------------ */

export function getProgress(slug: string, ep: number): WatchProgress | null {
  if (typeof window === "undefined") return null;
  const all = read<WatchProgress[]>(KEYS.progress, []);
  return all.find((p) => p.slug === slug && p.ep === ep) ?? null;
}

export function saveProgress(p: WatchProgress) {
  const all = read<WatchProgress[]>(KEYS.progress, []).filter(
    (x) => !(x.slug === p.slug && x.ep === p.ep)
  );
  all.unshift({ ...p, updatedAt: Date.now() });
  setCollection<WatchProgress[]>(KEYS.progress, all.slice(0, 200));
}

export function getContinueWatching(): WatchProgress[] {
  if (typeof window === "undefined") return [];
  return read<WatchProgress[]>(KEYS.progress, [])
    .filter((p) => p.duration > 0 && p.time / p.duration < 0.95)
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, 12);
}

/** All progress entries for one title, newest first. */
export function getTitleProgress(slug: string): WatchProgress[] {
  if (typeof window === "undefined") return [];
  return read<WatchProgress[]>(KEYS.progress, [])
    .filter((p) => p.slug === slug)
    .sort((a, b) => b.ep - a.ep);
}

/** Highest episode number watched to completion for a title. */
export function getWatchedEpisodes(slug: string): number[] {
  if (typeof window === "undefined") return [];
  return read<WatchProgress[]>(KEYS.progress, [])
    .filter((p) => p.slug === slug && p.duration > 0 && p.time / p.duration >= 0.9)
    .map((p) => p.ep);
}

/** Full watch history (all titles), most recently touched first. */
export function getHistory(): WatchProgress[] {
  if (typeof window === "undefined") return [];
  return read<WatchProgress[]>(KEYS.progress, []).sort((a, b) => b.updatedAt - a.updatedAt);
}

export function clearHistory(): void {
  setCollection<WatchProgress[]>(KEYS.progress, []);
}

/** Number of fully-watched episodes summed over the whole history. */
export function getWatchedEpisodeCount(): number {
  if (typeof window === "undefined") return 0;
  return read<WatchProgress[]>(KEYS.progress, [])
    .filter((p) => p.duration > 0 && p.time / p.duration >= 0.9).length;
}

export type { ListStatus, LibraryEntry, WatchProgress } from "@/types";
