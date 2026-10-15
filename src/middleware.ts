import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_NAME } from "@/i18n/server";
import { defaultLocale, isLocale } from "@/i18n/config";

/**
 * Optional language-prefix support + default-locale cookie.
 *
 * This project uses cookie-based i18n (no `app/[lang]` segment), so `/`
 * renders directly. This middleware additionally accepts `/en/...` and
 * `/ar/...` URLs: it stores the language in the locale cookie and redirects
 * to the clean path, so neither URL style can 404 on Vercel.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Match an optional leading /en or /ar segment.
  const match = pathname.match(/^\/(en|ar)(?=\/|$)(.*)$/);
  if (match) {
    const lang = match[1];
    const rest = match[2] || "/";
    const url = request.nextUrl.clone();
    url.pathname = rest.startsWith("/") ? rest : `/${rest}`;
    const response = NextResponse.redirect(url);
    response.cookies.set(COOKIE_NAME, lang, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
    return response;
  }

  // Ensure a default locale cookie exists so first paint is consistent.
  const response = NextResponse.next();
  const current = request.cookies.get(COOKIE_NAME)?.value;
  if (!isLocale(current)) {
    response.cookies.set(COOKIE_NAME, defaultLocale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
