export function AnimeCardSkeleton() {
  return (
    <div aria-hidden className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
      <div className="aspect-[3/4] animate-pulse bg-white/10" />
      <div className="space-y-2 p-3">
        <div className="h-3.5 w-3/4 animate-pulse rounded bg-white/10" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-white/5" />
      </div>
    </div>
  );
}

export function AnimeGridSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {Array.from({ length: count }, (_, i) => (
        <AnimeCardSkeleton key={i} />
      ))}
    </div>
  );
}
