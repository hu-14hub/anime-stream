import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/server";
import { animeList, getAnimeBySlug } from "@/data/anime";
import { anilistIdFromSlug, getAnimeDetail } from "@/services/anilistService";
import { getAnimeById as getJikanById, getAnimeEpisodes, idFromSlug as jikanIdFromSlug } from "@/services/animeService";
import { CommentsSection } from "@/components/comments-section";
import { EpisodeSelector } from "@/components/episode-selector";

export function generateStaticParams() {
  return animeList.map((a) => ({ slug: a.slug }));
}

export default async function WatchPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ ep?: string }> }) {
  const { slug } = await params;
  const { ep } = await searchParams;
  const locale = await getLocale();
  const t = getDictionary(locale);
  let anime = getAnimeBySlug(slug);
  const alId = anilistIdFromSlug(slug);
  const malId = jikanIdFromSlug(slug);
  if (!anime && alId) {
    try {
      anime = await getAnimeDetail(alId);
    } catch { /* fallback below */ }
  }
  if (!anime && malId) {
    try {
      anime = await getJikanById(malId);
    } catch { /* fallback below */ }
  }
  if (!anime) notFound();
  // Enrich episode titles from Jikan when available (first page covers eps 1-100)
  if (malId && anime.episodes.length) {
    try {
      const { items } = await getAnimeEpisodes(malId, 1);
      const byNum = new Map(items.map((e) => [parseInt(e.episode, 10), e.title]));
      anime = {
        ...anime,
        episodes: anime.episodes.map((e) => {
          const rt = byNum.get(e.number);
          return rt ? { ...e, title: { en: rt, ar: e.title.ar } } : e;
        }),
      };
    } catch { /* keep synthesized titles */ }
  }
  const num = Math.min(Math.max(parseInt(ep ?? "1", 10) || 1, 1), anime.episodes.length);
  const current = anime.episodes[num - 1];
  const BackIcon = locale === "ar" ? ArrowRight : ArrowLeft;
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-10 px-4 py-8 sm:px-6 sm:py-10">
      <div>
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-neutral-400">
          <Link href="/" className="rounded-full transition-colors duration-300 hover:text-white">{t.nav.home}</Link>
          <span aria-hidden className="text-neutral-600">/</span>
          <Link href={`/anime/${anime.slug}`} className="inline-flex items-center gap-1.5 rounded-full transition-colors duration-300 hover:text-white"><BackIcon className="h-3.5 w-3.5" />{t.watch.backToDetails}</Link>
          <span aria-hidden className="text-neutral-600">/</span>
          <span aria-current="page" className="text-neutral-200">{t.watch.episode} <span dir="ltr">{num}</span></span>
        </nav>
        <h1 className="mt-3 text-2xl font-black leading-tight tracking-tight text-white sm:text-4xl">{anime.title[locale]} <span className="text-cyan-300">· {t.watch.episode} <span dir="ltr">{num}</span></span></h1>
        <p className="mt-2 text-sm leading-6 text-neutral-400 sm:text-base sm:leading-7">{current.title[locale]} · <span dir="ltr">{current.duration}</span></p>
      </div>
      <section aria-label={t.watch.nowPlaying} className="overflow-hidden rounded-2xl bg-black">
        <div className="relative aspect-video w-full">
          <Image src={anime.banner} alt="" fill priority sizes="100vw" className="object-cover opacity-60" />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
            <p className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white backdrop-blur">{t.watch.nowPlaying}</p>
            <p className="max-w-md text-sm leading-6 text-neutral-300">{t.watch.commentsPlaceholder}</p>
            <video controls preload="metadata" poster={anime.banner} className="hidden" />
          </div>
        </div>
      </section>
      <div className="flex flex-wrap gap-3">
        {num > 1 && (<Link href={`/anime/${anime.slug}/watch?ep=${num - 1}`} className="rounded-full bg-white/10 px-5 py-2.5 text-sm font-bold text-white transition-colors duration-300 hover:bg-white/20">{t.watch.prevEpisode}</Link>)}
        {num < anime.episodes.length && (<Link href={`/anime/${anime.slug}/watch?ep=${num + 1}`} className="rounded-full bg-cyan-400 px-5 py-2.5 text-sm font-bold text-neutral-950 transition-all duration-300 hover:scale-105 hover:bg-cyan-300">{t.watch.nextEpisode}</Link>)}
      </div>
      <EpisodeSelector anime={anime} locale={locale} dict={t} active={num} baseHref={`/anime/${anime.slug}/watch`} />
      <CommentsSection target={`watch:${anime.slug}:${num}`} dict={t} title={t.player.commentsHere} />
    </main>
  );
}
