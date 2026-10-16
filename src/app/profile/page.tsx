import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { BookOpen, Clock, Film, Heart, LayoutList, Star } from "lucide-react";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/server";
import { animeList, getAnimeBySlug } from "@/data/anime";
import { getLibrary, getFavorites, getHistory, getWatchedEpisodeCount, LibraryEntry } from "@/lib/library";
import { getRatings, getRating } from "@/lib/store";
import { KEYS, useStore } from "@/lib/use-store";
import type { Anime } from "@/types";

export const dynamic = "force-dynamic";

type Tab = "watchlist" | "favorites" | "history" | "ratings";

export default async function ProfilePage() {
  const locale = await getLocale();
  const t = getDictionary(locale);
  const [tab, setTab] = useState<Tab>("watchlist");

  const [library] = useStore<LibraryEntry[]>(KEYS.library, []);
  const [ratings] = useStore<any[]>(KEYS.ratings, []);
  const favorites = getFavorites();
  const history = getHistory();
  const allRatings = getRatings();

  const bySlug = new Map(library.map((e) => [e.slug, e]));
  const titles: Anime[] = [];
  for (const slug of bySlug.keys()) {
    const a = getAnimeBySlug(slug);
    if (a) titles.push(a);
  }

  const tabData: Record<Tab, { label: string; icon: React.ElementType; items: any[] }> = {
    watchlist: {
      label: t.profile.watchlist,
      icon: LayoutList,
      items: library,
    },
    favorites: {
      label: t.profile.favorites,
      icon: Heart,
      items: favorites,
    },
    history: {
      label: t.profile.history,
      icon: Clock,
      items: history,
    },
    ratings: {
      label: t.profile.ratings,
      icon: Star,
      items: allRatings,
    },
  };

  const current = tabData[tab];
  const current = tabData[tab];
  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 sm:py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">{t.profile.title}</h1>
          <p className="text-sm text-neutral-400">{t.profile.signInNote}</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-4 mb-10">
        <StatCard
          icon={<Film className="h-5 w-5 text-cyan-400" />}
          label={t.profile.totalWatched}
          value={getWatchedEpisodeCount()}
        />
        <StatCard
          icon={<LayoutList className="h-5 w-5 text-cyan-400" />}
          label={t.profile.listSize}
          value={library.length}
        />
        <StatCard
          icon={<Heart className="h-5 w-5 text-red-400" />}
          label={t.profile.favorites}
          value={favorites.length}
        />
        <StatCard
          icon={<Star className="h-5 w-5 text-amber-400" />}
          label={t.profile.avgScore}
          value={
            allRatings.length
              ? (allRatings.reduce((s, r) => s + r.score, 0) / allRatings.length).toFixed(1)
              : "—"
          }
        />
      </div>

      {/* Tab strip */}
      <div role="tablist" aria-label="Profile tabs" className="flex gap-1 border-b border-white/10 mb-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {Object.entries(tabData).map(([key, def]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            onClick={() => setTab(key as Tab)}
            className={`shrink-0 px-4 py-3 text-sm font-bold transition-colors duration-300 ${
              tab === key ? "text-cyan-300" : "text-neutral-400 hover:text-white"
            }`}
          >
            <def.icon className="h-4 w-4 mr-1.5" aria-hidden />
            {def.label}
          </button>
        ))}
      </div>

      {/* Tab panels */}
      <div className="space-y-6">
        {current.items.length === 0 ? (
          <div className="rounded-2xl bg-white/[0.03] p-16 text-center">
            <p className="text-neutral-500 text-sm">
              {tab === "watchlist"
                ? t.profile.emptyWatchlist
                : tab === "history"
                  ? t.profile.emptyHistory
                  : t.profile.emptyRatings}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {current.items.map((item) => {
              const anime = titles.find((a) => a.slug === item.slug);
              if (!anime) return null;
              const entry = library.find((e) => e.slug === anime.slug);
              const rating = getRating(anime.slug);
              return (
                <Link key={anime.slug} href={`/anime/${anime.slug}`} className="group block">
                  <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-neutral-900 mb-3">
                    <Image
                      src={anime.cover}
                      alt={anime.title[locale]}
                      fill
                      sizes="(max-width: 640px) 45vw, 20vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    {tab === "history" && entry && (
                      <span
                        dir="ltr"
                        className="absolute bottom-1 end-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-bold text-white"
                      >
                        EP {entry.progress ?? 0}
                      </span>
                    )}
                    {tab === "watchlist" && entry && (
                      <span
                        className="absolute top-2 start-2 rounded-full bg-cyan-400/15 px-2.5 py-0.5 text-[10px] font-bold text-cyan-300 backdrop-blur"
                      >
                        {entry.status}
                      </span>
                    )}
                    {tab === "favorites" && (
                      <span
                        className="absolute top-2 start-2 rounded-full bg-red-500/15 px-2.5 py-0.5 text-[10px] font-bold text-red-400 backdrop-blur"
                      >
                        {t.profile.favorites}
                      </span>
                    )}
                  </div>
                  <h3 className="truncate text-sm font-bold text-neutral-100 group-hover:text-cyan-300">
                    {anime.title[locale]}
                  </h3>
                  <p className="text-xs text-neutral-500" dir="ltr">
                    {anime.year} · {anime.episodeCount} {t.card.episodes}
                  </p>
                  {tab === "ratings" && rating && (
                    <div dir="ltr" className="flex items-center gap-1 text-xs font-bold text-amber-400 mt-1">
                      {rating.score}/10
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-5">
      <div className="flex items-center gap-3">
        {icon}
        <span className="ml-auto text-[10px] font-bold uppercase tracking-widest text-neutral-500">
          {label}
        </span>
      </div>
      <div dir="ltr" className="mt-3 text-3xl font-black text-white">
        {value}
      </div>
    </div>
  );
}
