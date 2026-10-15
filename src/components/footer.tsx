import Link from "next/link";
import { Clapperboard, Globe, MessageCircle, Send } from "lucide-react";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { Locale } from "@/i18n/config";
import { genres } from "@/data/anime";

interface FooterProps {
  locale: Locale;
  dict: Dictionary;
}

export function Footer({ locale, dict }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-8 bg-neutral-950">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        {/* Brand */}
        <div>
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-400 shadow-lg shadow-cyan-500/25">
              <Clapperboard className="h-5 w-5 text-neutral-950" aria-hidden />
            </span>
            <span className="text-lg font-extrabold tracking-tight text-white">
              {dict.common.logo}
            </span>
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-7 text-neutral-400">{dict.footer.description}</p>
          <div className="mt-5 flex items-center gap-2">
            {[
              { icon: Globe, label: "Website" },
              { icon: Send, label: "Telegram" },
              { icon: MessageCircle, label: "Discord" },
            ].map(({ icon: Icon, label }) => (
              <a
                key={label}
                href="#"
                aria-label={label}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-neutral-400 transition-colors duration-300 hover:bg-white/10 hover:text-white"
              >
                <Icon className="h-4 w-4" aria-hidden />
              </a>
            ))}
          </div>
        </div>

        {/* Quick links */}
        <nav aria-label={dict.footer.quickLinks}>
          <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-300">
            {dict.footer.quickLinks}
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {[
              { href: "/", label: dict.nav.home },
              { href: "/catalog", label: dict.nav.catalog },
              { href: "/genres", label: dict.nav.genres },
            ].map((l) => (
              <li key={l.href + l.label}>
                <Link href={l.href} className="text-neutral-400 transition-colors duration-300 hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Genres */}
        <nav aria-label={dict.footer.genresTitle}>
          <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-300">
            {dict.footer.genresTitle}
          </h3>
          <ul className="mt-4 flex flex-wrap gap-2">
            {genres.slice(0, 6).map((g) => (
              <li key={g.key}>
                <Link
                  href={`/catalog?genre=${g.key}`}
                  className="inline-block rounded-full bg-white/5 px-3 py-1.5 text-xs text-neutral-300 transition-colors duration-300 hover:bg-white/10 hover:text-white"
                >
                  {g.label[locale]}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="border-t border-white/5">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-5 text-xs text-neutral-500 sm:px-6">
          <p>
            © {year} {dict.common.logo} · {dict.footer.rights}
          </p>
          <p dir="ltr" className="rounded-full bg-white/5 px-3 py-1 font-mono">
            {locale.toUpperCase()} · {locale === "ar" ? "RTL" : "LTR"} · dark-first
          </p>
        </div>
      </div>
    </footer>
  );
}
