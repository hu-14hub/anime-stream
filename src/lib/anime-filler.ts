import type { Anime } from "@/types";
import { FILLER_MAP, FILLER_DEMO_OVERRIDES } from "@/data/filler-data";

/**
 * Filler RESOLUTION + FLAG APPLICATION (logic only — data lives in
 * `@/data/filler-data`, the single source of truth).
 *
 * Why a curated registry?
 *   None of the public anime APIs (AniList, Jikan/MAL) expose a per-episode
 *   `isFiller` flag. AniList's Episode type is minimal (title/thumbnail only)
 *   and Jikan/MAL simply do not tag filler. The industry-standard approach —
 *   used by tracking apps like AniGap / MyAnimeList third-party tools — is a
 *   curated, maintainer-managed mapping of `{ canonicalKey: [fillerEpisode#] }`
 *   in `@/data/filler-data`.
 *
 * Resolution keys (try in order):
 *   1. canonical slug            — local demo slugs (stable, curated)
 *   2. normalized english title  — fuzzy match for live AniList/Jikan titles
 *   3. normalized native/jp title— catches titles whose english field is absent
 *   4. `al-<id>` / numeric slug  — hard overrides keyed by AniList / MAL id
 *
 * Fallback policy (see `FILLER_POLICY` in the data file): "canon-by-default" —
 *   titles absent from the registry are treated as NON-filler. This is the safe,
 *   honest default: unknown ≠ filler (we never fabricate flags for untracked shows).
 *
 * Single source of truth: every mapper (local, Jikan, AniList) funnels through
 *   {@link applyFillerFlags}, so the badge, the "Hide Filler" filter, the detail
 *   page, and the player notice all always agree.
 */

/** Demo seed slugs (illustrative overrides only — the live catalog never hits these). */
const DEMO_SLUGS = new Set(Object.keys(FILLER_DEMO_OVERRIDES));

/** Normalize a title/slug into a stable map key (lowercase, Latin alnum + Arabic, collapsed). */
function norm(s: string | undefined | null): string {
  return (s || "")
    .toLowerCase()
    .normalize("NFC")
    .replace(/[^a-z0-9\u0600-\u06ff]+/gi, " ")
    .trim();
}

export interface FillerSource {
  slug?: string;
  anilistId?: number;
  malId?: number;
  id?: number | string;
  title: { en?: string; ar?: string; jp?: string };
}

/**
 * Resolve the filler episode numbers for an anime.
 * Returns an empty array when nothing is known (→ no flags set, canon-by-default).
 */
export function getFillerEpisodes(a: FillerSource): number[] {
  // 1) LOCAL DEMO slugs — illustrative overrides (never present in the live catalog).
  if (a.slug && DEMO_SLUGS.has(a.slug)) return FILLER_DEMO_OVERRIDES[a.slug];

  // 2) Canonical registry — straight slug hit.
  if (a.slug && a.slug in FILLER_MAP) return FILLER_MAP[a.slug];

  // 2b) Registry — AniList (`al-<id>`) or Jikan/MAL (`<mal_id>-<title>`) slug → id.
  if (a.slug) {
    const idKey = a.slug.startsWith("al-")
      ? a.slug
      : a.slug.match(/^\d+/)
        ? a.slug.match(/^\d+/)![0]
        : null;
    if (idKey && idKey in FILLER_MAP) return FILLER_MAP[idKey];
  }

  // 2c) Registry — explicit numeric ids (AniList / MAL).
  for (const id of [a.anilistId, a.malId, Number(a.id)]) {
    const key = Number.isFinite(id) ? String(id) : null;
    if (key && key in FILLER_MAP) return FILLER_MAP[key];
  }

  // 3) Normalized-title match — exact first, then safe substring (avoids e.g.
  //    a live "Dragon Ball" short-title matching the "dragon ball z" key).
  const cands: Array<[string, number[]]> = Object.entries(FILLER_MAP).map(
    ([raw, eps]) => [norm(raw), eps]
  );
  const byEn = norm(a.title.en);
  const byNative = norm(a.title.jp) || norm(a.title.ar);
  const match = (target: string): number[] | null => {
    if (!target) return null;
    // exact
    const exact = cands.find(([k]) => k === target);
    if (exact) return exact[1];
    // then substring (query is a contained fragment of a key / vice-versa)
    const sub = cands.find(
      ([k]) => k.length > 3 && (k.includes(target) || target.includes(k))
    );
    return sub ? sub[1] : null;
  };
  return match(byEn) ?? match(byNative) ?? [];
}

/**
 * Pure, idempotent: tag each episode with `isFiller` from the curated registry.
 * Safe to call on anime already processed (reads the real array, so it won't
 * double-count or mutate in a loop). Intended for every mapper so the flag is
 * available in ONE place for badges, filters, and the player notice.
 */
export function applyFillerFlags(anime: Anime): Anime {
  if (!anime.episodes?.length) return anime;
  const fillerSet = new Set(getFillerEpisodes(anime));
  anime.episodes = anime.episodes.map((e) => ({
    ...e,
    isFiller: fillerSet.has(e.number),
  }));
  return anime;
}

/** Number of filler episodes in an anime (for counts / badges). */
export function countFiller(anime: Anime): number {
  return anime.episodes.reduce((n, e) => (e.isFiller ? n + 1 : n), 0);
}

/** True when at least one known filler episode falls within this anime's range. */
export function hasFiller(anime: Anime): boolean {
  return countFiller(anime) > 0;
}