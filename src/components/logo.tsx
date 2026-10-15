"use client";

import Link from "next/link";
import { Clapperboard } from "lucide-react";

export function Logo({ name }: { name: string }) {
  return (
    <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label={name}>
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg shadow-purple-900/40">
        <Clapperboard className="h-5 w-5 text-white" aria-hidden />
      </span>
      <span className="text-lg font-extrabold tracking-tight">
        <span className="bg-gradient-to-r from-indigo-400 to-fuchsia-400 bg-clip-text text-transparent">
          {name}
        </span>
      </span>
    </Link>
  );
}
