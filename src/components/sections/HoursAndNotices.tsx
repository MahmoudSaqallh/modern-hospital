import { announcements, type AnnouncementKind } from "@/data/announcements";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/ar";
import { formatDate } from "@/lib/dates";
import { cn } from "@/lib/localized";
import { Reveal } from "@/components/motion/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { HoursTable } from "./HoursTable";

const KIND_DOT: Record<AnnouncementKind, string> = {
  schedule: "bg-ink",
  availability: "bg-care",
  awareness: "bg-medical",
  service: "bg-care-deep",
};

/** Announcements as an editorial list beside the working-hours module. */
export function HoursAndNotices({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <Reveal as="section" aria-labelledby="notices-title" className="relative border-t border-line py-24 lg:py-32">
      <div className="container-site grid gap-20 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-7">
          <SectionHeader id="notices-title" eyebrow={dict.announcements.eyebrow} title={dict.announcements.title} />
          <ol className="mt-12 border-t border-ink/15">
            {announcements.map((item) => (
              <li
                key={item.id}
                data-reveal
                className="grid gap-x-8 gap-y-2 border-b border-line py-7 sm:grid-cols-[9.5rem_minmax(0,1fr)]"
              >
                <div className="flex flex-row gap-3 sm:flex-col sm:gap-1.5">
                  <time dateTime={item.date} className="text-meta tabular">
                    {formatDate(item.date, locale, { day: "numeric", month: "long", year: "numeric" })}
                  </time>
                  <span className="flex items-center gap-2 text-[0.8125rem] text-ink-2">
                    <span aria-hidden className={cn("size-1.5 rounded-full", KIND_DOT[item.kind])} />
                    {dict.announcements.kinds[item.kind]}
                  </span>
                </div>
                <div>
                  <h3 className="text-h3 text-ink">{item.title[locale]}</h3>
                  <p className="mt-1 text-[0.9375rem] leading-7 text-muted">{item.body[locale]}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <aside aria-labelledby="hours-title" className="lg:col-span-5">
          <div className="lg:sticky lg:top-28">
            <SectionHeader id="hours-title" eyebrow={dict.hours.eyebrow} title={dict.hours.title} />
            <div data-reveal className="mt-12">
              <HoursTable />
              <p className="mt-5 text-meta">{dict.hours.note}</p>
            </div>
          </div>
        </aside>
      </div>
    </Reveal>
  );
}
