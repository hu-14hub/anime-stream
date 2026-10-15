import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/server";
import { HeroBanner } from "@/components/hero-banner";
import { AnimeCard } from "@/components/anime-card";
import { SectionHeading } from "@/components/section-heading";
import { Reveal } from "@/components/reveal";
import { animeList, getLatest, getTrending } from "@/data/anime";
import { getPopularAnime, getTrendingAnime } from "@/services/anilistService";

export const dynamic = "force-dynamic";

export default async function Home() {
  const locale = await getLocale();
  const t = getDictionary(locale);
  let trending = getTrending();
  let latest = getLatest(6);
  let popular = [...animeList].sort((a, b) => b.rating - a.rating).slice(0, 6);
  try {
    const [trendingRes, popularRes] = await Promise.all([
      getTrendingAnime(1, 10),
      getPopularAnime(1, 12),
    ]);
    if (trendingRes.items.length) {
      trending = trendingRes.items.slice(0, 5);
      latest = trendingRes.items.slice(5, 11);
    }
    if (popularRes.items.length) popular = popularRes.items.slice(0, 6);
  } catch { /* offline: keep mock data */ }

  return (
    <main className="flex w-full flex-1 flex-col">
      <HeroBanner items={trending.length ? trending : latest} locale={locale} dict={t} />

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-16 px-4 py-12 sm:px-6 sm:py-16">
        <Reveal as="section" aria-labelledby="trending-heading" className="space-y-6">
          <div id="trending-heading">
            <SectionHeading
              title={t.sections.trending}
              actionLabel={t.sections.viewAll}
              actionHref="/catalog"
              locale={locale}
            />
          </div>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 sm:gap-8 lg:grid-cols-4">
            {trending.map((a) => (
              <AnimeCard key={a.id} anime={a} locale={locale} dict={t} />
            ))}
          </div>
        </Reveal>

        <Reveal as="section" aria-labelledby="latest-heading" className="space-y-6">
          <div id="latest-heading">
            <SectionHeading
              title={t.sections.latest}
              actionLabel={t.sections.viewAll}
              actionHref="/catalog"
              locale={locale}
            />
          </div>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 sm:gap-8 lg:grid-cols-6">
            {latest.map((a) => (
              <AnimeCard key={a.id} anime={a} locale={locale} dict={t} />
            ))}
          </div>
        </Reveal>

        <Reveal as="section" aria-labelledby="popular-heading" className="space-y-6 pb-4">
          <div id="popular-heading">
            <SectionHeading
              title={t.sections.popular}
              actionLabel={t.sections.viewAll}
              actionHref="/catalog"
              locale={locale}
            />
          </div>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 sm:gap-8 lg:grid-cols-6">
            {popular.map((a, i) => (
              <div key={a.id} className="relative">
                <span
                  dir="ltr"
                  className="absolute -top-3 start-2 z-10 rounded-full bg-cyan-400 px-2.5 py-0.5 text-xs font-black text-neutral-950 shadow-lg"
                >
                  #{i + 1}
                </span>
                <AnimeCard anime={a} locale={locale} dict={t} className="pt-1" />
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </main>
  );
}

