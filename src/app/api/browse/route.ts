import { NextResponse } from "next/server";
import { browseAnime } from "@/services/anilistService";
import { animeList } from "@/data/anime";
import { filtersToQuery, parseFilters } from "@/lib/browse-params";

/**
 * JSON browse endpoint used by the infinite-scroll grid.
 * GET /api/browse?q=&genres=&year=&season=&format=&status=&sort=&page=
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const filters = parseFilters(Object.fromEntries(searchParams.entries()));
  try {
    const r = await browseAnime({
      ...filtersToQuery(filters),
      perPage: 24,
    } as Parameters<typeof browseAnime>[0]);
    return NextResponse.json({
      items: r.items,
      page: filters.page,
      lastPage: r.lastPage,
      hasNext: r.hasNext,
    });
  } catch {
    // Offline fallback: filter the local catalogue the same way the page does.
    const q = filters.q.toLowerCase();
    const items = animeList
      .filter((a) => {
        const okQ =
          !q ||
          a.title.en.toLowerCase().includes(q) ||
          a.title.ar.includes(filters.q) ||
          (a.romajiTitle ?? "").toLowerCase().includes(q);
        const okG =
          !filters.genres.length || filters.genres.every((g) => a.genres.includes(g));
        const okY = !filters.year || a.year === filters.year;
        const okF = !filters.format || a.format === filters.format;
        const okS = !filters.status || a.status === filters.status;
        return okQ && okG && okY && okF && okS;
      })
      .sort((a, b) => {
        if (filters.sort === "score") return b.rating - a.rating;
        if (filters.sort === "newest") return b.year - a.year;
        if (filters.sort === "az") return a.title.en.localeCompare(b.title.en);
        if (filters.sort === "trending") return (b.popularity ?? 0) - (a.popularity ?? 0);
        return (b.popularity ?? 0) - (a.popularity ?? 0);
      });
    return NextResponse.json({ items, page: 1, lastPage: 1, hasNext: false });
  }
}