import type { Anime } from "@/types";
import {
  AIRING_QUERY,
  BROWSE_QUERY,
  DETAIL_QUERY,
  POPULAR_QUERY,
  SEASON_QUERY,
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
    anilistId: m.id,
    title: { en: titleEn, ar: titleEn },
    nativeTitle: m.title.native ?? undefined,
    romajiTitle: m.title.romaji ?? undefined,
    synopsis: { en: rawDesc, ar: rawDesc },
    cover,
    banner,
    rating: m.averageScore != null ? Math.round((m.averageScore / 10) * 10) / 10 : 0,
    popularity: m.popularity ?? undefined,
    year: m.startDate?.year ?? 0,
    season: (m.season as Anime["season"]) ?? undefined,
    seasonYear: m.seasonYear ?? undefined,
    format: (m.format as Anime["format"]) ?? undefined,
    duration: m.duration ?? undefined,
    status: m.status === "RELEASING" ? "ongoing" : "completed",
    genres: (m.genres ?? []).map(normGenre),
    tags: (m.tags ?? []).slice(0, 12).map((t) => t.name),
    studio: { en: studio, ar: studio },
    episodeCount: epCount,
    trailerUrl: m.trailer?.site === "youtube" && m.trailer.id ? `https://www.youtube.com/embed/${m.trailer.id}` : undefined,
    trending: (m.averageScore ?? 0) >= 80,
    nextAiringAt: m.nextAiringEpisode?.airingAt ?? null,
    nextAiringEpisode: m.nextAiringEpisode?.episode ?? null,
    characters: (m.characters?.edges ?? [])
      .filter((e) => e.node)
      .slice(0, 12)
      .map((e) => ({
        id: e.node!.id,
        name: e.node!.name?.full ?? "Unknown",
        image: e.node!.image?.large ?? "",
        role: e.role ?? undefined,
      })),
    related: (m.relations?.edges ?? [])
      .filter((e) => e.node)
      .slice(0, 8)
      .map((e) => mapAniListLite(e.node!)),
    recommendations: (m.recommendations?.nodes ?? [])
      .filter((r) => r.mediaRecommendation)
      .slice(0, 8)
      .map((r) => mapAniListLite(r.mediaRecommendation!)),
    episodes: Array.from({ length: n }, (_, i) => ({
      number: i + 1,
      title: { en: `Episode ${i + 1}`, ar: `الحلقة ${i + 1}` },
      duration: "23:40",
      thumbnail: cover,
      airedAt: new Date().toISOString(),
    })),
  };
}

function mapAniListLite(m: AniListMedia): Anime {
  const full = mapAniList(m);
  return { ...full, related: undefined, recommendations: undefined, characters: undefined };
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

export const browseAnime = (opts: {
  q?: string;
  genre?: string;
  genres?: string[];
  year?: number;
  season?: string;
  seasonYear?: number;
  format?: string;
  status?: string;
  sort?: string;
  page?: number;
  perPage?: number;
}) =>
  cachedAnilist(`al-browse-${opts.q ?? ""}-${(opts.genres ?? [opts.genre ?? ""]).join(",")}-${opts.year ?? ""}-${opts.season ?? ""}-${opts.seasonYear ?? ""}-${opts.format ?? ""}-${opts.status ?? ""}-${opts.sort ?? ""}-${opts.page ?? 1}-${opts.perPage ?? 25}`, async () => {
    const sortMap: Record<string, string[]> = {
      popularity: ["POPULARITY_DESC"],
      score: ["SCORE_DESC"],
      trending: ["TRENDING_DESC"],
      newest: ["START_DATE_DESC"],
      az: ["TITLE_ROMAJI"],
    };
    const genreIn = opts.genres?.length
      ? opts.genres.map(toAniListGenre).filter(Boolean) as string[]
      : toAniListGenre(opts.genre)
        ? [toAniListGenre(opts.genre)!]
        : undefined;
    const statusMap: Record<string, string> = { ongoing: "RELEASING", completed: "FINISHED" };
    return toPage(
      await anilist<AniListPageData>(BROWSE_QUERY, {
        page: opts.page ?? 1,
        perPage: opts.perPage ?? 25,
        search: opts.q || undefined,
        genreIn,
        season: opts.season || undefined,
        seasonYear: opts.seasonYear || opts.year || undefined,
        startDateGreater: opts.year && !opts.seasonYear ? opts.year * 10000 : undefined,
        startDateLesser: opts.year && !opts.seasonYear ? (opts.year + 1) * 10000 : undefined,
        format: opts.format || undefined,
        status: opts.status ? statusMap[opts.status] : undefined,
        sort: opts.q && !opts.sort ? ["SEARCH_MATCH", "POPULARITY_DESC"] : sortMap[opts.sort ?? "popularity"] ?? ["POPULARITY_DESC"],
      })
    );
  });

export const getSeasonAnime = (season: string, year: number, sort = "POPULARITY_DESC", perPage = 12) =>
  cachedAnilist(`al-season-${season}-${year}-${sort}-${perPage}`, async () =>
    toPage(await anilist<AniListPageData>(SEASON_QUERY, { page: 1, perPage, season, seasonYear: year, sort: [sort] }))
  );

export const getTopRated = (page = 1, perPage = 12) =>
  cachedAnilist(`al-top-${page}-${perPage}`, async () =>
    toPage(await anilist<AniListPageData>(BROWSE_QUERY, { page, perPage, sort: ["SCORE_DESC"] }))
  );

export const getAiringWeek = (weekStart: number, weekEnd: number, perPage = 50) =>
  cachedAnilist(`al-airing-${weekStart}-${weekEnd}`, async () => {
    const d = await anilist<{ Page: { pageInfo: { hasNextPage?: boolean | null }; airingSchedules: { id: number; airingAt: number; episode: number; media: import("./anilist-client").AniListMedia }[] } }>(
      AIRING_QUERY,
      { page: 1, perPage, weekStart, weekEnd }
    );
    return d.Page.airingSchedules.map((s) => ({
      id: s.id,
      airingAt: s.airingAt,
      episode: s.episode,
      anime: s.media ? mapAniList(s.media) : null,
    }));
  });

export const getAnimeDetail = (id: number) =>
  cachedAnilist(`al-detail-${id}`, async () => {
    const d = await anilist<{ Media: AniListMedia }>(DETAIL_QUERY, { id });
    return mapAniList(d.Media);
  });
