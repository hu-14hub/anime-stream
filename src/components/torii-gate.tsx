import type { SVGProps } from "react";

/**
 * A clean, modern Torii Gate (鳥居) rendered as a crisp geometric SVG.
 *
 * Uses `currentColor` for the stroke so the icon inherits any text color
 * (e.g. `text-cyan-400`) plus any glow/drop-shadow applied to it. Pure vector
 * shapes mean it stays sharp at any resolution or scale.
 */
export function ToriiGate(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {/* Central finial above the roof (kasagi cap) */}
      <path d="M12 3v2" />
      {/* Top beam — kasagi (roof with overhang) */}
      <path d="M3 6h18" />
      {/* Central strut between the top and tie beams (gakuzuka) */}
      <path d="M12 6v4" />
      {/* Cross tie beam — nuki */}
      <path d="M5.5 10h13" />
      {/* Pillars — hashira */}
      <path d="M7 7.5v14" />
      <path d="M17 7.5v14" />
      {/* Base feet */}
      <path d="M5 21.5h4" />
      <path d="M15 21.5h4" />
    </svg>
  );
}