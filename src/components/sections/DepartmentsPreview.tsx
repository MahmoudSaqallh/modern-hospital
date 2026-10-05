"use client";

import { useRef } from "react";
import { useSceneChapter } from "@/animations/sceneBridge";
import { localePath } from "@/i18n/config";
import { useI18n } from "@/i18n/I18nProvider";
import { DepartmentsSplit } from "@/features/departments/components/DepartmentsSplit";
import { Reveal } from "@/components/motion/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { TextLink } from "@/components/ui/Button";

/** Home: therapeutic and supporting departments either side of the patient. */
export function DepartmentsPreview() {
  const { locale, dict } = useI18n();
  const copy = dict.departmentsPreview;
  const section = useRef<HTMLElement>(null);
  useSceneChapter(section, "departments");

  return (
    <section ref={section} aria-labelledby="departments-preview-title" className="relative border-t border-line py-24 lg:py-32">
      <div className="container-site">
        <Reveal>
          <SectionHeader
            id="departments-preview-title"
            index="02"
            eyebrow={copy.eyebrow}
            title={copy.title}
            description={copy.description}
            action={<TextLink href={localePath(locale, "/departments")}>{copy.cta}</TextLink>}
          />
        </Reveal>
        <DepartmentsSplit className="mt-14" />
      </div>
    </section>
  );
}
