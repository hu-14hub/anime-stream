"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Route transition wrapper.
 *
 * Keying the subtree by pathname means React remounts the whole page on each
 * navigation, which re-runs the `.animate-page-in` fade-up (defined in
 * globals.css, disabled for prefers-reduced-motion). Because Next.js already
 * PREFETCHES the destination route, the new content is ready the moment this
 * animation plays — so switching feels instant, never a blank flash.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="animate-page-in">
      {children}
    </div>
  );
}