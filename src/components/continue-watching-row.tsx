"use client";

import Image from "next/image";
import { BLUR_DATA_URL } from "@/lib/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Play } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { getContinueWatching, type WatchProgress } from "@/lib/library";
import { onExternalChange } from "@/lib/store";
import { KEYS } from "@/lib/store";
import { MediaRow } from "./media-row";

interface ContinueItem extends WatchProgress {
  title: string;
  cover: string;
}

/**
 * "Continue Watching" row — reads local progress joined with the
 * AniList/mock catalogue passed down from the server.
 */
export function ContinueWatchingRow({
  catalog,
  locale,
  dict,
}: {
  catalog: { slug: string; title: string; cover: string }[];
  locale: Locale;
  dict: Dictionary;
}) {
  const [items, setItems] = useState<ContinueItem[]>([]);

  useEffect(() => {
    const load = () => {
      const progress = getContinueWatching();
      const bySlug = new Map(catalog.map((c) => [c.slug, c]));
      setItems(
        progress
          .map((p) => {
            const meta = bySlug.get(p.slug);
            return meta ? { ...p, title: meta.title, cover: meta.cover } : null;
          })
          .filter((x): x is ContinueItem => x !== null)
      );
    };
    load();
    const unsub = onExternalChange(KEYS.progress, load);
    return unsub;
  }, [catalog]);

  if (!items.length) return null;

  return (
    <section aria-labelledby="continue-heading" className="space-y-5">
      <div className="flex items-baseline justify-between gap-4">
        <h2
          id="continue-heading"
          className="text-xl font-extrabold tracking-tight text-white sm:text-2xl"
        >
          {dict.sections.continueWatching}
        </h2>
      </div>
      <MediaRow locale={locale} ariaLabel={dict.sections.continueWatching}>
        {items.map((p) => {
          const pct = Math.min(100, Math.round((p.time / Math.max(p.duration, 1)) * 100));
          return (
            <Link
              key={`${p.slug}-${p.ep}`}
              href={`/anime/${p.slug}/watch?ep=${p.ep}`}
              className="group w-56 shrink-0 snap-start sm:w-64"
            >
              <div className="relative aspect-video overflow-hidden rounded-xl bg-neutral-900">
                <Image
                  src={p.cover}
                  alt={p.title}
                  fill
                  sizes="(max-width: 640px) 240px, 256px"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  placeholder="blur"
                  blurDataURL={BLUR_DATA_URL}
                />
                <span className="absolute inset-0 flex items-center justify-center bg-neutral-950/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand text-neutral-950 shadow-xl shadow-brand/30">
                    <Play className="h-5 w-5 fill-neutral-950 rtl-flip" aria-hidden />
                  </span>
                </span>
                {/* progress bar */}
                <span className="absolute inset-x-0 bottom-0 h-1.5 bg-black/60">
                  <span className="block h-full bg-brand" style={{ width: `${pct}%` }} />
                </span>
                <span
                  dir="ltr"
                  className="absolute bottom-2 end-2 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-bold text-white"
                >
                  {pct}%
                </span>
              </div>
              <p className="mt-2.5 truncate text-sm font-bold text-neutral-100 transition-colors group-hover:text-brand-300">
                {p.title}
              </p>
              <p className="mt-0.5 text-xs text-neutral-500">
                <span dir="ltr">
                  {dict.watch.episode} {p.ep}
                </span>{" "}
                · {dict.profile.progress} <span dir="ltr">{pct}%</span>
              </p>
            </Link>
          );
        })}
      </MediaRow>
    </section>
  );
}