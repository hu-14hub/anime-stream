"use client";

import { useMemo, useState } from "react";
import { BarChart3, Clapperboard, Flag, Images, Settings2, Users } from "lucide-react";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { Locale } from "@/i18n/config";
import { KEYS, getAdminAnime, getAdminUsers, getHeroSlides, getReports, getViews, saveAdminUsers, saveHeroSlides, setReportStatus } from "@/lib/store";
import { useStore } from "@/lib/use-store";
import type { AdminAnime, AdminUserRecord, HeroSlide, ReportItem, UserRole } from "@/types";
import { animeList } from "@/data/anime";
import { cn } from "@/lib/utils";

type Section = "content" | "hero" | "reports" | "users" | "analytics";

export function AdminClient({ locale, dict: t }: { locale: Locale; dict: Dictionary }) {
  const [section, setSection] = useState<Section>("content");
  const [role, setRole] = useState<UserRole>(() => {
    if (typeof window === "undefined") return "admin";
    return (localStorage.getItem("anime-stream-role") as UserRole) || "admin";
  });

  const switchRole = (r: UserRole) => {
    setRole(r);
    try { localStorage.setItem("anime-stream-role", r); } catch { /* ignore */ }
  };

  const tabs: { id: Section; label: string; icon: React.ElementType }[] = [
    { id: "content", label: t.admin.content, icon: Clapperboard },
    { id: "hero", label: t.admin.curation, icon: Images },
    { id: "reports", label: t.admin.reports, icon: Flag },
    { id: "users", label: t.admin.users, icon: Users },
    { id: "analytics", label: t.admin.analytics, icon: BarChart3 },
  ];

  if (role === "viewer") {
    return (
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-16 text-center sm:px-6">
        <Settings2 className="mx-auto h-10 w-10 text-neutral-600" aria-hidden />
        <h1 className="mt-4 text-2xl font-extrabold text-white">{t.admin.accessDenied}</h1>
        <RoleSwitch role={role} onChange={switchRole} t={t} />
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 sm:py-12">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">{t.admin.dashboard}</h1>
          <p className="mt-1 text-sm text-neutral-400">{t.admin.title}</p>
        </div>
        <RoleSwitch role={role} onChange={switchRole} t={t} />
      </div>
      <div role="tablist" aria-label="Admin" className="mb-8 flex gap-1 overflow-x-auto border-b border-white/10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {tabs.map((tb) => {
          const Icon = tb.icon;
          const active = section === tb.id;
          return (
            <button key={tb.id} role="tab" aria-selected={active} onClick={() => setSection(tb.id)}
              className={cn("flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold transition",
                active ? "border-cyan-400 text-white" : "border-transparent text-neutral-500 hover:text-neutral-200")}>
              <Icon className="h-4 w-4" aria-hidden />
              {tb.label}
            </button>
          );
        })}
      </div>
      {section === "content" && <ContentSection t={t} role={role} />}
      {section === "hero" && <HeroSection t={t} />}
      {section === "reports" && <ReportsSection t={t} />}
      {section === "users" && <UsersSection t={t} />}
      {section === "analytics" && <AnalyticsSection t={t} locale={locale} />}
    </main>
  );
}

function RoleSwitch({ role, onChange, t }: { role: UserRole; onChange: (r: UserRole) => void; t: Dictionary }) {
  const roles: UserRole[] = ["viewer", "editor", "admin"];
  const labels: Record<UserRole, string> = { viewer: t.admin.roleViewer, editor: t.admin.roleEditor, admin: t.admin.roleAdmin };
  return (
    <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1 text-xs font-bold">
      <span className="ms-2 text-neutral-500">{t.admin.loginAs}:</span>
      {roles.map((r) => (
        <button key={r} type="button" onClick={() => onChange(r)} aria-pressed={role === r}
          className={cn("rounded-full px-3 py-1.5 transition", role === r ? "bg-cyan-400 text-neutral-950" : "text-neutral-400 hover:text-white")}>
          {labels[r]}
          </button>
        ))}
      </div>
    );
  }

