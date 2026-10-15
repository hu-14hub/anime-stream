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

export type AnimeFormat = "TV" | "MOVIE" | "OVA" | "ONA" | "SPECIAL" | "MUSIC" | string;
export type AnimeSeason = "WINTER" | "SPRING" | "SUMMER" | "FALL" | string;

export interface AnimeCharacter {
  id: number;
  name: string;
  image: string;
  role?: string;
}

export interface Anime {
  id: string;
  slug: string;
  anilistId?: number;
  title: LocalizedText;
  nativeTitle?: string;
  romajiTitle?: string;
  synopsis: LocalizedText;
  cover: string;
  banner: string;
  rating: number; // 0 - 10
  popularity?: number;
  year: number;
  season?: AnimeSeason;
  seasonYear?: number;
  format?: AnimeFormat;
  duration?: number;
  status: AnimeStatus;
  genres: string[]; // genre keys, translated in UI later
  tags?: string[];
  studio: LocalizedText;
  episodeCount: number;
  trailerUrl?: string;
  trending?: boolean;
  nextAiringAt?: number | null;
  nextAiringEpisode?: number | null;
  characters?: AnimeCharacter[];
  related?: Anime[];
  recommendations?: Anime[];
  episodes: Episode[];
}

export interface Genre {
  key: string;
  label: LocalizedText;
}

export type ListStatus = "watching" | "plan" | "completed" | "onhold" | "dropped" | "favorite";

export interface LibraryEntry {
  slug: string;
  anilistId?: number;
  title: string;
  cover: string;
  status: ListStatus;
  score?: number; // 1-10
  progress?: number; // watched episodes
  updatedAt: number;
}

export interface WatchProgress {
  slug: string;
  ep: number;
  time: number;
  duration: number;
  updatedAt: number;
}

