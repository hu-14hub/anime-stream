import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/server";
import { HeroBanner } from "@/components/hero-banner";
import { AnimeCard } from "@/components/anime-card";
import { SectionHeading } from "@/components/section-heading";
import { animeList, getLatest, getTrending } from "@/data/anime";
import { getTopAnime } from "@/services/animeService";

export const dynamic = "force-dynamic";

export default async function Home() {
  const locale = await getLocale();
  const t = getDictionary(locale);
  let trending = getTrending();
  let latest = getLatest(6);
  let popular = [...animeList].sort((a, b) => b.rating - a.rating).slice(0, 6);
  try {
    const { items } = await getTopAnime(1, 25);
    if (items.length) {
      trending = [...items].sort((a, b) => b.rating - a.rating).slice(0, 5);
      latest = items.slice(5, 11);
      popular = [...items].sort((a, b) => b.rating - a.rating).slice(11, 17);
    }
  } catch { /* offline: keep mock data */ }

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-12 px-4 py-6 sm:py-8">
      <HeroBanner items={trending.length ? trending : latest} locale={locale} dict={t} />

      <section aria-labelledby="trending-heading" className="space-y-5">
        <div id="trending-heading">
          <SectionHeading
            title={t.sections.trending}
            actionLabel={t.sections.viewAll}
            actionHref="/catalog"
            locale={locale}
          />
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {trending.map((a) => (
            <AnimeCard key={a.id} anime={a} locale={locale} dict={t} />
          ))}
        </div>
      </section>

      <section aria-labelledby="latest-heading" className="space-y-5">
        <div id="latest-heading">
          <SectionHeading
            title={t.sections.latest}
            actionLabel={t.sections.viewAll}
            actionHref="/catalog"
            locale={locale}
          />
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {latest.map((a) => (
            <AnimeCard key={a.id} anime={a} locale={locale} dict={t} />
          ))}
        </div>
      </section>

      <section aria-labelledby="popular-heading" className="space-y-5 pb-4">
        <div id="popular-heading">
          <SectionHeading
            title={t.sections.popular}
            actionLabel={t.sections.viewAll}
            actionHref="/catalog"
            locale={locale}
          />
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {popular.map((a, i) => (
            <div key={a.id} className="relative">
              <span
                dir="ltr"
                className="absolute -top-3 start-2 z-10 rounded-full bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-2.5 py-0.5 text-xs font-black text-white shadow-lg"
              >
                #{i + 1}
              </span>
              <AnimeCard anime={a} locale={locale} dict={t} className="pt-1" />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

