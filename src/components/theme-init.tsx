"use client";

import { useEffect } from "react";
import { applyTheme } from "@/lib/store";

/** Locks the permanent cinematic dark theme on first paint. */
export function ThemeInit() {
  useEffect(() => {
    applyTheme();
  }, []);
  return null;
}
