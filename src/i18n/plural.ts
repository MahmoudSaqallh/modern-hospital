import { intlLocale, type Locale } from "./config";
import { format } from "@/lib/localized";

export interface PluralForms {
  zero: string;
  one: string;
  two: string;
  few: string;
  many: string;
  other: string;
}

/** Pick the grammatically correct form — Arabic has six plural categories. */
export function plural(forms: PluralForms, count: number, locale: Locale): string {
  const category = count === 0 ? "zero" : new Intl.PluralRules(intlLocale[locale]).select(count);
  return format(forms[category], { count });
}
