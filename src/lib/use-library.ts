"use client";

import { useCallback } from "react";
import type { Anime, LibraryEntry, ListStatus } from "@/types";
import { KEYS } from "@/lib/store";
import { useStore } from "@/lib/use-store";
import {
  addFavorite,
  ensureMigrated,
  markAllAsWatched,
  removeFavorite,
  removeFromLibrary,
  removeFromWatchlist,
  toLibraryEntry,
  upsertWatchlist,
} from "@/lib/library";

/**
 * Shared reactive library hooks. All reads/writes go through the centralized
 * store (`lib/store.ts` pub/sub + `lib/library.ts` helpers), so the buttons,
 * the profile page, and other tabs stay in sync instantly — no hard refresh.
 */

/** Reactive watchlist entries (newest first). */
export function useWatchlist(): LibraryEntry[] {
  ensureMigrated();
  const [watchlist] = useStore<LibraryEntry[]>(KEYS.watchlist, []);
  return watchlist;
}

/** Reactive favorited entries (newest first). */
export function useFavorites(): LibraryEntry[] {
  ensureMigrated();
  const [favorites] = useStore<LibraryEntry[]>(KEYS.favorites, []);
  return favorites;
}

/**
 * Per-anime library state + actions. Stores complete snapshots (id, title,
 * cover, score, format, year, episodes) so profile cards render without
 * missing fields, even for AniList/Jikan-sourced titles.
 */
export function useLibraryEntry(anime: Anime) {
  const watchlist = useWatchlist();
  const favorites = useFavorites();

  const entry = watchlist.find((e) => e.slug === anime.slug);
  const favorited = favorites.some((e) => e.slug === anime.slug);

  /** Add or update the watchlist status, preserving progress & user score. */
  const setStatus = useCallback(
    (status: ListStatus) => {
      upsertWatchlist(
        toLibraryEntry(anime, {
          status,
          progress: entry?.progress ?? 0,
          score: entry?.score,
        })
      );
      if (status === "completed") {
        // Completing a title marks every episode as watched so the episode
        // list, watch history, and profile all update instantly (no reload).
        const epochs = anime.episodes.map((e) => e.number);
        if (epochs.length) markAllAsWatched(anime.slug, epochs);
      }
    },
    [anime, entry?.progress, entry?.score]
  );

  /** Toggle the favorite flag (independent of watchlist status). */
  const toggleFavorite = useCallback(() => {
    if (favorited) {
      removeFavorite(anime.slug);
    } else {
      addFavorite(toLibraryEntry(anime));
    }
  }, [anime, favorited]);

  /** Remove from watchlist + favorites (dropdown "Remove"). */
  const remove = useCallback(() => {
    removeFromLibrary(anime.slug);
  }, [anime.slug]);

  /** Remove only from the watchlist, keeping the favorite. */
  const removeWatchlist = useCallback(() => {
    removeFromWatchlist(anime.slug);
  }, [anime.slug]);

  return { entry, favorited, watchlisted: Boolean(entry), setStatus, toggleFavorite, remove, removeWatchlist };
}
