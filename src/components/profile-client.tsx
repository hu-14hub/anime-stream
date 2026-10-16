"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { BookOpen, Clock, Heart, LayoutList, Star, Trash2 } from "lucide-react";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { Locale } from "@/i18n/config";
import { getAnimeBySlug } from "@/data/anime";
import { clearHistory, getFavorites, getHistory, getWatchedEpisodeCount } from "@/lib/library";
import { KEYS, getRatings } from "@/lib/store";
import { useStore } from "@/lib/use-store";
import type { LibraryEntry, UserRating, WatchProgress } from "@/types";
import { cn } from "@/lib/utils";

export type ProfileTab = "watchlist" | "favorites" | "history" | "ratings";

export function ProfileClient({ locale, dict: t }: { locale: Locale; dict: Dictionary }) {
  const [tab, setTab] = useState<ProfileTab>("watchlist");
  const [library] = useStore<LibraryEntry[]>(KEYS.library, []);
  const [ratingsTick] = useStore<UserRating[]>(KEYS.ratings, []);
  const [progressTick] = useStore<WatchProgress[]>(KEYS.progress, []);

  const favorites = useMemo(() => getFavorites(), [library, tab, ratingsTick]);
  const history = useMemo(() => getHistory(), [progressTick, tab]);
  const allRatings = useMemo(() => getRatings(), [ratingsTick, tab]);
  const watchedCount = useMemo(() => getWatchedEpisodeCount(), [progressTick]);

  const tabs: Record<ProfileTab, { label: string; icon: React.ElementType }> = {
    watchlist: { label: t.profile.watchlist, icon: LayoutList },
    favorites: { label: t.profile.favorites, icon: Heart },
    history: { label: t.profile.history, icon: Clock },
    ratings: { label: t.profile.ratings, icon: Star },
  };
  const avg = allRatings.length
    ? (allRatings.reduce((s, r) => s + r.score, 0) / allRatings.length).toFixed(1)
    : "—";

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 sm:py-12">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">{t.profile.title}</h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-neutral-400">
            <BookOpen className="h-4 w-4" aria-hidden />
            {t.profile.signInNote}
          </p>
        </div>
        <Link href="/settings" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-neutral-200 transition hover:bg-white/10 hover:text-white">
          {t.profile.settings}
        </Link>
      </div>
      <div className="mb-10 grid gap-4 sm:grid-cols-4">
        <StatCard icon={<LayoutList className="h-5 w-5 text-cyan-400" />} label={t.profile.totalWatched} value={watchedCount} />
        <StatCard icon={<LayoutList className="h-5 w-5 text-cyan-400" />} label={t.profile.listSize} value={library.length} />
        <StatCard icon={<Heart className="h-5 w-5 text-red-400" />} label={t.profile.favorites} value={favorites.length} />
        <StatCard icon={<Star className="h-5 w-5 text-amber-400" />} label={t.profile.avgScore} value={avg} />
      </div>
      <div role="tablist" aria-label="Profile tabs" className="mb-8 flex gap-1 overflow-x-auto border-b border-white/10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {(Object.keys(tabs) as ProfileTab[]).map((key) => {
          const def = tabs[key];
          const Icon = def.icon;
          const active = tab === key;
          return (
            <button key={key} role="tab" aria-selected={active} onClick={() => setTab(key)}
              className={cn("flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold transition",
                active ? "border-cyan-400 text-white" : "border-transparent text-neutral-500 hover:text-neutral-200")}>
              <Icon className="h-4 w-4" aria-hidden />
              {def.label}
            </button>
          );
        })}
        {tab === "history" && history.length > 0 && (
          <button type="button" onClick={() => { clearHistory(); window.location.reload(); }}
            className="ms-auto mb-2 flex shrink-0 items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-bold text-red-300 transition hover:bg-red-500/20">
            <Trash2 className="h-3.5 w-3.5" aria-hidden />
            {t.profile.clearHistory}
          </button>
        )}
      </div>
      <TabGrid tab={tab} locale={locale} t={t} library={library} favorites={favorites} history={history} allRatings={allRatings} />
    </main>
  );
}
function TabGrid({ tab, locale, t, library, favorites, history, allRatings }: {
  tab: ProfileTab; locale: Locale; t: Dictionary;
  library: LibraryEntry[]; favorites: LibraryEntry[];
  history: WatchProgress[]; allRatings: UserRating[];
}) {
  if (tab === "watchlist") {
    if (!library.length) return <Empty text={t.profile.emptyWatchlist} />;
    return (
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {library.map((entry) => {
          const anime = getAnimeBySlug(entry.slug);
          if (!anime) return null;
          const label = (t.watchlist as Record<string, string>)[entry.status] ?? entry.status;
          return (
            <Link key={entry.slug} href={`/anime/${entry.slug}`} className="group block">
              <div className="relative mb-3 aspect-[3/4] overflow-hidden rounded-xl bg-neutral-900">
                <Image src={anime.cover} alt={anime.title[locale]} fill sizes="(max-width: 640px) 45vw, 20vw" className="object-cover transition-transform duration-300 group-hover:scale-110" />
                <span className="absolute start-2 top-2 rounded-full bg-cyan-400/15 px-2.5 py-0.5 text-[10px] font-bold text-cyan-300 backdrop-blur">{label}</span>
              </div>
              <h3 className="truncate text-sm font-bold text-neutral-100 group-hover:text-cyan-300">{anime.title[locale]}</h3>
              <p className="text-xs text-neutral-500" dir="ltr">{anime.year} · {anime.episodeCount} {t.profile.episodes}</p>
            </Link>
          );
        })}
      </div>
    );
  }
  if (tab === "favorites") {
    if (!favorites.length) return <Empty text={t.profile.emptyWatchlist} />;
    return (
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {favorites.map((entry) => {
          const anime = getAnimeBySlug(entry.slug);
          if (!anime) return null;
          return (
            <Link key={entry.slug} href={`/anime/${entry.slug}`} className="group block">
              <div className="relative mb-3 aspect-[3/4] overflow-hidden rounded-xl bg-neutral-900">
                <Image src={anime.cover} alt={anime.title[locale]} fill sizes="(max-width: 640px) 45vw, 20vw" className="object-cover transition-transform duration-300 group-hover:scale-110" />
                <span className="absolute start-2 top-2 rounded-full bg-red-500/15 px-2.5 py-0.5 text-[10px] font-bold text-red-400 backdrop-blur">{t.profile.favorites}</span>
              </div>
              <h3 className="truncate text-sm font-bold text-neutral-100 group-hover:text-cyan-300">{anime.title[locale]}</h3>
              <p className="text-xs text-neutral-500" dir="ltr">{anime.year} · {anime.episodeCount} {t.profile.episodes}</p>
            </Link>
          );
        })}
      </div>
    );
  }
  return <HistoryRatings tab={tab} locale={locale} t={t} history={history} allRatings={allRatings} />;
}

