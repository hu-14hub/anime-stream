"use client";

import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Genre } from "@/types";
import { cn } from "@/lib/utils";

/** Horizontally scrollable quick-access genre chips. */
export function GenreChips({
  genres,
  locale,
  ariaLabel,
  className,
}: {
  genres: Genre[];
  locale: Locale;
  ariaLabel: string;
  className?: string;
}) {
  return (
    <nav
      aria-label={ariaLabel}
      className={cn(
        "flex gap-2.5 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className
      )}
    >
      {genres.map((g) => (
        <Link
          key={g.key}
          href={`/catalog?genres=${g.key}`}
          className={cn(
            "shrink-0 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-neutral-300 sm:text-sm",
            "transition-all duration-300 hover:scale-105 hover:border-cyan-400/50 hover:bg-cyan-400/10 hover:text-cyan-300"
          )}
        >
          {g.label[locale]}
        </Link>
      ))}
    </nav>
  );
}