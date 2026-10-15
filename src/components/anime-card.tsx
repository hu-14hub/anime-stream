import Image from "next/image";
import Link from "next/link";
import { Play, Star } from "lucide-react";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { Locale } from "@/i18n/config";
import type { Anime } from "@/types";
import { genres } from "@/data/anime";
import { cn } from "@/lib/utils";

function genreLabel(key: string, locale: Locale): string {
  return genres.find((g) => g.key === key)?.label[locale] ?? key;
}

export function AnimeCard({
  anime,
  locale,
  dict,
  className,
}: {
  anime: Anime;
  locale: Locale;
  dict: Dictionary;
  className?: string;
}) {
  return (
    <Link
      href={`/anime/${anime.slug}`}
      className={cn(
        "group animate-fade-up overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur transition-all duration-300 hover:-translate-y-1.5 hover:border-purple-500/40 hover:shadow-2xl hover:shadow-purple-900/30",
        className
      )}
    >
      <div className="relative aspect-[3/4] overflow-hidden">
        <Image
          src={anime.cover}
          alt={anime.title[locale]}
          fill
          sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 20vw"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" aria-hidden />
        <span className="absolute start-2 top-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-[11px] font-bold text-amber-300 backdrop-blur">
          <Star className="h-3 w-3 fill-amber-300" aria-hidden />
          <span dir="ltr">{anime.rating.toFixed(1)}</span>
        </span>
        <span className="absolute end-2 top-2 rounded-full bg-purple-600/90 px-2 py-1 text-[11px] font-bold text-white backdrop-blur">
          {anime.episodeCount} {dict.card.episodes}
        </span>
        <span className="absolute inset-x-0 bottom-0 flex translate-y-2 items-center justify-center gap-2 bg-gradient-to-t from-purple-700/90 to-transparent px-3 pb-3 pt-8 text-sm font-bold text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <Play className="h-4 w-4 fill-white rtl-flip" aria-hidden />
          {dict.hero.watchNow}
        </span>
      </div>
      <div className="space-y-1.5 p-3">
        <h3 className="truncate text-sm font-bold text-slate-100 transition group-hover:text-purple-300">
          {anime.title[locale]}
        </h3>
        <p className="flex flex-wrap gap-1">
          {anime.genres.slice(0, 2).map((g) => (
            <span key={g} className="rounded-full bg-white/5 px-2 py-0.5 text-[11px] text-slate-400">
              {genreLabel(g, locale)}
            </span>
          ))}
          <span dir="ltr" className="ms-auto text-[11px] text-slate-500">
            {anime.year}
          </span>
        </p>
      </div>
    </Link>
  );
}
