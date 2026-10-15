"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "./theme-provider";

export function ThemeToggle({
  title,
  lightLabel,
  darkLabel,
}: {
  title: string;
  lightLabel: string;
  darkLabel: string;
}) {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      title={title}
      aria-label={title}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-200 backdrop-blur transition-all duration-200 hover:scale-105 hover:bg-white/10"
    >
      <span className="sr-only">{isDark ? lightLabel : darkLabel}</span>
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
