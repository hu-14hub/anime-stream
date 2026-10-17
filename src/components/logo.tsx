"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { ToriiGate } from "./torii-gate";

const TAGLINE = "アニメの世界へ";

interface LogoProps {
  name: string;
  locale?: "en" | "ar";
  className?: string;
}

/**
 * Brand mark: a glowing Torii Gate (鳥居) icon set inside a soft cyan tile,
 * paired with the brand name and a subtle Japanese tagline. Reused by the
 * navbar header — also mirrored in the footer for brand consistency.
 */
export function Logo({ name, locale = "en", className }: LogoProps) {
  return (
    <Link
      href="/"
      className={cn("group flex shrink-0 items-center gap-3", className)}
      aria-label={name}
    >
      <span className="relative flex shrink-0">
        {/* Soft pulsing aura behind the Torii tile (decorative, non-blocking). */}
        <span
          aria-hidden
          className="pointer-events-none absolute -inset-2.5 rounded-2xl bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-500/25 via-cyan-900/10 to-transparent blur-md animate-torii-aura"
        />
        <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 ring-1 ring-inset ring-brand/25 shadow-lg shadow-brand/20 transition-shadow duration-300 group-hover:shadow-brand/40">
          <ToriiGate className="h-6 w-6 text-brand drop-shadow-[0_0_8px_rgba(6,182,212,0.5)] transition-all duration-300 group-hover:drop-shadow-[0_0_12px_rgba(6,182,212,0.8)]" />
        </span>
      </span>
      <span className="flex flex-col leading-none">
        <span className={cn("text-lg font-extrabold tracking-tight text-white", locale === "en" && "font-amagro")}>
          {name}
        </span>
        <span className="mt-1.5 whitespace-nowrap font-jp text-[10px] font-medium leading-none tracking-widest text-muted-foreground/70">
          {TAGLINE}
        </span>
      </span>
    </Link>
  );
}
