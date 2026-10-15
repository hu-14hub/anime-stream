"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface TabDef {
  id: string;
  label: string;
  badge?: number;
  node: ReactNode;
}

/**
 * Accessible tab strip used on the details page. Children are rendered
 * as RSC slots, so server-rendered sections stay server-rendered.
 */
export function DetailTabs({ tabs, ariaLabel }: { tabs: TabDef[]; ariaLabel: string }) {
  const [active, setActive] = useState(tabs[0]?.id ?? "");
  const current = tabs.find((t) => t.id === active) ?? tabs[0];

  if (!tabs.length) return null;

  return (
    <div>
      <div
        role="tablist"
        aria-label={ariaLabel}
        className="flex gap-1 overflow-x-auto border-b border-white/10 pb-px [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            type="button"
            id={`tab-${t.id}`}
            aria-selected={t.id === active}
            aria-controls={`panel-${t.id}`}
            onClick={() => setActive(t.id)}
            className={cn(
              "relative shrink-0 whitespace-nowrap px-4 py-3 text-sm font-bold transition-colors duration-300",
              t.id === active
                ? "text-cyan-300"
                : "text-neutral-400 hover:bg-white/5 hover:text-white"
            )}
          >
            {t.label}
            {typeof t.badge === "number" && (
              <span
                dir="ltr"
                className="ms-1.5 rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] font-black text-neutral-300"
              >
                {t.badge}
              </span>
            )}
            <span
              aria-hidden
              className={cn(
                "absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-cyan-400 transition-all duration-300",
                t.id === active ? "opacity-100" : "opacity-0"
              )}
            />
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        id={`panel-${current.id}`}
        aria-labelledby={`tab-${current.id}`}
        tabIndex={0}
        className="pt-6 focus:outline-none"
      >
        {current.node}
      </div>
    </div>
  );
}