"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { ToriiGate } from "./torii-gate";

const TAGLINE = "アニメの世界へ";

interface LogoProps {
  name: string;
  className?: string;
}

/**
 * Brand mark: a glowing Torii Gate (鳥居) icon set inside a soft cyan tile,
 * paired with the brand name and a subtle Japanese tagline. Reused by the
 * navbar header — also mirrored in the footer for brand consistency.
 */
export function Logo({ name, className }: LogoProps) {
  return (
    <Link
      href="/"
      className={cn("group flex shrink-0 items-center gap-3", className)}
      aria-label={name}
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 ring-1 ring-inset ring-cyan-400/25 shadow-lg shadow-cyan-500/20 transition-shadow duration-300 group-hover:shadow-cyan-400/40">
        <ToriiGate className="h-6 w-6 text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.5)] transition-all duration-300 group-hover:drop-shadow-[0_0_12px_rgba(6,182,212,0.8)]" />
      </span>
      <span className="flex flex-col leading-none">
        <span className="text-lg font-extrabold tracking-tight text-white">
          {name}
        </span>
        <span className="mt-1.5 whitespace-nowrap font-jp text-[0.7rem] font-medium leading-none tracking-[0.3em] text-muted-foreground/80">
          {TAGLINE}
        </span>
      </span>
    </Link>
  );
}
