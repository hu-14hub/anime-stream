export type AnimeStatus = "ongoing" | "completed";

export interface LocalizedText {
  en: string;
  ar: string;
}

export interface Episode {
  number: number;
  title: LocalizedText;
  duration: string; // e.g. "23:40"
  thumbnail: string;
  airedAt: string; // ISO date
}

export interface Anime {
  id: string;
  slug: string;
  title: LocalizedText;
  synopsis: LocalizedText;
  cover: string;
  banner: string;
  rating: number; // 0 - 10
  year: number;
  status: AnimeStatus;
  genres: string[]; // genre keys, translated in UI later
  studio: LocalizedText;
  episodeCount: number;
  trailerUrl?: string;
  trending?: boolean;
  episodes: Episode[];
}

export interface Genre {
  key: string;
  label: LocalizedText;
}
