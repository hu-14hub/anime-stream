"use client";

import Link from "next/link";
import { Clapperboard } from "lucide-react";

export function Logo({ name }: { name: string }) {
  return (
    <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label={name}>
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-400 shadow-lg shadow-cyan-500/25">
        <Clapperboard className="h-5 w-5 text-neutral-950" aria-hidden />
      </span>
      <span className="text-lg font-extrabold tracking-tight text-white">
        {name}
      </span>
    </Link>
  );
}
