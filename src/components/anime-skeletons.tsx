export function AnimeCardSkeleton() {
  return (
    <div aria-hidden>
      <div className="aspect-[3/4] animate-pulse rounded-xl bg-white/5" />
      <div className="mt-3 space-y-2">
        <div className="h-3.5 w-3/4 animate-pulse rounded bg-white/10" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-white/5" />
      </div>
    </div>
  );
}

export function AnimeGridSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3 sm:gap-8 lg:grid-cols-4 xl:grid-cols-5">
      {Array.from({ length: count }, (_, i) => (
        <AnimeCardSkeleton key={i} />
      ))}
    </div>
  );
}
