import { cookies } from "next/headers";
import { defaultLocale, isLocale, type Locale } from "./config";

const COOKIE_NAME = "locale";

/** Read the active locale on the server (cookie-based). Defaults to `en`. */
export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const value = store.get(COOKIE_NAME)?.value;
  return isLocale(value) ? value : defaultLocale;
}

export { COOKIE_NAME };
