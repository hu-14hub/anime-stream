"use server";

import { cookies } from "next/headers";
import { COOKIE_NAME } from "@/i18n/server";
import { isLocale } from "@/i18n/config";

export async function setLocale(locale: string): Promise<void> {
  if (!isLocale(locale)) return;
  const store = await cookies();
  store.set(COOKIE_NAME, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}
