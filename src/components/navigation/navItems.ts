import type { Dictionary } from "@/i18n/dictionaries/ar";

export type NavKey = keyof Pick<
  Dictionary["nav"],
  | "home"
  | "clinics"
  | "departments"
  | "doctors"
  | "news"
  | "projects"
  | "patientSupport"
  | "booking"
  | "contact"
  | "complaints"
  | "about"
>;

export interface NavItem {
  key: NavKey;
  path: string;
  /** Secondary destinations shown in a dropdown (desktop) or indented (mobile). */
  children?: NavItem[];
  /** Accessible name of the dropdown toggle, when there are children. */
  menuLabel?: keyof Pick<Dictionary["nav"], "contactMenu" | "projectsMenu">;
}

/** Primary navigation, in reading order. */
export const NAV_ITEMS: readonly NavItem[] = [
  { key: "home", path: "/" },
  { key: "clinics", path: "/clinics" },
  { key: "departments", path: "/departments" },
  { key: "doctors", path: "/doctors" },
  { key: "news", path: "/news" },
  {
    key: "projects",
    path: "/projects",
    menuLabel: "projectsMenu",
    children: [
      { key: "projects", path: "/projects" },
      { key: "patientSupport", path: "/patient-support" },
    ],
  },
  { key: "booking", path: "/booking" },
  {
    key: "contact",
    path: "/contact",
    menuLabel: "contactMenu",
    children: [
      { key: "contact", path: "/contact" },
      { key: "complaints", path: "/complaints" },
    ],
  },
];

/** Pages reachable from the footer and the mobile menu's secondary list. */
export const SECONDARY_NAV: readonly NavItem[] = [{ key: "about", path: "/about" }];

/** True when `pathname` (with locale) belongs to the nav item at `path`. */
export function isActivePath(pathname: string, locale: string, path: string): boolean {
  const full = path === "/" ? `/${locale}` : `/${locale}${path}`;
  if (path === "/") return pathname === full || pathname === `${full}/`;
  return pathname === full || pathname.startsWith(`${full}/`);
}

/** A parent is active when it, or any of its children, matches. */
export function isActiveItem(pathname: string, locale: string, item: NavItem): boolean {
  return isActivePath(pathname, locale, item.path) || Boolean(item.children?.some((c) => isActivePath(pathname, locale, c.path)));
}
