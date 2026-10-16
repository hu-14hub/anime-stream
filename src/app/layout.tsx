import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ThemeInit } from "@/components/theme-init";
import { getDictionary } from "@/i18n/get-dictionary";
import { getDirection } from "@/i18n/config";
import { getLocale } from "@/i18n/server";


export const metadata: Metadata = {
  title: {
    default: "AnimeStream | Watch Anime EN & AR",
    template: "%s | AnimeStream",
  },
  description:
    "Modern anime streaming website with English & Arabic support, dark mode, trending anime, catalog, details and watch pages.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const dir = getDirection(locale);

  return (
    <html lang={locale} dir={dir} className="dark" suppressHydrationWarning>
      <body
        className={`min-h-screen bg-neutral-950 text-neutral-100 antialiased transition-colors duration-300 ${
          locale === "ar" ? "font-ar" : "font-en"
        }`}
      >
        <div className="flex min-h-screen flex-col">
          <ThemeInit />
          <Navbar locale={locale} dict={dict} />
          <div className="flex flex-1 flex-col">{children}</div>
          <Footer locale={locale} dict={dict} />
        </div>
      </body>
    </html>
  );
}