import en from "./dictionaries/en.json";
import ar from "./dictionaries/ar.json";
import { defaultLocale, isLocale, type Locale } from "./config";

export type Dictionary = typeof en;

const dictionaries: Record<Locale, Dictionary> = { en, ar: ar as Dictionary };

export function getDictionary(locale: unknown): Dictionary {
  if (isLocale(locale)) return dictionaries[locale];
  return dictionaries[defaultLocale];
}
