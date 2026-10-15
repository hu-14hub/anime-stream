"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Loader2, Search, Star } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Suggestion {
  slug: string;
  title: { en: string; ar: string };
  cover: string;
  rating: number;
  year: number;
  episodeCount: number;
}

export function SearchBar({
  placeholder,
  locale,
  viewAllLabel,
  noResultsLabel,
  className,
  onNavigate,
}: {
  placeholder: string;
  locale: "en" | "ar";
  viewAllLabel: string;
  noResultsLabel: string;
  className?: string;
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const boxRef = useRef<HTMLDivElement>(null);

  // Debounced live fetch as the user types — no navigation here.
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setItems([]);
      setLoading(false);
      setActive(-1);
      return;
    }
    setLoading(true);
    const id = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setItems(data.items ?? []);
        setOpen(true);
        setActive(-1);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(id);
  }, [query]);

  // Close dropdown on outside click.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const go = (href: string) => {
    setOpen(false);
    onNavigate?.();
    router.push(href);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    // Submit navigates (detail or full catalog) — typing never does.
    if (active >= 0 && items[active]) go(`/anime/${items[active].slug}`);
    else if (items.length === 1) go(`/anime/${items[0].slug}`);
    else if (query.trim()) go(`/catalog?q=${encodeURIComponent(query.trim())}`);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" && items.length) {
      e.preventDefault();
      setActive((a) => (a + 1) % items.length);
    } else if (e.key === "ArrowUp" && items.length) {
      e.preventDefault();
      setActive((a) => (a - 1 + items.length) % items.length);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const showDropdown = open && query.trim().length >= 2;

  return (
    <div ref={boxRef} className={cn("relative", className)}>
      <form onSubmit={submit} role="search">
        <Search
          className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500"
          aria-hidden
        />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => items.length && setOpen(true)}
          onKeyDown={onKeyDown}
          type="search"
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls="anime-search-listbox"
          aria-activedescendant={active >= 0 ? `search-opt-${active}` : undefined}
          placeholder={placeholder}
          aria-label={placeholder}
          autoComplete="off"
          className="h-10 w-full rounded-full border border-transparent bg-white/5 ps-9 pe-9 text-sm text-neutral-100 placeholder:text-neutral-500 outline-none transition-all duration-300 focus:border-cyan-400/50 focus:bg-white/10 focus:ring-2 focus:ring-cyan-400/20"
        />
        {loading && (
          <Loader2 className="absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-cyan-400" aria-hidden />
        )}
      </form>

      {showDropdown && !loading && (
        <div className="absolute inset-x-0 top-12 z-50 overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/95 shadow-2xl shadow-black/60 backdrop-blur-xl">
          {items.length === 0 ? (
            <p className="px-4 py-5 text-center text-sm text-neutral-400">{noResultsLabel}</p>
          ) : (
            <ul id="anime-search-listbox" role="listbox" className="max-h-80 overflow-y-auto p-2">
              {items.map((a, i) => (
                <li key={a.slug} id={`search-opt-${i}`} role="option" aria-selected={i === active}>
                  <Link
                    href={`/anime/${a.slug}`}
                    onClick={(e) => {
                      e.preventDefault();
                      go(`/anime/${a.slug}`);
                    }}
                    onMouseEnter={() => setActive(i)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl p-2 transition-colors duration-300",
                      i === active ? "bg-white/10" : "hover:bg-white/5"
                    )}
                  >
                    <span className="relative h-14 w-10 shrink-0 overflow-hidden rounded-lg bg-neutral-800">
                      {a.cover ? (
                        <Image src={a.cover} alt="" fill sizes="40px" className="object-cover" />
                      ) : null}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold text-neutral-100">
                        {locale === "ar" ? a.title.ar : a.title.en}
                      </span>
                      <span className="mt-0.5 flex items-center gap-2 text-[11px] text-neutral-400">
                        <span className="flex items-center gap-1 font-bold text-amber-400">
                          <Star className="h-3 w-3 fill-amber-400" aria-hidden />
                          <span dir="ltr">{a.rating.toFixed(1)}</span>
                        </span>
                        <span dir="ltr">{a.year}</span>
                        <span aria-hidden>·</span>
                        <span dir="ltr">{a.episodeCount} EP</span>
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {items.length > 0 && query.trim() && (
            <button
              type="button"
              onClick={() => go(`/catalog?q=${encodeURIComponent(query.trim())}`)}
              className="w-full border-t border-white/10 px-4 py-2.5 text-center text-xs font-bold text-cyan-300 transition-colors duration-300 hover:bg-white/5 hover:text-cyan-200"
            >
              {viewAllLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
