"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { Check, Search, X } from "lucide-react";
import { bookableClinics } from "@/data/clinics";
import { getDoctorsByClinic } from "@/data/doctors";
import { localePath } from "@/i18n/config";
import { useI18n } from "@/i18n/I18nProvider";
import { plural } from "@/i18n/plural";
import { cn } from "@/lib/localized";
import { matchesQuery } from "@/lib/search";
import { MedicalIcon } from "@/components/icons/MedicalIcon";
import { Notice } from "@/components/ui/Notice";
import { StepHeading } from "./StepHeading";

export function StepClinic({
  selectedId,
  onSelect,
}: {
  selectedId: string | null;
  onSelect: (clinicId: string) => void;
}) {
  const { locale, dict } = useI18n();
  const copy = dict.booking.clinic;
  const [query, setQuery] = useState("");
  const searchId = useId();
  const results = bookableClinics.filter((d) =>
    matchesQuery(query, d.name.ar, d.name.en, d.summary.ar, d.summary.en),
  );

  return (
    <div>
      <StepHeading index={1} title={copy.title} description={copy.description} />

      <div data-step-item className="mt-8">
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
            className="h-13 w-full border border-line-strong bg-white ps-12 pe-12 text-[1rem] outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-muted/70 focus:border-care-deep focus:shadow-[0_0_0_3px_rgb(11_107_44/0.12)] [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute end-2 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full text-muted hover:bg-mist hover:text-ink"
            >
              <X aria-hidden strokeWidth={1.5} className="size-4" />
              <span className="visually-hidden">{copy.clearSearch}</span>
            </button>
          )}
        </div>
      </div>

      <p className="visually-hidden" role="status" aria-live="polite">
        {query ? plural(dict.common.resultsCount, results.length, locale) : ""}
      </p>

      {results.length > 0 ? (
        <ul data-step-item className="mt-6 grid border-s border-t border-line sm:grid-cols-2 xl:grid-cols-3">
          {results.map((clinic) => {
            const selected = clinic.id === selectedId;
            const count = getDoctorsByClinic(clinic.id).length;
            return (
              <li key={clinic.id} className="border-b border-e border-line">
                <button
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onSelect(clinic.id)}
                  className={cn(
                    "group relative flex h-full w-full items-start gap-4 p-5 text-start transition-colors duration-200",
                    selected ? "bg-care-tint/60" : "hover:bg-white",
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      "absolute inset-y-0 start-0 w-[3px] transition-colors",
                      selected ? "bg-care-deep" : "bg-transparent group-hover:bg-line-strong",
                    )}
                  />
                  <MedicalIcon
                    name={clinic.icon}
                    size={24}
                    className="mt-0.5 shrink-0 text-care-deep transition-transform duration-300 group-hover:-translate-y-0.5"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium text-ink">{clinic.name[locale]}</span>
                    <span className="mt-0.5 block text-meta">{clinic.summary[locale]}</span>
                    <span className="mt-2 block text-[0.75rem] text-muted tabular">
                      {plural(dict.common.doctorsCount, count, locale)}
                    </span>
                  </span>
                  {selected && (
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-care-deep text-white">
                      <Check aria-hidden strokeWidth={2.25} className="size-3.5" />
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <div data-step-item className="mt-6 border border-dashed border-line-strong px-6 py-10 text-center">
          <p className="font-medium text-ink">{copy.noResults}</p>
          <p className="mt-1 text-meta">{copy.noResultsHint}</p>
          <button
            type="button"
            onClick={() => setQuery("")}
            className="mt-5 inline-flex min-h-10 items-center px-4 text-[0.9375rem] font-medium text-care-deep underline underline-offset-4"
          >
            {copy.clearSearch}
          </button>
        </div>
      )}

      <div data-step-item className="mt-8">
        <Notice
          tone="info"
          title={copy.urgentTitle}
          action={
            <Link
              href={localePath(locale, "/contact")}
              className="inline-flex min-h-10 items-center text-[0.9375rem] font-medium text-medical underline underline-offset-4"
            >
              {copy.urgentLink}
            </Link>
          }
        >
          {copy.urgentText}
        </Notice>
      </div>
    </div>
  );
}
