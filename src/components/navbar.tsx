"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { Locale } from "@/i18n/config";
import { LanguageSwitcher } from "./language-switcher";
import { SearchBar } from "./search-bar";
import { Logo } from "./logo";
import { cn } from "@/lib/utils";

interface NavbarProps {
  locale: Locale;
  dict: Dictionary;
}

const links = [
  { href: "/", key: "home" },
  { href: "/catalog", key: "catalog" },
  { href: "/schedule", key: "schedule" },
  { href: "/profile", key: "profile" },
  { href: "/settings", key: "settings" },
  { href: "/admin", key: "admin" },
] as const;

export function Navbar({ locale, dict }: NavbarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-neutral-950/70 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] w-full max-w-7xl items-center gap-3 px-4 sm:px-6">
        <Logo name={dict.common.logo} locale={locale} />
        <nav className="ms-4 hidden items-center gap-1 lg:flex" aria-label="Primary">
          {links.map((l) => (
            <Link
              key={l.key}
              href={l.href}
              aria-current={isActive(l.href) ? "page" : undefined}
              className={cn(
                "relative rounded-full px-4 py-2 text-sm font-medium transition-colors duration-300",
                // Brand serif — mirrors the "Shinkai" logo wordmark (font-amagro),
                // EN only so the Arabic interface keeps its Cairo typography.
                locale === "en" && "font-amagro",
                isActive(l.href)
                  ? "text-white"
                  : "text-neutral-400 hover:text-white"
              )}
            >
              {dict.nav[l.key]}
              <span
                aria-hidden
                className={cn(
                  "absolute inset-x-4 -bottom-px h-0.5 rounded-full bg-brand transition-all duration-300",
                  isActive(l.href) ? "opacity-100" : "opacity-0"
                )}
              />
            </Link>
          ))}
        </nav>
        <div className="flex-1" />
        <SearchBar
          placeholder={dict.nav.searchPlaceholder}
          locale={locale}
          viewAllLabel={dict.nav.viewAllResults}
          noResultsLabel={dict.nav.noSuggestions}
          className="hidden w-64 md:block xl:w-80"
        />
        <LanguageSwitcher current={locale} label={dict.nav.language} className="hidden sm:flex" />
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-neutral-200 transition-all duration-300 hover:bg-white/10 lg:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      <div
        className={cn(
          "grid overflow-hidden border-white/10 transition-all duration-300 lg:hidden",
          open ? "grid-rows-[1fr] border-t" : "grid-rows-[0fr]"
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="space-y-3 px-4 py-4">
            <SearchBar
              placeholder={dict.nav.searchPlaceholder}
              locale={locale}
              viewAllLabel={dict.nav.viewAllResults}
              noResultsLabel={dict.nav.noSuggestions}
              className="md:hidden"
              onNavigate={() => setOpen(false)}
            />
            <nav className="flex flex-col gap-1" aria-label="Mobile">
              {links.map((l) => (
                <Link
                  key={l.key}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  aria-current={isActive(l.href) ? "page" : undefined}
                  className={cn(
                    "rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-300",
                    // Brand serif — mirrors the "Shinkai" logo wordmark (font-amagro), EN only.
                    locale === "en" && "font-amagro",
                    isActive(l.href) ? "bg-white/10 text-white" : "text-neutral-400 hover:bg-white/5 hover:text-white"
                  )}
                >
                  {dict.nav[l.key]}
                </Link>
              ))}
            </nav>
            <div className="sm:hidden">
              <LanguageSwitcher current={locale} label={dict.nav.language} className="w-fit" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
