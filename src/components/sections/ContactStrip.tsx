"use client";

import { useRef } from "react";
import { Clock3, MapPin, MessageCircle, Phone, type LucideIcon } from "lucide-react";
import { directionsHref, organization, telHref, whatsappHref } from "@/config/organization";
import { useSceneAnchor, useSceneChapter } from "@/animations/sceneBridge";
import { useClientNow } from "@/features/doctors/hooks/useClientNow";
import { localePath } from "@/i18n/config";
import { useI18n } from "@/i18n/I18nProvider";
import { cn } from "@/lib/localized";
import { Reveal } from "@/components/motion/Reveal";
import { ForwardArrow, TextLink } from "@/components/ui/Button";
import { SectionHeader } from "@/components/ui/SectionHeader";

interface Action {
  key: string;
  icon: LucideIcon;
  label: string;
  value: string | null;
  ltr?: boolean;
  href: string | null;
  external?: boolean;
}

/**
 * Contact preview: four direct actions on one ruled band — call, WhatsApp,
 * location, today's hours. A WebGL connection line runs quietly behind it.
 * Unconfirmed details show a clear "to be announced" state, never fake data.
 */
export function ContactStrip() {
  const { locale, dict } = useI18n();
  const copy = dict.contactStrip;
  const section = useRef<HTMLElement>(null);
  const band = useRef<HTMLUListElement>(null);
  const now = useClientNow();
  useSceneChapter(section, "contact");
  useSceneAnchor(band, "contact-strip");

  const { contact, workingHours } = organization;
  const today = now ? workingHours.find((row) => row.days.includes(now.getDay())) : undefined;

  const actions: Action[] = [
    { key: "phone", icon: Phone, label: copy.phone, value: contact.phone, ltr: true, href: contact.phone ? telHref(contact.phone) : null },
    {
      key: "whatsapp",
      icon: MessageCircle,
      label: copy.whatsapp,
      value: contact.whatsapp,
      ltr: true,
      href: contact.whatsapp ? whatsappHref(contact.whatsapp) : null,
      external: true,
    },
    {
      key: "location",
      icon: MapPin,
      label: copy.location,
      value: contact.address?.[locale] ?? null,
      href: contact.location ? directionsHref(contact.location) : null,
      external: true,
    },
    {
      key: "hours",
      icon: Clock3,
      label: copy.hours,
      value: today ? `${dict.hours.today}: ${today.hours[locale]}` : workingHours[0].hours[locale],
      href: localePath(locale, "/contact"),
    },
  ];

  return (
    <section ref={section} aria-labelledby="contact-strip-title" className="relative py-24 lg:py-32">
      <Reveal className="container-site">
        <SectionHeader
          id="contact-strip-title"
          index="06"
          eyebrow={copy.eyebrow}
          title={copy.title}
          action={<TextLink href={localePath(locale, "/contact")}>{copy.more}</TextLink>}
        />
        <ul ref={band} className="mt-14 grid border-y border-ink/15 sm:grid-cols-2 lg:grid-cols-4">
          {actions.map((action, i) => {
            const Icon = action.icon;
            const body = (
              <>
                <span
                  className={cn(
                    "flex size-12 items-center justify-center border transition-[transform,background-color,border-color,color] duration-300",
                    action.href
                      ? "border-line bg-paper text-care-deep group-hover/btn:-translate-y-0.5 group-hover/btn:border-care-deep group-hover/btn:bg-care-deep group-hover/btn:text-white"
                      : "border-dashed border-line-strong text-muted",
                  )}
                >
                  <Icon aria-hidden strokeWidth={1.5} className="size-5" />
                </span>
                <span className="mt-6 flex items-center justify-between gap-3">
                  <span className="text-[1.0625rem] font-medium text-ink">{action.label}</span>
                  {action.href && <ForwardArrow className="text-muted group-hover/btn:text-care-deep" />}
                </span>
                <span className="mt-1 block text-[0.9375rem] text-muted tabular">
                  {action.value ? action.ltr ? <bdi dir="ltr">{action.value}</bdi> : action.value : dict.common.pending}
                </span>
                <span
                  aria-hidden
                  className="absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 bg-care-deep transition-transform duration-500 group-hover/btn:scale-x-100 rtl:origin-right"
                />
              </>
            );
            const cell = cn(
              "group/btn relative flex h-full flex-col p-6 transition-colors duration-300 lg:p-7",
              action.href && "hover:bg-white/85",
            );
            return (
              <li
                key={action.key}
                data-reveal
                className={cn("border-line", i < 3 && "lg:border-e", i % 2 === 0 && "sm:border-e", i < 2 && "border-b lg:border-b-0", i === 2 && "max-sm:border-b")}
              >
                {action.href ? (
                  <a
                    href={action.href}
                    className={cell}
                    {...(action.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  >
                    {body}
                    {action.external && <span className="visually-hidden"> ({dict.a11y.opensExternal})</span>}
                  </a>
                ) : (
                  <div className={cell}>{body}</div>
                )}
              </li>
            );
          })}
        </ul>
        {!(contact.phone && contact.whatsapp && contact.location) && (
          <p data-reveal className="mt-5 text-meta">
            {dict.contact.pendingNote}
          </p>
        )}
      </Reveal>
    </section>
  );
}
