"use client";

import Image from "next/image";
import { BLUR_DATA_URL } from "@/lib/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle2, Circle, Clock, EyeOff, LayoutGrid, List, Play } from "lucide-react";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { Locale } from "@/i18n/config";
import type { Anime } from "@/types";
import { getWatchedEpisodes } from "@/lib/library";
import { onExternalChange, KEYS } from "@/lib/store";
import { cn } from "@/lib/utils";
import { getAiredEpisodeCount } from "@/lib/anime-availability";
import { countFiller } from "@/lib/anime-filler";

type ViewMode = "grid" | "list";

/**
 * Episode list with a grid/list toggle and watched indicators.
 * Watched state comes from local playback progress and updates live
 * whenever the watch page saves a new position (cross-component sync).
 */
import { EpisodeSelector, EPISODE_CHUNK_SIZE, rangeStartForEpisode } from "./episode-selector";

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
  // "Hide Filler" toggle: when on, the list + range selector operate on the
  // canon-only episode array so users skip filler seamlessly.
  const [hideFiller, setHideFiller] = useState(false);
  const fillerCount = countFiller(anime);
  // 0-based start of the visible episode chunk ("1-24", "25-48", ...).
  // Driven by <EpisodeSelector/> so only ONE chunk renders at a time — this is
  // what keeps long-running titles (One Piece ~1100+, Naruto, Black Clover,
  // ...) fast: the full episode array is huge but we only mount 24 cards.
  const [rangeStart, setRangeStart] = useState(() => rangeStartForEpisode(active));
  // Base list the window + selector operate on: all episodes, or canon-only
  // when "Hide Filler" is on (both derive from the same array so the chunk
  // indices stay aligned with <EpisodeSelector/>).
  const canonicalEpisodes = hideFiller
    ? anime.episodes.filter((e) => !e.isFiller)
    : anime.episodes;
  const totalEpisodes = canonicalEpisodes.length;
  // Clamp the window into the base list (guard: `rangeStart` may exceed the
  // shortened canon list right after the "Hide Filler" toggle).
  const maxStart = totalEpisodes
    ? Math.max(0, Math.floor((totalEpisodes - 1) / EPISODE_CHUNK_SIZE) * EPISODE_CHUNK_SIZE)
    : 0;
  const safeStart = Math.min(rangeStart, maxStart);
  const episodesSlice = canonicalEpisodes.slice(safeStart, safeStart + EPISODE_CHUNK_SIZE);
  
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
        ? "bg-brand text-neutral-950"
        : "bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white"
    );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
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
        <div className="flex flex-wrap items-center justify-end gap-1.5">
          {fillerCount > 0 && (
            <button
              type="button"
              role="switch"
              aria-checked={hideFiller}
              onClick={() => setHideFiller((v) => !v)}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-2.5 text-xs font-bold transition-colors duration-300",
                hideFiller
                  ? "bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30"
                  : "bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white"
              )}
            >
              <EyeOff className="h-3.5 w-3.5" aria-hidden />
              {dict.detail.hideFiller}
            </button>
          )}
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
      </div>

      <div className="mt-4">
        <EpisodeSelector
          key={hideFiller ? "filler" : "all"}
          total={totalEpisodes}
          activeEpisode={active}
          initialStart={safeStart}
          onSelect={setRangeStart}
        />
      </div>

      <ol
        className={cn(
          "mt-4 gap-3",
          view === "grid" ? "grid sm:grid-cols-2 lg:grid-cols-3" : "flex flex-col"
        )}
      >
        {episodesSlice.map((ep) => {
          const released = ep.number <= airedCount;
          const isWatched = released && watched.includes(ep.number);
          const isActive = released && ep.number === active;
          const isFiller = !!ep.isFiller;
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
                      ? "bg-brand/10 ring-1 ring-brand/60"
                      : "bg-white/[0.03] hover:bg-white/[0.07]"
                )}
              >
                <span
                  className={cn(
                    "relative shrink-0 overflow-hidden rounded-lg",
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
                  {/* Hover play overlay: dark backdrop + centered cyan play + episode badge */}
                  <span className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    {released ? (
                      <>
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500 text-neutral-950 shadow-xl shadow-black/40">
                          <Play className="h-5 w-5 fill-neutral-950 rtl-flip" aria-hidden />
                        </span>
                        <span dir="ltr" className="text-[10px] font-bold text-white">
                          EP {ep.number}
                        </span>
                      </>
                    ) : (
                      <Clock className="h-5 w-5 text-neutral-400" aria-hidden />
                    )}
                  </span>
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
                      released ? "text-brand-300" : "text-neutral-500"
                    )}
                  >
                    EP {ep.number}
                    {isFiller && (
                      <span className="rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase leading-none text-amber-400 ring-1 ring-amber-500/30">
                        {dict.detail.fillerBadge}
                      </span>
                    )}
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
                        ? "text-brand-300"
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
      {canonicalEpisodes.length === 0 && (
        <p
          role="status"
          className="mt-4 rounded-xl border border-white/5 bg-white/[0.03] p-6 text-center text-sm text-neutral-500"
        >
          {dict.detail.fillerOnly}
        </p>
      )}
    </div>
  );
}

