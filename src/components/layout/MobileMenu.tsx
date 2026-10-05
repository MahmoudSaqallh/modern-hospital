"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, type RefObject } from "react";
import { Phone, X } from "lucide-react";
import { gsap } from "@/animations/gsap";
import { prefersReducedMotion } from "@/animations/motion";
import { localePath } from "@/i18n/config";
import { useI18n } from "@/i18n/I18nProvider";
import { organization, telHref } from "@/config/organization";
import { cn } from "@/lib/localized";
import { NAV_ITEMS, SECONDARY_NAV, isActivePath } from "@/components/navigation/navItems";
import { LanguageSwitch } from "@/components/navigation/LanguageSwitch";
import { ArcMark } from "@/components/ui/ArcMark";
import { buttonClasses, ForwardArrow } from "@/components/ui/Button";

export interface MobileMenuHandle {
  open: () => void;
}

/**
 * Drawer built on the native <dialog>: focus trapping, Escape and an inert
 * background come from the platform. GSAP only handles enter/exit motion.
 */
export const MobileMenu = forwardRef<MobileMenuHandle, { returnFocusTo: RefObject<HTMLButtonElement | null> }>(
  function MobileMenu({ returnFocusTo }, ref) {
    const { locale, dir, dict } = useI18n();
    const pathname = usePathname();
    const dialog = useRef<HTMLDialogElement>(null);
    const panel = useRef<HTMLDivElement>(null);
    const closing = useRef(false);

    const finishClose = useCallback(() => {
      const el = dialog.current;
      closing.current = false;
      document.documentElement.classList.remove("scroll-locked");
      if (el?.open) el.close();
      returnFocusTo.current?.focus();
    }, [returnFocusTo]);

    const close = useCallback(() => {
      const el = dialog.current;
      if (!el?.open || closing.current) return;
      closing.current = true;
      if (prefersReducedMotion()) return finishClose();
      gsap.to(panel.current, {
        xPercent: dir === "rtl" ? -100 : 100,
        duration: 0.35,
        ease: "power2.in",
        onComplete: finishClose,
      });
    }, [dir, finishClose]);

    useImperativeHandle(ref, () => ({
      open() {
        const el = dialog.current;
        if (!el || el.open) return;
        el.showModal();
        document.documentElement.classList.add("scroll-locked");
        if (prefersReducedMotion()) return;
        const items = panel.current?.querySelectorAll("[data-menu-item]") ?? [];
        gsap
          .timeline()
          .fromTo(panel.current, { xPercent: dir === "rtl" ? -100 : 100 }, { xPercent: 0, duration: 0.55, ease: "expo.out" })
          .fromTo(items, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.04 }, "-=0.35");
      },
    }));

    // Navigating closes the drawer.
    useEffect(() => {
      if (dialog.current?.open) finishClose();
    }, [pathname, finishClose]);

    useEffect(() => () => document.documentElement.classList.remove("scroll-locked"), []);

    const phone = organization.contact.phone;

    return (
      <dialog
        ref={dialog}
        id="mobile-menu"
        aria-label={dict.a11y.mainNav}
        onCancel={(e) => {
          e.preventDefault();
          close();
        }}
        onClick={(e) => {
          if (e.target === dialog.current) close();
        }}
        className="m-0 ms-auto h-dvh max-h-none w-[min(26rem,100vw)] max-w-none overflow-hidden border-0 bg-transparent p-0 backdrop:bg-ink/35"
      >
        <div ref={panel} className="flex h-full flex-col bg-paper">
          <div className="flex h-[76px] items-center justify-between border-b border-line px-5">
            <span className="flex items-center gap-2.5 text-eyebrow">
              <ArcMark size={16} />
              {organization.name[locale]}
            </span>
            <button
              type="button"
              onClick={close}
              className="inline-flex size-11 items-center justify-center rounded-[3px] hover:bg-mist"
            >
              <X aria-hidden strokeWidth={1.5} className="size-6" />
              <span className="visually-hidden">{dict.a11y.closeMenu}</span>
            </button>
          </div>

          <nav aria-label={dict.a11y.mainNav} className="flex-1 overflow-y-auto px-5 py-4">
            <ul>
              {NAV_ITEMS.map((item, i) => {
                const active = isActivePath(pathname, locale, item.path);
                // Children beyond the parent itself (e.g. Complaints under Contact) are listed indented.
                const extra = item.children?.filter((child) => child.path !== item.path) ?? [];
                return (
                  <li key={item.key} data-menu-item className="border-b border-line">
                    <Link
                      href={localePath(locale, item.path)}
                      aria-current={active ? "page" : undefined}
                      onClick={close}
                      className="group/btn flex min-h-14 items-center gap-4 py-2.5"
                    >
                      <span className="font-mono text-xs text-muted tabular">{String(i + 1).padStart(2, "0")}</span>
                      <span className={cn("font-display text-[1.25rem]", active ? "text-care-deep" : "text-ink")}>
                        {dict.nav[item.key]}
                      </span>
                      {active && <span aria-hidden className="ms-auto size-1.5 rounded-full bg-care-deep" />}
                    </Link>
                    {extra.length > 0 && (
                      <ul className="mb-2 ms-9 border-s border-line ps-4">
                        {extra.map((child) => {
                          const childActive = isActivePath(pathname, locale, child.path);
                          return (
                            <li key={child.key}>
                              <Link
                                href={localePath(locale, child.path)}
                                aria-current={childActive ? "page" : undefined}
                                onClick={close}
                                className={cn("flex min-h-11 items-center text-[1rem]", childActive ? "text-care-deep" : "text-ink-2")}
                              >
                                {dict.nav[child.key]}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
            <ul data-menu-item className="mt-4 flex flex-wrap gap-x-6">
              {SECONDARY_NAV.map((item) => (
                <li key={item.key}>
                  <Link
                    href={localePath(locale, item.path)}
                    onClick={close}
                    className="inline-flex min-h-11 items-center text-[0.9375rem] text-ink-2 underline decoration-line-strong underline-offset-4"
                  >
                    {dict.nav[item.key]}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="space-y-3 border-t border-line px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4">
            <Link
              data-menu-item
              href={localePath(locale, "/booking")}
              onClick={close}
              className={buttonClasses({ size: "lg", className: "w-full" })}
            >
              <span>{dict.nav.cta}</span>
              <ForwardArrow />
            </Link>
            <div data-menu-item className="flex items-center justify-between">
              <LanguageSwitch />
              {phone && (
                <a href={telHref(phone)} className="inline-flex min-h-11 items-center gap-2 px-2 text-[0.9375rem] text-ink">
                  <Phone aria-hidden strokeWidth={1.5} className="size-4" />
                  <span dir="ltr">{phone}</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </dialog>
    );
  },
);
