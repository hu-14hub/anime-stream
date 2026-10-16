"use client";

import type { Dictionary } from "@/i18n/get-dictionary";
import { getRating, setRating, KEYS } from "@/lib/store";
import { useStore } from "@/lib/use-store";
import { cn } from "@/lib/utils";

/**
 * 1-10 rating input used on the detail page and the profile screen.
 * Persists to the local ratings collection and re-renders via the store.
 */
export function RatingInput({
  slug,
  dict,
  compact,
}: {
  slug: string;
  dict: Dictionary;
  compact?: boolean;
}) {
  const [, refresh] = useStore(KEYS.ratings, []);
  const current = getRating(slug)?.score;

  return (
    <div className={cn("flex flex-wrap items-center gap-2", compact && "gap-1")}>
      {!compact && (
        <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">
          {dict.detail.rate}
        </span>
      )}
      <div dir="ltr" role="radiogroup" aria-label={dict.detail.rate} className="flex gap-1">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={current === n}
            aria-label={`${n} ${dict.detail.scoreOutOf10}`}
            onClick={() => {
              setRating(slug, n);
              refresh();
            }}
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-md text-[11px] font-black transition-all duration-200",
              current === n
                ? "bg-amber-400 text-neutral-950 shadow-lg shadow-amber-500/30"
                : current && n <= current
                  ? "bg-amber-400/20 text-amber-300"
                  : "bg-white/5 text-neutral-500 hover:bg-white/10 hover:text-neutral-300"
            )}
          >
            {n}
          </button>
        ))}
      </div>
      {typeof current === "number" && (
        <span dir="ltr" className="ms-1 text-xs font-bold text-amber-400">
          {current}/10
        </span>
      )}
    </div>
  );
}
