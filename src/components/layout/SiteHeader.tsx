"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";
import { FolderKanban, HandHeart, Menu, MessageSquareText, Phone, type LucideIcon } from "lucide-react";
import { gsap, useGSAP } from "@/animations/gsap";
import { prefersReducedMotion } from "@/animations/motion";
import { localePath } from "@/i18n/config";
import { useI18n } from "@/i18n/I18nProvider";
import { organization } from "@/config/organization";
import { cn } from "@/lib/localized";
import { NAV_ITEMS, isActiveItem, isActivePath, type NavKey } from "@/components/navigation/navItems";
import { NavDropdown } from "@/components/navigation/NavDropdown";
import { LanguageSwitch } from "@/components/navigation/LanguageSwitch";
import { MagneticLink } from "@/components/ui/MagneticLink";
import { MobileMenu, type MobileMenuHandle } from "./MobileMenu";

const COMPACT_AFTER = 24;

const DROPDOWN_ICONS: Partial<Record<NavKey, LucideIcon>> = {
  contact: Phone,
  complaints: MessageSquareText,
  projects: FolderKanban,
  patientSupport: HandHeart,
};

function DropdownIcon({ navKey }: { navKey: NavKey }) {
  const Icon = DROPDOWN_ICONS[navKey];
  return Icon ? <Icon aria-hidden strokeWidth={1.5} className="size-4 text-muted" /> : null;
}

