import { Info, Mail, MapPin, MessageCircle, Phone, type LucideIcon } from "lucide-react";
import { directionsHref, organization, telHref, whatsappHref } from "@/config/organization";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/ar";
import { cn } from "@/lib/localized";
import { Reveal } from "@/components/motion/Reveal";
import { SceneAnchor } from "@/components/motion/SceneAnchor";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ForwardArrow } from "@/components/ui/Button";
import { MagneticLink } from "@/components/ui/MagneticLink";
import { HoursTable } from "@/components/sections/HoursTable";
import { MapPanel } from "./MapPanel";

interface ContactAction {
  key: string;
  icon: LucideIcon;
  label: string;
  value: string | null;
  /** Direction-neutral values (phone numbers, emails) render LTR inside RTL text. */
  ltrValue?: boolean;
  action: string;
  href: string | null;
  external?: boolean;
}

/**
 * Contact as large, direct actions — call, message, write, get directions —
 * each a full-width row with a generous tap target. Details that have not
 * been confirmed show a clear "to be announced" state instead of fake data.
 */
export function ContactSection({
  locale,
  dict,
  index = "08",
  headingLevel = "h2",
}: {
  locale: Locale;
  dict: Dictionary;
  index?: string;
  headingLevel?: "h1" | "h2";
}) {
  const { contact } = organization;
  const copy = dict.contact;

  const actions: ContactAction[] = [
    {
      key: "phone",
      icon: Phone,
      label: copy.phone,
      value: contact.phone,
      ltrValue: true,
      action: copy.call,
      href: contact.phone ? telHref(contact.phone) : null,
    },
    {
      key: "whatsapp",
      icon: MessageCircle,
      label: copy.whatsapp,
      value: contact.whatsapp,
      ltrValue: true,
      action: copy.chat,
      href: contact.whatsapp ? whatsappHref(contact.whatsapp) : null,
      external: true,
    },
    {
      key: "email",
      icon: Mail,
      label: copy.email,
      value: contact.email,
      ltrValue: true,
      action: copy.write,
      href: contact.email ? `mailto:${contact.email}` : null,
    },
    {
      key: "address",
      icon: MapPin,
      label: copy.address,
      value: contact.address?.[locale] ?? null,
      action: copy.directions,
      href: contact.location ? directionsHref(contact.location) : null,
      external: true,
    },
  ];
  const anyPending = actions.some((a) => !a.value);
  const Heading = headingLevel;

  return (
    <Reveal as="section" aria-labelledby="contact-title" className="relative py-24 lg:py-32">
      <div className="container-site">
        {headingLevel === "h1" ? (
          <div>
            <p data-reveal className="text-eyebrow">{copy.eyebrow}</p>
            <Heading id="contact-title" data-reveal="mask" className="text-hero mt-4 text-ink">
              {copy.title}
            </Heading>
            <p data-reveal className="text-lead mt-5 max-w-[52ch] text-muted">{copy.description}</p>
          </div>
        ) : (
          <SectionHeader id="contact-title" index={index} eyebrow={copy.eyebrow} title={copy.title} description={copy.description} />
        )}

        {/* Contact page only: a band where the WebGL "communication line" flows, clear of any text. */}
        {headingLevel === "h1" && <SceneAnchor anchor="contact-strip" className="mt-6 h-16" />}

        <div className={cn("grid gap-12 lg:grid-cols-12 lg:gap-14", headingLevel === "h1" ? "mt-6" : "mt-14")}>
          <div className="lg:col-span-7">
            <ul className="border-t border-ink/15">
              {actions.map((item) => {
                const Icon = item.icon;
                const body = (
                  <>
                    <span
                      className={cn(
                        "flex size-12 shrink-0 items-center justify-center border transition-colors duration-300",
                        item.href
                          ? "border-line bg-paper text-care-deep group-hover/btn:border-care-deep group-hover/btn:bg-care-deep group-hover/btn:text-white"
                          : "border-dashed border-line-strong text-muted",
                      )}
                    >
                      <Icon aria-hidden strokeWidth={1.5} className="size-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-meta">{item.label}</span>
                      {item.value ? (
                        <span className="mt-0.5 block truncate font-display text-[1.3rem] text-ink sm:text-[1.5rem]">
                          {item.ltrValue ? <bdi dir="ltr">{item.value}</bdi> : item.value}
                        </span>
                      ) : (
                        <span className="mt-1 block text-[1.0625rem] text-muted">{dict.common.pending}</span>
                      )}
                    </span>
                    <span
                      className={cn(
                        "hidden shrink-0 items-center gap-2 text-[0.9375rem] font-medium sm:inline-flex",
                        item.href ? "text-care-deep" : "text-muted/70",
                      )}
                    >
                      {item.action}
                      {item.href && <ForwardArrow />}
                    </span>
                  </>
                );
                const rowClass = "group/btn flex min-h-24 items-center gap-5 py-5 sm:gap-6";
                return (
                  <li key={item.key} data-reveal className="border-b border-line">
                    {item.href ? (
                      <a
                        href={item.href}
                        className={cn(rowClass, "transition-colors duration-300 hover:bg-white sm:px-4")}
                        {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      >
                        {body}
                        <span className="visually-hidden">
                          {item.action}
                          {item.external ? ` (${dict.a11y.opensExternal})` : ""}
                        </span>
                      </a>
                    ) : (
                      <div className={cn(rowClass, "sm:px-4")}>{body}</div>
                    )}
                  </li>
                );
              })}
            </ul>

            {anyPending && (
              <p data-reveal className="mt-5 flex items-start gap-2.5 text-meta">
                <Info aria-hidden strokeWidth={1.5} className="mt-0.5 size-4 shrink-0" />
                {copy.pendingNote}
              </p>
            )}

            <div data-reveal className="mt-14">
              <h3 className="text-h3 text-ink">{copy.hoursTitle}</h3>
              <HoursTable className="mt-4" />
            </div>
            <div
              data-reveal
              className="mt-10 flex flex-col gap-5 border-s-2 border-care-deep bg-care-tint/50 p-6 sm:flex-row sm:items-center sm:justify-between"
            >
              <p className="font-display text-[1.25rem] text-ink">{copy.bookInstead}</p>
              <MagneticLink href={localePath(locale, "/booking")} className="shrink-0">
                {copy.bookCta}
              </MagneticLink>
            </div>
          </div>

          <div data-reveal="fade" className="lg:col-span-5">
            <MapPanel locale={locale} dict={dict} className="h-full min-h-[30rem] lg:sticky lg:top-28 lg:max-h-[44rem]" />
          </div>
        </div>
      </div>
    </Reveal>
  );
}
