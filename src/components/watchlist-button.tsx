"use client";

import { useState } from "react";
import { Check, ChevronDown, Heart, ListPlus, X } from "lucide-react";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { Anime, LibraryEntry, ListStatus } from "@/types";
import { upsertLibrary, removeFromLibrary } from "@/lib/library";
import { KEYS } from "@/lib/store";
import { useStore } from "@/lib/use-store";
import { cn } from "@/lib/utils";

const STATUSES: ListStatus[] = ["watching", "plan", "completed", "onhold", "dropped"];

const STATUS_LABEL: Record<ListStatus, keyof Dictionary["watchlist"]> = {
  watching: "watching",
  plan: "plan",
  completed: "completed",
  onhold: "onhold",
  dropped: "dropped",
  favorite: "favorite",
};

/**
 * "Add to Watchlist" dropdown — Watching / Plan to Watch / Completed /
 * On Hold / Dropped plus a Favorites heart. Persists to the local
 * library and stays in sync through the store's pub/sub layer.
 */
export function WatchlistButton({ anime, dict }: { anime: Anime; dict: Dictionary }) {
  const [open, setOpen] = useState(false);
  const [library] = useStore<LibraryEntry[]>(KEYS.library, []);
  const entry = library.find((e) => e.slug === anime.slug);

  const applyStatus = (status: ListStatus) => {
    upsertLibrary({
      slug: anime.slug,
      anilistId: anime.anilistId,
      title: anime.title.en,
      cover: anime.cover,
      status,
      progress: entry?.progress ?? 0,
      score: entry?.score,
      favorited: entry?.favorited ?? false,
      updatedAt: Date.now(),
    });
    setOpen(false);
  };

  const toggleFavorite = () => {
    upsertLibrary({
      slug: anime.slug,
      anilistId: anime.anilistId,
      title: anime.title.en,
      cover: anime.cover,
      status: entry?.favorited ? entry?.status ?? "plan" : "favorite",
      score: entry?.score,
      progress: entry?.progress ?? 0,
      favorited: !entry?.favorited,
      updatedAt: Date.now(),
    });
  };

  const remove = () => {
    removeFromLibrary(anime.slug);
    setOpen(false);
  };

  return (
    <div className="relative inline-block">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-haspopup="menu"
          className={cn(
            "flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-bold transition-all duration-300",
            entry
              ? "bg-cyan-400/15 text-cyan-300 ring-1 ring-cyan-400/50"
              : "bg-white/10 text-white hover:bg-white/20"
          )}
        >
          <ListPlus className="h-4 w-4" aria-hidden />
          {entry ? dict.detail.inWatchlist : dict.detail.addToWatchlist}
          <ChevronDown className="h-4 w-4" aria-hidden />
        </button>
        <button
          type="button"
          onClick={toggleFavorite}
          aria-pressed={Boolean(entry?.favorited)}
          aria-label={dict.watchlist.favorite}
          title={dict.watchlist.favorite}
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-full transition-all duration-300",
            entry?.favorited
              ? "bg-red-500/15 text-red-400 ring-1 ring-red-500/50"
              : "bg-white/10 text-neutral-300 hover:bg-white/20 hover:text-red-400"
          )}
        >
          <Heart className={cn("h-5 w-5", entry?.favorited && "fill-red-500")} aria-hidden />
        </button>
      </div>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} aria-hidden />
          <div
            role="menu"
            className="absolute start-0 z-40 mt-2 min-w-52 overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/95 p-1.5 shadow-2xl shadow-black/60 backdrop-blur-xl"
          >
            {STATUSES.map((s) => (
              <button
                key={s}
                role="menuitem"
                type="button"
                onClick={() => applyStatus(s)}
                className={cn(
                  "flex w-full items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 text-start text-sm font-semibold transition-colors",
                  entry?.status === s
                    ? "bg-cyan-400/15 text-cyan-300"
                    : "text-neutral-300 hover:bg-white/5 hover:text-white"
                )}
              >
                {dict.watchlist[STATUS_LABEL[s]]}
                {entry?.status === s && <Check className="h-4 w-4" aria-hidden />}
              </button>
            ))}
            {entry && (
              <button
                type="button"
                onClick={remove}
                className="mt-1 flex w-full items-center gap-2 rounded-xl px-3.5 py-2.5 text-start text-sm font-semibold text-red-400 transition-colors hover:bg-red-500/10"
              >
                <X className="h-4 w-4" aria-hidden />
                {dict.detail.removeFromWatchlist}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
