import { Mail, Phone } from "lucide-react";
import { mailtoHref, phoneHref, supportContact } from "@/data/patientSupport";
import type { Dictionary } from "@/i18n/dictionaries/ar";
import { ArcMark } from "@/components/ui/ArcMark";
import { ButtonLink } from "@/components/ui/Button";
import { MagneticLink } from "@/components/ui/MagneticLink";
import { PageIntro } from "@/components/motion/PageIntro";
import { SupportNetworkVisual } from "./SupportNetworkVisual";

/**
 * Calm, institutional opening: the promise, two clear actions, and the care
 * network visual (desktop). On phones the inquiry details follow right
 * under the actions — they matter more there than decoration.
 */
export function SupportHero({ dict }: { dict: Dictionary }) {
  const copy = dict.patientSupport;
  const actions = copy.actions;

  return (
    <header className="relative pb-16 pt-[calc(76px+3rem)] lg:pb-24 lg:pt-[calc(88px+4rem)]">
      <PageIntro className="container-site grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-7">
          <p data-intro className="text-eyebrow flex items-center gap-2.5">
            <ArcMark size={14} />
            {copy.eyebrow}
          </p>
          <h1 data-intro className="text-h1 mt-5 max-w-[15ch] text-ink">
            {copy.hero.title}
          </h1>
          <p data-intro className="text-lead mt-6 max-w-[50ch] text-muted">
            {copy.hero.text}
          </p>
          <div data-intro className="mt-9 flex flex-wrap gap-3">
            <MagneticLink href="#contribute" size="lg">
              {copy.hero.primary}
            </MagneticLink>
            <ButtonLink href="#programs" variant="secondary" size="lg">
              {copy.hero.secondary}
            </ButtonLink>
          </div>
          <p data-intro className="mt-9 flex items-center gap-3 text-[0.9375rem] text-ink-2">
            <span aria-hidden className="h-px w-8 bg-care" />
            {copy.hero.note}
          </p>

          {/* Phones / tablets: the inquiry details, one tap away. */}
          <div data-intro className="mt-8 grid gap-2 border-t border-line pt-6 sm:grid-cols-2 lg:hidden">
            <a href={phoneHref(supportContact.phone)} className="flex min-h-12 items-center gap-3 text-ink">
              <Phone aria-hidden strokeWidth={1.5} className="size-5 text-care-deep" />
              <span className="visually-hidden">{actions.call}: </span>
              <bdi dir="ltr" className="font-display text-[1.125rem]">
                {supportContact.phone}
              </bdi>
            </a>
            <a href={mailtoHref(supportContact.email)} className="flex min-h-12 items-center gap-3 text-ink">
              <Mail aria-hidden strokeWidth={1.5} className="size-5 text-care-deep" />
              <span className="visually-hidden">{actions.sendEmail}: </span>
              <bdi dir="ltr" className="font-display text-[1.125rem]">
                {supportContact.email}
              </bdi>
            </a>
          </div>
        </div>

        <div data-intro className="hidden lg:col-span-5 lg:block">
          <SupportNetworkVisual />
        </div>
      </PageIntro>
    </header>
  );
}
