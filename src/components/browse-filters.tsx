"use client";

import {
  Children,
  isValidElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Check, ChevronDown, Filter, RotateCcw, Search, X } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { Genre } from "@/types";
import {
  FORMAT_KEYS,
  SEASON_KEYS,
  SORT_KEYS,
  STATUS_KEYS,
  YEAR_OPTIONS,
  filtersToHref,
  parseFilters,
} from "@/lib/browse-params";
import { cn } from "@/lib/utils";

const SORT_LABEL: Record<string, keyof Dictionary["browse"]> = {
  popularity: "sortPopularity",
  score: "sortScore",
  newest: "sortNewest",
  az: "sortAz",
  trending: "sortTrending",
};

type Filters = ReturnType<typeof parseFilters>;

/**
 * Advanced filter panel — reads the URL on mount and mirrors every change
 * back into the URL (replace while typing, push for facets) so results,
 * pagination and the back button stay consistent.
 */
export function BrowseFilters({
  genres,
  locale,
  dict,
}: {
  genres: Genre[];
  locale: Locale;
  dict: Dictionary;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [draft, setDraft] = useState<Filters>(() =>
    parseFilters(Object.fromEntries(searchParams.entries()))
  );
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState(() => draft.q);

  // External navigation (back/forward, chip links) → resync local draft.
  const urlKey = searchParams.toString();
  useEffect(() => {
    const parsed = parseFilters(Object.fromEntries(searchParams.entries()));
    setDraft(parsed);
    setTerm(parsed.q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlKey]);

  const push = useCallback(
    (next: Filters, replace = false) => {
      const qs = filtersToHref(next).replace("/catalog", "");
      if (replace) router.replace(`${pathname}${qs}`, { scroll: false });
      else router.push(`${pathname}${qs}`, { scroll: false });
    },
    [router, pathname]
  );

  // Debounced search box → ?q= with replace so history stays clean.
  useEffect(() => {
    const q = term.trim();
    if (q === draft.q) return;
    const id = setTimeout(() => {
      const next = { ...draft, q, page: 1 };
      setDraft(next);
      push(next, true);
    }, 350);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [term]);

  const toggleGenre = (key: string) => {
    const next = {
      ...draft,
      genres: draft.genres.includes(key)
        ? draft.genres.filter((g) => g !== key)
        : [...draft.genres, key],
      page: 1,
    };
    setDraft(next);
    push(next);
  };

  const setFacet = <K extends keyof Filters>(k: K, v: Filters[K]) => {
    const next = { ...draft, [k]: v, page: 1 } as Filters;
    setDraft(next);
    push(next);
  };

  const clearAll = () => {
    const next = parseFilters({});
    setDraft(next);
    setTerm("");
    push(next);
  };

  const activeCount =
    draft.genres.length +
    (draft.year ? 1 : 0) +
    (draft.season ? 1 : 0) +
    (draft.format ? 1 : 0) +
    (draft.status ? 1 : 0) +
    (draft.sort !== "popularity" ? 1 : 0);

  const Select = ({
    label,
    value,
    onChange,
    children,
  }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    children: ReactNode;
  }) => {
    const [open, setOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);

    // Flatten the rendered <option> children into simple { value, label } pairs so the
    // filter call sites can keep passing plain <option> elements unchanged.
    const options = useMemo(
      () =>
        Children.toArray(children).flatMap((child): { value: string; label: string }[] => {
          if (!isValidElement(child)) return [];
          const { value: v, children: c } = child.props as {
            value?: string | number;
            children?: ReactNode;
          };
          return [{ value: String(v ?? ""), label: typeof c === "string" ? c : String(c) }];
        }),
      [children]
    );
    const selected = options.find((o) => o.value === value);

    // Dismiss on outside click or Escape while the menu is open.
    useEffect(() => {
      if (!open) return;
      const onDown = (e: MouseEvent) => {
        if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
      };
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") setOpen(false);
      };
      document.addEventListener("mousedown", onDown);
      document.addEventListener("keydown", onKey);
      return () => {
        document.removeEventListener("mousedown", onDown);
        document.removeEventListener("keydown", onKey);
      };
    }, [open]);

    const choose = (v: string) => {
      onChange(v);
      setOpen(false);
    };

    return (
      <label className="block space-y-1.5">
        <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-500">
          {label}
        </span>
        <div className="relative" ref={rootRef}>
          {/* Trigger button — replaces the native <select> control. */}
          <button
            type="button"
            role="combobox"
            aria-haspopup="listbox"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
            className="flex h-10 w-full items-center justify-between gap-2 rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 text-start text-sm font-semibold text-zinc-100 outline-none transition-all duration-300 hover:border-zinc-700 hover:bg-zinc-900 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20"
          >
            <span className="truncate">{selected ? selected.label : value}</span>
            <ChevronDown
              className={cn(
                "h-4 w-4 shrink-0 text-neutral-500 transition-transform duration-300",
                open && "rotate-180"
              )}
              aria-hidden
            />
          </button>

          {/* Custom popup — a single seamless dark unit beneath the trigger. */}
          {open && (
            <div
              role="listbox"
              className="animate-select-pop absolute inset-x-0 top-full z-30 mt-2 max-h-64 overflow-auto rounded-xl border border-zinc-800 bg-zinc-900 p-1.5 shadow-xl shadow-black/50"
            >
              {options.length === 0 && (
                <p className="px-3 py-2 text-sm text-neutral-500">—</p>
              )}
              {options.map((o) => {
                const isSelected = o.value === value;
                return (
                  <button
                    key={o.value || "empty"}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => choose(o.value)}
                    className={cn(
                      "flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-start text-sm font-semibold transition-colors duration-150",
                      isSelected
                        ? "bg-cyan-500/15 text-cyan-200"
                        : "text-zinc-200 hover:bg-cyan-500/10 hover:text-white focus:bg-cyan-500/20 focus:text-white"
                    )}
                  >
                    <span className="truncate">{o.label}</span>
                    {isSelected && <Check className="h-4 w-4 shrink-0 text-cyan-300" aria-hidden />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </label>
    );
  };

  return (
    <div className="space-y-4">
      {/* Search + toggle */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            className="absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500"
            aria-hidden
          />
          <input
            type="search"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder={dict.browse.searchLabel}
            aria-label={dict.browse.searchLabel}
            className="h-11 w-full rounded-full border border-white/10 bg-white/5 ps-10 pe-4 text-sm text-neutral-100 placeholder:text-neutral-500 outline-none transition-all focus:border-cyan-400/50 focus:bg-white/[0.07] focus:ring-2 focus:ring-cyan-400/20"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className={cn(
              "flex h-11 items-center gap-2 rounded-full px-5 text-sm font-bold transition-all duration-300",
              open ? "bg-cyan-400 text-neutral-950" : "bg-white/5 text-neutral-200 hover:bg-white/10"
            )}
          >
            <Filter className="h-4 w-4" aria-hidden />
            {dict.browse.filters}
            {activeCount > 0 && (
              <span
                dir="ltr"
                className="flex h-5 min-w-5 items-center justify-center rounded-full bg-neutral-950/20 px-1.5 text-[11px] font-black"
              >
                {activeCount}
              </span>
            )}
          </button>
          {activeCount > 0 && (
            <button
              type="button"
              onClick={clearAll}
              className="flex h-11 items-center gap-1.5 rounded-full border border-white/10 px-4 text-sm font-semibold text-neutral-400 transition-all duration-300 hover:border-red-400/40 hover:text-red-300"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden />
              {dict.browse.clearAll}
            </button>
          )}
        </div>
      </div>

      {/* Facet panel */}
      <div
        className={cn(
          "grid overflow-hidden transition-all duration-300",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
            {/* Genres (multi-select chips) */}
            <div className="space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-500">
                {dict.browse.genres}
              </p>
              <div className="flex flex-wrap gap-2">
                {genres.map((g) => {
                  const active = draft.genres.includes(g.key);
                  return (
                    <button
                      key={g.key}
                      type="button"
                      aria-pressed={active}
                      onClick={() => toggleGenre(g.key)}
                      className={cn(
                        "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all duration-300",
                        active
                          ? "bg-cyan-400 text-neutral-950 shadow-lg shadow-cyan-500/20"
                          : "bg-white/5 text-neutral-300 hover:bg-white/10 hover:text-white"
                      )}
                    >
                      {active && <Check className="h-3 w-3" aria-hidden />}
                      {g.label[locale]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Select facets */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              <Select
                label={dict.browse.year}
                value={draft.year ? String(draft.year) : ""}
                onChange={(v) => setFacet("year", v ? parseInt(v, 10) : undefined)}
              >
                <option value="">{dict.browse.all}</option>
                {YEAR_OPTIONS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </Select>

              <Select
                label={dict.browse.season}
                value={draft.season ?? ""}
                onChange={(v) => setFacet("season", v || undefined)}
              >
                <option value="">{dict.browse.all}</option>
                {SEASON_KEYS.map((s) => (
                  <option key={s} value={s}>
                    {dict.browse[s]}
                  </option>
                ))}
              </Select>

              <Select
                label={dict.browse.format}
                value={draft.format ?? ""}
                onChange={(v) => setFacet("format", v || undefined)}
              >
                <option value="">{dict.browse.all}</option>
                {FORMAT_KEYS.map((f) => (
                  <option key={f} value={f}>
                    {dict.browse[f.toLowerCase() as "tv"]}
                  </option>
                ))}
              </Select>

              <Select
                label={dict.browse.status}
                value={draft.status ?? ""}
                onChange={(v) => setFacet("status", v || undefined)}
              >
                <option value="">{dict.browse.all}</option>
                {STATUS_KEYS.map((s) => (
                  <option key={s} value={s}>
                    {s === "ongoing" ? dict.browse.airing : dict.browse.finished}
                  </option>
                ))}
              </Select>

              <Select
                label={dict.browse.sortBy}
                value={draft.sort}
                onChange={(v) => setFacet("sort", v as Filters["sort"])}
              >
                {SORT_KEYS.map((s) => (
                  <option key={s} value={s}>
                    {dict.browse[SORT_LABEL[s]]}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Active filter pills */}
      {activeCount > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-500">
            {dict.browse.activeFilters}
          </span>
          {draft.genres.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => toggleGenre(g)}
              className="flex items-center gap-1 rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-bold text-cyan-300 transition-all duration-300 hover:bg-cyan-400/20"
            >
              {genres.find((x) => x.key === g)?.label[locale] ?? g}
              <X className="h-3 w-3" aria-hidden />
            </button>
          ))}
          {(
            [
              draft.year ? { k: "year" as const, label: String(draft.year) } : null,
              draft.season
                ? { k: "season" as const, label: dict.browse[draft.season as "winter"] }
                : null,
              draft.format
                ? { k: "format" as const, label: dict.browse[draft.format.toLowerCase() as "tv"] }
                : null,
              draft.status
                ? {
                    k: "status" as const,
                    label: draft.status === "ongoing" ? dict.browse.airing : dict.browse.finished,
                  }
                : null,
            ]
          )
            .filter((p): p is { k: "year" | "season" | "format" | "status"; label: string } =>
              Boolean(p)
            )
            .map((pill) => (
              <button
                key={pill.k}
                type="button"
                onClick={() => setFacet(pill.k, undefined)}
                className="flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-neutral-200 transition-all duration-300 hover:bg-white/20"
              >
                {pill.label}
                <X className="h-3 w-3" aria-hidden />
              </button>
            ))}
        </div>
      )}
    </div>
  );
}


