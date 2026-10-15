import type { Metadata } from "next";
import { Cairo, Poppins } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { getDictionary } from "@/i18n/get-dictionary";
import { getDirection } from "@/i18n/config";
import { getLocale } from "@/i18n/server";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
  display: "swap",
});
const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-cairo",
  display: "swap",
});

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
        className={`${poppins.variable} ${cairo.variable} min-h-screen bg-slate-100 text-slate-900 antialiased transition-colors duration-300 dark:bg-[#0b0b16] dark:text-slate-100 ${
          locale === "ar" ? "font-ar" : "font-en"
        }`}
      >
        <ThemeProvider defaultTheme="dark">
          <div className="flex min-h-screen flex-col">
            <Navbar locale={locale} dict={dict} />
            <div className="flex flex-1 flex-col">{children}</div>
            <Footer locale={locale} dict={dict} />
          </div>
        </ThemeProvider>
        <script
          // Avoid theme flash: default to dark unless user explicitly chose light.
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("anime-stream-theme");if(t!=="light"){document.documentElement.classList.add("dark");document.documentElement.style.colorScheme="dark";}else{document.documentElement.classList.remove("dark");document.documentElement.style.colorScheme="light";}}catch(e){document.documentElement.classList.add("dark");}})();`,
          }}
        />
      </body>
    </html>
  );
}
