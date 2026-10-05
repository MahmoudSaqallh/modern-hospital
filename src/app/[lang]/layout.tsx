import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans_Arabic, Noto_Kufi_Arabic } from "next/font/google";
import { notFound } from "next/navigation";
import "../globals.css";
import { isLocale, localeDirection, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/getDictionary";
import { I18nProvider } from "@/i18n/I18nProvider";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { MobileBookingBar } from "@/components/layout/MobileBookingBar";
import { Preloader } from "@/components/layout/Preloader";
import { VISITED_KEY } from "@/lib/storageKeys";
import { SceneCanvas } from "@/three/SceneCanvas";

const body = IBM_Plex_Sans_Arabic({
  weight: ["300", "400", "500", "600"],
  subsets: ["arabic", "latin"],
  variable: "--font-body",
  display: "swap",
});

const heading = Noto_Kufi_Arabic({
  subsets: ["arabic", "latin"],
  variable: "--font-heading",
  display: "swap",
});

const code = IBM_Plex_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-code",
  display: "swap",
  preload: false,
});

/**
 * Runs before first paint:
 *  · `motion-ok` enables intro pre-hiding only when motion is allowed,
 *  · `preloader-skip` hides the loader on repeat visits and for reduced motion.
 */
const INIT_SCRIPT = `(function(){var d=document.documentElement;try{var r=window.matchMedia('(prefers-reduced-motion: reduce)').matches;if(!r)d.classList.add('motion-ok');if(r||sessionStorage.getItem('${VISITED_KEY}'))d.classList.add('preloader-skip');}catch(e){d.classList.add('preloader-skip');}})();`;

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    // Set NEXT_PUBLIC_SITE_URL to the production origin so social previews resolve correctly.
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
    title: { default: dict.meta.title, template: `%s — ${dict.meta.siteName}` },
    description: dict.meta.description,
    applicationName: dict.meta.siteName,
    alternates: { languages: { ar: "/ar", en: "/en" } },
    openGraph: {
      title: dict.meta.title,
      description: dict.meta.description,
      siteName: dict.meta.siteName,
      locale: lang === "ar" ? "ar" : "en",
      type: "website",
      images: [{ url: "/brand/logo.png", width: 384, height: 384, alt: dict.a11y.logoAlt }],
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#fafbf9",
  colorScheme: "light",
};

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const dir = localeDirection[lang];

  return (
    <html
      lang={lang}
      dir={dir}
      className={`${body.variable} ${heading.variable} ${code.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: INIT_SCRIPT }} />
        <noscript>
          <style>{`.preloader{display:none!important}`}</style>
        </noscript>
      </head>
      <body>
        <I18nProvider value={{ locale: lang, dir, dict }}>
          <a
            href="#main"
            className="sr-only fixed start-3 top-3 z-[120] bg-ink px-4 py-2.5 text-white focus:not-sr-only"
          >
            {dict.a11y.skipToContent}
          </a>
          <Preloader />
          <SceneCanvas />
          <SiteHeader />
          <main id="main" tabIndex={-1} className="relative z-10 outline-none">
            {children}
          </main>
          <SiteFooter locale={lang} dict={dict} />
          <MobileBookingBar />
        </I18nProvider>
      </body>
    </html>
  );
}
