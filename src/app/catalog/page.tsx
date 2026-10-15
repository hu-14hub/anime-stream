import Link from "next/link";
import { SearchX } from "lucide-react";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/server";
import { AnimeCard } from "@/components/anime-card";
import { animeList, genres } from "@/data/anime";
import { cn } from "@/lib/utils";

export default async function CatalogPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const locale = await getLocale();
  const t = getDictionary(locale);
  const params = (await searchParams) ?? {};
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const genre = typeof params.genre === "string" ? params.genre : "";

  const results = animeList.filter((a) => {
    const matchQ = q
      ? a.title.en.toLowerCase().includes(q.toLowerCase()) || a.title.ar.includes(q)
      : true;
    const matchGenre = genre ? a.genres.includes(genre) : true;
    return matchQ && matchGenre;
  });

  const chip = (href: string, active: boolean, label: string) => (
    <Link
      key={href + label}
      href={href}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-4 py-1.5 text-xs font-semibold transition-all duration-200",
        active
          ? "border-transparent bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-purple-900/30"
          : "border-white/10 bg-white/5 text-slate-300 hover:border-purple-500/40 hover:text-white"
      )}
    >
      {label}
    </Link>
  );

  const withGenre = (g: string) =>
    `/catalog?${new URLSearchParams({
      ...(q ? { q } : {}),
      ...(g ? { genre: g } : {}),
    }).toString()}`;

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
      <h1 className="text-3xl font-extrabold tracking-tight">{t.catalog.title}</h1>
      <p className="mt-1 text-sm text-slate-400">
        {t.catalog.subtitle} · <span dir="ltr">{results.length}</span> {t.catalog.results}
      </p>

      <div className="mt-6">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
          {t.catalog.filterByGenre}
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {chip("/catalog" + (q ? `?q=${encodeURIComponent(q)}` : ""), !genre, t.catalog.all)}
          {genres.map((g) => chip(withGenre(g.key), genre === g.key, g.label[locale]))}
        </div>
      </div>

      {results.length === 0 ? (
        <div className="mt-8 flex flex-col items-center gap-3 rounded-3xl border border-dashed border-white/15 bg-white/[0.03] px-6 py-16 text-center">
          <SearchX className="h-10 w-10 text-slate-500" aria-hidden />
          <p className="font-semibold text-slate-300">{t.catalog.noResults}</p>
          <Link
            href="/catalog"
            className="rounded-full bg-white/10 px-5 py-2 text-sm font-semibold transition hover:bg-white/15"
          >
            {t.catalog.all}
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {results.map((a) => (
            <AnimeCard key={a.id} anime={a} locale={locale} dict={t} />
          ))}
        </div>
      )}
    </main>
  );
}

