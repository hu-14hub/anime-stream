"use client";

import Image from "next/image";
import { BLUR_DATA_URL } from "@/lib/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle2, Circle, Clock, LayoutGrid, List, Play } from "lucide-react";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { Locale } from "@/i18n/config";
import type { Anime } from "@/types";
import { getWatchedEpisodes } from "@/lib/library";
import { onExternalChange, KEYS } from "@/lib/store";
import { cn } from "@/lib/utils";
import { getAiredEpisodeCount } from "@/lib/anime-availability";

type ViewMode = "grid" | "list";

/**
 * Episode list with a grid/list toggle and watched indicators.
 * Watched state comes from local playback progress and updates live
 * whenever the watch page saves a new position (cross-component sync).
 */
export function EpisodeList({
  anime,
  locale,
  dict,
  baseHref,
  active,
}: {
  anime: Anime;
  locale: Locale;
  dict: Dictionary;
  baseHref: string;
  active?: number;
}) {
  const [view, setView] = useState<ViewMode>("grid");
  const [watched, setWatched] = useState<number[]>([]);

  useEffect(() => {
    const load = () => setWatched(getWatchedEpisodes(anime.slug));
    load();
    const unsub = onExternalChange(KEYS.progress, load);
    return unsub;
  }, [anime.slug]);

  // Highest episode that is actually aired / available to watch. For ongoing
  // titles this is driven by the AniList "next airing episode" (next - 1); for
  // completed titles (or when no airing info exists) every episode is available.
  const airedCount = getAiredEpisodeCount(anime);

  const toggleCls = (mode: ViewMode) =>
    cn(
      "flex h-9 w-9 items-center justify-center rounded-lg transition-colors duration-300",
      view === mode
        ? "bg-cyan-400 text-neutral-950"
        : "bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white"
    );

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-3 text-lg font-extrabold tracking-tight text-white">
          {dict.detail.episodes}
          <span
            dir="ltr"
            className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-bold text-neutral-300"
          >
            {airedCount === anime.episodes.length
              ? anime.episodes.length
              : `${airedCount}/${anime.episodes.length}`}
          </span>
          {watched.length > 0 && (
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
              <span dir="ltr">{watched.length}</span>
            </span>
          )}
        </h3>
        <div className="flex items-center gap-1.5" role="group" aria-label={dict.detail.episodes}>
          <button
            type="button"
            onClick={() => setView("grid")}
            aria-pressed={view === "grid"}
            aria-label={dict.detail.gridView}
            title={dict.detail.gridView}
            className={toggleCls("grid")}
          >
            <LayoutGrid className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => setView("list")}
            aria-pressed={view === "list"}
            aria-label={dict.detail.listView}
            title={dict.detail.listView}
            className={toggleCls("list")}
          >
            <List className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>

      <ol
        className={cn(
          "mt-4 gap-3",
          view === "grid" ? "grid sm:grid-cols-2 lg:grid-cols-3" : "flex flex-col"
        )}
      >
        {anime.episodes.map((ep) => {
          const released = ep.number <= airedCount;
          const isWatched = released && watched.includes(ep.number);
          const isActive = released && ep.number === active;
          return (
            <li key={ep.number}>
              <Link
                href={`${baseHref}?ep=${ep.number}`}
                aria-current={isActive ? "true" : undefined}
                aria-label={`${dict.watch.episode} ${ep.number}${
                  !released
                    ? ` — ${dict.detail.comingSoon}`
                    : isWatched
                      ? ` — ${dict.detail.watched}`
                      : ""
                }`}
                onClick={(e) => { if (!released) e.preventDefault(); }}
                className={cn(
                  "group flex items-center gap-3.5 rounded-xl p-2.5 pe-4 transition-colors duration-300",
                  !released
                    ? "cursor-not-allowed opacity-50"
                    : isActive
                      ? "bg-cyan-400/10 ring-1 ring-cyan-400/60"
                      : "bg-white/[0.03] hover:bg-white/[0.07]"
                )}
              >
                <span
                  className={cn(
                    "relative shrink-0 overflow-hidden rounded-lg bg-neutral-900",
                    view === "grid" ? "h-16 w-28" : "h-11 w-20",
                    !released && "grayscale"
                  )}
                >
                  <Image
                    src={ep.thumbnail}
                    alt=""
                    fill
                    sizes={view === "grid" ? "112px" : "80px"}
                    className={cn(
                      "object-cover transition-transform duration-300",
                      released && "group-hover:scale-105"
                    )}
                    placeholder="blur"
                    blurDataURL={BLUR_DATA_URL}
                  />
                  {released ? (
                    <span className="absolute inset-0 flex items-center justify-center bg-neutral-950/45 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <Play className="h-5 w-5 fill-white text-white rtl-flip" aria-hidden />
                    </span>
                  ) : (
                    <span className="absolute inset-0 flex items-center justify-center bg-neutral-950/70">
                      <Clock className="h-5 w-5 text-neutral-400" aria-hidden />
                    </span>
                  )}
                  {isWatched && (
                    <span className="absolute inset-0 flex items-center justify-center bg-emerald-500/25">
                      <CheckCircle2 className="h-6 w-6 text-emerald-300 drop-shadow" aria-hidden />
                    </span>
                  )}
                </span>

                <span className="min-w-0 flex-1">
                  <span
                    dir="ltr"
                    className={cn(
                      "flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest",
                      released ? "text-cyan-300" : "text-neutral-500"
                    )}
                  >
                    EP {ep.number}
                    <span className="text-neutral-600" aria-hidden>
                      ·
                    </span>
                    <span dir="ltr" className="text-neutral-500">
                      {ep.duration}
                    </span>
                  </span>
                  <span
                    className={cn(
                      "mt-0.5 block truncate text-sm font-bold",
                      released ? "text-neutral-100" : "text-neutral-500"
                    )}
                  >
                    {ep.title[locale]}
                  </span>
                  <span
                    className={cn(
                      "mt-0.5 flex items-center gap-1 text-[11px] font-semibold",
                      !released
                        ? "text-cyan-300"
                        : isWatched
                          ? "text-emerald-400"
                          : "text-neutral-600"
                    )}
                  >
                    {!released ? (
                      <>
                        <Clock className="h-3 w-3" aria-hidden />
                        {dict.detail.comingSoon}
                      </>
                    ) : isWatched ? (
                      <>
                        <CheckCircle2 className="h-3 w-3" aria-hidden />
                        {dict.detail.watched}
                      </>
                    ) : (
                      <>
                        <Circle className="h-3 w-3" aria-hidden />
                        {dict.detail.notWatched}
                      </>
                    )}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

