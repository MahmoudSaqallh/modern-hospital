"use client";

import { Check, UsersRound } from "lucide-react";
import { getDepartment } from "@/data/departments";
import { getDoctorsByDepartment } from "@/data/doctors";
import { DoctorNextSlot } from "@/features/doctors/components/DoctorNextSlot";
import { useI18n } from "@/i18n/I18nProvider";
import { cn, format } from "@/lib/localized";
import { Button } from "@/components/ui/Button";
import { Notice } from "@/components/ui/Notice";
import { Portrait } from "@/components/ui/Portrait";
import { ANY_DOCTOR, type DoctorChoice } from "../types";
import { StepActions, StepHeading } from "./StepHeading";

function SelectedMark() {
  return (
    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-care-deep text-white">
      <Check aria-hidden strokeWidth={2.25} className="size-3.5" />
    </span>
  );
}

export function StepDoctor({
  departmentId,
  selected,
  now,
  onSelect,
  onBack,
}: {
  departmentId: string;
  selected: DoctorChoice | null;
  now: Date | null;
  onSelect: (choice: DoctorChoice) => void;
  onBack: () => void;
}) {
  const { locale, dict } = useI18n();
  const copy = dict.booking.doctor;
  const department = getDepartment(departmentId);
  const doctors = getDoctorsByDepartment(departmentId);

  const optionClass = (isSelected: boolean) =>
    cn(
      "group relative flex w-full items-center gap-4 border-b border-line px-4 py-4 text-start transition-colors duration-200 sm:gap-5 sm:px-5",
      isSelected ? "bg-care-tint/60" : "hover:bg-white",
    );
  const indicator = (isSelected: boolean) => (
    <span
      aria-hidden
      className={cn("absolute inset-y-0 start-0 w-[3px]", isSelected ? "bg-care-deep" : "bg-transparent group-hover:bg-line-strong")}
    />
  );

  return (
    <div>
      <StepHeading
        index={2}
        title={copy.title}
        description={department ? format(copy.description, { department: department.name[locale] }) : undefined}
      />

      {doctors.length === 0 ? (
        <div data-step-item className="mt-8">
          <Notice tone="info" title={copy.none}>
            {copy.noneHint}
          </Notice>
          <Button variant="secondary" className="mt-6" onClick={onBack}>
            {copy.changeDepartment}
          </Button>
        </div>
      ) : (
        <ul data-step-item className="mt-8 border-t border-line">
          {doctors.length > 1 && (
            <li>
              <button
                type="button"
                aria-pressed={selected === ANY_DOCTOR}
                onClick={() => onSelect(ANY_DOCTOR)}
                className={optionClass(selected === ANY_DOCTOR)}
              >
                {indicator(selected === ANY_DOCTOR)}
                <span className="flex size-16 shrink-0 items-center justify-center bg-sage text-care-deep">
                  <UsersRound aria-hidden strokeWidth={1.5} className="size-6" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-medium text-ink">{copy.any}</span>
                  <span className="mt-0.5 block text-meta">{copy.anyHint}</span>
                </span>
                {selected === ANY_DOCTOR && <SelectedMark />}
              </button>
            </li>
          )}
          {doctors.map((doctor) => {
            const isSelected = selected === doctor.id;
            return (
              <li key={doctor.id}>
                <button
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => onSelect(doctor.id)}
                  className={optionClass(isSelected)}
                >
                  {indicator(isSelected)}
                  <Portrait name={doctor.name[locale]} photo={doctor.photo} className="size-16 shrink-0" sizes="64px" />
                  <span className="grid min-w-0 flex-1 gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-6">
                    <span className="min-w-0">
                      <span className="block font-medium text-ink">{doctor.name[locale]}</span>
                      <span className="mt-0.5 block truncate text-meta">{doctor.title[locale]}</span>
                    </span>
                    <DoctorNextSlot doctor={doctor} now={now} />
                  </span>
                  {isSelected && <SelectedMark />}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <StepActions>
        <Button variant="quiet" onClick={onBack}>
          {dict.common.back}
        </Button>
      </StepActions>
    </div>
  );
}
