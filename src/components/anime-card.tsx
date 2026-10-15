import Image from "next/image";
import Link from "next/link";
import { Play, Star } from "lucide-react";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { Locale } from "@/i18n/config";
import type { Anime } from "@/types";
import { cn } from "@/lib/utils";

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
        "group block transition-transform duration-300 hover:scale-105",
        className
      )}
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-neutral-900">
        <Image
          src={anime.cover}
          alt={anime.title[locale]}
          fill
          sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 20vw"
          className="object-cover transition-transform duration-300 group-hover:scale-110"
        />
        {/* Score badge */}
        <span className="absolute start-2 top-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-[11px] font-bold text-amber-400 backdrop-blur">
          <Star className="h-3 w-3 fill-amber-400" aria-hidden />
          <span dir="ltr">{anime.rating.toFixed(1)}</span>
        </span>
        {/* Cinematic hover overlay: play + stats */}
        <span className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-neutral-950/60 opacity-0 backdrop-blur-[2px] transition-opacity duration-300 group-hover:opacity-100">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-400 text-neutral-950 shadow-xl shadow-cyan-500/30 transition-transform duration-300 group-hover:scale-110">
            <Play className="h-5 w-5 fill-neutral-950 rtl-flip" aria-hidden />
          </span>
          <span dir="ltr" className="text-xs font-bold text-white">
            {anime.episodeCount} {dict.card.episodes}
          </span>
        </span>
      </div>
      <div className="mt-3 space-y-1 px-0.5">
        <h3 className="truncate text-sm font-bold text-neutral-100 transition-colors duration-300 group-hover:text-cyan-300">
          {anime.title[locale]}
        </h3>
        <p className="flex items-center gap-2 text-xs text-neutral-500">
          <span dir="ltr">{anime.year}</span>
          <span aria-hidden>·</span>
          <span dir="ltr">
            {anime.episodeCount} {dict.card.episodes}
          </span>
        </p>
      </div>
    </Link>
  );
}
