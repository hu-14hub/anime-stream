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

export type { ListStatus, LibraryEntry, WatchProgress } from "@/types";
