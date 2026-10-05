"use client";

import Link from "next/link";
import { useRef, type ReactNode } from "react";
import { useMagnetic } from "@/animations/magnetic";
import { buttonClasses, ForwardArrow } from "./Button";

/** Primary CTA with a subtle magnetic response. Reserved for a few key actions. */
export function MagneticLink({
  href,
  children,
  size = "md",
  arrow = true,
  className,
  ...rest
}: {
  href: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg";
  arrow?: boolean;
  className?: string;
} & Omit<React.ComponentProps<typeof Link>, "href" | "children" | "className">) {
  const ref = useRef<HTMLAnchorElement>(null);
  useMagnetic(ref, size === "sm" ? 4 : 6);
  return (
    <Link ref={ref} href={href} className={buttonClasses({ variant: "primary", size, className })} {...rest}>
      <span>{children}</span>
      {arrow && <ForwardArrow />}
    </Link>
  );
}
