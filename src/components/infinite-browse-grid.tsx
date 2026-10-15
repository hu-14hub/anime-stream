"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { Anime } from "@/types";
import { AnimeCard } from "./anime-card";

interface PageRes {
  items: Anime[];
  page: number;
  lastPage: number;
  hasNext: boolean;
}

/**
 * Appends pages from `/api/browse` as the user scrolls (IntersectionObserver),
 * with an explicit "Load more" button as a keyboard/SSR-friendly fallback.
 * `query` is the already-serialized filter query string (without `page`).
 */
export function InfiniteBrowseGrid({
  initialItems,
  initialPage,
  initialHasNext,
  query,
  locale,
  dict,
  mode,
}: {
  initialItems: Anime[];
  initialPage: number;
  initialHasNext: boolean;
  query: string;
  locale: Locale;
  dict: Dictionary;
  /** `infinite` follows scroll; `manual` only loads on click. */
  mode: "infinite" | "manual";
}) {
  const [items, setItems] = useState<Anime[]>(initialItems);
  const [page, setPage] = useState(initialPage);
  const [hasNext, setHasNext] = useState(initialHasNext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const sentinel = useRef<HTMLDivElement>(null);
  const busy = useRef(false);

  // Filter changes arrive as new props → reset the grid.
  useEffect(() => {
    setItems(initialItems);
    setPage(initialPage);
    setHasNext(initialHasNext);
    setError(false);
  }, [initialItems, initialPage, initialHasNext, query]);

  const loadMore = useCallback(async () => {
    if (busy.current || !hasNext) return;
    busy.current = true;
    setLoading(true);
    setError(false);
    try {
      const next = page + 1;
      const res = await fetch(`/api/browse${query ? `?${query}&` : "?"}page=${next}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as PageRes;
      setItems((prev) => {
        const seen = new Set(prev.map((a) => a.id));
        return [...prev, ...data.items.filter((a) => !seen.has(a.id))];
      });
      setPage(data.page);
      setHasNext(Boolean(data.hasNext));
    } catch {
      setError(true);
    } finally {
      setLoading(false);
      busy.current = false;
    }
  }, [page, hasNext, query]);

  // Observe the sentinel when in infinite mode.
  useEffect(() => {
    if (mode !== "infinite") return;
    const el = sentinel.current;
    if (!el || !hasNext) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) void loadMore();
      },
      { rootMargin: "600px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [mode, hasNext, loadMore]);

  if (!items.length) return null;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 sm:gap-7 lg:grid-cols-4 xl:grid-cols-5">
        {items.map((a) => (
          <AnimeCard key={a.id} anime={a} locale={locale} dict={dict} />
        ))}
      </div>

      {hasNext && (
        <div ref={sentinel} className="flex flex-col items-center gap-2 pt-2">
          <button
            type="button"
            onClick={() => void loadMore()}
            disabled={loading}
            className="flex items-center gap-2 rounded-full bg-white/5 px-7 py-3 text-sm font-bold text-neutral-200 transition-all duration-300 hover:bg-white/10 hover:text-white disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin text-cyan-400" aria-hidden />
            ) : (
              <Plus className="h-4 w-4" aria-hidden />
            )}
            {loading ? dict.browse.loadingMore : dict.browse.loadMore}
          </button>
          {error && (
            <p className="text-xs font-semibold text-red-400">{dict.common.error}</p>
          )}
        </div>
      )}
    </div>
  );
}