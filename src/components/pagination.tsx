import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";

function pageHref(base: string, page: number) {
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}page=${page}`;
}

export function Pagination({
  page,
  lastPage,
  hasNext,
  baseHref,
  locale,
  prevLabel,
  nextLabel,
}: {
  page: number;
  lastPage: number;
  hasNext: boolean;
  baseHref: string;
  locale: Locale;
  prevLabel: string;
  nextLabel: string;
}) {
  const PrevIcon = locale === "ar" ? ChevronRight : ChevronLeft;
  const NextIcon = locale === "ar" ? ChevronLeft : ChevronRight;
  const nums = [page - 1, page, page + 1].filter((n) => n >= 1 && n <= Math.max(lastPage, 1)).slice(0, 3);
  return (
    <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-2">
      {page > 1 && (
        <Link href={pageHref(baseHref, page - 1)} className="flex h-10 items-center gap-1 rounded-full bg-white/5 px-4 text-sm font-bold text-neutral-200 transition-colors duration-300 hover:bg-white/10 hover:text-white">
          <PrevIcon className="h-4 w-4" />{prevLabel}
        </Link>
      )}
      {nums.map((n) => (
        <Link key={n} href={pageHref(baseHref, n)} aria-current={n === page ? "page" : undefined}
          className={cn("flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-colors duration-300",
            n === page ? "bg-cyan-400 text-neutral-950" : "bg-white/5 text-neutral-300 hover:bg-white/10 hover:text-white")}>
          <span dir="ltr">{n}</span>
        </Link>
      ))}
      {hasNext && (
        <Link href={pageHref(baseHref, page + 1)} className="flex h-10 items-center gap-1 rounded-full bg-cyan-400 px-4 text-sm font-bold text-neutral-950 transition-all duration-300 hover:scale-105 hover:bg-cyan-300">
          {nextLabel}<NextIcon className="h-4 w-4" />
        </Link>
      )}
    </nav>
  );
}
