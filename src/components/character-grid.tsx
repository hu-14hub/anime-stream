"use client";

import Image from "next/image";
import type { AnimeCharacter } from "@/types";
import { BLUR_DATA_URL } from "@/lib/image";

/** Responsive character cast grid for the details page. */
export function CharacterGrid({
  characters,
  emptyLabel,
}: {
  characters: AnimeCharacter[];
  emptyLabel: string;
}) {
  if (!characters.length) {
    return <p className="rounded-xl bg-white/[0.03] px-4 py-10 text-center text-sm text-neutral-500">{emptyLabel}</p>;
  }
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
      {characters.map((c) => (
        <li
          key={c.id}
          className="group flex items-center gap-3 rounded-xl bg-white/[0.03] p-3 transition-colors duration-300 hover:bg-white/[0.07]"
        >
          <span className="relative h-14 w-14 overflow-hidden rounded-full bg-neutral-900 ring-1 ring-white/10">
            {c.image && (
              <Image
                src={c.image}
                alt={c.name}
                fill
                sizes="56px"
                className="object-cover transition-transform duration-300 group-hover:scale-110"
                placeholder="blur"
                blurDataURL={BLUR_DATA_URL}
              />
            )}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-bold text-neutral-100" dir="ltr">
              {c.name}
            </span>
            {c.role && (
              <span className="mt-0.5 block truncate text-[11px] font-semibold uppercase tracking-wider text-brand/80" dir="ltr">
                {c.role}
              </span>
            )}
          </span>
        </li>
      ))}
    </ul>
  );
}