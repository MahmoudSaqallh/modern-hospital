import type { Dictionary } from "@/i18n/dictionaries/ar";

export type NavKey = keyof Pick<Dictionary["nav"], "home" | "departments" | "doctors" | "booking" | "about" | "contact">;

export const NAV_ITEMS: ReadonlyArray<{ key: NavKey; path: string }> = [
  { key: "home", path: "/" },
  { key: "departments", path: "/departments" },
  { key: "doctors", path: "/doctors" },
  { key: "booking", path: "/booking" },
  { key: "about", path: "/about" },
  { key: "contact", path: "/contact" },
];

/** True when `pathname` (with locale) belongs to the nav item at `path`. */
export function isActivePath(pathname: string, locale: string, path: string): boolean {
  const full = path === "/" ? `/${locale}` : `/${locale}${path}`;
  if (path === "/") return pathname === full || pathname === `${full}/`;
  return pathname === full || pathname.startsWith(`${full}/`);
}
