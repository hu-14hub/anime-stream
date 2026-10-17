import Image from "next/image";
import { BLUR_DATA_URL } from "@/lib/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Calendar, Clock, MonitorPlay, Play, Star, Trophy, Tv } from "lucide-react";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/server";
import { animeList, genres, getAnimeBySlug } from "@/data/anime";
import { anilistIdFromSlug, browseAnime, getAnimeDetail } from "@/services/anilistService";
import { getAiredEpisodeCount } from "@/lib/anime-availability";
import { getAnimeById as getJikanById, idFromSlug as jikanIdFromSlug } from "@/services/animeService";
import { AnimeCard } from "@/components/anime-card";
import { cn } from "@/lib/utils";
import { CharacterGrid } from "@/components/character-grid";
import { DetailTabs } from "@/components/detail-tabs";
import { EpisodeList } from "@/components/episode-list";
import { CommentsSection } from "@/components/comments-section";
import { WatchlistButton } from "@/components/watchlist-button";
import { RatingInput } from "@/components/rating-input";
import { TrailerButton } from "@/components/trailer-button";

export function generateStaticParams() {
  return animeList.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getLocale();
  let anime = getAnimeBySlug(slug);
  const alId = anilistIdFromSlug(slug);
  if (!anime && alId) {
    try {
      anime = await getAnimeDetail(alId);
    } catch {
      /* fallback to generic metadata */
    }
  }
  if (!anime) return {};
  return {
    title: anime.title[locale],
    description: anime.synopsis[locale].slice(0, 160),
  };
}

