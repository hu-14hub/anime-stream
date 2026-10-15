import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Calendar, Play, Star } from "lucide-react";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/server";
import { animeList, genres, getAnimeBySlug } from "@/data/anime";
import { anilistIdFromSlug, getAnimeDetail } from "@/services/anilistService";
import { getAnimeById as getJikanById, idFromSlug as jikanIdFromSlug } from "@/services/animeService";
import { AnimeCard } from "@/components/anime-card";
import { EpisodeSelector } from "@/components/episode-selector";
import { SectionHeading } from "@/components/section-heading";
import { TrailerButton } from "@/components/trailer-button";

export function generateStaticParams() {
  return animeList.map((a) => ({ slug: a.slug }));
}

export default async function AnimeDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const locale = await getLocale();
  const t = getDictionary(locale);
  let anime = getAnimeBySlug(slug);
  const alId = anilistIdFromSlug(slug);
  const jikanId = jikanIdFromSlug(slug);
  if (!anime && alId) {
    try {
      anime = await getAnimeDetail(alId);
    } catch { /* try Jikan fallback below */ }
  }
  if (!anime && jikanId) {
    try {
      anime = await getJikanById(jikanId);
    } catch { /* fallback below */ }
  }
  if (!anime) notFound();
  const BackIcon = locale === "ar" ? ArrowRight : ArrowLeft;
  const related = animeList.filter((a) => a.id !== anime.id && a.genres.some((g) => anime.genres.includes(g))).slice(0, 4);
  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6">
      <Link href="/catalog" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white">
        <BackIcon className="h-3.5 w-3.5" />{t.detail.backToCatalog}
      </Link>
      <h1 className="mt-2 text-3xl font-black text-white">{anime.title[locale]}</h1>
      <p className="mt-1 flex items-center gap-3 text-sm text-slate-300">
        <span className="flex items-center gap-1 font-bold text-amber-300"><Star className="h-4 w-4 fill-amber-300" /><span dir="ltr">{anime.rating.toFixed(1)}</span></span>
        <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /><span dir="ltr">{anime.year}</span></span>
        <span>{anime.status === "ongoing" ? t.detail.ongoing : t.detail.completed}</span>
      </p>
      <div className="mt-3 flex flex-wrap gap-1.5">{anime.genres.map((g) => (<Link key={g} href={`/catalog?genre=${g}`} className="rounded-full border border-white/15 px-2.5 py-1 text-xs text-slate-200">{genres.find((x) => x.key === g)?.label[locale] ?? g}</Link>))}</div>
      <div className="relative mt-4 h-64 overflow-hidden rounded-3xl border border-white/10 sm:h-96">
        <Image src={anime.banner} alt="" fill priority sizes="100vw" className="object-cover" />
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <Link href={`/anime/${anime.slug}/watch?ep=1`} className="flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-sm font-bold text-white"><Play className="h-4 w-4 fill-white rtl-flip" />{t.hero.watchNow}</Link>
        {anime.trailerUrl && (<TrailerButton label={t.detail.watchTrailer} trailerUrl={anime.trailerUrl} />)}
      </div>
      <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">{anime.synopsis[locale]}</p>
      <dl className="mt-6 grid max-w-3xl grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3"><dt className="text-xs text-slate-400">{t.detail.status}</dt><dd className="mt-1 font-bold">{anime.status === "ongoing" ? t.detail.ongoing : t.detail.completed}</dd></div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3"><dt className="text-xs text-slate-400">{t.detail.totalEpisodes}</dt><dd dir="ltr" className="mt-1 font-bold">{anime.episodeCount}</dd></div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3"><dt className="text-xs text-slate-400">{t.detail.studio}</dt><dd className="mt-1 font-bold">{anime.studio[locale]}</dd></div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3"><dt className="text-xs text-slate-400">{t.detail.rating}</dt><dd dir="ltr" className="mt-1 font-bold">{anime.rating.toFixed(1)}</dd></div>
      </dl>
      <div className="mt-8 max-w-5xl"><EpisodeSelector anime={anime} locale={locale} dict={t} baseHref={`/anime/${anime.slug}/watch`} /></div>
      {related.length > 0 && (
        <section className="mt-10 max-w-7xl space-y-5 pb-6">
          <SectionHeading title={t.sections.popular} actionLabel={t.sections.viewAll} actionHref="/catalog" locale={locale} />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">{related.map((a) => (<AnimeCard key={a.id} anime={a} locale={locale} dict={t} />))}</div>
        </section>
      )}
    </main>
  );
}
