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
    <nav aria-label="Pagination" className="mt-8 flex items-center justify-center gap-2">
      {page > 1 && (
        <Link href={pageHref(baseHref, page - 1)} className="flex h-10 items-center gap-1 rounded-full border border-white/10 bg-white/5 px-4 text-sm font-bold transition hover:bg-white/10">
          <PrevIcon className="h-4 w-4" />{prevLabel}
        </Link>
      )}
      {nums.map((n) => (
        <Link key={n} href={pageHref(baseHref, n)} aria-current={n === page ? "page" : undefined}
          className={cn("flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition",
            n === page ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white" : "border border-white/10 bg-white/5 hover:bg-white/10")}>
          <span dir="ltr">{n}</span>
        </Link>
      ))}
      {hasNext && (
        <Link href={pageHref(baseHref, page + 1)} className="flex h-10 items-center gap-1 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-4 text-sm font-bold text-white transition hover:scale-105">
          {nextLabel}<NextIcon className="h-4 w-4" />
        </Link>
      )}
    </nav>
  );
}
