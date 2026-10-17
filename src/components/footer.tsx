import Link from "next/link";
import { Globe, MessageCircle, Send } from "lucide-react";
import { ToriiGate } from "./torii-gate";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";

interface FooterProps {
  locale: Locale;
  dict: Dictionary;
}

export function Footer({ locale, dict }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-8 bg-neutral-950">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-8 px-4 py-14 sm:px-6 md:grid-cols-[1.2fr_auto] md:items-center">
        {/* Brand */}
        <div>
          <Link href="/" className="group flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 ring-1 ring-inset ring-brand/25 shadow-lg shadow-brand/20 transition-shadow duration-300 group-hover:shadow-brand/40">
              <ToriiGate className="h-6 w-6 text-brand drop-shadow-[0_0_8px_rgba(6,182,212,0.5)] transition-all duration-300 group-hover:drop-shadow-[0_0_12px_rgba(6,182,212,0.8)]" aria-hidden />
            </span>
            <span className="flex flex-col leading-none">
              <span className={cn("text-lg font-extrabold tracking-tight text-white", locale === "en" && "font-amagro")}>
                {dict.common.logo}
              </span>
              <span className="mt-1.5 block max-w-full truncate font-medium leading-tight text-[0.65rem] tracking-wide text-muted-foreground/70">
                Your ultimate destination for watching anime with English & Arabic subtitles.
              </span>
            </span>
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-7 text-neutral-400">{dict.footer.description}</p>
        </div>

        {/* Social */}
        <div className="flex items-center gap-2">
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

      <div className="border-t border-white/5">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-center gap-2 px-4 py-5 text-xs text-neutral-500 sm:px-6">
          <p>
            © {year} {dict.common.logo} · {dict.footer.rights}
          </p>
        </div>
      </div>
    </footer>
  );
}
