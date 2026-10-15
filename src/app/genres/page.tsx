import Link from "next/link";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/server";
import { genres } from "@/data/anime";

export default async function GenresPage() {
  const locale = await getLocale();
  const t = getDictionary(locale);

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10">
      <h1 className="text-3xl font-extrabold">{t.nav.genres}</h1>
      <p className="mt-1 text-sm text-slate-400">{t.catalog.filterByGenre}</p>
      <div className="mt-6 flex flex-wrap gap-2">
        {genres.map((g) => (
          <Link
            key={g.key}
            href={`/catalog?genre=${g.key}`}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm transition hover:border-purple-500/50 hover:bg-white/10"
          >
            {g.label[locale]}
          </Link>
        ))}
      </div>
    </main>
  );
}
