import Link from "next/link";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/server";
import { genres } from "@/data/anime";

export default async function GenresPage() {
  const locale = await getLocale();
  const t = getDictionary(locale);

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 sm:py-12">
      <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">{t.nav.genres}</h1>
      <p className="mt-2 text-sm leading-6 text-neutral-400 sm:text-base sm:leading-7">{t.catalog.filterByGenre}</p>
      <div className="mt-6 flex flex-wrap gap-2.5">
        {genres.map((g) => (
          <Link
            key={g.key}
            href={`/catalog?genre=${g.key}`}
            className="rounded-full bg-white/5 px-5 py-2.5 text-sm font-medium text-neutral-200 transition-colors duration-300 hover:bg-white/10 hover:text-white"
          >
            {g.label[locale]}
          </Link>
        ))}
      </div>
    </main>
  );
}
