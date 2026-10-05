"use client";

import { usePathname } from "next/navigation";
import { Languages } from "lucide-react";
import { switchLocalePath } from "@/i18n/config";
import { useI18n } from "@/i18n/I18nProvider";
import { cn } from "@/lib/localized";

/**
 * A plain link on purpose: switching language swaps `lang`, `dir`, fonts and
 * the whole dictionary, so it is a full document load. A client-side
 * transition would re-render the root layout in the browser, dropping the
 * pre-paint classes on <html> and re-creating its inline init script.
 */
export function LanguageSwitch({ className }: { className?: string }) {
  const pathname = usePathname();
  const { locale, dict } = useI18n();
  const target = locale === "ar" ? "en" : "ar";

  return (
    <a
      href={switchLocalePath(pathname, target)}
      hrefLang={target}
      lang={target}
      aria-label={dict.a11y.switchLanguageLabel}
      className={cn(
        "inline-flex min-h-10 items-center gap-1.5 rounded-[3px] px-2.5 text-[0.875rem] text-ink-2 transition-colors hover:bg-mist hover:text-ink",
        className,
      )}
    >
      <Languages aria-hidden strokeWidth={1.5} className="size-4" />
      <span>{dict.a11y.switchLanguage}</span>
    </a>
  );
}
