import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Flag, Warehouse } from "lucide-react";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/server";
import { animeList, getAnimeBySlug } from "@/data/anime";
import { anilistIdFromSlug, getAnimeDetail } from "@/services/anilistService";
import { getAnimeById as getJikanById, getAnimeEpisodes, idFromSlug as jikanIdFromSlug } from "@/services/animeService";
import { getEpisodeStream } from "@/services/stream";
import { VideoPlayer } from "@/components/video-player";
import { CommentsSection } from "@/components/comments-section";
import { EpisodeSelector } from "@/components/episode-selector";
import { recordView } from "@/lib/store";

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
  const hasNext = num < anime.episodes.length;
  const hasPrev = num > 1;
  const BackIcon = locale === "ar" ? ArrowRight : ArrowLeft;

  // Resolve sources + subtitles for this episode (demo streams by default).
  const stream = getEpisodeStream(slug, num, anime.title[locale]);

  // Record a view for analytics (server-side counter).
  recordView(slug);
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
      {/* Cinematic player section */}
      <section aria-label={t.watch.nowPlaying} className="overflow-hidden rounded-2xl bg-black shadow-2xl shadow-black/60">
        <VideoPlayer
          sources={stream.sources}
          subtitles={stream.subtitles}
          slug={slug}
          episode={num}
          totalEpisodes={anime.episodes.length}
          poster={anime.banner}
          epTitle={current.title[locale]}
          dict={t}
          hasNext={hasNext}
          hasPrev={hasPrev}
          onNext={() => {
            window.location.href = `/anime/${slug}/watch?ep=${num + 1}`;
          }}
          onPrev={() => {
            window.location.href = `/anime/${slug}/watch?ep=${num - 1}`;
          }}
        />
      </section>

      {/* Prev / next navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {hasPrev && (
          <Link
            href={`/anime/${anime.slug}/watch?ep=${num - 1}`}
            className="flex items-center gap-2 rounded-full bg-white/10 px-5 py-2.5 text-sm font-bold text-white transition-colors duration-300 hover:bg-white/20"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
            {t.watch.prevEpisode}
          </Link>
        )}
        <div className="flex-1" />
        {hasNext && (
          <Link
            href={`/anime/${anime.slug}/watch?ep=${num + 1}`}
            className="flex items-center gap-2 rounded-full bg-cyan-400 px-5 py-2.5 text-sm font-bold text-neutral-950 transition-all duration-300 hover:scale-105 hover:bg-cyan-300"
          >
            {t.watch.nextEpisode}
            <ChevronRight className="h-4 w-4" aria-hidden />
          </Link>
        )}
      </div>

      {/* Source / server switcher + report */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3 sm:p-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-500">{t.player.server}</span>
          {stream.sources.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition-colors duration-300 ${
                s.default
                  ? "bg-cyan-400 text-neutral-950 shadow-lg shadow-cyan-500/20"
                  : "bg-white/5 text-neutral-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              {s.name}
              <span dir="ltr" className="text-[10px]">{s.quality}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold text-neutral-300 transition hover:bg-white/10 hover:text-white"
          >
            <Flag className="h-3 w-3" aria-hidden />
            {t.player.reportVideo}
          </button>
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition"
            aria-label={t.player.switchServer}
          >
            <Warehouse className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>
      <EpisodeSelector anime={anime} locale={locale} dict={t} active={num} baseHref={`/anime/${anime.slug}/watch`} />
      <CommentsSection target={`watch:${anime.slug}:${num}`} dict={t} title={t.player.commentsHere} />
    </main>
  );
}
