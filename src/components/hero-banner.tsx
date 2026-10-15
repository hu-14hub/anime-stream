"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight, Info, Play, Star } from "lucide-react";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { Locale } from "@/i18n/config";
import type { Anime } from "@/types";
import { genres } from "@/data/anime";
import { cn } from "@/lib/utils";
import { TrailerButton } from "./trailer-button";

export function HeroBanner({
  items,
  locale,
  dict,
}: {
  items: Anime[];
  locale: Locale;
  dict: Dictionary;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = items.length;
  const active = items[index];

  const go = useCallback((dir: 1 | -1) => {
    setIndex((i) => (i + dir + count) % count);
  }, [count]);

  useEffect(() => {
    if (paused || count < 2) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % count), 6000);
    return () => clearInterval(id);
  }, [paused, count]);

  if (!active) return null;
  const isRtl = locale === "ar";

  return (
    <section
      aria-roledescription="carousel"
      aria-label={dict.sections.trending}
      className="relative -mx-4 overflow-hidden sm:-mx-6"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative h-[78vh] min-h-[540px] w-full sm:h-[86vh]">
        {items.map((a, i) => (
          <div
            key={a.id}
            aria-hidden={i !== index}
            className={cn(
              "absolute inset-0 transition-opacity duration-1000 ease-out",
              i === index ? "z-10 opacity-100" : "z-0 opacity-0"
            )}
          >
            <Image
              src={a.banner}
              alt=""
              fill
              priority={i === 0}
              sizes="100vw"
              className={cn(
                "object-cover transition-transform duration-[6000ms] ease-out",
                i === index ? "scale-105" : "scale-100"
              )}
            />
          </div>
        ))}
        <div className="absolute inset-0 z-20 bg-gradient-to-t from-neutral-950 via-neutral-950/45 to-transparent" aria-hidden />
        <div
          className="absolute inset-0 z-20"
          style={{ background: "radial-gradient(ellipse 90% 70% at 50% 40%, transparent 40%, rgba(9,9,11,0.55) 100%)" }}
          aria-hidden
        />
        <div
          className={cn("absolute inset-y-0 z-20 w-3/4", isRtl ? "right-0 bg-gradient-to-l" : "left-0 bg-gradient-to-r", "from-neutral-950/85 to-transparent")}
          aria-hidden
        />
      </div>

      <div className="absolute inset-x-0 bottom-0 z-30">
        <div className="mx-auto w-full max-w-7xl px-4 pb-10 sm:px-6 sm:pb-14">
          <div key={active.id} className="animate-fade-up max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full bg-cyan-400/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-widest text-cyan-300 backdrop-blur">
              {dict.hero.trendingBadge}
            </p>
            <h1 className="mt-4 text-4xl font-black leading-[1.1] tracking-tight text-white drop-shadow-2xl sm:text-6xl sm:leading-[1.05]">
              {active.title[locale]}
            </h1>
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
            <span className="flex items-center gap-1.5 font-bold text-amber-400">
              <Star className="h-4 w-4 fill-amber-400" aria-hidden />
              <span dir="ltr">{active.rating.toFixed(1)}</span>
            </span>
            <span className="flex items-center gap-1.5 text-neutral-300">
              <Calendar className="h-4 w-4" aria-hidden />
              <span dir="ltr">{active.year}</span>
            </span>
            <span className="font-medium text-neutral-300">
              <span dir="ltr">{active.episodeCount}</span> {dict.hero.episodes}
            </span>
            <span className="flex flex-wrap gap-2">
              {active.genres.slice(0, 3).map((g) => (
                <span key={g} className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-neutral-200 backdrop-blur">
                  {genres.find((x) => x.key === g)?.label[locale] ?? g}
                </span>
              ))}
            </span>
          </div>
          <p className="mt-4 line-clamp-2 max-w-xl text-base leading-7 text-neutral-300 sm:text-lg sm:leading-8">
            {active.synopsis[locale]}
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href={`/anime/${active.slug}/watch?ep=1`}
              className="group flex items-center gap-2 rounded-full bg-cyan-400 px-7 py-3.5 text-sm font-bold text-neutral-950 shadow-xl shadow-cyan-500/25 transition-all duration-300 hover:scale-105 hover:bg-cyan-300"
            >
              <Play className="h-4 w-4 fill-neutral-950 rtl-flip transition-transform duration-300 group-hover:scale-110" aria-hidden />
              {dict.hero.watchNow}
            </Link>
            <Link
              href={`/anime/${active.slug}`}
              className="flex items-center gap-2 rounded-full bg-white/10 px-7 py-3.5 text-sm font-bold text-white backdrop-blur transition-all duration-300 hover:bg-white/20"
            >
              <Info className="h-4 w-4" aria-hidden />
              {dict.hero.moreInfo}
            </Link>
            {active.trailerUrl && (
              <TrailerButton label={dict.hero.trailer} trailerUrl={active.trailerUrl} />
            )}
          </div>
          </div>

            <div className="mt-8 flex items-center justify-between gap-4">
              <div className="flex gap-2" role="tablist" aria-label="Slides">
                {items.map((a, i) => (
                  <button
                    key={a.id}
                    role="tab"
                    aria-selected={i === index}
                    aria-label={`${a.title[locale]}`}
                    onClick={() => setIndex(i)}
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-300",
                      i === index ? "w-10 bg-cyan-400" : "w-3 bg-white/25 hover:bg-white/50"
                    )}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => go(isRtl ? 1 : -1)}
                  aria-label="Previous slide"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition-all duration-300 hover:bg-white/20"
                >
                  {isRtl ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
                </button>
                <button
                  type="button"
                  onClick={() => go(isRtl ? -1 : 1)}
                  aria-label="Next slide"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition-all duration-300 hover:bg-white/20"
                >
                  {isRtl ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }
