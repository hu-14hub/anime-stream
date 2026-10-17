import type { Anime } from "@/types";

const BASE = "https://api.jikan.moe/v4";

export interface JikanImageSet { image_url: string; large_image_url: string; }
export interface JikanAnime {
  mal_id: number;
  title: string;
  title_english?: string | null;
  synopsis?: string | null;
  images: { jpg: JikanImageSet; webp?: JikanImageSet };
  score?: number | null;
  year?: number | null;
  aired?: { from?: string | null };
  status?: string;
  genres?: { name: string }[];
  themes?: { name: string }[];
  demographics?: { name: string }[];
  studios?: { name: string }[];
  episodes?: number | null;
  trailer?: { youtube_id?: string | null; url?: string | null; images?: { maximum_image_url?: string } };
}
export interface JikanListRes { data: JikanAnime[]; pagination: { last_visible_page: number; has_next_page: boolean }; }
export interface JikanSingleRes { data: JikanAnime; }
export interface JikanEpisode { mal_id: number; title: string; episode: string; score?: number | null; aired?: string | null; }
export interface JikanEpRes { data: JikanEpisode[]; pagination: { last_visible_page: number; has_next_page: boolean }; }

const cache = new Map<string, { exp: number; val: unknown }>();
const TTL = 10 * 60 * 1000;
async function cached<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const hit = cache.get(key);
  if (hit && hit.exp > Date.now()) return hit.val as T;
  const val = await fn();
  cache.set(key, { exp: Date.now() + TTL, val });
  return val;
}
async function jikan<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { next: { revalidate: 600 } });
  if (res.status === 429) throw new Error("RATE_LIMIT");
  if (!res.ok) throw new Error(`JIKAN_${res.status}`);
  return res.json() as Promise<T>;
}

export function toSlug(id: number, title: string): string {
  const s = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "anime";
  return `${id}-${s}`;
}
export function idFromSlug(slug: string): number | null {
  const m = slug.match(/^(\d+)/);
  return m ? parseInt(m[1], 10) : null;
}
function normGenre(n: string): string {
  return n.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}
function arTitle(en: string): string { return en; }
function arSynopsis(en: string): string { return en || ""; }

export function mapJikan(a: JikanAnime): Anime {
  const genres = [...(a.genres ?? []), ...(a.themes ?? []), ...(a.demographics ?? [])].map((g) => normGenre(g.name));
  const year = a.year ?? (a.aired?.from ? new Date(a.aired.from).getFullYear() : 0) ?? 0;
  const cover = a.images.webp?.large_image_url || a.images.webp?.image_url || a.images.jpg.large_image_url;
  const banner = a.trailer?.images?.maximum_image_url || cover;
  // Build the full episode list (no hard cap) so long-running titles list every
  // episode; the UI paginates via the 24-episode range tabs.
  const epCount = a.episodes ?? 0;
  const n = Math.max(epCount || 12, 1);
  const titleEn = a.title_english || a.title;
  return {
    id: String(a.mal_id), slug: toSlug(a.mal_id, titleEn),
    title: { en: titleEn, ar: arTitle(titleEn) },
    synopsis: { en: a.synopsis ?? "", ar: arSynopsis(a.synopsis ?? "") },
    cover, banner, rating: a.score ?? 0, year,
    status: a.status === "Currently Airing" ? "ongoing" : "completed",
    genres, studio: { en: a.studios?.[0]?.name ?? "Unknown", ar: a.studios?.[0]?.name ?? "Unknown" },
    episodeCount: epCount, trailerUrl: a.trailer?.youtube_id ? `https://www.youtube.com/embed/${a.trailer.youtube_id}` : (a.trailer?.url ?? undefined),
    trending: (a.score ?? 0) >= 8.4,
    episodes: Array.from({ length: n }, (_, i) => ({
      number: i + 1, title: { en: `Episode ${i + 1}`, ar: `الحلقة ${i + 1}` },
      duration: "23:40", thumbnail: cover, airedAt: new Date().toISOString(),
    })),
  };
}

export const getTopAnime = (page = 1, limit = 25) => cached(`top-${page}-${limit}`, async () => {
  const r = await jikan<JikanListRes>(`/top/anime?page=${page}&limit=${limit}&filter=bypopularity`);
  return { items: r.data.map(mapJikan), lastPage: r.pagination.last_visible_page, hasNext: r.pagination.has_next_page };
});
export const searchAnime = (q: string, page = 1, limit = 25, genreFilter?: string) => cached(`s-${q}-${page}-${genreFilter ?? ""}`, async () => {
  const p = new URLSearchParams({ q, page: String(page), limit: String(limit), order_by: "members", sort: "desc", sfw: "true" });
  if (genreFilter) p.set("genres_filter", "genres");
  const r = await jikan<JikanListRes>(`/anime?${p.toString()}`);
  let items = r.data.map(mapJikan);
  if (genreFilter) items = items.filter((a) => a.genres.includes(genreFilter));
  return { items, lastPage: r.pagination.last_visible_page, hasNext: r.pagination.has_next_page };
});
export const getAnimeById = (id: number) => cached(`a-${id}`, async () => {
  const r = await jikan<JikanSingleRes>(`/anime/${id}/full`);
  return mapJikan(r.data);
});
export const getAnimeEpisodes = (id: number, page = 1) => cached(`e-${id}-${page}`, async () => {
  const r = await jikan<JikanEpRes>(`/anime/${id}/episodes?page=${page}`);
  return { items: r.data, lastPage: r.pagination.last_visible_page, hasNext: r.pagination.has_next_page };
});
