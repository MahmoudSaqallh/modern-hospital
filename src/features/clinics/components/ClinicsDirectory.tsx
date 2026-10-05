"use client";

import Link from "next/link";
import { useId, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { clinics } from "@/data/clinics";
import { departments } from "@/data/departments";
import { getDoctorsByClinic } from "@/data/doctors";
import { gsap, useGSAP } from "@/animations/gsap";
import { MEDIA } from "@/animations/motion";
import { bookingHref } from "@/features/booking/links";
import { useClientNow } from "@/features/doctors/hooks/useClientNow";
import { localePath } from "@/i18n/config";
import { useI18n } from "@/i18n/I18nProvider";
import { plural } from "@/i18n/plural";
import { cn, format } from "@/lib/localized";
import { matchesQuery } from "@/lib/search";
import { setFocusClinic } from "@/three/sceneStore";
import { MedicalIcon } from "@/components/icons/MedicalIcon";
import { buttonClasses, ForwardArrow } from "@/components/ui/Button";
import { inputClasses } from "@/components/ui/Field";
import { ClinicNextSlot } from "./ClinicNextSlot";

/** The therapeutic department a clinic belongs to, if any. */
function parentDepartment(clinicId: string) {
  return departments.find((d) => d.category === "therapeutic" && d.clinicIds.includes(clinicId));
}

/**
 * Clinics directory: searchable, ruled grid of outpatient clinics. Each tile
 * shows its doctors, the nearest bookable time and direct actions. Hovering
 * a tile lights its node in the clinic lattice above.
 */
export function ClinicsDirectory() {
  const { locale, dict } = useI18n();
  const copy = dict.clinicsPage;
  const now = useClientNow();
  const searchId = useId();
  const [query, setQuery] = useState("");
  const grid = useRef<HTMLUListElement>(null);
  const firstRender = useRef(true);
  const results = clinics.filter((c) => matchesQuery(query, c.name.ar, c.name.en, c.summary.ar, c.summary.en));

  // Results settle in when the search changes (not on first paint — no flash).
  useGSAP(
    () => {
      if (firstRender.current) {
        firstRender.current = false;
        return;
      }
      const mm = gsap.matchMedia();
      mm.add(MEDIA.motionOk, () => {
        gsap.fromTo(
          "[data-clinic-tile]",
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.04, ease: "power3.out", clearProps: "transform" },
        );
      });
    },
    { scope: grid, dependencies: [query] },
  );

  return (
    <div className="container-site pb-20">
      <div className="max-w-md">
        <label htmlFor={searchId} className="text-[0.9375rem] font-medium text-ink">
          {copy.searchLabel}
        </label>
        <div className="relative mt-2">
          <Search aria-hidden strokeWidth={1.5} className="pointer-events-none absolute start-4 top-1/2 size-5 -translate-y-1/2 text-muted" />
          <input
            id={searchId}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={copy.searchPlaceholder}
            autoComplete="off"
            className={`${inputClasses(false)} h-12 ps-12 pe-11 [&::-webkit-search-cancel-button]:hidden`}
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute end-1.5 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full text-muted hover:bg-mist"
            >
              <X aria-hidden strokeWidth={1.5} className="size-4" />
              <span className="visually-hidden">{copy.clear}</span>
            </button>
          )}
        </div>
      </div>

      <p role="status" aria-live="polite" className="mt-6 text-meta">
        {plural(dict.common.resultsCount, results.length, locale)}
      </p>

      {results.length > 0 ? (
        <ul ref={grid} className="mt-3 grid border-s border-t border-line sm:grid-cols-2 lg:grid-cols-3">
          {results.map((clinic) => {
            const index = clinics.indexOf(clinic);
            const count = getDoctorsByClinic(clinic.id).length;
            const department = parentDepartment(clinic.id);
            return (
              <li
                key={clinic.id}
                id={clinic.id}
                data-clinic-tile
                onMouseEnter={() => setFocusClinic(index)}
                onMouseLeave={() => setFocusClinic(-1)}
                onFocusCapture={() => setFocusClinic(index)}
                className="group relative scroll-mt-28 border-b border-e border-line bg-paper/80 transition-colors duration-300 hover:bg-white focus-within:bg-white"
              >
                <span
                  aria-hidden
                  className="absolute inset-x-0 -top-px h-[2px] origin-left scale-x-0 bg-care-deep transition-transform duration-500 ease-[var(--ease-out-quart)] group-hover:scale-x-100 group-focus-within:scale-x-100 rtl:origin-right"
                />
                <article className="flex h-full flex-col p-6 lg:p-7">
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex size-12 items-center justify-center border border-line bg-paper text-care-deep transition-transform duration-500 group-hover:-translate-y-0.5">
                      <MedicalIcon name={clinic.icon} size={24} />
                    </span>
                    <span className="text-meta tabular">{plural(dict.common.doctorsCount, count, locale)}</span>
                  </div>
                  <h2 className="text-h3 mt-6 text-ink">{clinic.name[locale]}</h2>
                  {department && <p className="mt-0.5 text-[0.8125rem] text-care-deep">{format(copy.department, { department: department.name[locale] })}</p>}
                  <p className="mt-2 text-[0.9375rem] leading-7 text-muted">{clinic.description[locale]}</p>

                  <ClinicNextSlot clinicId={clinic.id} now={now} className="mt-5 border-t border-line pt-4" />

                  <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-2 pt-6">
                    <Link
                      href={bookingHref(locale, { clinic: clinic.id })}
                      aria-label={`${dict.clinicsSection.book} — ${clinic.name[locale]}`}
                      className={buttonClasses({ size: "sm" })}
                    >
                      <span>{dict.clinicsSection.book}</span>
                      <ForwardArrow />
                    </Link>
                    <Link
                      href={`${localePath(locale, "/doctors")}?clinic=${clinic.id}`}
                      aria-label={`${dict.clinicsSection.doctors} — ${clinic.name[locale]}`}
                      className="inline-flex min-h-10 items-center text-[0.9375rem] text-ink-2 underline decoration-line-strong underline-offset-[6px] transition-colors hover:text-ink hover:decoration-ink"
                    >
                      {dict.clinicsSection.doctors}
                    </Link>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="mt-3 border border-dashed border-line-strong px-6 py-14 text-center">
          <p className="font-medium text-ink">{copy.empty}</p>
          <p className="mt-1 text-meta">{copy.emptyHint}</p>
          <button
            type="button"
            onClick={() => setQuery("")}
            className="mt-5 inline-flex min-h-10 items-center px-4 text-[0.9375rem] font-medium text-care-deep underline underline-offset-4"
          >
            {copy.clear}
          </button>
        </div>
      )}

      <p className={cn("mt-8 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.9375rem] text-ink-2")}>
        <MedicalIcon name="emergency" size={18} className="text-medical" />
        <span className="font-medium text-ink">{copy.urgentTitle}</span>
        <span>{copy.urgentText}</span>
        <Link href={localePath(locale, "/contact")} className="text-medical underline underline-offset-4">
          {dict.clinicsSection.urgentAction}
        </Link>
      </p>
    </div>
  );
}
