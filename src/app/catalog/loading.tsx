import { AnimeGridSkeleton } from "@/components/anime-skeletons";

export default function CatalogLoading() {
  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8" aria-busy="true" aria-label="Loading">
      <div className="h-8 w-56 animate-pulse rounded-lg bg-white/10" />
      <div className="mt-2 h-4 w-40 animate-pulse rounded bg-white/5" />
      <div className="mt-6 flex flex-wrap gap-2">
        {Array.from({ length: 7 }, (_, i) => (
          <div key={i} className="h-8 w-20 animate-pulse rounded-full bg-white/5" />
        ))}
      </div>
      <AnimeGridSkeleton count={10} />
    </main>
  );
}