export default async function AnimeDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const locale = await getLocale();
  const t = getDictionary(locale);
  let anime = getAnimeBySlug(slug);
  const alId = anilistIdFromSlug(slug);
  const jikanId = jikanIdFromSlug(slug);
  if (!anime && alId) {
    try {
      anime = await getAnimeDetail(alId);
    } catch { /* try Jikan fallback below */ }
  }
  if (!anime && jikanId) {
    try {
      anime = await getJikanById(jikanId);
    } catch { /* fallback below */ }
  }
  if (!anime) notFound();
  const BackIcon = locale === "ar" ? ArrowRight : ArrowLeft;

  // Related: prefer live AniList results by first genre; fall back to mock list.
  let related = animeList
    .filter((a) => a.id !== anime.id && a.genres.some((g) => anime.genres.includes(g)))
    .slice(0, 4);
  if (anime.genres.length > 0) {
    try {
      const r = await browseAnime({ genre: anime.genres[0], page: 1, perPage: 8 });
      const live = r.items.filter((a) => a.id !== anime.id).slice(0, 4);
      if (live.length) related = live;
    } catch {
      /* keep mock related */
    }
  }
  const recommendations = anime.recommendations?.length ? anime.recommendations.slice(0, 8) : related;
  const characters = anime.characters ?? [];
  const statusLabel = anime.status === "ongoing" ? t.detail.ongoing : t.detail.completed;
  const airedCount = getAiredEpisodeCount(anime);

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-neutral-400">
        <Link href="/" className="inline-flex items-center gap-1.5 rounded-full transition-colors duration-300 hover:text-white">
          <BackIcon className="h-3.5 w-3.5" aria-hidden />
          {t.nav.home}
        </Link>
        <span aria-hidden className="text-neutral-600">/</span>
        <span aria-current="page" className="max-w-[40vw] truncate text-neutral-200">
          {anime.title[locale]}
        </span>
      </nav>

      {/* Rich metadata header: backdrop + poster + native/romaji/english titles.
          NOTE: no `overflow-hidden` here — it would clip the Watchlist dropdown.
          Rounded top corners are instead clipped on the banner container below. */}
      <header className="relative mt-4 rounded-3xl border border-white/5">
        <div className="relative h-52 w-full overflow-hidden rounded-t-3xl sm:h-72 lg:h-80">
          <Image src={anime.banner} alt="" fill priority sizes="100vw" className="object-cover" placeholder="blur" blurDataURL={BLUR_DATA_URL} />
          <div
            className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/75 to-neutral-950/25"
            aria-hidden
          />
        </div>
        <div className="relative -mt-28 flex flex-col gap-6 px-5 pb-7 sm:flex-row sm:gap-7 sm:px-7">
          <div className="relative h-44 w-full sm:h-56 sm:w-40 shrink-0 self-start overflow-hidden rounded-xl border-2 border-white/15 shadow-2xl">
            <Image src={anime.cover} alt={anime.title[locale]} fill sizes="160px" priority className="object-cover" placeholder="blur" blurDataURL={BLUR_DATA_URL} />
          </div>
          <div className="min-w-0 flex-1 pt-1 sm:pt-3">
            <h1 className={cn("text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl", locale === "en" && "font-amagro")}>
              {anime.title[locale]}
            </h1>
            {(anime.romajiTitle || anime.nativeTitle) && (
              <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-neutral-400">
                {anime.romajiTitle && (
                  <span>
                    <span className="text-neutral-600">{t.detail.romajiTitle}: </span>
                    <span dir="ltr">{anime.romajiTitle}</span>
                  </span>
                )}
                {anime.nativeTitle && (
                  <span>
                    <span className="text-neutral-600">{t.detail.nativeTitle}: </span>
                    <span dir="ltr">{anime.nativeTitle}</span>
                  </span>
                )}
              </p>
            )}

            {/* Quick meta: score · IMDb · awards · year · status · format · episodes */}
            <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-neutral-300">
              <span className="flex items-center gap-1.5 font-bold text-amber-400">
                <Star className="h-4 w-4 fill-amber-400" aria-hidden />
                <span dir="ltr">{anime.rating.toFixed(1)}</span>
              </span>
              {anime.imdbRating != null && (
                <span
                  className="flex items-center gap-1.5 rounded-full bg-yellow-500/15 px-2.5 py-1 text-xs font-bold text-yellow-400"
                  aria-label={t.detail.imdbRating}
                >
                  <span dir="ltr" aria-hidden className="rounded bg-yellow-400 px-1 py-px text-[9px] font-black uppercase tracking-wide text-neutral-950">
                    IMDb
                  </span>
                  <span dir="ltr">
                    {typeof anime.imdbRating === "number" ? anime.imdbRating.toFixed(1) : anime.imdbRating}
                  </span>
                </span>
              )}
              {(anime.animeAwardsCount ?? 0) > 0 && (
                <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-300">
                  <Trophy className="h-4 w-4 text-amber-400" aria-hidden />
                  <span dir="ltr">{anime.animeAwardsCount}</span> {t.detail.animeAwards}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" aria-hidden />
                <span dir="ltr">{anime.year}</span>
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-neutral-200">
                {statusLabel}
              </span>
              {anime.format && (
                <span className="flex items-center gap-1.5 text-xs font-semibold text-neutral-400">
                  <Tv className="h-3.5 w-3.5" aria-hidden />
                  <span dir="ltr">{anime.format}</span>
                </span>
              )}
              <span className="flex items-center gap-1.5 text-xs font-semibold text-neutral-400">
                <MonitorPlay className="h-3.5 w-3.5" aria-hidden />
                {anime.episodeCount > 0 ? (
                  <>
                    <span dir="ltr">{airedCount === anime.episodeCount ? anime.episodeCount : `${airedCount}/${anime.episodeCount}`}</span> {t.detail.episodes}
                  </>
                ) : (
                  <span dir="ltr">{anime.status === "ongoing" ? t.detail.ongoing : "0"}</span>
                )}
              </span>
            </p>

            {/* Genre tags */}
            <div className="mt-4 flex flex-wrap gap-2">
              {anime.genres.map((g) => (
                <Link
                  key={g}
                  href={`/catalog?genres=${g}`}
                  className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-neutral-200 backdrop-blur transition-colors duration-300 hover:bg-brand/15 hover:text-brand-300"
                >
                  {genres.find((x) => x.key === g)?.label[locale] ?? g}
                </Link>
              ))}
            </div>

            {/* Actions: watch · trailer · watchlist */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href={`/anime/${anime.slug}/watch?ep=1`}
                className="flex items-center gap-2 rounded-full bg-brand px-7 py-3.5 text-sm font-bold text-neutral-950 shadow-xl shadow-brand/25 transition-all duration-300 hover:scale-105 hover:bg-brand-300"
              >
                <Play className="h-4 w-4 fill-neutral-950 rtl-flip" aria-hidden />
                {t.hero.watchNow}
              </Link>
              {anime.trailerUrl && (
                <TrailerButton label={t.detail.watchTrailer} trailerUrl={anime.trailerUrl} />
              )}
              <WatchlistButton anime={anime} dict={t} />
            </div>
          </div>
        </div>
      </header>

      {/* Synopsis + information + user rating */}
      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <section aria-labelledby="synopsis-heading" className="lg:col-span-2">
          <h2 id="synopsis-heading" className="text-xl font-extrabold tracking-tight text-white">
            {t.detail.synopsis}
          </h2>
          <p className="mt-3 max-w-3xl whitespace-pre-line text-base leading-8 text-neutral-300">
            {anime.synopsis[locale]}
          </p>

          <dl className="mt-6 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
            <div className="rounded-xl bg-white/[0.04] p-4">
              <dt className="text-xs text-neutral-500">{t.detail.status}</dt>
              <dd className="mt-1.5 font-bold text-white">{statusLabel}</dd>
            </div>
            <div className="rounded-xl bg-white/[0.04] p-4">
              <dt className="text-xs text-neutral-500">{t.detail.totalEpisodes}</dt>
              <dd dir="ltr" className="mt-1.5 font-bold text-white">
                {anime.episodeCount}
              </dd>
            </div>
            <div className="rounded-xl bg-white/[0.04] p-4">
              <dt className="text-xs text-neutral-500">{t.detail.studio}</dt>
              <dd className="mt-1.5 truncate font-bold text-white">{anime.studio[locale]}</dd>
            </div>
            <div className="rounded-xl bg-white/[0.04] p-4">
              <dt className="text-xs text-neutral-500">{t.detail.rating}</dt>
              <dd dir="ltr" className="mt-1.5 font-bold text-white">
                {anime.rating.toFixed(1)}
              </dd>
            </div>
            <div className="rounded-xl bg-white/[0.04] p-4">
              <dt className="text-xs text-neutral-500">{t.detail.format}</dt>
              <dd dir="ltr" className="mt-1.5 font-bold text-white">
                {anime.format ?? "—"}
              </dd>
            </div>
            <div className="rounded-xl bg-white/[0.04] p-4">
              <dt className="text-xs text-neutral-500">{t.detail.year}</dt>
              <dd dir="ltr" className="mt-1.5 font-bold text-white">
                {anime.year}
              </dd>
            </div>
            <div className="rounded-xl bg-white/[0.04] p-4">
              <dt className="text-xs text-neutral-500">{t.detail.seasonLabel}</dt>
              <dd className="mt-1.5 font-bold text-white" dir="ltr">
                {anime.season ? `${anime.season} ${anime.seasonYear ?? ""}` : "—"}
              </dd>
            </div>
            <div className="rounded-xl bg-white/[0.04] p-4">
              <dt className="text-xs text-neutral-500">{t.detail.duration}</dt>
              <dd dir="ltr" className="mt-1.5 font-bold text-white">
                {anime.duration ? `${anime.duration}m` : "—"}
              </dd>
            </div>
          </dl>
        </section>

        <aside className="h-fit space-y-5 rounded-2xl border border-white/5 bg-white/[0.03] p-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-500">
              {t.detail.youScored}
            </p>
            <div className="mt-3">
              <RatingInput slug={anime.slug} dict={t} />
            </div>
          </div>
        </aside>
      </div>

      {/* Interactive tabs: episodes · characters · related · recommendations · comments */}
      <section className="mt-12 pb-8">
        <DetailTabs
          ariaLabel={t.detail.information}
          tabs={[
            {
              id: "episodes",
              label: t.detail.episodesTab,
              badge: anime.episodes.length,
              node: (
                <EpisodeList
                  anime={anime}
                  locale={locale}
                  dict={t}
                  baseHref={`/anime/${anime.slug}/watch`}
                />
              ),
            },
            {
              id: "characters",
              label: t.detail.characters,
              badge: characters.length,
              node: <CharacterGrid characters={characters} emptyLabel={t.admin.noItems} />,
            },
            {
              id: "related",
              label: t.detail.related,
              badge: related.length,
              node: (
                <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
                  {related.map((a) => (
                    <AnimeCard key={a.id} anime={a} locale={locale} dict={t} />
                  ))}
                </div>
              ),
            },
            {
              id: "recommendations",
              label: t.detail.recommendations,
              badge: recommendations.length,
              node: (
                <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
                  {recommendations.map((a) => (
                    <AnimeCard key={`rec-${a.id}`} anime={a} locale={locale} dict={t} />
                  ))}
                </div>
              ),
            },
            {
              id: "comments",
              label: t.detail.comments,
              node: (
                <div className="max-w-3xl">
                  <CommentsSection target={`anime:${anime.slug}`} dict={t} />
                </div>
              ),
            },
          ]}
        />
      </section>
    </main>
  );
}

