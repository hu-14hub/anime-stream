import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
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
import { browseAnime } from "@/services/anilistService";

export function generateStaticParams() {
  return animeList.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getLocale();
  let anime = getAnimeBySlug(slug);
  const alId = anilistIdFromSlug(slug);
  if (!anime && alId) {
    try {
      anime = await getAnimeDetail(alId);
    } catch {
      /* fallback to generic metadata */
    }
  }
  if (!anime) return {};
  return {
    title: anime.title[locale],
    description: anime.synopsis[locale].slice(0, 160),
  };
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
  // Related: prefer live AniList results by first genre; fall back to mock list.
  let related = animeList.filter((a) => a.id !== anime.id && a.genres.some((g) => anime.genres.includes(g))).slice(0, 4);
  if (anime.genres.length > 0) {
    try {
      const r = await browseAnime({ genre: anime.genres[0], page: 1, perPage: 8 });
      const live = r.items.filter((a) => a.id !== anime.id).slice(0, 4);
      if (live.length) related = live;
    } catch {
      /* keep mock related */
    }
  }
  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-neutral-400">
        <Link href="/" className="inline-flex items-center gap-1.5 rounded-full transition-colors duration-300 hover:text-white">
          <BackIcon className="h-3.5 w-3.5" aria-hidden />
          {t.nav.home}
        </Link>
        <span aria-hidden className="text-neutral-600">/</span>
        <Link href="/catalog" className="rounded-full transition-colors duration-300 hover:text-white">
          {t.nav.catalog}
        </Link>
        <span aria-hidden className="text-neutral-600">/</span>
        <span aria-current="page" className="max-w-[40vw] truncate text-neutral-200">
          {anime.title[locale]}
        </span>
      </nav>
      <h1 className="mt-3 text-3xl font-black leading-tight tracking-tight text-white sm:text-5xl">{anime.title[locale]}</h1>
      <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-neutral-300">
        <span className="flex items-center gap-1.5 font-bold text-amber-400"><Star className="h-4 w-4 fill-amber-400" /><span dir="ltr">{anime.rating.toFixed(1)}</span></span>
        <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /><span dir="ltr">{anime.year}</span></span>
        <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-semibold">{anime.status === "ongoing" ? t.detail.ongoing : t.detail.completed}</span>
      </p>
      <div className="mt-4 flex flex-wrap gap-2">{anime.genres.map((g) => (<Link key={g} href={`/catalog?genre=${g}`} className="rounded-full bg-white/5 px-3 py-1.5 text-xs font-medium text-neutral-300 transition-colors duration-300 hover:bg-white/10 hover:text-white">{genres.find((x) => x.key === g)?.label[locale] ?? g}</Link>))}</div>
      <div className="relative mt-6 h-64 overflow-hidden rounded-2xl sm:h-96">
        <Image src={anime.banner} alt="" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/60 via-transparent to-transparent" aria-hidden />
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href={`/anime/${anime.slug}/watch?ep=1`} className="flex items-center gap-2 rounded-full bg-cyan-400 px-7 py-3.5 text-sm font-bold text-neutral-950 shadow-xl shadow-cyan-500/25 transition-all duration-300 hover:scale-105 hover:bg-cyan-300"><Play className="h-4 w-4 fill-neutral-950 rtl-flip" />{t.hero.watchNow}</Link>
        {anime.trailerUrl && (<TrailerButton label={t.detail.watchTrailer} trailerUrl={anime.trailerUrl} />)}
      </div>
      <p className="mt-6 max-w-3xl text-base leading-8 text-neutral-300">{anime.synopsis[locale]}</p>
      <dl className="mt-8 grid max-w-3xl grid-cols-2 gap-4 text-sm sm:grid-cols-4">
        <div className="rounded-xl bg-white/[0.04] p-4"><dt className="text-xs text-neutral-500">{t.detail.status}</dt><dd className="mt-1.5 font-bold text-white">{anime.status === "ongoing" ? t.detail.ongoing : t.detail.completed}</dd></div>
        <div className="rounded-xl bg-white/[0.04] p-4"><dt className="text-xs text-neutral-500">{t.detail.totalEpisodes}</dt><dd dir="ltr" className="mt-1.5 font-bold text-white">{anime.episodeCount}</dd></div>
        <div className="rounded-xl bg-white/[0.04] p-4"><dt className="text-xs text-neutral-500">{t.detail.studio}</dt><dd className="mt-1.5 font-bold text-white">{anime.studio[locale]}</dd></div>
        <div className="rounded-xl bg-white/[0.04] p-4"><dt className="text-xs text-neutral-500">{t.detail.rating}</dt><dd dir="ltr" className="mt-1.5 font-bold text-white">{anime.rating.toFixed(1)}</dd></div>
      </dl>
      <div className="mt-10 max-w-5xl"><EpisodeSelector anime={anime} locale={locale} dict={t} baseHref={`/anime/${anime.slug}/watch`} /></div>
      {related.length > 0 && (
        <section className="mt-14 space-y-6 pb-6">
          <SectionHeading title={t.sections.popular} actionLabel={t.sections.viewAll} actionHref="/catalog" locale={locale} />
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 sm:gap-8 lg:grid-cols-4">{related.map((a) => (<AnimeCard key={a.id} anime={a} locale={locale} dict={t} />))}</div>
        </section>
      )}
    </main>
  );
}
