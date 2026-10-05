import { Mail, Phone, type LucideIcon } from "lucide-react";
import { mailtoHref, phoneHref } from "@/data/patientSupport";
import type { SupportContact } from "@/features/patient-support/types";
import type { Dictionary } from "@/i18n/dictionaries/ar";
import { cn, format } from "@/lib/localized";
import { CopyButton } from "./CopyButton";

interface Row {
  key: "phone" | "email";
  icon: LucideIcon;
  label: string;
  value: string;
  href: string;
  action: string;
  copy: string;
}

/**
 * The approved inquiry details as large, direct actions: call / send email
 * as real links (tel:, mailto:) and copy buttons with inline confirmation.
 * Values render left-to-right inside Arabic text and stay selectable.
 */
export function SupportContactActions({
  contact,
  dict,
  size = "md",
  className,
}: {
  contact: SupportContact;
  dict: Dictionary;
  size?: "md" | "lg";
  className?: string;
}) {
  const copy = dict.patientSupport.actions;
  const rows: Row[] = [
    {
      key: "phone",
      icon: Phone,
      label: copy.phone,
      value: contact.phone,
      href: phoneHref(contact.phone),
      action: copy.call,
      copy: copy.copyPhone,
    },
    {
      key: "email",
      icon: Mail,
      label: copy.email,
      value: contact.email,
      href: mailtoHref(contact.email),
      action: copy.sendEmail,
      copy: copy.copyEmail,
    },
  ];
  const large = size === "lg";

  return (
    <ul className={cn("border-t border-ink/15", className)}>
      {rows.map((row) => {
        const Icon = row.icon;
        return (
          <li
            key={row.key}
            data-reveal
            data-contact-row={row.key}
            className={cn("flex flex-wrap items-center gap-x-5 gap-y-4 border-b border-line", large ? "py-6" : "py-5")}
          >
            <span
              aria-hidden
              className={cn(
                "flex shrink-0 items-center justify-center border border-line bg-paper text-care-deep",
                large ? "size-14" : "size-11",
              )}
            >
              <Icon strokeWidth={1.5} className={large ? "size-6" : "size-5"} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-meta">{row.label}</span>
              {/* Never broken mid-number or mid-address. */}
              <span
                className={cn(
                  "mt-0.5 block select-all whitespace-nowrap font-display text-ink",
                  large ? "text-[1.375rem] sm:text-[1.75rem]" : "text-[1.25rem]",
                )}
              >
                <bdi dir="ltr">{row.value}</bdi>
              </span>
            </span>
            {/* Compact panels give the actions their own row; the large block keeps them inline from sm up. */}
            <span className={cn("grid w-full grid-cols-2 gap-2", large && "sm:flex sm:w-auto sm:shrink-0")}>
              <a
                href={row.href}
                data-contact-action
                className="group/btn inline-flex min-h-12 items-center justify-center gap-2 rounded-[3px] bg-care-deep px-4 text-[0.9375rem] font-medium text-white transition-colors duration-200 hover:bg-care-ink"
              >
                <Icon aria-hidden strokeWidth={1.75} className="size-4" />
                {row.action}
                <span className="visually-hidden">: {row.value}</span>
              </a>
              <CopyButton
                value={row.value}
                label={row.copy}
                copiedText={copy.copied}
                failedText={copy.copyFailed}
                announcement={format(copy.copiedAnnouncement, { label: row.label })}
              />
            </span>
          </li>
        );
      })}
    </ul>
  );
}
