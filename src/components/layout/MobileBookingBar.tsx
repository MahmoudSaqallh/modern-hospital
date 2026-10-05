"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { Phone } from "lucide-react";
import { localePath } from "@/i18n/config";
import { useI18n } from "@/i18n/I18nProvider";
import { organization, telHref } from "@/config/organization";
import { buttonClasses, ForwardArrow } from "@/components/ui/Button";

/** Routes that already carry their own booking action. */
const HIDDEN_ON = [/^\/(ar|en)\/booking/, /^\/(ar|en)\/doctors\/[^/]+/, /^\/(ar|en)\/complaints/];

/**
 * Sticky booking action for small screens. Appears after the first screen
 * (so it never covers the hero CTA) and hides near the footer.
 * A matching spacer keeps it from covering the last content on the page.
 */
export function MobileBookingBar() {
  const { locale, dict } = useI18n();
  const pathname = usePathname();
  const bar = useRef<HTMLDivElement>(null);
  const hidden = HIDDEN_ON.some((pattern) => pattern.test(pathname));

  useEffect(() => {
    if (hidden) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const el = bar.current;
      if (!el) return;
      const footer = document.querySelector("footer");
      const nearFooter = footer ? footer.getBoundingClientRect().top < window.innerHeight - 40 : false;
      const visible = window.scrollY > window.innerHeight * 0.6 && !nearFooter;
      el.dataset.visible = String(visible);
      // Off-screen controls must not receive keyboard focus.
      el.inert = !visible;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [hidden, pathname]);

  if (hidden) return null;
  const phone = organization.contact.phone;

  return (
    <div
      ref={bar}
      data-visible="false"
      inert
      className="no-print fixed inset-x-0 bottom-0 z-40 translate-y-full border-t border-line bg-paper/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 transition-transform duration-300 ease-[var(--ease-out-quart)] data-[visible=true]:translate-y-0 lg:hidden"
    >
      <div className="mx-auto flex max-w-xl items-center gap-2.5">
        <Link href={localePath(locale, "/booking")} className={buttonClasses({ size: "md", className: "flex-1" })}>
          <span>{dict.mobileBar.book}</span>
          <ForwardArrow />
        </Link>
        {phone && (
          <a href={telHref(phone)} className={buttonClasses({ variant: "secondary", size: "md", className: "px-4" })}>
            <Phone aria-hidden strokeWidth={1.5} className="size-[1.1rem]" />
            <span>{dict.mobileBar.call}</span>
          </a>
        )}
      </div>
    </div>
  );
}
