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
      className="relative overflow-hidden rounded-3xl border border-white/10"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative h-[480px] sm:h-[520px]">
        {items.map((a, i) => (
          <div
            key={a.id}
            aria-hidden={i !== index}
            className={cn(
              "absolute inset-0 transition-opacity duration-700",
              i === index ? "z-10 opacity-100" : "z-0 opacity-0"
            )}
          >
            <Image
              src={a.banner}
              alt=""
              fill
              priority={i === 0}
              sizes="100vw"
              className="object-cover"
            />
          </div>
        ))}
        <div className="absolute inset-0 z-20 bg-gradient-to-t from-[#0b0b16] via-[#0b0b16]/55 to-transparent" aria-hidden />
        <div
          className={cn("absolute inset-y-0 z-20 w-2/3", isRtl ? "right-0 bg-gradient-to-l" : "left-0 bg-gradient-to-r", "from-[#0b0b16]/90 to-transparent")}
          aria-hidden
        />
      </div>

      <div className="absolute inset-x-0 bottom-0 z-30 p-5 sm:p-8">
        <div key={active.id} className="animate-fade-up max-w-2xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-fuchsia-400/30 bg-fuchsia-500/15 px-3 py-1 text-xs font-bold text-fuchsia-200 backdrop-blur">
            {dict.hero.trendingBadge}
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-white drop-shadow sm:text-5xl">
            {active.title[locale]}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm">
            <span className="flex items-center gap-1.5 font-bold text-amber-300">
              <Star className="h-4 w-4 fill-amber-300" aria-hidden />
              <span dir="ltr">{active.rating.toFixed(1)}</span>
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <Calendar className="h-4 w-4" aria-hidden />
              <span dir="ltr">{active.year}</span>
            </span>
            <span className="rounded-full bg-white/10 px-2.5 py-1 font-semibold text-slate-200 backdrop-blur">
              <span dir="ltr">{active.episodeCount}</span> {dict.hero.episodes}
            </span>
            <span className="flex flex-wrap gap-1.5">
              {active.genres.slice(0, 3).map((g) => (
                <span key={g} className="rounded-full border border-white/15 bg-black/40 px-2.5 py-1 text-slate-200 backdrop-blur">
                  {genres.find((x) => x.key === g)?.label[locale] ?? g}
                </span>
              ))}
            </span>
          </div>
          <p className="mt-3 line-clamp-2 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
            {active.synopsis[locale]}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href={`/anime/${active.slug}/watch?ep=1`}
              className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-sm font-bold text-white shadow-xl shadow-purple-900/40 transition-all duration-300 hover:scale-105 hover:shadow-purple-700/40"
            >
              <Play className="h-4 w-4 fill-white rtl-flip transition-transform group-hover:scale-110" aria-hidden />
              {dict.hero.watchNow}
            </Link>
            <Link
              href={`/anime/${active.slug}`}
              className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur transition-all duration-300 hover:bg-white/20"
            >
              <Info className="h-4 w-4" aria-hidden />
              {dict.hero.moreInfo}
            </Link>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between gap-4">
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
                  i === index ? "w-8 bg-gradient-to-r from-indigo-400 to-fuchsia-400" : "w-3 bg-white/25 hover:bg-white/50"
                )}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => go(isRtl ? 1 : -1)}
              aria-label="Previous slide"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white backdrop-blur transition hover:bg-white/15"
            >
              {isRtl ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            </button>
            <button
              type="button"
              onClick={() => go(isRtl ? -1 : 1)}
              aria-label="Next slide"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white backdrop-blur transition hover:bg-white/15"
            >
              {isRtl ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
