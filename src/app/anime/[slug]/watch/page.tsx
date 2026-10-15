import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/server";
import { animeList, getAnimeBySlug } from "@/data/anime";
import { CommentsSection } from "@/components/comments-section";
import { EpisodeSelector } from "@/components/episode-selector";

export function generateStaticParams() {
  return animeList.map((a) => ({ slug: a.slug }));
}

export default async function WatchPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ ep?: string }> }) {
  const { slug } = await params;
  const { ep } = await searchParams;
  const anime = getAnimeBySlug(slug);
  if (!anime) notFound();
  const locale = await getLocale();
  const t = getDictionary(locale);
  const num = Math.min(Math.max(parseInt(ep ?? "1", 10) || 1, 1), anime.episodes.length);
  const current = anime.episodes[num - 1];
  const BackIcon = locale === "ar" ? ArrowRight : ArrowLeft;
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 py-6">
      <div>
        <Link href={`/anime/${anime.slug}`} className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white"><BackIcon className="h-3.5 w-3.5" />{t.watch.backToDetails}</Link>
        <h1 className="mt-2 text-2xl font-black text-white">{anime.title[locale]} <span className="text-purple-300">· {t.watch.episode} <span dir="ltr">{num}</span></span></h1>
        <p className="mt-1 text-sm text-slate-400">{current.title[locale]} · <span dir="ltr">{current.duration}</span></p>
      </div>
      <section aria-label={t.watch.nowPlaying} className="overflow-hidden rounded-3xl border border-white/10 bg-black">
        <div className="relative aspect-video w-full">
          <Image src={anime.banner} alt="" fill priority sizes="100vw" className="object-cover opacity-60" />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
            <p className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white backdrop-blur">{t.watch.nowPlaying}</p>
            <p className="max-w-md text-sm text-slate-300">{t.watch.commentsPlaceholder}</p>
            <video controls preload="metadata" poster={anime.banner} className="hidden" />
          </div>
        </div>
      </section>
      <div className="flex flex-wrap gap-3">
        {num > 1 && (<Link href={`/anime/${anime.slug}/watch?ep=${num - 1}`} className="rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-bold hover:bg-white/10">{t.watch.prevEpisode}</Link>)}
        {num < anime.episodes.length && (<Link href={`/anime/${anime.slug}/watch?ep=${num + 1}`} className="rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 text-sm font-bold text-white">{t.watch.nextEpisode}</Link>)}
      </div>
      <EpisodeSelector anime={anime} locale={locale} dict={t} active={num} baseHref={`/anime/${anime.slug}/watch`} />
      <CommentsSection dict={t} />
    </main>
  );
}
