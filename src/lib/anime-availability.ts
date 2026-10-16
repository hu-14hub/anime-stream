import type { Anime } from "@/types";

/**
 * Returns the highest episode number that is aired / available to watch.
 *
 * Resolution rules:
 *  1. "completed" titles — every episode in the model is available.
 *  2. "ongoing" titles with `nextAiringEpisode` set (from AniList) —
 *     AniList returns the *next* episode about to air, so
 *     aired = nextAiringEpisode − 1.
 *  3. "ongoing" without `nextAiringEpisode` (mock / local data, or
 *     the title just finished airing in a fresh cache) —
 *     all model episodes are treated as available so we never
 *     show false "unreleased" flags.
 *
 * The function is a pure, server-safe module (no DOM / localStorage
 * access) and can therefore be imported from both server components
 * and "use client" components without side effects.
 */
export function getAiredEpisodeCount(anime: Anime): number {
  const total = anime.episodes.length;
  if (anime.status !== "ongoing") return total;
  const next = anime.nextAiringEpisode;
  // next must be in range [2, total+1] to be meaningful:
  //   2    → 1 episode has aired
  //   total+1 → all episodes have aired (title is effectively done)
  if (next != null && next >= 2 && next <= total + 1) {
    return Math.max(1, next - 1);
  }
  return total;
}

/**
 * Quick boolean check: is this episode already aired / available?
 * Intended for use inside a render loop where `airedCount` is hoisted.
 */
export function isReleased(epNumber: number, airedCount: number): boolean {
  return epNumber <= airedCount;
}