function HistoryRatings({ tab, locale, t, history, allRatings }: {
  tab: ProfileTab; locale: Locale; t: Dictionary;
  history: WatchProgress[]; allRatings: UserRating[];
}) {
  if (tab === "history") {
    if (!history.length) return <Empty text={t.profile.emptyHistory} />;
    return (
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {history.slice(0, 40).map((h, i) => {
          const anime = getAnimeBySlug(h.slug);
          if (!anime) return null;
          return (
            <Link key={`${h.slug}-${h.ep}-${i}`} href={`/anime/${h.slug}/watch?ep=${h.ep}`} className="group block">
              <div className="relative mb-3 aspect-[3/4] overflow-hidden rounded-xl bg-neutral-900">
                <Image src={anime.cover} alt={anime.title[locale]} fill sizes="(max-width: 640px) 45vw, 20vw" className="object-cover transition-transform duration-300 group-hover:scale-110" />
                <span dir="ltr" className="absolute bottom-1 end-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-bold text-white">EP {h.ep}</span>
              </div>
              <h3 className="truncate text-sm font-bold text-neutral-100 group-hover:text-cyan-300">{anime.title[locale]}</h3>
              <p className="text-xs text-neutral-500">{t.profile.lastWatched}: <span dir="ltr">{new Date(h.updatedAt).toLocaleDateString()}</span></p>
            </Link>
          );
        })}
      </div>
    );
  }
  if (!allRatings.length) return <Empty text={t.profile.emptyRatings} />;
  return (
    <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {allRatings.map((r) => {
        const anime = getAnimeBySlug(r.slug);
        if (!anime) return null;
        return (
          <Link key={r.slug} href={`/anime/${r.slug}`} className="group block">
            <div className="relative mb-3 aspect-[3/4] overflow-hidden rounded-xl bg-neutral-900">
              <Image src={anime.cover} alt={anime.title[locale]} fill sizes="(max-width: 640px) 45vw, 20vw" className="object-cover transition-transform duration-300 group-hover:scale-110" />
            </div>
            <h3 className="truncate text-sm font-bold text-neutral-100 group-hover:text-cyan-300">{anime.title[locale]}</h3>
            <div dir="ltr" className="mt-1 flex items-center gap-1 text-xs font-bold text-amber-400">
              <Star className="h-3.5 w-3.5 fill-amber-400" aria-hidden />
              {r.score}/10
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.03] px-6 py-16 text-center">
      <p className="text-sm text-neutral-400">{text}</p>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-5">
      <div className="flex items-center gap-3">
        {icon}
        <span className="ms-auto text-[10px] font-bold uppercase tracking-widest text-neutral-500">{label}</span>
      </div>
      <div dir="ltr" className="mt-3 text-3xl font-black text-white">{value}</div>
    </div>
  );
}

