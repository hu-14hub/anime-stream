"use client";

import { useEffect, useState } from "react";
import { onExternalChange, read, subscribe } from "./store";

/**
 * Reactive localStorage read — re-renders whenever the collection is
 * mutated in this tab or another one.
 */
export function useStore<T>(key: string, fallback: T): [T, () => void] {
  const [value, setValue] = useState<T>(() => read<T>(key, fallback));
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setValue(read<T>(key, fallback));
    const unsub = subscribe(key, () => setTick((t) => t + 1));
    const unsubExt = onExternalChange(key, () => setTick((t) => t + 1));
    return () => {
      unsub();
      unsubExt();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    setValue(read<T>(key, fallback));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick]);

  return [value, () => setTick((t) => t + 1)];
}
