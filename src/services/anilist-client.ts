export interface AniListTitle { romaji?: string | null; english?: string | null; native?: string | null; }
export interface AniListDate { year?: number | null; month?: number | null; day?: number | null; }
export interface AniListMedia {
  id: number;
  title: AniListTitle;
  description?: string | null;
  genres?: string[];
  averageScore?: number | null;
  coverImage?: { large?: string | null; extraLarge?: string | null } | null;
  bannerImage?: string | null;
  episodes?: number | null;
  startDate?: AniListDate | null;
  status?: string | null;
  studios?: { nodes?: { name: string }[] } | null;
  trailer?: { id?: string | null; site?: string | null } | null;
}
export interface AniListPageInfo { total?: number | null; perPage?: number | null; currentPage?: number | null; lastPage?: number | null; hasNextPage?: boolean | null; }
export interface AniListPageData { Page: { pageInfo: AniListPageInfo; media: AniListMedia[] }; }

const ENDPOINT = "https://graphql.anilist.co";

export const MEDIA_FIELDS = `
  id
  title { romaji english native }
  description(asHtml: false)
  genres
  averageScore
  coverImage { large extraLarge }
  bannerImage
  episodes
  startDate { year month day }
  status
  studios { nodes { name } }
  trailer { id site }
`;

export const TRENDING_QUERY = `query ($page: Int, $perPage: Int) {
  Page(page: $page, perPage: $perPage) {
    pageInfo { total perPage currentPage lastPage hasNextPage }
    media(type: ANIME, sort: TRENDING_DESC, isAdult: false) { ${MEDIA_FIELDS} }
  }
}`;
export const POPULAR_QUERY = `query ($page: Int, $perPage: Int) {
  Page(page: $page, perPage: $perPage) {
    pageInfo { total perPage currentPage lastPage hasNextPage }
    media(type: ANIME, sort: POPULARITY_DESC, isAdult: false) { ${MEDIA_FIELDS} }
  }
}`;
export const BROWSE_QUERY = `query ($page: Int, $perPage: Int, $search: String, $genre: String, $sort: [MediaSort]) {
  Page(page: $page, perPage: $perPage) {
    pageInfo { total perPage currentPage lastPage hasNextPage }
    media(type: ANIME, search: $search, genre: $genre, sort: $sort, isAdult: false) { ${MEDIA_FIELDS} }
  }
}`;
export const DETAIL_QUERY = `query ($id: Int) {
  Media(id: $id, type: ANIME) { ${MEDIA_FIELDS} }
}`;

const cache = new Map<string, { exp: number; val: unknown }>();
const TTL = 10 * 60 * 1000;
export async function cachedAnilist<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const hit = cache.get(key);
  if (hit && hit.exp > Date.now()) return hit.val as T;
  const val = await fn();
  cache.set(key, { exp: Date.now() + TTL, val });
  return val;
}

export async function anilist<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 600 },
  });
  if (res.status === 429) throw new Error("ANILIST_RATE_LIMIT");
  if (!res.ok) throw new Error(`ANILIST_${res.status}`);
  const json = (await res.json()) as { data?: T; errors?: { message: string }[] };
  if (json.errors?.length) throw new Error(`ANILIST_${json.errors[0].message}`);
  if (!json.data) throw new Error("ANILIST_EMPTY");
  return json.data;
}
