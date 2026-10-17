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
        "group block transition-all duration-300 ease-out hover:-translate-y-1",
        className
      )}
    >
      {/* Cinematic poster frame: refined radius + an ultra-thin, semi-transparent border
          that catches the light on hover, wrapped in a soft cyan ring for radiance. */}
      <div className="relative w-full aspect-[3/4] overflow-hidden rounded-2xl border border-white/10 ring-1 ring-white/5 transition-all duration-300 group-hover:border-white/25 group-hover:ring-2 group-hover:ring-cyan-500/20 group-hover:shadow-[0_18px_46px_-16px_rgba(6,182,212,0.45)]">
        {/* Shimmer placeholder — hidden once image has loaded */}
        {!imgLoaded && (
          <div className="absolute inset-0 animate-pulse rounded-2xl bg-zinc-800/20" aria-hidden />
        )}
        <Image
          src={anime.cover}
          alt={anime.title[locale]}
          fill
          sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 20vw"
          loading="lazy"
          className={cn(
            "anim-poster-img object-cover transform-gpu transition-all duration-500 ease-in-out",
            imgLoaded ? "scale-100 opacity-100 group-hover:scale-105" : "scale-95 opacity-0",
          )}
          onLoad={() => setImgLoaded(true)}
        />
        {/* Deep internal gradient vignette — pushes the poster's edges into shadow for a
            cinematic, immersive sense of depth. Always-on, purely decorative. */}
        <div
          className="pointer-events-none absolute inset-0 z-10 rounded-2xl [background:radial-gradient(120%_82%_at_50%_18%,transparent_44%,rgba(0,0,0,0.42)_74%,rgba(0,0,0,0.82))]"
          aria-hidden
        />
        {/* Hover overlay: dark glassmorphism gradient fades up with a centered, glowing
            cyan play button and a crisp episode badge captioned beneath the action. */}
        <span className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="flex h-12 w-12 scale-95 items-center justify-center rounded-full bg-cyan-500/90 text-black shadow-lg shadow-cyan-500/30 ring-4 ring-cyan-500/20 backdrop-blur-md transition-transform duration-300 ease-out group-hover:scale-110">
            <Play className="h-5 w-5 fill-black rtl-flip" aria-hidden />
          </span>
          <span dir="ltr" className="absolute bottom-4 start-4 flex items-center gap-1 rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-[11px] font-bold tracking-wide text-white backdrop-blur-md">
            {epLabel}
          </span>
        </span>
        {/* Rating pill — crisp glass pill anchored to the top corner of the image. */}
        <span className="absolute start-2 top-2 z-10 flex items-center gap-1 rounded-full border border-white/10 bg-black/50 px-2 py-1 text-[11px] font-bold text-amber-400 backdrop-blur-md transition-colors duration-300 group-hover:bg-black/65">
          <Star className="h-3 w-3 fill-amber-400" aria-hidden />
          <span dir="ltr">{anime.rating.toFixed(1)}</span>
        </span>
        {/* Format badge — top corner, balanced against the rating pill. */}
        {anime.format && (
          <span dir="ltr" className="absolute end-2 top-2 z-10 rounded-full border border-white/10 bg-black/50 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-brand-300 backdrop-blur-md transition-colors duration-300 group-hover:bg-black/65">
            {anime.format}
          </span>
        )}
      </div>
      {/* Typography & info below the poster: bold, modern, tight-tracked title with
          muted, evenly-spaced secondary metadata. */}
      <div className="mt-3 space-y-1 px-0.5">
        <h3
          className={cn(
            "truncate text-sm font-semibold tracking-tight text-neutral-100 transition-colors duration-300 group-hover:text-white",
            locale === "en" && "font-amagro",
          )}
        >
          {anime.title[locale]}
        </h3>
        <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-neutral-400">
          <span dir="ltr">{anime.year}</span>
          <span aria-hidden>·</span>
          {anime.format && (
            <>
              <span dir="ltr" className="font-medium text-neutral-300">
                {anime.format}
              </span>
              <span aria-hidden>·</span>
            </>
          )}
          <span dir="ltr">{epLabel}</span>
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

