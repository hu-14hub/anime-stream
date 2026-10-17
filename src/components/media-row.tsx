"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";

/**
 * Horizontally scrolling media row with RTL-aware arrow controls.
 * Arrows auto-hide when there is nothing to scroll (e.g. small screens).
 */
export function MediaRow({
  children,
  locale,
  ariaLabel,
  className,
}: {
  children: ReactNode;
  locale: Locale;
  ariaLabel: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const isRtl = locale === "ar";

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth - 2;
    // In RTL scrollLeft is negative in Chrome/Firefox; treat magnitudes.
    const pos = isRtl ? Math.abs(el.scrollLeft) : el.scrollLeft;
    setCanPrev(pos > 2);
    setCanNext(pos < max);
  }, [isRtl]);

  useEffect(() => {
    update();
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    el.addEventListener("scroll", update, { passive: true });
    return () => {
      ro.disconnect();
      el.removeEventListener("scroll", update);
    };
  }, [update]);

  const scrollBy = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    const amount = Math.max(el.clientWidth * 0.8, 240);
    // RTL: positive scrollLeft moves visually left → invert for logical dir
    const sign = isRtl ? -1 : 1;
    el.scrollBy({ left: dir * amount * sign, behavior: "smooth" });
  };

  return (
    <div className="group/row relative" aria-label={ariaLabel}>
      <div
        ref={ref}
        className={cn(
          "flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-5",
          className
        )}
      >
        {children}
      </div>

      {/* Edge fade */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-y-0 -start-4 w-8 bg-gradient-to-r from-neutral-950 to-transparent opacity-0 transition-opacity duration-300",
          canPrev && "opacity-100"
        )}
      />
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-y-0 -end-4 w-8 bg-gradient-to-l from-neutral-950 to-transparent opacity-0 transition-opacity duration-300",
          canNext && "opacity-100"
        )}
      />

      {canPrev && (
        <button
          type="button"
          onClick={() => scrollBy(-1)}
          aria-label={`${ariaLabel} — previous`}
          className={cn(
            "absolute top-[38%] z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-neutral-950/85 text-white shadow-xl backdrop-blur transition-all duration-300 hover:bg-brand hover:text-neutral-950 md:flex",
            isRtl ? "-right-3" : "-left-3"
          )}
        >
          {isRtl ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </button>
      )}
      {canNext && (
        <button
          type="button"
          onClick={() => scrollBy(1)}
          aria-label={`${ariaLabel} — next`}
          className={cn(
            "absolute top-[38%] z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-neutral-950/85 text-white shadow-xl backdrop-blur transition-all duration-300 hover:bg-brand hover:text-neutral-950 md:flex",
            isRtl ? "-left-3" : "-right-3"
          )}
        >
          {isRtl ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </button>
      )}
    </div>
  );
}