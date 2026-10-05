import { supportContact } from "@/data/patientSupport";
import type { Dictionary } from "@/i18n/dictionaries/ar";
import { Reveal } from "@/components/motion/Reveal";
import { ArcMark } from "@/components/ui/ArcMark";
import { SupportContactActions } from "./SupportContactActions";

/**
 * The dedicated inquiry block. Sits on an opaque surface so nothing from the
 * WebGL layer ever passes behind the phone number or email.
 */
export function SupportContactBlock({ dict }: { dict: Dictionary }) {
  const copy = dict.patientSupport.contact;
  return (
    <Reveal
      as="section"
      id="support-contact"
      aria-labelledby="support-contact-title"
      className="relative scroll-mt-20 border-y border-line bg-white py-20 lg:py-28"
    >
      <div className="container-site grid gap-12 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-5">
          <p data-reveal className="text-eyebrow flex items-center gap-2.5">
            <ArcMark size={14} />
            <span className="font-mono text-[0.75rem] tabular">04</span>
            <span aria-hidden className="h-px w-5 bg-line-strong" />
            <span>{copy.eyebrow}</span>
          </p>
          <h2 id="support-contact-title" data-reveal="mask" className="text-h2 mt-4 text-ink">
            {copy.title}
          </h2>
          <p data-reveal className="text-lead mt-4 max-w-[44ch] text-muted">
            {copy.text}
          </p>
        </div>
        <div className="lg:col-span-7">
          <SupportContactActions contact={supportContact} dict={dict} size="lg" />
        </div>
      </div>
    </Reveal>
  );
}
