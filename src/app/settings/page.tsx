import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/server";
import { SettingsClient } from "@/components/settings-client";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  return <SettingsClient locale={locale} dict={dict} />;
}
