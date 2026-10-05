import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/localized";

type Variant = "primary" | "secondary" | "quiet" | "inverse";
type Size = "sm" | "md" | "lg";

const base =
  "group/btn relative inline-flex items-center justify-center gap-2.5 whitespace-nowrap rounded-[3px] font-medium " +
  "transition-[background-color,border-color,color,box-shadow] duration-200 ease-[var(--ease-out-quart)] " +
  "disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:cursor-not-allowed aria-disabled:opacity-50";

const variants: Record<Variant, string> = {
  // Primary carries a soft light sweep on hover (pseudo-element, transform-only, off for reduced motion).
  primary:
    "overflow-hidden bg-care-deep text-white shadow-[0_1px_0_rgb(255_255_255/0.12)_inset] hover:bg-care-ink hover:shadow-[var(--shadow-soft)] active:bg-care-ink " +
    "after:pointer-events-none after:absolute after:inset-y-0 after:left-0 after:w-1/3 after:-translate-x-full after:skew-x-[-18deg] after:bg-white/18 after:opacity-0 after:transition-[transform,opacity] after:duration-700 after:ease-[var(--ease-out-quart)] " +
    "hover:after:translate-x-[320%] hover:after:opacity-100 motion-reduce:after:hidden",
  secondary: "border border-line-strong bg-white/70 text-ink hover:border-ink/40 hover:bg-white",
  quiet: "text-ink hover:text-care-deep",
  inverse: "bg-white text-ink hover:bg-care-tint",
};

const sizes: Record<Size, string> = {
  sm: "min-h-10 px-4 text-[0.875rem]",
  md: "min-h-12 px-5 text-[0.9375rem]",
  lg: "min-h-14 px-7 text-base",
};

export function buttonClasses({
  variant = "primary",
  size = "md",
  className,
}: { variant?: Variant; size?: Size; className?: string } = {}) {
  return cn(base, variants[variant], variant === "quiet" ? "px-0" : sizes[size], className);
}

/** Arrow that follows reading direction and nudges forward on hover. */
export function ForwardArrow({ className }: { className?: string }) {
  return (
    <ArrowRight
      aria-hidden
      strokeWidth={1.75}
      className={cn(
        "size-[1.05em] shrink-0 transition-transform duration-300 ease-[var(--ease-out-quart)] rtl:-scale-x-100",
        "group-hover/btn:translate-x-1 rtl:group-hover/btn:-translate-x-1",
        className,
      )}
    />
  );
}

interface CommonProps {
  variant?: Variant;
  size?: Size;
  arrow?: boolean;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Button({
  variant,
  size,
  arrow,
  icon,
  children,
  className,
  type = "button",
  ...rest
}: CommonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type={type} className={buttonClasses({ variant, size, className })} {...rest}>
      {icon}
      <span>{children}</span>
      {arrow && <ForwardArrow />}
    </button>
  );
}

export function ButtonLink({
  href,
  variant,
  size,
  arrow,
  icon,
  children,
  className,
  ...rest
}: CommonProps & { href: string } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href">) {
  const external = /^(https?:|tel:|mailto:)/.test(href);
  const content = (
    <>
      {icon}
      <span>{children}</span>
      {arrow && <ForwardArrow />}
    </>
  );
  if (external) {
    return (
      <a href={href} className={buttonClasses({ variant, size, className })} {...rest}>
        {content}
      </a>
    );
  }
  return (
    <Link href={href} className={buttonClasses({ variant, size, className })} {...rest}>
      {content}
    </Link>
  );
}

/** Inline text link with an underline that draws in from the reading start. */
export function TextLink({
  href,
  children,
  className,
  arrow = true,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  arrow?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group/btn inline-flex items-center gap-2 font-medium text-ink transition-colors hover:text-care-deep",
        className,
      )}
    >
      <span className="relative">
        {children}
        <span aria-hidden className="absolute inset-x-0 -bottom-0.5 h-px bg-current opacity-25" />
        <span
          aria-hidden
          className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-current transition-transform duration-300 ease-[var(--ease-out-quart)] group-hover/btn:scale-x-100 group-focus-visible/btn:scale-x-100 rtl:origin-right"
        />
      </span>
      {arrow && <ForwardArrow />}
    </Link>
  );
}
