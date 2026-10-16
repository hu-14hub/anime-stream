import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/server";
import { ProfileClient } from "@/components/profile-client";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  return <ProfileClient locale={locale} dict={dict} />;
}
