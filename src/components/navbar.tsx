"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Menu, Search, X } from "lucide-react";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { Locale } from "@/i18n/config";
import { LanguageSwitcher } from "./language-switcher";
import { ThemeToggle } from "./theme-toggle";
import { Logo } from "./logo";
import { cn } from "@/lib/utils";

interface NavbarProps {
  locale: Locale;
  dict: Dictionary;
}

const links = [
  { href: "/", key: "home" },
  { href: "/catalog", key: "catalog" },
  { href: "/genres", key: "genres" },
] as const;

export function Navbar({ locale, dict }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const submitSearch = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/catalog?q=${encodeURIComponent(q)}` : "/catalog");
    setOpen(false);
  };

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-neutral-950/70 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] w-full max-w-7xl items-center gap-3 px-4 sm:px-6">
        <Logo name={dict.common.logo} />
        <nav className="ms-4 hidden items-center gap-1 lg:flex" aria-label="Primary">
          {links.map((l) => (
            <Link
              key={l.key}
              href={l.href}
              aria-current={isActive(l.href) ? "page" : undefined}
              className={cn(
                "relative rounded-full px-4 py-2 text-sm font-medium transition-colors duration-300",
                isActive(l.href)
                  ? "text-white"
                  : "text-neutral-400 hover:text-white"
              )}
            >
              {dict.nav[l.key]}
              <span
                aria-hidden
                className={cn(
                  "absolute inset-x-4 -bottom-px h-0.5 rounded-full bg-cyan-400 transition-all duration-300",
                  isActive(l.href) ? "opacity-100" : "opacity-0"
                )}
              />
            </Link>
          ))}
        </nav>
        <div className="flex-1" />
        <form onSubmit={submitSearch} role="search" className="relative hidden w-64 md:block xl:w-80">
          <Search
            className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
            aria-hidden
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="search"
            placeholder={dict.nav.searchPlaceholder}
            aria-label={dict.nav.searchPlaceholder}
            className="h-10 w-full rounded-full border border-transparent bg-white/5 ps-9 pe-4 text-sm text-neutral-100 placeholder:text-neutral-500 outline-none transition-all duration-300 focus:border-cyan-400/50 focus:bg-white/10 focus:ring-2 focus:ring-cyan-400/20"
          />
        </form>
        <LanguageSwitcher current={locale} label={dict.nav.language} className="hidden sm:flex" />
        <ThemeToggle lightLabel={dict.nav.light} darkLabel={dict.nav.dark} title={dict.nav.toggleTheme} />
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-200 transition hover:bg-white/10 lg:hidden"
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
            <form onSubmit={submitSearch} role="search" className="relative md:hidden">
              <Search
                className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                aria-hidden
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                type="search"
                placeholder={dict.nav.searchPlaceholder}
                aria-label={dict.nav.searchPlaceholder}
                className="h-10 w-full rounded-full border border-white/10 bg-white/5 ps-9 pe-4 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/30"
              />
            </form>
            <nav className="flex flex-col gap-1" aria-label="Mobile">
              {links.map((l) => (
                <Link
                  key={l.key}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  aria-current={isActive(l.href) ? "page" : undefined}
                  className={cn(
                    "rounded-xl px-4 py-2.5 text-sm font-medium transition",
                    isActive(l.href) ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"
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
