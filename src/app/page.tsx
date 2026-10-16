import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/server";
import { HeroBanner } from "@/components/hero-banner";
import { AnimeCard } from "@/components/anime-card";
import { SectionHeading } from "@/components/section-heading";
import { Reveal } from "@/components/reveal";
import { MediaRow } from "@/components/media-row";
import { GenreChips } from "@/components/genre-chips";
import { ContinueWatchingRow } from "@/components/continue-watching-row";
import { animeList, genres, getLatest, getTrending } from "@/data/anime";
import {
  getAiringWeek,
  getSeasonAnime,
  getTopRated,
  getTrendingAnime,
} from "@/services/anilistService";
import type { Anime } from "@/types";

export const dynamic = "force-dynamic";

function currentSeason(): { season: string; year: number } {
  const m = new Date().getMonth(); // 0-11
  const season = m < 2 || m === 11 ? "WINTER" : m < 5 ? "SPRING" : m < 8 ? "SUMMER" : "FALL";
  return { season, year: new Date().getFullYear() };
}

export default async function Home() {
  const locale = await getLocale();
  const t = getDictionary(locale);

  // Offline defaults — replaced by live AniList data when the API responds.
  let trending: Anime[] = getTrending();
  let latest: Anime[] = getLatest(6);
  let season: Anime[] = [...animeList].sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0)).slice(0, 6);
  let topRated: Anime[] = [...animeList].sort((a, b) => b.rating - a.rating).slice(0, 6);
  let offline = false;

  const { season: s, year: y } = currentSeason();
  const now = Math.floor(Date.now() / 1000);
  try {
    const [tr, ss, tp, air] = await Promise.all([
      getTrendingAnime(1, 12),
      getSeasonAnime(s, y, "POPULARITY_DESC", 12).catch(() => null),
      getTopRated(1, 12),
      getAiringWeek(now - 2 * 24 * 3600, now + 7 * 24 * 3600, 40).catch(() => []),
    ]);
    if (tr.items.length) {
      trending = tr.items.slice(0, 5);
      // Latest episodes: titles airing this week, newest first, de-duplicated.
      const seen = new Set<string>();
      const latestLive = [...air]
        .filter((a) => a.anime)
        .sort((a, b) => b.airingAt - a.airingAt)
        .map((a) => a.anime!)
        .filter((a) => (seen.has(a.id) ? false : (seen.add(a.id), true)));
      latest = (latestLive.length ? latestLive : tr.items).slice(0, 12);
    } else {
      offline = true;
    }
    if (ss?.items.length) season = ss.items.slice(0, 12);
    if (tp.items.length) topRated = tp.items.slice(0, 12);
  } catch {
    offline = true;
  }

  // Catalogue passed to the client "Continue Watching" row for progress joins.
  const catalog = [
    ...new Map([...trending, ...latest, ...season, ...topRated].map((a) => [a.slug, a])).values(),
  ]
    .slice(0, 40)
    .map((a) => ({ slug: a.slug, title: a.title[locale], cover: a.cover }));

  const heroItems = trending.length ? trending : latest;

  return (
    <main className="flex w-full flex-1 flex-col">
      <HeroBanner items={heroItems} locale={locale} dict={t} />

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-14 px-4 py-10 sm:px-6 sm:py-14">
        {/* Genre chips — quick-access horizontal filters */}
        <Reveal as="section" aria-labelledby="genres-heading" className="space-y-4">
          <p
            id="genres-heading"
            className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-500"
          >
            {t.sections.browseGenres}
          </p>
          <GenreChips genres={genres} locale={locale} ariaLabel={t.sections.browseGenres} />
        </Reveal>

        {/* Continue Watching (active sessions only) */}
        <Reveal as="section">
          <ContinueWatchingRow catalog={catalog} locale={locale} dict={t} />
        </Reveal>

        <Reveal as="section" aria-labelledby="trending-heading" className="space-y-5">
          <div id="trending-heading">
            <SectionHeading
              title={t.sections.trending}
              actionLabel={t.sections.viewAll}
              actionHref="/catalog?sort=trending"
              locale={locale}
            />
          </div>
          <MediaRow locale={locale} ariaLabel={t.sections.trending}>
            {trending.map((a) => (
              <div key={a.id} className="w-36 shrink-0 snap-start sm:w-44 lg:w-48">
                <AnimeCard anime={a} locale={locale} dict={t} />
              </div>
            ))}
          </MediaRow>
        </Reveal>

        <Reveal as="section" aria-labelledby="latest-heading" className="space-y-5">
          <div id="latest-heading">
            <SectionHeading
              title={t.sections.latest}
              actionLabel={t.sections.viewAll}
              actionHref="/catalog?sort=newest"
              locale={locale}
            />
          </div>
          <MediaRow locale={locale} ariaLabel={t.sections.latest}>
            {latest.map((a) => (
              <div key={a.id} className="w-60 shrink-0 snap-start sm:w-72">
                <AnimeCard anime={a} locale={locale} dict={t} />
              </div>
            ))}
          </MediaRow>
        </Reveal>

        <Reveal as="section" aria-labelledby="season-heading" className="space-y-5">
          <div id="season-heading">
            <SectionHeading
              title={t.sections.thisSeason}
              actionLabel={t.sections.viewAll}
              actionHref={`/catalog?season=${s.toLowerCase()}&seasonYear=${y}`}
              locale={locale}
            />
          </div>
          <MediaRow locale={locale} ariaLabel={t.sections.thisSeason}>
            {season.map((a) => (
              <div key={a.id} className="w-36 shrink-0 snap-start sm:w-44 lg:w-48">
                <AnimeCard anime={a} locale={locale} dict={t} />
              </div>
            ))}
          </MediaRow>
        </Reveal>

        <Reveal as="section" aria-labelledby="toprated-heading" className="space-y-5 pb-4">
          <div id="toprated-heading">
            <SectionHeading
              title={t.sections.topRated}
              actionLabel={t.sections.viewAll}
              actionHref="/catalog?sort=score"
              locale={locale}
            />
          </div>
          <MediaRow locale={locale} ariaLabel={t.sections.topRated}>
            {topRated.map((a, i) => (
              <div key={a.id} className="relative w-36 shrink-0 snap-start sm:w-44 lg:w-48">
                <span
                  dir="ltr"
                  className="absolute -top-2 start-2 z-10 rounded-full bg-cyan-400 px-2.5 py-0.5 text-xs font-black text-neutral-950 shadow-lg"
                >
                  #{i + 1}
                </span>
                <AnimeCard anime={a} locale={locale} dict={t} className="pt-1" />
              </div>
            ))}
          </MediaRow>
        </Reveal>

        {offline && (
          <p className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-xs text-amber-200">
            {t.browse.offlineNote}
          </p>
        )}
      </div>
    </main>
  );
}

