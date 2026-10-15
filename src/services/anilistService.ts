import type { Anime } from "@/types";
import {
  BROWSE_QUERY,
  DETAIL_QUERY,
  POPULAR_QUERY,
  TRENDING_QUERY,
  anilist,
  cachedAnilist,
  type AniListMedia,
  type AniListPageData,
} from "./anilist-client";

function stripHtml(s: string): string {
  return s.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]*>/g, "").replace(/\n{3,}/g, "\n\n").trim();
}
function normGenre(n: string): string {
  return n.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}
export function toAnilistSlug(id: number, title: string): string {
  const s = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "anime";
  return `al-${id}-${s}`;
}
export function anilistIdFromSlug(slug: string): number | null {
  const m = slug.match(/^al-(\d+)/);
  return m ? parseInt(m[1], 10) : null;
}

export function mapAniList(m: AniListMedia): Anime {
  const titleEn = m.title.english || m.title.romaji || "Unknown";
  const rawDesc = m.description ? stripHtml(m.description) : "";
  const cover = m.coverImage?.extraLarge || m.coverImage?.large || "";
  const banner = m.bannerImage || cover;
  const epCount = m.episodes ?? 0;
  const n = Math.min(Math.max(epCount || 12, 1), 24);
  const studio = m.studios?.nodes?.[0]?.name ?? "Unknown";
  return {
    id: `al-${m.id}`,
    slug: toAnilistSlug(m.id, titleEn),
    title: { en: titleEn, ar: titleEn },
    synopsis: { en: rawDesc, ar: rawDesc },
    cover,
    banner,
    rating: m.averageScore != null ? Math.round((m.averageScore / 10) * 10) / 10 : 0,
    year: m.startDate?.year ?? 0,
    status: m.status === "RELEASING" ? "ongoing" : "completed",
    genres: (m.genres ?? []).map(normGenre),
    studio: { en: studio, ar: studio },
    episodeCount: epCount,
    trailerUrl: m.trailer?.site === "youtube" && m.trailer.id ? `https://www.youtube.com/embed/${m.trailer.id}` : undefined,
    trending: (m.averageScore ?? 0) >= 80,
    episodes: Array.from({ length: n }, (_, i) => ({
      number: i + 1,
      title: { en: `Episode ${i + 1}`, ar: `الحلقة ${i + 1}` },
      duration: "23:40",
      thumbnail: cover,
      airedAt: new Date().toISOString(),
    })),
  };
}

function toPage(d: AniListPageData) {
  const items = d.Page.media.map(mapAniList);
  return {
    items,
    lastPage: d.Page.pageInfo.lastPage ?? 1,
    hasNext: d.Page.pageInfo.hasNextPage ?? false,
    total: d.Page.pageInfo.total ?? items.length,
  };
}

export const getTrendingAnime = (page = 1, perPage = 10) =>
  cachedAnilist(`al-trending-${page}-${perPage}`, async () =>
    toPage(await anilist<AniListPageData>(TRENDING_QUERY, { page, perPage }))
  );

export const getPopularAnime = (page = 1, perPage = 12) =>
  cachedAnilist(`al-popular-${page}-${perPage}`, async () =>
    toPage(await anilist<AniListPageData>(POPULAR_QUERY, { page, perPage }))
  );

function toAniListGenre(key?: string): string | undefined {
  if (!key) return undefined;
  return key.split("-").map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w)).join(" ");
}

export const browseAnime = (opts: { q?: string; genre?: string; page?: number; perPage?: number }) =>
  cachedAnilist(`al-browse-${opts.q ?? ""}-${opts.genre ?? ""}-${opts.page ?? 1}-${opts.perPage ?? 25}`, async () =>
    toPage(
      await anilist<AniListPageData>(BROWSE_QUERY, {
        page: opts.page ?? 1,
        perPage: opts.perPage ?? 25,
        search: opts.q || undefined,
        genre: toAniListGenre(opts.genre),
        sort: opts.q ? ["SEARCH_MATCH", "POPULARITY_DESC"] : ["POPULARITY_DESC"],
      })
    )
  );

export const getAnimeDetail = (id: number) =>
  cachedAnilist(`al-detail-${id}`, async () => {
    const d = await anilist<{ Media: AniListMedia }>(DETAIL_QUERY, { id });
    return mapAniList(d.Media);
  });
