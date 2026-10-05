import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/ar";
import { Reveal } from "@/components/motion/Reveal";
import { ImageSlot } from "@/components/ui/ImageSlot";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { TextLink } from "@/components/ui/Button";

/** Editorial, asymmetric services layout: one feature, supporting services as a ruled index. */
export function ServicesShowcase({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const copy = dict.services;
  return (
    <Reveal as="section" aria-labelledby="services-title" className="relative border-t border-line bg-mist/70 py-24 lg:py-32">
      <div className="container-site">
        <SectionHeader id="services-title" eyebrow={copy.eyebrow} title={copy.title} />

        <div className="mt-14 grid gap-12 lg:grid-cols-12 lg:gap-16">
          <article className="lg:col-span-7">
            <div data-reveal="fade">
              <ImageSlot
                caption={copy.feature.image}
                slotLabel={dict.common.imageSlot}
                className="aspect-[4/3] w-full lg:aspect-[5/4]"
              />
            </div>
            <div
              data-reveal
              className="relative -mt-16 ms-5 border-s-2 border-care-deep bg-paper p-7 shadow-[var(--shadow-soft)] sm:ms-10 sm:max-w-[30rem] lg:-mt-28 lg:p-9"
            >
              <h3 className="font-display text-[1.6rem] leading-snug text-ink">{copy.feature.title}</h3>
              <p className="mt-3 text-[1rem] leading-8 text-ink-2">{copy.feature.text}</p>
              <TextLink href={localePath(locale, "/departments")} className="mt-5">
                {copy.feature.cta}
              </TextLink>
            </div>
          </article>

          <ol className="self-end border-t border-ink/15 lg:col-span-5">
            {copy.items.map((item, i) => (
              <li key={item.title} data-reveal className="grid grid-cols-[3rem_1fr] border-b border-line py-7">
                <span className="font-mono text-sm text-care-deep tabular">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className="text-h3 text-ink">{item.title}</h3>
                  <p className="mt-1 text-[0.9375rem] leading-7 text-muted">{item.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </Reveal>
  );
}
