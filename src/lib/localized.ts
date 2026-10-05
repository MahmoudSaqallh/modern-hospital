import type { Locale } from "@/i18n/config";

/** A string provided in every supported language. */
export type LocalizedText = Record<Locale, string>;

export function pick(text: LocalizedText, locale: Locale): string {
  return text[locale];
}

/** Replace `{name}` tokens in a dictionary string. */
export function format(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
