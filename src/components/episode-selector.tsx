import Image from "next/image";
import Link from "next/link";
import { Play } from "lucide-react";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { Locale } from "@/i18n/config";
import type { Anime } from "@/types";
import { cn } from "@/lib/utils";

export function EpisodeSelector({
  anime,
  locale,
  dict,
  active,
  baseHref,
}: {
  anime: Anime;
  locale: Locale;
  dict: Dictionary;
  active?: number;
  baseHref: string;
}) {
  return (
    <div>
      <h2 className="flex items-center gap-3 text-lg font-extrabold">
        {dict.detail.episodesList}
        <span dir="ltr" className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-bold text-slate-300">
          {anime.episodes.length}
        </span>
      </h2>
      <ol className="mt-4 grid gap-3 sm:grid-cols-2">
        {anime.episodes.map((ep) => {
          const isActive = ep.number === active;
          return (
            <li key={ep.number}>
              <Link
                href={`${baseHref}?ep=${ep.number}`}
                aria-current={isActive ? "true" : undefined}
                className={cn(
                  "group flex items-center gap-3 rounded-2xl border p-2.5 pe-4 transition-all duration-200",
                  isActive
                    ? "border-purple-500/60 bg-purple-600/15 shadow-lg shadow-purple-900/20"
                    : "border-white/10 bg-white/[0.03] hover:border-purple-500/40 hover:bg-white/[0.06]"
                )}
              >
                <span className="relative h-16 w-28 shrink-0 overflow-hidden rounded-xl">
                  <Image
                    src={ep.thumbnail}
                    alt={ep.title[locale]}
                    fill
                    sizes="112px"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <span className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition group-hover:opacity-100">
                    <Play className="h-5 w-5 fill-white text-white rtl-flip" aria-hidden />
                  </span>
                  <span dir="ltr" className="absolute bottom-1 end-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-bold text-white">
                    {ep.duration}
                  </span>
                </span>
                <span className="min-w-0">
                  <span dir="ltr" className="text-[11px] font-bold uppercase tracking-widest text-purple-300">
                    EP {ep.number}
                  </span>
                  <span className="block truncate text-sm font-bold text-slate-100">
                    {ep.title[locale]}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
