"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { ToriiGate } from "./torii-gate";

const SEEN_KEY = "animestream-has-seen-intro";
const PLAY_MS = 1600; // how long the intro stays fully visible
const LEAVE_MS = 650; // fade + scale-out duration

type Phase = "idle" | "playing" | "leaving" | "done";

// Subtle light motes floating around the torii (position % within the gate box).
const PARTICLES = [
  { left: "34%", top: "28%", delay: 0, size: 4 },
  { left: "64%", top: "22%", delay: 0.5, size: 3 },
  { left: "26%", top: "56%", delay: 0.9, size: 3 },
  { left: "70%", top: "50%", delay: 1.2, size: 4 },
  { left: "46%", top: "68%", delay: 0.7, size: 3 },
  { left: "56%", top: "40%", delay: 1.0, size: 2 },
] as const;

/**
 * Full-screen intro splash that plays once per browser session on first load.
 *
 * - Rendered as a `fixed` overlay (out of flow) so it never triggers CLS on the
 *   page below. It mounts invisibly and only animates in after hydration.
 * - Uses `sessionStorage` so it does not replay on in-app navigation.
 * - Respects `prefers-reduced-motion` by skipping the effect entirely.
 */
export function IntroAnimation() {
  const [phase, setPhase] = useState<Phase>("idle");
  // Decided once per component instance (survives StrictMode double-invoke) so
  // the splash logic only runs a single time and timers are never restarted.
  const decided = useRef<boolean | null>(null);

  useEffect(() => {
    if (decided.current === null) {
      let show = false;
      try {
        show = !window.sessionStorage.getItem(SEEN_KEY);
        if (show) window.sessionStorage.setItem(SEEN_KEY, "1");
      } catch {
        /* storage unavailable (e.g. private mode) → treat as seen */
      }
      const reduced =
        window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
      decided.current = show && !reduced;
    }

    if (!decided.current) {
      setPhase("done");
      return;
    }

    setPhase("playing");
    const leaveTimer = window.setTimeout(() => setPhase("leaving"), PLAY_MS);
    const doneTimer = window.setTimeout(
      () => setPhase("done"),
      PLAY_MS + LEAVE_MS + 60
    );
    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(doneTimer);
    };
  }, []);

  if (phase === "done") return null;

  const started = phase !== "idle";

  return (
    <div
      aria-hidden
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-neutral-950 transition-[opacity,transform] duration-500 ease-out",
        phase === "idle" && "pointer-events-none opacity-0",
        phase === "playing" && "opacity-100",
        phase === "leaving" && "scale-105 opacity-0 duration-700 ease-in"
      )}
    >
      {/* soft radial cyan backdrop */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 46%, rgba(6,182,212,0.12) 0%, rgba(9,9,11,0) 58%)",
        }}
      />

      <div className="relative flex flex-col items-center px-6">
        {/* Torii gate + neon aura + floating light particles */}
        <div className="relative mb-8 h-32 w-32">
          <span
            className="intro-aura pointer-events-none absolute left-1/2 top-1/2 -z-10 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/25 blur-3xl"
            aria-hidden
          />
          {PARTICLES.map((p, i) => (
            <span
              key={i}
              className="intro-particle pointer-events-none absolute rounded-full bg-cyan-300/80 shadow-[0_0_8px_1px_rgba(6,182,212,0.7)]"
              style={{
                left: p.left,
                top: p.top,
                width: p.size,
                height: p.size,
                animationDelay: `${p.delay}s`,
              }}
              aria-hidden
            />
          ))}
          <ToriiGate
            className={cn(
              "intro-torii neon absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 text-cyan-400",
              started && "is-drawing"
            )}
          />
        </div>

        {/* Brand name */}
        <h1
          className={cn(
            "intro-text text-center text-3xl font-extrabold tracking-tight text-white sm:text-4xl",
            started && "is-in"
          )}
          style={started ? { animationDelay: "0.55s" } : undefined}
        >
          AnimeStream
        </h1>

        {/* Japanese tagline */}
        <p
          className={cn(
            "intro-text mt-3 text-center font-jp text-base tracking-[0.35em] text-cyan-300/85 sm:text-lg",
            started && "is-in"
          )}
          style={started ? { animationDelay: "0.8s" } : undefined}
        >
          アニメの世界へ
        </p>

        {/* thin shimmering progress hint */}
        <div
          className={cn(
            "intro-text mt-8 h-px w-40 overflow-hidden rounded-full bg-white/5",
            started && "is-in"
          )}
          style={started ? { animationDelay: "1s" } : undefined}
        >
          <span className="block h-full w-1/3 animate-pulse rounded-full bg-cyan-400/80 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
        </div>
      </div>
    </div>
  );
}