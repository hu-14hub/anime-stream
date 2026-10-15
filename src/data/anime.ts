import type { Anime, Genre } from "@/types";
import { animeListFromData } from "./animeData";

export const genres: Genre[] = [
  { key: "action", label: { en: "Action", ar: "أكشن" } },
  { key: "adventure", label: { en: "Adventure", ar: "مغامرات" } },
  { key: "fantasy", label: { en: "Fantasy", ar: "فانتازيا" } },
  { key: "drama", label: { en: "Drama", ar: "دراما" } },
  { key: "romance", label: { en: "Romance", ar: "رومانسي" } },
  { key: "sci-fi", label: { en: "Sci-Fi", ar: "خيال علمي" } },
  { key: "supernatural", label: { en: "Supernatural", ar: "خارق للطبيعة" } },
];

/** Anime list sourced from the flat bilingual mock data (animeData.ts). */
export const animeList: Anime[] = animeListFromData;

export function getAnimeBySlug(slug: string): Anime | undefined {
  return animeList.find((a) => a.slug === slug);
}

export function getTrending(): Anime[] {
  return animeList.filter((a) => a.trending);
}

export function getLatest(limit = 8): Anime[] {
  return [...animeList].sort((a, b) => b.year - a.year).slice(0, limit);
}
