import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/server";
import { getAiringWeek } from "@/services/anilistService";
import { ScheduleCalendar } from "@/components/schedule-calendar";
import type { Anime } from "@/types";

export const dynamic = "force-dynamic";

export default async function SchedulePage() {
  const locale = await getLocale();
  const dict = getDictionary(locale);

  const now = Math.floor(Date.now() / 1000);
  const weekStart = now - 2 * 24 * 3600; // include shows airing in the last 48h
  const weekEnd = now + 7 * 24 * 3600;

  let entries: Awaited<ReturnType<typeof getAiringWeek>> = [];
  try {
    entries = await getAiringWeek(weekStart, weekEnd, 60);
  } catch {
    entries = []; // offline: empty schedule
  }

  // Drop any schedule items whose media couldn't be resolved.
  const resolved = entries.filter((e): e is { id: number; airingAt: number; episode: number; anime: Anime } => e.anime !== null);

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 sm:py-12">
      <ScheduleCalendar entries={resolved} weekStart={weekStart} locale={locale} dict={dict} />
    </main>
  );
}