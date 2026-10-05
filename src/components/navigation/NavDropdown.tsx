"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type FocusEvent, type KeyboardEvent, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { gsap } from "@/animations/gsap";
import { prefersReducedMotion } from "@/animations/motion";
import { cn } from "@/lib/localized";

export interface DropdownLink {
  href: string;
  label: string;
  icon?: ReactNode;
  active: boolean;
}

/**
 * Disclosure-style dropdown: the parent link still navigates; a separate
 * chevron button opens the menu. Keyboard: Enter/Space/ArrowDown open and
 * move into the list, arrows move between items, Escape closes and returns
 * focus. Opens on hover for mouse users; closes on outside click or when
 * focus leaves.
 */
export function NavDropdown({
  label,
  href,
  menuLabel,
  links,
  active,
  linkClassName,
  onLinkFocus,
  onLinkHover,
}: {
  label: string;
  href: string;
  menuLabel: string;
  links: DropdownLink[];
  active: boolean;
  linkClassName: string;
  onLinkFocus?: (el: HTMLElement) => void;
  onLinkHover?: (el: HTMLElement) => void;
}) {
  const [open, setOpen] = useState(false);
  const wrapper = useRef<HTMLLIElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLUListElement>(null);
  const closeTimer = useRef<number | undefined>(undefined);
  /** Opened by mouse hover (not yet "pinned" by a click). */
  const hoverOpened = useRef(false);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onDocumentPointer = (e: PointerEvent) => {
      if (!wrapper.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDocumentPointer);
    if (panel.current && !prefersReducedMotion()) {
      gsap.fromTo(panel.current, { opacity: 0, y: -6 }, { opacity: 1, y: 0, duration: 0.25, ease: "power2.out" });
    }
    return () => document.removeEventListener("pointerdown", onDocumentPointer);
  }, [open]);

  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  const items = () => Array.from(panel.current?.querySelectorAll<HTMLAnchorElement>("a") ?? []);

  const focusItem = (index: number) => {
    const list = items();
    list[(index + list.length) % list.length]?.focus();
  };

  const onToggleKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      requestAnimationFrame(() => focusItem(0));
    }
  };

  const onPanelKey = (e: KeyboardEvent<HTMLUListElement>) => {
    const list = items();
    const index = list.findIndex((el) => el === document.activeElement);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      focusItem(index + 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      focusItem(index - 1);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      toggle.current?.focus();
    }
  };

  const onBlurWithin = (e: FocusEvent<HTMLLIElement>) => {
    if (!wrapper.current?.contains(e.relatedTarget as Node | null)) setOpen(false);
  };

  return (
    <li
      ref={wrapper}
      className="relative flex items-center"
      onPointerEnter={(e) => {
        if (e.pointerType !== "mouse") return;
        window.clearTimeout(closeTimer.current);
        if (!open) hoverOpened.current = true;
        setOpen(true);
      }}
      onPointerLeave={(e) => {
        if (e.pointerType !== "mouse") return;
        closeTimer.current = window.setTimeout(() => setOpen(false), 140);
      }}
      onBlur={onBlurWithin}
      onKeyDown={(e) => {
        if (e.key === "Escape" && open) {
          setOpen(false);
          toggle.current?.focus();
        }
      }}
    >
      <Link
        href={href}
        data-nav-active={active ? "true" : undefined}
        aria-current={links.find((l) => l.href === href)?.active ? "page" : undefined}
        className={linkClassName}
        onMouseEnter={(e) => onLinkHover?.(e.currentTarget)}
        onFocus={(e) => onLinkFocus?.(e.currentTarget)}
      >
        {label}
      </Link>
      <button
        ref={toggle}
        type="button"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={menuLabel}
        onClick={() => {
          // A click on a menu that hover just opened confirms it rather than closing it.
          if (hoverOpened.current && open) {
            hoverOpened.current = false;
            return;
          }
          hoverOpened.current = false;
          setOpen((o) => !o);
        }}
        onKeyDown={onToggleKey}
        className="-ms-1.5 flex size-8 items-center justify-center rounded-[3px] text-ink-2/80 transition-colors hover:bg-mist hover:text-ink"
      >
        <ChevronDown aria-hidden strokeWidth={1.75} className={cn("size-4 transition-transform duration-300", open && "rotate-180")} />
      </button>

      {open && (
        <ul
          ref={panel}
          id={menuId}
          onKeyDown={onPanelKey}
          className="absolute end-0 top-full z-10 mt-2 min-w-[15rem] border border-line bg-paper p-1.5 shadow-[var(--shadow-lift)]"
        >
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={link.active ? "page" : undefined}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex min-h-11 items-center gap-3 px-3 py-2 text-[0.9375rem] transition-colors hover:bg-mist focus-visible:bg-mist",
                  link.active ? "font-medium text-care-deep" : "text-ink",
                )}
              >
                {link.icon}
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}
