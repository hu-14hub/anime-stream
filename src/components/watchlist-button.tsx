"use client";

import { useEffect, useState } from "react";
import {
  BookmarkPlus,
  Check,
  ChevronDown,
  CircleAlert,
  CircleCheck,
  Clock,
  Heart,
  Pause,
  Play,
  X,
  type LucideIcon,
} from "lucide-react";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { Anime, ListStatus } from "@/types";
import { useLibraryEntry } from "@/lib/use-library";
import { cn } from "@/lib/utils";

const STATUSES: ListStatus[] = ["watching", "plan", "completed", "onhold", "dropped"];

type StatusMeta = { icon: LucideIcon; accent: string };

/** Distinct icon + accent per status so the saved state reads at a glance. */
const STATUS_META: Record<ListStatus, StatusMeta> = {
  watching: { icon: Play, accent: "bg-brand/15 text-brand-300 ring-1 ring-brand/50" },
  plan: { icon: Clock, accent: "bg-sky-400/15 text-sky-300 ring-1 ring-sky-400/40" },
  completed: { icon: CircleCheck, accent: "bg-emerald-400/15 text-emerald-300 ring-1 ring-emerald-400/50" },
  onhold: { icon: Pause, accent: "bg-amber-400/15 text-amber-300 ring-1 ring-amber-400/40" },
  dropped: { icon: CircleAlert, accent: "bg-rose-400/15 text-rose-300 ring-1 ring-rose-400/40" },
  favorite: { icon: CircleCheck, accent: "bg-brand/15 text-brand-300 ring-1 ring-brand/50" },
};

/**
 * Watchlist control — a status dropdown (Watching / Plan to Watch /
 * Completed / On Hold / Dropped) plus an independent Favorites heart.
 *
 * Both actions are instant and independent, so a title is removed in one
 * tap with no ghost state:
 *  • the heart toggles favorites on/off without touching the watchlist status;
 *  • "Remove from Watchlist" drops only the list entry, keeping any favorite.
 * Every change flows through `useLibraryEntry` → the store's pub/sub, so the
 * whole page stays in sync immediately (and across tabs).
 */
export function WatchlistButton({ anime, dict }: { anime: Anime; dict: Dictionary }) {
  const [open, setOpen] = useState(false);
  const { entry, favorited, setStatus, toggleFavorite, removeWatchlist } = useLibraryEntry(anime);

  const applyStatus = (status: ListStatus) => {
    setStatus(status);
    setOpen(false);
  };

  const removeEntry = () => {
    removeWatchlist();
    setOpen(false);
  };

  // Close the menu on Escape for keyboard users.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const meta = entry ? STATUS_META[entry.status] : null;
  const MainIcon = meta?.icon ?? BookmarkPlus;
  const accent = meta?.accent ?? "";

  return (
    <div className="relative inline-block">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-haspopup="menu"
          title={
            entry ? `${dict.detail.inWatchlist}: ${dict.watchlist[entry.status]}` : dict.detail.addToWatchlist
          }
          className={cn(
            "flex items-center gap-2 rounded-full px-5 py-3.5 text-sm font-bold transition-all duration-300 active:scale-[0.97]",
            entry ? accent : "bg-white/10 text-white hover:bg-white/20"
          )}
        >
          <MainIcon className="h-4 w-4 shrink-0" aria-hidden />
          <span className="max-w-44 truncate">
            {entry ? dict.watchlist[entry.status] : dict.detail.addToWatchlist}
          </span>
          <ChevronDown
            className={cn("h-4 w-4 shrink-0 transition-transform duration-300", open && "rotate-180")}
            aria-hidden
          />
        </button>
        <button
          type="button"
          onClick={toggleFavorite}
          aria-pressed={favorited}
          aria-label={favorited ? dict.detail.removeFavorite : dict.detail.addFavorite}
          title={favorited ? dict.detail.removeFavorite : dict.detail.addFavorite}
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-full transition-all duration-300",
            favorited
              ? "bg-red-500/15 text-red-400 ring-1 ring-red-500/50"
              : "bg-white/10 text-neutral-300 hover:bg-white/20 hover:text-red-400"
          )}
        >
          <Heart
            className={cn(
              "h-5 w-5 transition-all duration-300",
              favorited ? "scale-105 fill-red-500" : "fill-transparent"
            )}
            aria-hidden
          />
        </button>
      </div>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden />
          <div
            role="menu"
            aria-label={dict.profile.watchlist}
            className="absolute start-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/95 p-1.5 shadow-2xl shadow-black/60 backdrop-blur-xl"
          >
            <p className="px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.15em] text-neutral-500">
              {dict.profile.watchlist}
            </p>
            {STATUSES.map((s) => {
              const Icon = STATUS_META[s].icon;
              const active = entry?.status === s;
              return (
                <button
                  key={s}
                  role="menuitem"
                  type="button"
                  onClick={() => applyStatus(s)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-start text-sm font-semibold transition-colors",
                    active ? "bg-white/[0.08] text-white" : "text-neutral-300 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <Icon
                    className={cn("h-4 w-4 shrink-0", active ? "text-brand-300" : "text-neutral-400")}
                    aria-hidden
                  />
                  <span className="flex-1">{dict.watchlist[s]}</span>
                  {active && <Check className="h-4 w-4 shrink-0 text-brand-300" aria-hidden />}
                </button>
              );
            })}
            {entry && (
              <div className="mt-1 border-t border-white/10 pt-1">
                <button
                  type="button"
                  onClick={removeEntry}
                  className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-start text-sm font-bold text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
                >
                  <X className="h-4 w-4 shrink-0" aria-hidden />
                  <span className="flex-1">{dict.detail.removeFromWatchlist}</span>
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
