import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/server";
import { AdminClient } from "@/components/admin-client";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  return <AdminClient locale={locale} dict={dict} />;
}