export function SiteHeader() {
  const { locale, dict } = useI18n();
  const pathname = usePathname();
  const header = useRef<HTMLElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const indicator = useRef<HTMLSpanElement>(null);
  const menu = useRef<MobileMenuHandle>(null);
  const menuButton = useRef<HTMLButtonElement>(null);

  // Integrated with the hero at the top; compact, translucent and softly blurred once scrolled.
  // GSAP handles the surface transition; a data attribute drives the size changes (no re-render).
  useEffect(() => {
    let frame = 0;
    let last: boolean | null = null;
    const update = () => {
      frame = 0;
      const el = header.current;
      if (!el) return;
      const scrolled = window.scrollY > COMPACT_AFTER;
      if (scrolled === last) return;
      const instant = last === null || prefersReducedMotion();
      last = scrolled;
      el.dataset.scrolled = String(scrolled);
      gsap.to(el, {
        backgroundColor: scrolled ? "rgba(250, 251, 249, 0.86)" : "rgba(250, 251, 249, 0)",
        borderBottomColor: scrolled ? "rgba(228, 232, 227, 1)" : "rgba(228, 232, 227, 0)",
        backdropFilter: scrolled ? "blur(14px) saturate(1.15)" : "blur(0px) saturate(1)",
        boxShadow: scrolled ? "0 10px 30px -24px rgba(23, 32, 26, 0.35)" : "0 10px 30px -24px rgba(23, 32, 26, 0)",
        duration: instant ? 0 : 0.45,
        ease: "power2.out",
        overwrite: "auto",
      });
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  /** Slide the active line under a given link (or the current page's link). */
  const moveIndicator = useCallback((target?: HTMLElement | null, instant = false) => {
    const bar = indicator.current;
    const ul = list.current;
    if (!bar || !ul) return;
    const link = target ?? ul.querySelector<HTMLElement>("[data-nav-active='true']");
    if (!link) {
      gsap.to(bar, { autoAlpha: 0, duration: 0.2 });
      return;
    }
    // Measure against the nav itself (dropdown items are positioned, so offsetLeft would lie).
    const nav = bar.parentElement;
    if (!nav) return;
    const inset = 10;
    const linkRect = link.getBoundingClientRect();
    const navRect = nav.getBoundingClientRect();
    gsap.to(bar, {
      x: linkRect.left - navRect.left + inset,
      width: Math.max(linkRect.width - inset * 2, 8),
      autoAlpha: 1,
      duration: instant || prefersReducedMotion() ? 0 : 0.45,
      ease: "power3.out",
    });
  }, []);

  useGSAP(() => moveIndicator(null, true), { dependencies: [pathname], scope: header });

  useEffect(() => {
    const onResize = () => moveIndicator(null, true);
    window.addEventListener("resize", onResize);
    // Fonts change link widths once loaded.
    document.fonts?.ready.then(onResize).catch(() => {});
    return () => window.removeEventListener("resize", onResize);
  }, [moveIndicator]);

  return (
    <header
      ref={header}
      data-scrolled="false"
      className="group/header fixed inset-x-0 top-0 z-50 border-b border-transparent"
    >
      <div className="container-site flex h-[76px] items-center gap-4 transition-[height] duration-300 ease-[var(--ease-out-quart)] group-data-[scrolled=true]/header:h-16 lg:h-[88px] lg:group-data-[scrolled=true]/header:h-[68px]">
        <Link href={localePath(locale)} aria-label={dict.a11y.homeLink} className="flex shrink-0 items-center gap-3">
          <Image
            src={organization.logo}
            alt=""
            width={52}
            height={52}
            className="size-11 transition-[width,height] duration-300 group-data-[scrolled=true]/header:size-10 lg:size-[52px] lg:group-data-[scrolled=true]/header:size-11"
          />
          <span className="flex flex-col leading-tight">
            <span className="font-display text-[0.98rem] font-medium text-ink sm:text-[1.05rem]">
              {organization.name.ar}
            </span>
            <span lang="en" dir="ltr" className="text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-muted">
              {organization.name.en}
            </span>
          </span>
        </Link>

        <nav aria-label={dict.a11y.mainNav} className="relative ms-auto hidden xl:block">
          <ul ref={list} className="relative flex items-center" onMouseLeave={() => moveIndicator()}>
            {NAV_ITEMS.map((item) => {
              const active = isActiveItem(pathname, locale, item);
              const linkClassName = cn(
                "relative block px-2.5 py-2.5 text-[0.9375rem] transition-colors duration-200",
                active ? "text-ink" : "text-ink-2/80 hover:text-ink",
              );
              if (item.children) {
                return (
                  <NavDropdown
                    key={item.key}
                    label={dict.nav[item.key]}
                    href={localePath(locale, item.path)}
                    menuLabel={dict.nav[item.menuLabel ?? "contactMenu"]}
                    active={active}
                    linkClassName={linkClassName}
                    onLinkHover={(el) => moveIndicator(el)}
                    onLinkFocus={(el) => moveIndicator(el)}
                    links={item.children.map((child) => ({
                      href: localePath(locale, child.path),
                      label: dict.nav[child.key],
                      active: isActivePath(pathname, locale, child.path),
                      icon: <DropdownIcon navKey={child.key} />,
                    }))}
                  />
                );
              }
              return (
                <li key={item.key}>
                  <Link
                    href={localePath(locale, item.path)}
                    aria-current={isActivePath(pathname, locale, item.path) ? "page" : undefined}
                    data-nav-active={active ? "true" : undefined}
                    onMouseEnter={(e) => moveIndicator(e.currentTarget)}
                    onFocus={(e) => moveIndicator(e.currentTarget)}
                    onBlur={() => moveIndicator()}
                    className={linkClassName}
                  >
                    {dict.nav[item.key]}
                  </Link>
                </li>
              );
            })}
          </ul>
          <span
            ref={indicator}
            aria-hidden
            className="invisible absolute -bottom-px left-0 h-[2px] w-0 bg-care-deep opacity-0"
          />
        </nav>

        <div className="ms-auto flex items-center gap-1.5 xl:ms-4">
          {/* max-sm:hidden (a variant) reliably overrides the components' base inline-flex. */}
          <LanguageSwitch className="max-sm:hidden" />
          <MagneticLink href={localePath(locale, "/booking")} size="sm" className="max-sm:hidden">
            {dict.nav.cta}
          </MagneticLink>
          <button
            ref={menuButton}
            type="button"
            onClick={() => menu.current?.open()}
            aria-haspopup="dialog"
            aria-controls="mobile-menu"
            className="inline-flex size-11 items-center justify-center rounded-[3px] text-ink transition-colors hover:bg-mist xl:hidden"
          >
            <Menu aria-hidden strokeWidth={1.5} className="size-6" />
            <span className="visually-hidden">{dict.a11y.openMenu}</span>
          </button>
        </div>
      </div>

      <MobileMenu ref={menu} returnFocusTo={menuButton} />
    </header>
  );
}
