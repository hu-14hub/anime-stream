"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Languages } from "lucide-react";
import { locales, localeNames, type Locale } from "@/i18n/config";
import { setLocale } from "@/app/actions";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({
  current,
  label,
  className,
}: {
  current: Locale;
  label: string;
  className?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const switchTo = (locale: Locale) => {
    if (locale === current) return;
    startTransition(async () => {
      await setLocale(locale);
      router.refresh();
    });
  };

  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1 text-xs font-medium backdrop-blur",
        className
      )}
      role="group"
      aria-label={label}
      title={label}
    >
      <Languages className="ms-1 h-4 w-4 shrink-0 opacity-70" aria-hidden />
      {locales.map((l) => (
        <button
          key={l}
          type="button"
          disabled={pending}
          onClick={() => switchTo(l)}
          aria-pressed={current === l}
          className={cn(
            "rounded-full px-2.5 py-1 transition-all duration-200 disabled:opacity-50",
            current === l
              ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow"
              : "text-neutral-300 hover:bg-white/10 hover:text-white"
          )}
        >
          {l === "en" ? "EN" : "عربي"}
          <span className="sr-only"> — {localeNames[l]}</span>
        </button>
      ))}
    </div>
  );
}