function ContentSection({ t, role }: { t: Dictionary; role: UserRole }) {
  const [tick] = useStore<AdminAnime[]>(KEYS.adminAnime, []);
  const records = useMemo(() => getAdminAnime(), [tick]);
  const [editing, setEditing] = useState<AdminAnime | null>(null);
  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm text-neutral-400">{t.admin.anime} · <span dir="ltr">{records.length}</span></p>
        {role === "admin" && (
          <button type="button" onClick={() => setEditing(blankAnime())}
            className="rounded-full bg-cyan-400 px-4 py-2 text-xs font-bold text-neutral-950 transition-all duration-300 hover:bg-cyan-300">
            {t.admin.addNew}
          </button>
        )}
      </div>
      <AnimeForm t={t} initial={editing} onClose={() => setEditing(null)} />
      {!records.length && <p className="rounded-2xl border border-white/5 bg-white/[0.03] px-6 py-12 text-center text-sm text-neutral-500">{t.admin.noItems}</p>}
      <div className="space-y-2">
        {records.map((a) => (
          <div key={a.id} className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-white">{a.title.en}</p>
              <p className="text-xs text-neutral-500" dir="ltr">{a.slug} · {a.year} · {a.episodes.length} ep</p>
            </div>
            <button type="button" onClick={() => setEditing(a)} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-neutral-200 hover:bg-white/10">{t.admin.edit}</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function blankAnime(): AdminAnime {
  const id = `local-${Date.now()}`;
  return {
    id, slug: id, title: { en: "", ar: "" }, synopsis: { en: "", ar: "" },
    cover: "", banner: "", rating: 7, year: new Date().getFullYear(),
    status: "ongoing", genres: [], studio: { en: "", ar: "" },
    episodeCount: 1, episodes: [],
  };
}

function AnimeForm({ t, initial, onClose }: { t: Dictionary; initial: AdminAnime | null; onClose: () => void }) {
  const [form, setForm] = useState<AdminAnime | null>(null);
  const [anilistId, setAnilistId] = useState("");
  const [importing, setImporting] = useState(false);
  const [msg, setMsg] = useState("");
  const shown = form ?? initial;
  if (!shown) return null;
  const set = (p: Partial<AdminAnime>) => setForm({ ...shown, ...p });

  const doImport = async () => {
    const id = parseInt(anilistId, 10);
    if (!id) { setMsg(t.admin.requiredField); return; }
    setImporting(true);
    setMsg("");
    try {
      const { getAnimeDetail } = await import("@/services/anilistService");
      const full = await getAnimeDetail(id);
      const { saveAdminAnime } = await import("@/lib/store");
      saveAdminAnime({
        id: `al-${full.anilistId ?? id}`, slug: full.slug, anilistId: full.anilistId ?? id,
        title: full.title, nativeTitle: full.nativeTitle, romajiTitle: full.romajiTitle,
        synopsis: full.synopsis, cover: full.cover, banner: full.banner, rating: full.rating,
        popularity: full.popularity, year: full.year, season: full.season, seasonYear: full.seasonYear,
        format: full.format, duration: full.duration, status: full.status, genres: full.genres,
        tags: full.tags, studio: full.studio, episodeCount: full.episodeCount,
        trailerUrl: full.trailerUrl, trending: full.trending, episodes: full.episodes.map((e) => ({
          number: e.number, title: e.title, duration: e.duration, thumbnail: e.thumbnail,
          airedAt: e.airedAt, sources: [], subtitles: [],
        })),
      });
      setMsg(t.admin.imported);
    } catch { setMsg(t.admin.importFailed); }
    finally { setImporting(false); }
  };

  return (
    <div className="mb-6 rounded-2xl border border-cyan-400/20 bg-white/[0.03] p-5">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-sm font-extrabold text-white">{t.admin.anilistImport}</span>
        <input value={anilistId} onChange={(e) => setAnilistId(e.target.value)} inputMode="numeric" dir="ltr"
          placeholder="21" className="w-24 rounded-lg border border-white/10 bg-neutral-950 px-3 py-1.5 text-sm text-white" />
        <button type="button" onClick={doImport} disabled={importing}
          className="rounded-full bg-cyan-400 px-4 py-1.5 text-xs font-bold text-neutral-950 disabled:opacity-50">
          {importing ? t.admin.importing : t.admin.import}
        </button>
        {msg && <span className="text-xs text-neutral-400">{msg}</span>}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label={t.admin.englishTitleField} value={shown.title.en} onChange={(v) => set({ title: { ...shown.title, en: v } })} />
        <Field label={t.admin.arabicTitleField} value={shown.title.ar} onChange={(v) => set({ title: { ...shown.title, ar: v } })} />
        <Field label={t.admin.coverUrl} value={shown.cover} onChange={(v) => set({ cover: v })} ltr />
        <Field label={t.admin.bannerUrl} value={shown.banner} onChange={(v) => set({ banner: v })} ltr />
      </div>
      <div className="mt-3 flex gap-2">
        <button type="button" onClick={async () => {
          const { saveAdminAnime } = await import("@/lib/store");
          const rec = form ?? shown;
          if (!rec.title.en || !rec.slug) { setMsg(t.admin.requiredField); return; }
          saveAdminAnime(rec);
          setForm(null); onClose();
        }} className="rounded-full bg-cyan-400 px-5 py-2 text-xs font-bold text-neutral-950">{t.admin.save}</button>
        <button type="button" onClick={() => { setForm(null); onClose(); }}
          className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-xs font-bold text-neutral-300">{t.admin.cancel}</button>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, ltr }: { label: string; value: string; onChange: (v: string) => void; ltr?: boolean }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold text-neutral-400">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} dir={ltr ? "ltr" : undefined}
        className="w-full rounded-xl border border-white/10 bg-neutral-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/60" />
    </label>
  );
}

function HeroSection({ t }: { t: Dictionary }) {
  const [tick] = useStore<HeroSlide[]>(KEYS.hero, []);
  const slides = useMemo(() => getHeroSlides(), [tick]);
  const toggle = (slug: string) => {
    const has = slides.find((s) => s.slug === slug);
    const next = has
      ? slides.filter((s) => s.slug !== slug)
      : [...slides, { id: slug, slug, title: { en: slug, ar: slug }, banner: "", enabled: true, order: slides.length }];
    saveHeroSlides(next);
  };
  return (
    <div>
      <p className="mb-4 text-sm text-neutral-400">{t.admin.heroSlides} · <span dir="ltr">{slides.length}</span></p>
      <div className="grid gap-2 sm:grid-cols-2">
        {animeList.slice(0, 12).map((a) => {
          const on = slides.some((s) => s.slug === a.slug);
          return (
            <button key={a.slug} type="button" onClick={() => toggle(a.slug)} aria-pressed={on}
              className={cn("flex items-center justify-between gap-2 rounded-2xl border px-4 py-3 text-start text-sm font-bold transition",
                on ? "border-cyan-400/50 bg-cyan-400/10 text-white" : "border-white/5 bg-white/[0.03] text-neutral-300 hover:bg-white/[0.06]")}>
              <span className="truncate">{a.title.en}</span>
              <span className="text-xs text-neutral-500">{on ? t.admin.hide : t.admin.show}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ReportsSection({ t }: { t: Dictionary }) {
  const [tick] = useStore<ReportItem[]>(KEYS.reports, []);
  const reports = useMemo(() => getReports(), [tick]);
  if (!reports.length) return <p className="rounded-2xl border border-white/5 bg-white/[0.03] px-6 py-12 text-center text-sm text-neutral-500">{t.admin.noItems}</p>;
  return (
    <div className="space-y-2">
      {reports.map((r) => (
        <div key={r.id} className="flex flex-wrap items-center gap-2 rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-white">{r.reason}</p>
            <p className="text-xs text-neutral-500" dir="ltr">{r.slug} · EP {r.episode ?? "—"} · {r.status}</p>
          </div>
          <button type="button" onClick={() => setReportStatus(r.id, "resolved")} className="rounded-full bg-emerald-400/15 px-3 py-1.5 text-xs font-bold text-emerald-300">{t.admin.resolve}</button>
          <button type="button" onClick={() => setReportStatus(r.id, "dismissed")} className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-bold text-neutral-300">{t.admin.dismiss}</button>
        </div>
      ))}
    </div>
  );
}

function UsersSection({ t }: { t: Dictionary }) {
  const [tick] = useStore<AdminUserRecord[]>(KEYS.adminUsers, []);
  const users = useMemo(() => {
    const u = getAdminUsers();
    return u.length ? u : seedUsers();
  }, [tick]);
  const setRoleFor = (id: string, role: UserRole) => {
    saveAdminUsers(users.map((u) => (u.id === id ? { ...u, role } : u)));
  };
  return (
    <div className="space-y-2">
      {users.map((u) => (
        <div key={u.id} className="flex flex-wrap items-center gap-2 rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-white">{u.name}</p>
            <p className="truncate text-xs text-neutral-500" dir="ltr">{u.email}</p>
          </div>
          <select value={u.role} onChange={(e) => setRoleFor(u.id, e.target.value as UserRole)} aria-label={t.admin.roleAdmin}
            className="rounded-full border border-white/10 bg-neutral-950 px-3 py-1.5 text-xs font-bold text-white">
            <option value="viewer">{t.admin.roleViewer}</option>
            <option value="editor">{t.admin.roleEditor}</option>
            <option value="admin">{t.admin.roleAdmin}</option>
          </select>
        </div>
      ))}
    </div>
  );
}

function seedUsers(): AdminUserRecord[] {
  const seeded: AdminUserRecord[] = [
    { id: "u-admin", name: "Admin", email: "admin@animestream.app", role: "admin", createdAt: Date.now(), watchlistCount: 0, commentsCount: 0 },
    { id: "u-editor", name: "Editor", email: "editor@animestream.app", role: "editor", createdAt: Date.now(), watchlistCount: 0, commentsCount: 0 },
    { id: "u-viewer", name: "Viewer", email: "viewer@animestream.app", role: "viewer", createdAt: Date.now(), watchlistCount: 0, commentsCount: 0 },
  ];
  saveAdminUsers(seeded);
  return seeded;
}

function AnalyticsSection({ t, locale }: { t: Dictionary; locale: Locale }) {
  const [tick] = useStore<Record<string, number>>(KEYS.views, {});
  const views = useMemo(() => getViews(), [tick]);
  const total = Object.values(views).reduce((s, v) => s + v, 0);
  const top = Object.entries(views).sort((a, b) => b[1] - a[1]).slice(0, 8);
  return (
    <div>
      <div className="mb-4 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">{t.admin.totalViews}</p>
          <p dir="ltr" className="mt-2 text-3xl font-black text-white">{total}</p>
        </div>
        <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">{t.admin.totalTitles}</p>
          <p dir="ltr" className="mt-2 text-3xl font-black text-white">{Object.keys(views).length}</p>
        </div>
      </div>
      <h2 className="mb-3 text-sm font-extrabold text-white">{t.admin.topTitles}</h2>
      {!top.length && <p className="rounded-2xl border border-white/5 bg-white/[0.03] px-6 py-12 text-center text-sm text-neutral-500">{t.admin.noItems}</p>}
      <div className="space-y-2">
        {top.map(([slug, v]) => (
          <div key={slug} className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3">
            <span className="min-w-0 flex-1 truncate text-sm font-bold text-white">{slug}</span>
            <span dir="ltr" className="text-xs font-bold text-cyan-300">{v} {t.admin.views}</span>
          </div>
        ))}
      </div>
      <p className="mt-3 hidden">{locale}</p>
    </div>
  );
}

