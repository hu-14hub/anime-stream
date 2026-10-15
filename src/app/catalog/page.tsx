import { Suspense } from "react";
import Link from "next/link";
import { SearchX } from "lucide-react";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/server";
import { AnimeCard } from "@/components/anime-card";
import { Pagination } from "@/components/pagination";
import { BrowseFilters } from "@/components/browse-filters";
import { InfiniteBrowseGrid } from "@/components/infinite-browse-grid";
import { AnimeGridSkeleton } from "@/components/anime-skeletons";
import { animeList, genres } from "@/data/anime";
import { browseAnime } from "@/services/anilistService";
import { filtersToParams, filtersToQuery, parseFilters } from "@/lib/browse-params";

export const dynamic = "force-dynamic";

export default async function CatalogPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const locale = await getLocale();
  const t = getDictionary(locale);
  const params = (await searchParams) ?? {};
  const filters = parseFilters(params);
  const view = typeof params.view === "string" && params.view === "paged" ? "paged" : "infinite";

  let items: Awaited<ReturnType<typeof browseAnime>>["items"] = animeList;
  let lastPage = 1;
  let hasNext = false;
  let failed = false;

  try {
    const r = await browseAnime({ ...filtersToQuery(filters), perPage: 24 } as Parameters<
      typeof browseAnime
    >[0]);
    items = r.items;
    lastPage = r.lastPage;
    hasNext = r.hasNext;
    if (!items.length && !(filters.q || filters.genres.length)) throw new Error("EMPTY");
  } catch {
    // Offline fallback — mirror the API's filtering locally.
    failed = true;
    const q = filters.q.toLowerCase();
    items = animeList.filter((a) => {
      const okQ =
        !q ||
        a.title.en.toLowerCase().includes(q) ||
        a.title.ar.includes(filters.q) ||
        (a.romajiTitle ?? "").toLowerCase().includes(q);
      const okG = !filters.genres.length || filters.genres.every((g) => a.genres.includes(g));
      const okY = !filters.year || a.year === filters.year;
      const okF = !filters.format || a.format === filters.format;
      const okS = !filters.status || a.status === filters.status;
      return okQ && okG && okY && okF && okS;
    });
    lastPage = 1;
    hasNext = false;
  }

  // Query string (without page) handed to the infinite-scroll grid.
  const baseParams = filtersToParams({ ...filters, page: 1 });
  const apiQuery = baseParams.toString();
  // Page hrefs for classic pagination mode.
  const pageBase = `/catalog?${baseParams.toString()}`;
  // Toggle href (preserves all filters).
  const toggleParams = filtersToParams(filters);
  toggleParams.set("view", view === "infinite" ? "paged" : "infinite");
  const toggleHref = `/catalog?${toggleParams.toString()}`;

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 sm:py-12">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            {t.browse.title}
          </h1>
          <p className="mt-2 text-sm leading-6 text-neutral-400 sm:text-base sm:leading-7">
            {t.browse.subtitle} · <span dir="ltr">{items.length}</span> {t.browse.results}
          </p>
        </div>
        <Link
          href={toggleHref}
          className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-neutral-300 transition hover:bg-white/10 hover:text-white"
        >
          {view === "infinite" ? t.browse.viewPaged : t.browse.viewInfinite}
        </Link>
      </div>

      {failed && (
        <p className="mt-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-xs text-amber-200">
          {t.browse.offlineNote}
        </p>
      )}

      <div className="mt-6">
        <Suspense fallback={<div className="h-24 animate-pulse rounded-2xl bg-white/5" />}>
          <BrowseFilters genres={genres} locale={locale} dict={t} />
        </Suspense>
      </div>

      {items.length === 0 ? (
        <div className="mt-8 flex flex-col items-center gap-3 rounded-2xl bg-white/[0.03] px-6 py-16 text-center">
          <SearchX className="h-10 w-10 text-neutral-600" aria-hidden />
          <p className="font-semibold text-neutral-300">{t.browse.noResults}</p>
          <Link
            href="/catalog"
            className="rounded-full bg-white/10 px-5 py-2 text-sm font-semibold text-white transition-colors duration-300 hover:bg-white/15"
          >
            {t.browse.clearAll}
          </Link>
        </div>
      ) : view === "infinite" ? (
        <div className="mt-8">
          <InfiniteBrowseGrid
            initialItems={items}
            initialPage={filters.page}
            initialHasNext={hasNext}
            query={apiQuery}
            locale={locale}
            dict={t}
            mode="infinite"
          />
        </div>
      ) : (
        <>
          <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3 sm:gap-7 lg:grid-cols-4 xl:grid-cols-5">
            {items.map((a) => (
              <AnimeCard key={a.id} anime={a} locale={locale} dict={t} />
            ))}
          </div>
          <Pagination
            page={filters.page}
            lastPage={lastPage}
            hasNext={hasNext}
            baseHref={pageBase}
            locale={locale}
            prevLabel={t.browse.prevPage}
            nextLabel={t.browse.nextPage}
          />
        </>
      )}
    </main>
  );
}

