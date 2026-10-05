export const locales = ["ar", "en"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "ar";

export const localeDirection: Record<Locale, "rtl" | "ltr"> = {
  ar: "rtl",
  en: "ltr",
};

/**
 * Intl locale tags. Arabic uses Latin digits (0-9) so times, dates and
 * reference numbers read consistently across the booking flow.
 */
export const intlLocale: Record<Locale, string> = {
  ar: "ar-u-nu-latn",
  en: "en-GB",
};

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/** Prefix an internal path with the active locale: localePath("ar", "/booking") → "/ar/booking". */
export function localePath(locale: Locale, path = "/"): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return clean === "/" ? `/${locale}` : `/${locale}${clean}`;
}

/** Swap the locale segment of a pathname, keeping the rest of the route. */
export function switchLocalePath(pathname: string, next: Locale): string {
  const segments = pathname.split("/");
  if (segments.length > 1 && isLocale(segments[1])) {
    segments[1] = next;
    return segments.join("/") || `/${next}`;
  }
  return localePath(next, pathname);
}
