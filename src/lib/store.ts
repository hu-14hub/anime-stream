"use client";

/**
 * Typed localStorage store with a tiny pub/sub layer.
 *
 * Every collection lives under its own key and broadcasts changes so all
 * mounted components (navbar, rows, watch page…) stay in sync across the
 * app AND across browser tabs (via the `storage` event).
 *
 * NOTE: persistence is device-local — there is no backend in this project.
 * Swap `read`/`write` for API calls to get true cross-device sync without
 * touching any consumer.
 */

import type {
  AdminAnime,
  AdminUserRecord,
  CommentItem,
  HeroSlide,
  ReportItem,
  ThemePref,
  UserRating,
  UserProfile,
  UserSettings,
} from "@/types";

export const KEYS = {
  /**
   * Watchlist entries (status: watching/plan/completed/onhold/dropped).
   * Historically combined with favorites under `library` — split on first
   * read via the lazy migration in `lib/library.ts`.
   */
  watchlist: "anime_watchlist",
  /** Favorited entries (full snapshots, independent of watchlist status). */
  favorites: "anime_favorites",
  /** @deprecated pre-split combined library; migrated to watchlist/favorites. */
  library: "anime-stream-library",
  progress: "anime-stream-progress",
  comments: "anime-stream-comments",
  reports: "anime-stream-reports",
  ratings: "anime-stream-ratings",
  settings: "anime-stream-settings",
  profile: "anime-stream-profile",
  adminAnime: "anime-stream-admin-anime",
  adminUsers: "anime-stream-admin-users",
  hero: "anime-stream-hero",
  views: "anime-stream-views",
} as const;

type Listener = () => void;
const listeners = new Map<string, Set<Listener>>();

export function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write(key: string, val: unknown) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {
    /* storage full / private mode — ignore */
  }
  listeners.get(key)?.forEach((fn) => fn());
  // Notify other tabs
  try {
    window.dispatchEvent(new StorageEvent("storage", { key, newValue: JSON.stringify(val) }));
  } catch {
    /* older browsers */
  }
}

export function subscribe(key: string, fn: Listener): () => void {
  if (!listeners.has(key)) listeners.set(key, new Set());
  listeners.get(key)!.add(fn);
  return () => {
    listeners.get(key)?.delete(fn);
  };
}

/** Cross-tab listener helper — safe to call in effects. */
export function onExternalChange(key: string, fn: Listener): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = (e: StorageEvent) => {
    if (e.key === key) fn();
  };
  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}

export function getCollection<T>(key: string, fallback: T): T {
  return read<T>(key, fallback);
}

export function setCollection<T>(key: string, value: T): void {
  write(key, value);
}

/* ------------------------------------------------------------------ */
/* Settings                                                            */
/* ------------------------------------------------------------------ */

export const DEFAULT_SETTINGS: UserSettings = {
  locale: "en",
  theme: "dark",
  autoplayNext: true,
  autoplayPreviews: true,
  defaultSubtitle: "en",
  preferredQuality: "auto",
  rememberProgress: true,
};

export function getSettings(): UserSettings {
  const stored = read<Partial<UserSettings>>(KEYS.settings, {});
  // Theme is permanently dark — discard any legacy light/system preference.
  return { ...DEFAULT_SETTINGS, ...stored, theme: "dark" };
}

export function saveSettings(patch: Partial<UserSettings>): UserSettings {
  const { theme: _ignored, ...rest } = patch;
  void _ignored;
  const next = { ...getSettings(), ...rest, theme: "dark" as const };
  write(KEYS.settings, next);
  return next;
}

export function resetSettings(): UserSettings {
  write(KEYS.settings, DEFAULT_SETTINGS);
  return DEFAULT_SETTINGS;
}

/* ------------------------------------------------------------------ */
/* Profile / role                                                      */
/* ------------------------------------------------------------------ */

export const DEFAULT_PROFILE: UserProfile = {
  name: "Guest",
  email: "",
  role: "viewer",
};

export function getProfile(): UserProfile {
  return { ...DEFAULT_PROFILE, ...read<Partial<UserProfile>>(KEYS.profile, {}) };
}

export function saveProfile(patch: Partial<UserProfile>): UserProfile {
  const next = { ...getProfile(), ...patch };
  write(KEYS.profile, next);
  return next;
}

export function hasAdminAccess(): boolean {
  const role = getProfile().role;
  return role === "admin" || role === "editor";
}

/* ------------------------------------------------------------------ */
/* Ratings (1-10)                                                      */
/* ------------------------------------------------------------------ */

export function getRatings(): UserRating[] {
  return read<UserRating[]>(KEYS.ratings, []);
}

export function getRating(slug: string): UserRating | undefined {
  return getRatings().find((r) => r.slug === slug);
}

export function setRating(slug: string, score: number): UserRating[] {
  const clamped = Math.min(10, Math.max(1, Math.round(score)));
  const list = getRatings().filter((r) => r.slug !== slug);
  list.unshift({ slug, score: clamped, updatedAt: Date.now() });
  write(KEYS.ratings, list);
  return list;
}

