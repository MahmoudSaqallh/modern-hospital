"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useId, useState } from "react";
import { Search, X } from "lucide-react";
import { bookableClinics, getClinic } from "@/data/clinics";
import { doctors } from "@/data/doctors";
import { useI18n } from "@/i18n/I18nProvider";
import { plural } from "@/i18n/plural";
import { cn } from "@/lib/localized";
import { matchesQuery } from "@/lib/search";
import { Button } from "@/components/ui/Button";
import { inputClasses } from "@/components/ui/Field";
import { useClientNow } from "../hooks/useClientNow";
import { DoctorRow } from "./DoctorRow";

export function DoctorsDirectory() {
  const { locale, dict } = useI18n();
  const copy = dict.doctorsPage;
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const now = useClientNow();
  const searchId = useId();
  const [query, setQuery] = useState("");

  // `department` is the pre-rename parameter name; still honoured for old links.
  const requested = params.get("clinic") ?? params.get("department");
  const clinicFilter = getClinic(requested)?.id ?? null;

  const setClinicFilter = (id: string | null) => {
    const next = new URLSearchParams(params);
    next.delete("department");
    if (id) next.set("clinic", id);
    else next.delete("clinic");
    const qs = next.toString();
    router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
  };

  const results = doctors.filter((doctor) => {
    if (clinicFilter && doctor.clinicId !== clinicFilter) return false;
    const clinic = getClinic(doctor.clinicId);
    return matchesQuery(
      query,
      doctor.name.ar,
      doctor.name.en,
      doctor.title.ar,
      doctor.title.en,
      clinic?.name.ar ?? "",
      clinic?.name.en ?? "",
    );
  });

  const filterButton = (id: string | null, label: string) => {
    const active = clinicFilter === id;
    return (
      <button
        key={id ?? "all"}
        type="button"
        aria-pressed={active}
        onClick={() => setClinicFilter(id)}
        className={cn(
          "min-h-10 shrink-0 border px-4 text-[0.875rem] transition-colors duration-200",
          active ? "border-ink bg-ink text-white" : "border-line-strong bg-white text-ink-2 hover:border-ink/40 hover:text-ink",
        )}
      >
        {label}
      </button>
    );
  };

  return (
    <div className="container-site pb-24">
      <div className="grid gap-6 border-y border-line py-6 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-4">
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
                <span className="visually-hidden">{dict.booking.clinic.clearSearch}</span>
              </button>
            )}
          </div>
        </div>
        <div className="min-w-0 lg:col-span-8">
          <p id={`${searchId}-filter`} className="text-[0.9375rem] font-medium text-ink">
            {copy.filterLabel}
          </p>
          <div
            role="group"
            aria-labelledby={`${searchId}-filter`}
            className="-mx-5 mt-2 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:thin] sm:mx-0 sm:flex-wrap sm:px-0"
          >
            {filterButton(null, copy.all)}
            {bookableClinics.map((d) => filterButton(d.id, d.name[locale]))}
          </div>
        </div>
      </div>

      <p role="status" aria-live="polite" className="mt-6 text-meta">
        {plural(dict.common.resultsCount, results.length, locale)}
      </p>

      {results.length > 0 ? (
        <ul className="mt-2 border-t border-ink/15">
          {results.map((doctor) => (
            <DoctorRow key={doctor.id} doctor={doctor} now={now} />
          ))}
        </ul>
      ) : (
        <div className="mt-4 border border-dashed border-line-strong px-6 py-14 text-center">
          <p className="font-medium text-ink">{copy.empty}</p>
          <p className="mt-1 text-meta">{copy.emptyHint}</p>
          <Button
            variant="secondary"
            size="sm"
            className="mt-6"
            onClick={() => {
              setQuery("");
              setClinicFilter(null);
            }}
          >
            {copy.reset}
          </Button>
        </div>
      )}
    </div>
  );
}
