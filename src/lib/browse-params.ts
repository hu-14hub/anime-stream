import type { BrowseFilters, BrowseSort } from "@/types";

/** Parses `/catalog?...` search params into a normalized filter object. */
export function parseFilters(params: Record<string, string | string[] | undefined>): BrowseFilters {
  const str = (v: string | string[] | undefined): string =>
    typeof v === "string" ? v.trim() : Array.isArray(v) ? v[0]?.trim() ?? "" : "";

  const genresRaw = params.genres ?? params.genre;
  const genres = Array.isArray(genresRaw)
    ? genresRaw.flatMap((g) => g.split(","))
    : typeof genresRaw === "string"
      ? genresRaw.split(",").map((g) => g.trim())
      : [];

  const sortRaw = str(params.sort);
  const sort: BrowseSort = (["popularity", "score", "newest", "az", "trending"] as const).includes(
    sortRaw as BrowseSort
  )
    ? (sortRaw as BrowseSort)
    : "popularity";

  const year = parseInt(str(params.year), 10);
  const page = Math.max(parseInt(str(params.page), 10) || 1, 1);

  return {
    q: str(params.q),
    genres: genres.filter(Boolean),
    year: Number.isFinite(year) && year > 1900 ? year : undefined,
    season: str(params.season) || undefined,
    format: str(params.format) || undefined,
    status: str(params.status) || undefined,
    sort,
    page,
  };
}

/** Serializes filters back to URL search params, omitting defaults. */
export function filtersToParams(f: BrowseFilters): URLSearchParams {
  const p = new URLSearchParams();
  if (f.q) p.set("q", f.q);
  if (f.genres.length) p.set("genres", f.genres.join(","));
  if (f.year) p.set("year", String(f.year));
  if (f.season) p.set("season", f.season);
  if (f.format) p.set("format", f.format);
  if (f.status) p.set("status", f.status);
  if (f.sort && f.sort !== "popularity") p.set("sort", f.sort);
  if (f.page > 1) p.set("page", String(f.page));
  return p;
}

/** `/catalog?<params>` href for a filter state. */
export function filtersToHref(f: BrowseFilters): string {
  const qs = filtersToParams(f).toString();
  return qs ? `/catalog?${qs}` : "/catalog";
}

/** Query args passed to `browseAnime` (server + JSON API). */
export function filtersToQuery(f: BrowseFilters): Record<string, unknown> {
  return {
    q: f.q || undefined,
    genres: f.genres.length ? f.genres : undefined,
    year: f.year,
    season: f.season ? f.season.toUpperCase() : undefined,
    // A season without an explicit year falls back to the current year.
    seasonYear: f.season ? f.year ?? new Date().getFullYear() : f.year,
    format: f.format,
    status: f.status,
    sort: f.sort,
    page: f.page,
  };
}

export const SORT_KEYS: BrowseSort[] = ["popularity", "score", "newest", "az", "trending"];
export const SEASON_KEYS = ["winter", "spring", "summer", "fall"] as const;
export const FORMAT_KEYS = ["TV", "MOVIE", "OVA", "ONA", "SPECIAL"] as const;
export const STATUS_KEYS = ["ongoing", "completed"] as const;
export const YEAR_OPTIONS = Array.from({ length: 16 }, (_, i) => new Date().getFullYear() - i);