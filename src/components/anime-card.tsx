"use client";

import Image from "next/image";
import Link from "next/link";
import { memo, useState } from "react";
import { Play, Star } from "lucide-react";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { Locale } from "@/i18n/config";
import type { Anime } from "@/types";
import { cn } from "@/lib/utils";
import { getAiredEpisodeCount } from "@/lib/anime-availability";

export function ImageCard({
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
  const [imgLoaded, setImgLoaded] = useState(false);

  // Resolve a sensible episode count for the badge. `getAiredEpisodeCount`
  // falls back through the episode array, then `nextAiringEpisode - 1`, so
  // long-running ongoing titles (Conan, Doraemon, Shin Chan, One Piece) —
  // where the API returns `episodes: null` — show their actual aired count.
  // When the exact count is still unknown (brand-new show, no airing data),
  // an ongoing title renders a localized "Ongoing" label instead of a fake
  // number — we never emit a misleading default like "12 EP".
  const aired = getAiredEpisodeCount(anime);
  const epLabel =
    aired > 0
      ? `${aired} ${dict.card.episodes}`
      : anime.status === "ongoing"
        ? dict.card.ongoing
        : "0";


  return (
    <Link
      href={`/anime/${anime.slug}`}
      className={cn(
        "group block transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_10px_30px_-10px_rgba(6,182,212,0.18)]",
        className
      )}
    >
      <div className="relative w-full aspect-[3/4] overflow-hidden rounded-xl bg-neutral-900">
        {/* Shimmer placeholder — hidden once image has loaded */}
        {!imgLoaded && (
          <div
            className="absolute inset-0 animate-pulse rounded-xl bg-zinc-800/80"
            aria-hidden
          />
        )}
        <Image
          src={anime.cover}
          alt={anime.title[locale]}
          fill
          sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 20vw"
          loading="lazy"
          className={cn(
            "anim-poster-img object-cover transform-gpu transition-all duration-500 ease-in-out",
            imgLoaded
              ? "scale-100 opacity-100 group-hover:scale-105"
              : "scale-95 opacity-0",
          )}
          onLoad={() => setImgLoaded(true)}
        />
        {/* Score badge */}
        <span className="absolute start-2 top-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-[11px] font-bold text-amber-400 backdrop-blur">
          <Star className="h-3 w-3 fill-amber-400" aria-hidden />
          <span dir="ltr">{anime.rating.toFixed(1)}</span>
        </span>
        {/* Format badge */}
        {anime.format && (
          <span dir="ltr" className="absolute end-2 top-2 rounded-full bg-black/60 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-brand-300 backdrop-blur">
            {anime.format}
          </span>
        )}
        {/* Cinematic hover overlay: play + stats */}
        <span className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-neutral-950/60 opacity-0 backdrop-blur-[2px] transition-opacity duration-300 group-hover:opacity-100">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand text-neutral-950 shadow-xl shadow-brand/30 transition-transform duration-300 group-hover:scale-110">
            <Play className="h-5 w-5 fill-neutral-950 rtl-flip" aria-hidden />
          </span>
          <span dir="ltr" className="text-xs font-bold text-white">
            {epLabel}
          </span>
          {anime.imdbRating != null && (
            <span
              dir="ltr"
              className="flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-bold text-yellow-400 backdrop-blur"
              aria-label={dict.detail.imdbRating}
            >
              <span aria-hidden className="rounded bg-yellow-400 px-1 text-[9px] font-black text-neutral-950">
                IMDb
              </span>
              {typeof anime.imdbRating === "number" ? anime.imdbRating.toFixed(1) : anime.imdbRating}
            </span>
          )}
        </span>
      </div>
      <div className="mt-3 space-y-1 px-0.5">
        <h3 className={cn("truncate text-sm font-bold text-neutral-100 transition-colors duration-300 group-hover:text-brand-300", locale === "en" && "font-amagro")}>
          {anime.title[locale]}
        </h3>
        <p className="flex items-center gap-2 text-xs text-neutral-500">
          <span dir="ltr">{anime.year}</span>
          <span aria-hidden>·</span>
          <span dir="ltr">
            {epLabel}
          </span>
        </p>
      </div>
    </Link>

    
  );
}

/**
 * Memoized card so infinite-scroll batches don't re-render every poster when a
 * neighbour is appended — `anime`/`dict`/`locale` are stable references.
 */
export const AnimeCard = memo(ImageCard);

