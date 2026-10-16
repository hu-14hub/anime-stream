"use client";

import { useEffect } from "react";
import { KEYS, applyTheme, read } from "@/lib/store";
import type { UserSettings } from "@/types";

/** Applies the persisted theme on first paint (dark-first default). */
export function ThemeInit() {
  useEffect(() => {
    const s = read<Partial<UserSettings>>(KEYS.settings, {});
    applyTheme(s.theme ?? "dark");
  }, []);
  return null;
}
