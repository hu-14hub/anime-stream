import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { Locale } from "@/i18n/config";

export function SectionHeading({
  title,
  actionLabel,
  actionHref,
  locale,
}: {
  title: string;
  actionLabel?: string;
  actionHref?: string;
  locale: Locale;
}) {
  const Arrow = locale === "ar" ? ArrowLeft : ArrowRight;
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <div className="h-1 w-10 rounded-full bg-cyan-400" aria-hidden />
        <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">{title}</h2>
      </div>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="group flex shrink-0 items-center gap-1.5 rounded-full bg-white/5 px-4 py-2 text-xs font-semibold text-neutral-300 transition-colors duration-300 hover:bg-white/10 hover:text-white"
        >
          {actionLabel}
          <Arrow className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" aria-hidden />
        </Link>
      )}
    </div>
  );
}
