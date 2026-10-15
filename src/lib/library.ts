"use client";

import type { LibraryEntry, WatchProgress } from "@/types";

const LIB_KEY = "anime-stream-library";
const PROGRESS_KEY = "anime-stream-progress";

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write(key: string, val: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch { /* storage full / private mode */ }
}

export function getLibrary(): LibraryEntry[] {
  if (typeof window === "undefined") return [];
  return read<LibraryEntry[]>(LIB_KEY, []);
}

export function upsertLibrary(entry: LibraryEntry): LibraryEntry[] {
  const list = getLibrary().filter((e) => e.slug !== entry.slug);
  list.unshift({ ...entry, updatedAt: Date.now() });
  write(LIB_KEY, list);
  return list;
}

export function removeFromLibrary(slug: string): LibraryEntry[] {
  const list = getLibrary().filter((e) => e.slug !== slug);
  write(LIB_KEY, list);
  return list;
}

export function getProgress(slug: string, ep: number): WatchProgress | null {
  if (typeof window === "undefined") return null;
  const all = read<WatchProgress[]>(PROGRESS_KEY, []);
  return all.find((p) => p.slug === slug && p.ep === ep) ?? null;
}

export function saveProgress(p: WatchProgress) {
  const all = read<WatchProgress[]>(PROGRESS_KEY, []).filter(
    (x) => !(x.slug === p.slug && x.ep === p.ep)
  );
  all.unshift({ ...p, updatedAt: Date.now() });
  write(PROGRESS_KEY, all.slice(0, 200));
}

export function getContinueWatching(): WatchProgress[] {
  if (typeof window === "undefined") return [];
  return read<WatchProgress[]>(PROGRESS_KEY, [])
    .filter((p) => p.duration > 0 && p.time / p.duration < 0.95)
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, 12);
}

/** All progress entries for one title, newest first. */
export function getTitleProgress(slug: string): WatchProgress[] {
  if (typeof window === "undefined") return [];
  return read<WatchProgress[]>(PROGRESS_KEY, [])
    .filter((p) => p.slug === slug)
    .sort((a, b) => b.ep - a.ep);
}

/** Highest episode number watched to completion for a title. */
export function getWatchedEpisodes(slug: string): number[] {
  if (typeof window === "undefined") return [];
  return read<WatchProgress[]>(PROGRESS_KEY, [])
    .filter((p) => p.slug === slug && p.duration > 0 && p.time / p.duration >= 0.9)
    .map((p) => p.ep);
}

/** Full watch history (all titles), most recently touched first. */
export function getHistory(): WatchProgress[] {
  if (typeof window === "undefined") return [];
  return read<WatchProgress[]>(PROGRESS_KEY, []).sort((a, b) => b.updatedAt - a.updatedAt);
}

export function clearHistory(): void {
  write(PROGRESS_KEY, []);
}

export function getFavorites(): LibraryEntry[] {
  return getLibrary().filter((e) => e.status === "favorite" || e.favorited);
}

/** Number of fully-watched episodes summed over the whole history. */
export function getWatchedEpisodeCount(): number {
  if (typeof window === "undefined") return 0;
  return read<WatchProgress[]>(PROGRESS_KEY, [])
    .filter((p) => p.duration > 0 && p.time / p.duration >= 0.9).length;
}

export type { ListStatus, LibraryEntry, WatchProgress } from "@/types";
