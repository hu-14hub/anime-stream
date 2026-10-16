import type { Anime } from "@/types";

/** IMDB / awards metadata used as a fallback and for fine-tuning.
 *
 *  AniList's official GraphQL schema does not expose an IMDB score or a
 *  "Crunchyroll Anime Awards" tally, so we keep a small curated map keyed
 *  by catalogue slug.  Every entry is *optional* so the feature can be
 *  turned off or widened without changing the build.
 */

/** IMDB rating (0-10) and Crunchyroll Anime Awards wins per title slug. */
export const ANIME_META_BY_SLUG: Record<
  string,
  { imdbRating?: number | string; animeAwardsCount?: number }
> = {
  "attack-on-titan": { imdbRating: 8.8, animeAwardsCount: 4 },
  "demon-slayer": { imdbRating: 8.6, animeAwardsCount: 3 },
  "solo-leveling": { imdbRating: 8.5, animeAwardsCount: 6 },
  "my-hero-academia": { imdbRating: 8.1, animeAwardsCount: 5 },
  "death-note": { imdbRating: 8.3, animeAwardsCount: 2 },
  "spy-x-family": { imdbRating: 8.4, animeAwardsCount: 3 },
  "jujutsu-kaizen": { imdbRating: 8.2, animeAwardsCount: 2 },
  "one-piece": { imdbRating: 8.7, animeAwardsCount: 7 },
  "naruto": { imdbRating: 8.4, animeAwardsCount: 4 },
  "bleach": { imdbRating: 8.0, animeAwardsCount: 3 },
};

/**
 * Attach IMDB rating + Anime Awards count to an anime record.
 *
 * Run this after any data source resolves (mock catalogue, AniList, Jikan)
 * so every consumer sees the same shape.  Unknown slugs are returned
 * unchanged, so the build never breaks on missing metadata.
 */
export function attachImdbAndAwards(anime: Anime): Anime {
  const meta = ANIME_META_BY_SLUG[anime.slug];
  if (!meta) return anime;
  return {
    ...anime,
    imdbRating: meta.imdbRating,
    animeAwardsCount: meta.animeAwardsCount,
  };
}

/** Safe accessor returning `undefined` when metadata is unavailable. */
export function imdbRatingOf(anime: Anime): number | string | undefined {
  return anime.imdbRating;
}

/** Safe accessor returning `0` when metadata is unavailable. */
export function animeAwardsCountOf(anime: Anime): number {
  return anime.animeAwardsCount ?? 0;
}
