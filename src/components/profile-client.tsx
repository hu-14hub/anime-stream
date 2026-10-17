"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { BookOpen, Clock, Heart, LayoutList, Star, Trash2 } from "lucide-react";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { Locale } from "@/i18n/config";
import { getAnimeBySlug } from "@/data/anime";
import { clearHistory, getHistory, getWatchedEpisodeCount } from "@/lib/library";
import { KEYS, getRatings } from "@/lib/store";
import { useStore } from "@/lib/use-store";
import { useFavorites, useWatchlist } from "@/lib/use-library";
import { BLUR_DATA_URL } from "@/lib/image";
import type { LibraryEntry, UserRating, WatchProgress } from "@/types";
import { cn } from "@/lib/utils";
import { statusColorClasses, statusLabel } from "@/lib/status-colors";

export type ProfileTab = "watchlist" | "favorites" | "history" | "ratings";

export function ProfileClient({ locale, dict: t }: { locale: Locale; dict: Dictionary }) {
  const [tab, setTab] = useState<ProfileTab>("watchlist");
  const watchlist = useWatchlist();
  const favorites = useFavorites();
  const [ratingsTick] = useStore<UserRating[]>(KEYS.ratings, []);
  const [progressTick] = useStore<WatchProgress[]>(KEYS.progress, []);

  const history = useMemo(() => getHistory(), [progressTick]);
  const allRatings = useMemo(() => getRatings(), [ratingsTick]);
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
        <Link href="/settings" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-neutral-200 transition-all duration-300 hover:bg-white/10 hover:text-white">
          {t.profile.settings}
        </Link>
      </div>
      <div className="mb-10 grid gap-4 sm:grid-cols-4">
        <StatCard icon={<LayoutList className="h-5 w-5 text-brand" />} label={t.profile.totalWatched} value={watchedCount} />
        <StatCard icon={<LayoutList className="h-5 w-5 text-brand" />} label={t.profile.listSize} value={watchlist.length} />
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
                active ? "border-brand text-white" : "border-transparent text-neutral-500 hover:text-neutral-200")}>
              <Icon className="h-4 w-4" aria-hidden />
              {def.label}
            </button>
          );
        })}
        {tab === "history" && history.length > 0 && (
          <button type="button" onClick={() => clearHistory()}
            className="ms-auto mb-2 flex shrink-0 items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-bold text-red-300 transition-all duration-300 hover:bg-red-500/20">
            <Trash2 className="h-3.5 w-3.5" aria-hidden />
            {t.profile.clearHistory}
          </button>
        )}
      </div>
      <TabGrid tab={tab} locale={locale} t={t} watchlist={watchlist} favorites={favorites} history={history} allRatings={allRatings} />
    </main>
  );
}
function TabGrid({ tab, locale, t, watchlist, favorites, history, allRatings }: {
  tab: ProfileTab; locale: Locale; t: Dictionary;
  watchlist: LibraryEntry[]; favorites: LibraryEntry[];
  history: WatchProgress[]; allRatings: UserRating[];
}) {
  if (tab === "watchlist") {
    if (!watchlist.length) return <Empty icon={LayoutList} text={t.profile.emptyWatchlist} />;
    return (
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {watchlist.map((entry) => {
          return (
            <LibraryCard key={entry.slug} entry={entry} locale={locale} t={t} badge={statusLabel(t, entry.status)} badgeClass={statusColorClasses(entry.status)} />
          );
        })}
      </div>
    );
  }
  if (tab === "favorites") {
    if (!favorites.length) return <Empty icon={Heart} text={t.profile.emptyFavorites} />;
    return (
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {favorites.map((entry) => (
          <LibraryCard key={entry.slug} entry={entry} locale={locale} t={t} badge={t.profile.favorites} badgeClass={statusColorClasses("favorite")} />
        ))}
      </div>
    );
  }
  return <HistoryRatings tab={tab} locale={locale} t={t} history={history} allRatings={allRatings} />;
}

/**
 * Renders a watchlist/favorites card straight from the stored snapshot so
 * AniList/Jikan-sourced titles (absent from the static catalog) still show.
 * The catalog is consulted only to enrich legacy entries missing fields.
 */
function LibraryCard({ entry, locale, t, badge, badgeClass }: {
  entry: LibraryEntry; locale: Locale; t: Dictionary;
  badge: string; badgeClass: string;
}) {
  const catalog = getAnimeBySlug(entry.slug);
  const title = (locale === "ar" ? entry.titleAr || entry.title : entry.title) || catalog?.title[locale] || entry.slug;
  const cover = entry.cover || catalog?.cover;
  const rating = entry.rating ?? catalog?.rating;
  const year = entry.year ?? catalog?.year;
  const episodes = entry.episodes ?? catalog?.episodeCount;
  return (
    <Link href={`/anime/${entry.slug}`} className="group block">
      <div className="relative mb-3 aspect-[3/4] overflow-hidden rounded-xl">
        {cover ? (
          <Image src={cover} alt={title} fill sizes="(max-width: 640px) 45vw, 20vw" loading="lazy" placeholder="blur" blurDataURL={BLUR_DATA_URL}
            className="object-cover transition-transform duration-300 group-hover:scale-110" />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-5xl font-black text-neutral-800">{title.slice(0, 1)}</span>
        )}
        <span className={cn("absolute start-2 top-2 rounded-full px-2.5 py-0.5 text-[10px] font-bold backdrop-blur", badgeClass)}>
          {badge}
        </span>
        {entry.format && (
          <span dir="ltr" className="absolute end-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-brand-300 backdrop-blur">
            {entry.format}
          </span>
        )}
        {rating != null && (
          <span dir="ltr" className="absolute bottom-2 start-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-bold text-amber-400 backdrop-blur">
            <Star className="h-3 w-3 fill-amber-400" aria-hidden />
            {rating.toFixed(1)}
          </span>
        )}
      </div>
      <h3 className="truncate text-sm font-bold text-neutral-100 group-hover:text-brand-300">{title}</h3>
      {(year != null || episodes != null) && (
        <p className="text-xs text-neutral-500" dir="ltr">
          {year}{year != null && episodes != null && " · "}
          {episodes != null && `${episodes} ${t.profile.episodes}`}
        </p>
      )}
    </Link>
  );
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
              <div className="relative mb-3 aspect-[3/4] overflow-hidden rounded-xl">
                <Image src={anime.cover} alt={anime.title[locale]} fill sizes="(max-width: 640px) 45vw, 20vw" loading="lazy" className="object-cover transition-transform duration-300 group-hover:scale-110" />
                <span dir="ltr" className="absolute bottom-1 end-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-bold text-white">EP {h.ep}</span>
              </div>
              <h3 className="truncate text-sm font-bold text-neutral-100 group-hover:text-brand-300">{anime.title[locale]}</h3>
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
            <div className="relative mb-3 aspect-[3/4] overflow-hidden rounded-xl">
              <Image src={anime.cover} alt={anime.title[locale]} fill sizes="(max-width: 640px) 45vw, 20vw" loading="lazy" className="object-cover transition-transform duration-300 group-hover:scale-110" />
            </div>
            <h3 className="truncate text-sm font-bold text-neutral-100 group-hover:text-brand-300">{anime.title[locale]}</h3>
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

function Empty({ text, icon: Icon }: { text: string; icon?: React.ElementType }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.03] px-6 py-16 text-center">
      {Icon && (
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5">
          <Icon className="h-6 w-6 text-neutral-500" aria-hidden />
        </span>
      )}
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