export function clearRatings(): void {
  write(KEYS.ratings, []);
}

/* ------------------------------------------------------------------ */
/* Comments (threaded)                                                 */
/* ------------------------------------------------------------------ */

export function getComments(target?: string): CommentItem[] {
  const all = read<CommentItem[]>(KEYS.comments, []);
  return target ? all.filter((c) => c.target === target) : all;
}

export function addComment(
  item: Omit<CommentItem, "id" | "createdAt" | "likes" | "replies">
): CommentItem[] {
  const all = read<CommentItem[]>(KEYS.comments, []);
  const created: CommentItem = {
    ...item,
    id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: Date.now(),
    likes: 0,
    replies: [],
  };
  all.unshift(created);
  write(KEYS.comments, all);
  return all.filter((c) => c.target === item.target);
}

export function toggleCommentLike(target: string, id: string): CommentItem[] {
  const all = read<CommentItem[]>(KEYS.comments, []);
  const next = all.map((c) =>
    c.id === id
      ? { ...c, likedByMe: !c.likedByMe, likes: c.likes + (c.likedByMe ? -1 : 1) }
      : c
  );
  write(KEYS.comments, next);
  return next.filter((c) => c.target === target);
}

export function addReply(target: string, id: string, author: string, text: string): CommentItem[] {
  const all = read<CommentItem[]>(KEYS.comments, []);
  const next = all.map((c) =>
    c.id === id
      ? {
          ...c,
          replies: [
            ...c.replies,
            {
              id: `r-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
              author,
              text,
              createdAt: Date.now(),
            },
          ],
        }
      : c
  );
  write(KEYS.comments, next);
  return next.filter((c) => c.target === target);
}

export function moderateComment(id: string, patch: Partial<CommentItem>): CommentItem[] {
  const all = read<CommentItem[]>(KEYS.comments, []);
  const next = all.map((c) => (c.id === id ? { ...c, ...patch } : c));
  write(KEYS.comments, next);
  return next;
}

export function deleteComment(id: string): CommentItem[] {
  const next = read<CommentItem[]>(KEYS.comments, []).filter((c) => c.id !== id);
  write(KEYS.comments, next);
  return next;
}

/* ------------------------------------------------------------------ */
/* Reports                                                             */
/* ------------------------------------------------------------------ */

export function getReports(): ReportItem[] {
  return read<ReportItem[]>(KEYS.reports, []);
}

export function addReport(report: Omit<ReportItem, "id" | "createdAt" | "status">): ReportItem[] {
  const all = getReports();
  const created: ReportItem = {
    ...report,
    id: `rp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: Date.now(),
    status: "open",
  };
  all.unshift(created);
  write(KEYS.reports, all);
  return all;
}

export function setReportStatus(id: string, status: ReportItem["status"]): ReportItem[] {
  const next = getReports().map((r) => (r.id === id ? { ...r, status } : r));
  write(KEYS.reports, next);
  return next;
}

/* ------------------------------------------------------------------ */
/* Admin: content CRUD                                                 */
/* ------------------------------------------------------------------ */

export function getAdminAnime(): AdminAnime[] {
  return read<AdminAnime[]>(KEYS.adminAnime, []);
}

export function saveAdminAnime(record: AdminAnime): AdminAnime[] {
  const all = getAdminAnime();
  const idx = all.findIndex((a) => a.id === record.id || a.slug === record.slug);
  if (idx >= 0) all[idx] = record;
  else all.unshift(record);
  write(KEYS.adminAnime, all);
  return all;
}

export function deleteAdminAnime(id: string): AdminAnime[] {
  const next = getAdminAnime().filter((a) => a.id !== id);
  write(KEYS.adminAnime, next);
  return next;
}

export function getAdminUsers(): AdminUserRecord[] {
  return read<AdminUserRecord[]>(KEYS.adminUsers, []);
}

export function saveAdminUsers(users: AdminUserRecord[]): AdminUserRecord[] {
  write(KEYS.adminUsers, users);
  return users;
}

/* ------------------------------------------------------------------ */
/* Hero curation                                                       */
/* ------------------------------------------------------------------ */

export function getHeroSlides(): HeroSlide[] {
  return read<HeroSlide[]>(KEYS.hero, []);
}

export function saveHeroSlides(slides: HeroSlide[]): HeroSlide[] {
  write(KEYS.hero, slides);
  return slides;
}

/* ------------------------------------------------------------------ */
/* View analytics (incremented by the watch page)                      */
/* ------------------------------------------------------------------ */

export function recordView(slug: string): void {
  const map = read<Record<string, number>>(KEYS.views, {});
  map[slug] = (map[slug] ?? 0) + 1;
  write(KEYS.views, map);
}

export function getViews(): Record<string, number> {
  return read<Record<string, number>>(KEYS.views, {});
}

/* ------------------------------------------------------------------ */
/* Theme lock: cinematic dark is permanent. This helper only guarantees */
/* the `dark` class + dark color-scheme on the document element.        */
/* ------------------------------------------------------------------ */

export function applyTheme(): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.add("dark");
  root.style.colorScheme = "dark";
}
