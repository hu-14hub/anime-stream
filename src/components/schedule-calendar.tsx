"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { Anime } from "@/types";
import { cn } from "@/lib/utils";

const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sun
  const mondayOffset = (day + 6) % 7;
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - mondayOffset);
  return d;
}

function fmtTime(ts: number): string {
  return new Date(ts * 1000).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Countdown to a future unix timestamp, seconds precision. */
function Countdown({ airingAt }: { airingAt: number }) {
  const [left, setLeft] = useState(() => Math.max(0, airingAt - Math.floor(Date.now() / 1000)));
  useEffect(() => {
    const id = setInterval(() => {
      setLeft((n) => {
        const next = airingAt - Math.floor(Date.now() / 1000);
        return next <= 0 ? 0 : next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [airingAt]);
  if (left <= 0) return <span className="text-emerald-400 font-bold">{tAired}</span>;
  const d = Math.floor(left / 86400);
  const h = Math.floor((left % 86400) / 3600);
  const m = Math.floor((left % 3600) / 60);
  const s = left % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  const parts: string[] = [];
  if (d > 0) parts.push(`${d}d`);
  if (d > 0 || h > 0) parts.push(`${pad(h)}h`);
  if (d > 0 || h > 0 || m > 0) parts.push(`${pad(m)}m`);
  parts.push(`${pad(s)}s`);
  return <span className="text-cyan-400 font-bold" dir="ltr">{parts.join(" ")}</span>;
}

let tAired = "Aired";

interface AiringDayEntry {
  id: number;
  airingAt: number;
  episode: number;
  anime: Anime;
}

export function ScheduleCalendar({
  entries,
  weekStart,
  locale,
  dict,
}: {
  entries: AiringDayEntry[];
  weekStart: number; // unix timestamp of Monday
  locale: Locale;
  dict: Dictionary;
}) {
  tAired = dict.schedule.aired;
  const start = startOfWeek(new Date(weekStart * 1000));
  const byDay = new Map<number, AiringDayEntry[]>();
  entries.forEach((e) => {
    const dayIdx = ((new Date(e.airingAt * 1000).getDay() + 6) % 7); // 0=Mon
    const arr = byDay.get(dayIdx) ?? [];
    arr.push(e);
    byDay.set(dayIdx, arr);
  });

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white">{dict.schedule.title}</h2>
          <p className="text-sm text-neutral-400">{dict.schedule.subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-full bg-white/[0.03] px-1">
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-400 hover:bg-white/10 hover:text-white transition"
              aria-label={dict.schedule.prevWeek}
              onClick={() => {}}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span
              dir="ltr"
              className="px-3 py-1 text-sm font-semibold text-white sm:text-base"
            >
              {start.toLocaleDateString(locale, { month: "short", day: "numeric" })}{" "}
              –{" "}
              {new Date(start.getTime() + 6 * 86400000).toLocaleDateString(locale, {
                month: "short",
                day: "numeric",
                year: new Date().getFullYear() !== start.getFullYear() ? "numeric" : undefined,
              })}
            </span>
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-400 hover:bg-white/10 hover:text-white transition"
              aria-label={dict.schedule.nextWeek}
              onClick={() => {}}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
        {dict.schedule.localNote.replace("{tz}", Intl.DateTimeFormat().resolvedOptions().timeZone)}
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-7">
        {DAYS.map((dayKey, dayIdx) => {
          const dayEntries = byDay.get(dayIdx) ?? [];
          const dayDate = new Date(start.getTime() + dayIdx * 86400000);
          const today =
            dayIdx === new Date().getDay() && startOfWeek(new Date()).getTime() === start.getTime();
          return (
            <div
              key={dayKey}
              className={cn(
                "rounded-xl border border-white/5 bg-white/[0.02] p-3 transition-colors hover:bg-white/[0.05]",
                today && "border-cyan-400/50 bg-cyan-400/5"
              )}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex flex-col items-center">
                  <span
                    className={cn(
                      "text-[10px] font-bold uppercase tracking-wider",
                      today ? "text-cyan-400" : "text-neutral-500"
                    )}
                  >
                    {dict.schedule[dayKey]}
                  </span>
                  {today && (
                    <span className="mt-0.5 rounded-full bg-cyan-400 px-1.5 py-0 text-[10px] font-bold text-neutral-950">
                      {dict.schedule.today}
                    </span>
                  )}
                </div>
                <span dir="ltr" className="text-[11px] font-medium text-neutral-400">
                  {dayDate.getDate()}
                </span>
              </div>
              {dayEntries.length === 0 ? (
                <p className="text-xs text-neutral-500 text-center py-2">
                  {dict.schedule.noEntries}
                </p>
              ) : (
                <ul className="space-y-1.5">
                  {dayEntries.map((e) => (
                    <li
                      key={e.id}
                      className="group flex items-center justify-between gap-2 rounded-lg p-2 hover:bg-white/[0.03] transition"
                    >
                      <div className="min-w-0 flex-1">
                        <LinkEntry anime={e.anime} episode={e.episode} locale={locale} dict={dict} />
                        <p className="mt-0.5 text-[10px] text-neutral-500" dir="ltr">
                          {fmtTime(e.airingAt)}
                        </p>
                      </div>
                      <Countdown airingAt={e.airingAt} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function LinkEntry({
  anime,
  episode,
  locale,
  dict,
}: {
  anime: Anime;
  episode: number;
  locale: Locale;
  dict: Dictionary;
}) {
  return (
    <Link
      href={`/anime/${anime.slug}/watch?ep=${episode}`}
      className="block truncate text-sm font-bold text-neutral-200 hover:text-cyan-300 transition"
    >
      {anime.title[locale]} <span className="text-cyan-400/70">· EP {episode}</span>
    </Link>
  );
}