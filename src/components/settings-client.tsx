"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { BellRing, Check, Languages, MonitorPlay, Trash2 } from "lucide-react";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { Locale } from "@/i18n/config";
import { setLocale } from "@/app/actions";
import { DEFAULT_SETTINGS, KEYS, applyTheme, getSettings, saveSettings } from "@/lib/store";
import { useStore } from "@/lib/use-store";
import type { UserSettings } from "@/types";
import { cn } from "@/lib/utils";

const SUBS = [
  { id: "en", label: "English" },
  { id: "ar", label: "العربية" },
];

export function SettingsClient({ locale, dict: t }: { locale: Locale; dict: Dictionary }) {
  const router = useRouter();
  const [settingsTick] = useStore<UserSettings>(KEYS.settings, DEFAULT_SETTINGS);
  const [settings, setSettingsState] = useState<UserSettings>(() => getSettings());
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);

  void settingsTick;

  const patch = (p: Partial<UserSettings>) => {
    const next = saveSettings(p);
    setSettingsState(next);
    applyTheme();
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  };

  const switchLocale = async (next: Locale) => {
    if (next === locale) return;
    setPending(true);
    patch({ locale: next });
    try {
      await setLocale(next);
    } finally {
      setPending(false);
      router.refresh();
    }
  };

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6 sm:py-12">
      <h1 className="text-3xl font-extrabold tracking-tight text-white">{t.settings.title}</h1>
      <p className="mt-2 text-sm text-neutral-400">{t.settings.subtitle}</p>
      {saved && (
        <p role="status" className="mt-4 flex items-center gap-1.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-xs font-bold text-emerald-300">
          <Check className="h-4 w-4" aria-hidden />
          {t.settings.saved}
        </p>
      )}
      <div className="mt-8 space-y-6">
        <Card icon={<Languages className="h-5 w-5 text-brand" />} title={t.settings.language} note={t.settings.languageNote}>
          <div className="flex gap-2">
            {(["en", "ar"] as Locale[]).map((l) => (
              <button key={l} type="button" disabled={pending} onClick={() => switchLocale(l)}
                aria-pressed={locale === l}
                className={cn("rounded-full px-5 py-2 text-sm font-bold transition-all duration-300 disabled:opacity-50",
                  locale === l ? "bg-brand text-neutral-950" : "border border-white/10 bg-white/5 text-neutral-300 hover:bg-white/10 hover:text-white")}>
                {l === "en" ? "English" : "العربية"}
              </button>
            ))}
          </div>
        </Card>
        <PlaybackCard t={t} settings={settings} onPatch={patch} />
        <DataCard t={t} />
      </div>
    </main>
  );
}
function PlaybackCard({ t, settings, onPatch }: { t: Dictionary; settings: UserSettings; onPatch: (p: Partial<UserSettings>) => void }) {
  return (
    <Card icon={<MonitorPlay className="h-5 w-5 text-emerald-400" />} title={t.settings.playback}>
      <Toggle label={t.settings.autoplayNext} note={t.settings.autoplayNextNote} checked={settings.autoplayNext} onChange={(v) => onPatch({ autoplayNext: v })} />
      <Toggle label={t.settings.rememberProgress} note={t.settings.rememberProgressNote} checked={settings.rememberProgress} onChange={(v) => onPatch({ rememberProgress: v })} />
      <div className="mt-4">
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-neutral-500">{t.settings.defaultSubtitle}</p>
        <div className="flex flex-wrap gap-2">
          <SubBtn active={settings.defaultSubtitle === "off"} label={t.settings.defaultSubtitleOff} onClick={() => onPatch({ defaultSubtitle: "off" })} />
          {SUBS.map((s) => (
            <SubBtn key={s.id} active={settings.defaultSubtitle === s.id} label={s.label} onClick={() => onPatch({ defaultSubtitle: s.id })} />
          ))}
        </div>
        <p className="mt-2 text-xs text-neutral-500">{t.settings.defaultSubtitleNote}</p>
      </div>
    </Card>
  );
}

function DataCard({ t }: { t: Dictionary }) {
  const reset = () => {
    if (!window.confirm("Reset all local data?")) return;
    try {
      for (const k of Object.values(KEYS)) localStorage.removeItem(k as string);
    } catch { /* ignore */ }
    window.location.reload();
  };
  return (
    <Card icon={<Trash2 className="h-5 w-5 text-red-400" />} title={t.settings.data} note={t.settings.clearLibraryNote}>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={reset}
          className="rounded-full border border-red-500/30 bg-red-500/10 px-5 py-2 text-sm font-bold text-red-300 transition-all duration-300 hover:bg-red-500/20">
          {t.settings.clearLibrary}
        </button>
      </div>
    </Card>
  );
}

function Card({ icon, title, note, children }: { icon: React.ReactNode; title: string; note?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-white/5 bg-white/[0.03] p-5 sm:p-6">
      <div className="mb-4 flex items-center gap-2.5">
        {icon}
        <h2 className="text-base font-extrabold text-white">{title}</h2>
      </div>
      {note && <p className="mb-4 text-xs leading-5 text-neutral-500">{note}</p>}
      {children}
    </section>
  );
}

function Toggle({ label, note, checked, onChange }: { label: string; note?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-3 rounded-xl px-1 py-2.5 text-start">
      <span>
        <span className="flex items-center gap-1.5 text-sm font-bold text-neutral-200">
          <BellRing className="h-3.5 w-3.5 text-neutral-500" aria-hidden />
          {label}
        </span>
        {note && <span className="mt-0.5 block text-xs text-neutral-500">{note}</span>}
      </span>
      <span aria-hidden className={cn("relative h-6 w-11 shrink-0 rounded-full transition", checked ? "bg-brand" : "bg-white/10")}>
        <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all", checked ? "end-0.5" : "start-0.5")} />
      </span>
    </button>
  );
}

function SubBtn({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active}
      className={cn("rounded-full px-4 py-1.5 text-xs font-bold transition",
        active ? "bg-brand text-neutral-950" : "border border-white/10 bg-white/5 text-neutral-300 hover:bg-white/10 hover:text-white")}>
      <span dir="ltr">{label}</span>
    </button>
  );
}

