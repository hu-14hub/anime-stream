import type { Anime } from "@/types";

/**
 * Curated filler registry.
 *
 * Why a registry?
 *   None of the public anime APIs (AniList, Jikan/MAL) expose a per-episode
 *   `isFiller` flag. AniList's Episode type is minimal (title/thumbnail only)
 *   and Jikan/MAL simply do not tag filler. So the industry-standard approach
 *   — used by tracking apps like AniGap/MyAnimeList third-party tools — is a
 *   curated, maintainer-managed mapping of `{ canonicalKey: [fillerEpisode#] }`.
 *
 * Resolution keys (try in order):
 *   1. canonical slug            — local demo data slugs (stable, curated)
 *   2. normalized english title  — fuzzy match for live AniList/Jikan titles
 *   3. normalized native/jp title— catches titles whose english field is missing
 *   4. `al-<id>` / numeric slug  — hard overrides keyed by AniList / MAL id
 *
 * The registry is intentionally a single source of truth: every mapper
 * (local, Jikan, AniList) funnels through {@link applyFillerFlags}, so the badge,
 * the "Hide Filler" filter, and the player notice all always agree.
 *
 * NOTE (on live data): most live AniList/Jikan titles resolve `n` (aired
 *   count) to a large number, so only registry entries whose episode numbers
 *   fall within the *generated* episode range actually surface. The seed below
 *   guarantees the feature is demonstrable out-of-the-box via the local demo
 *   titles, while the real-world keys (Naruto, Bleach, Fairy Tail, etc.) are
 *   ready to light up as soon as their airing windows include them.
 */

const range = (from: number, to: number): number[] =>
  Array.from({ length: to - from + 1 }, (_, i) => from + i);

/** Curated filler episode numbers per title. Values are 1-based episode numbers. */
const FILLER_MAP: Record<string, number[]> = {
  /* ── Local demo titles (seeded so the feature is visible immediately) ── */
  "attack-on-titan": [5],
  "demon-slayer": [6],
  "naruto-shippuden": [4, 6, 8],
  "one-piece": [3, 7, 10],
  "jujutsu-kaisen": [6, 9],
  "my-hero-academia": [5, 8],
  "death-note": [6],
  "spy-x-family": [4, 7],

  /* ── Representative real-world filler (keyed by canonical title) ── */
  "Naruto Shippuden": [
    16, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 70, 71, 72, 73, 76, 77,
    78, 79, 80, 81, 82, 83, 89, 90, 91, 92, 93, 94, 95, 96, 97,
  ],
  "Fairy Tail": range(161, 167),
  "Bleach": [103, 175, 178, 179, 180, 185, 186, 197, 198, 199, 200, 283, 284, 285, 344, 358, 359],
  "Hunter x Hunter": [93, 94, 95, 103],
  "Cardcaptor Sakura": [14, 47, 48, 50, 70, 72, 75, 76, 100, 101, 110, 111, 127, 128],
  "Tokyo Mew Mew": [23, 38, 45, 51],
};

/** Normalize a title into a stable map key (lowercase, alnum/collapsed). */
function norm(s: string | undefined | null): string {
  return (s || "").toLowerCase().replace(/[^a-z0-9\u0600-\u06ff]+/gi, " ").trim();
}

export interface FillerSource {
  slug?: string;
  anilistId?: number;
  title: { en?: string; ar?: string; jp?: string };
}

/**
 * Resolve the curated filler episode numbers for an anime.
 * Returns an empty array when nothing is known (→ no flags set).
 */
export function getFillerEpisodes(a: FillerSource): number[] {
  if (a.slug) {
    if (a.slug in FILLER_MAP) return FILLER_MAP[a.slug];
    // Live AniList slugs look like `al-<id>` and Jikan slugs like `<id>-<title>`.
    const idKey = a.slug.startsWith("al-")
      ? a.slug
      : a.slug.match(/^\d+/)
        ? `${a.slug.match(/^\d+/)![0]}`
        : null;
    if (idKey && idKey in FILLER_MAP) return FILLER_MAP[idKey];
  }
  // Fall back to normalized title matching (covers live API titles).
  const byEn = norm(a.title.en);
  const byNative = norm(a.title.jp) || norm(a.title.ar);
  for (const [key, eps] of Object.entries(FILLER_MAP)) {
    const k = norm(key);
    if ((byEn && k === byEn) || (byNative && k === byNative)) return eps;
  }
  return [];
}

/**
 * Pure, idempotent: tag each episode with `isFiller` from the curated registry.
 * Safe to call on anime already processed (reads the real array length, so it
 * won't double-count or mutate in a loop). Intended for every mapper so the
 * flag is available in ONE place for badges, filters, and the player notice.
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