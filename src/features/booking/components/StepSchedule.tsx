"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { getDoctor } from "@/data/doctors";
import { useI18n } from "@/i18n/I18nProvider";
import { formatDate, toIsoDate } from "@/lib/dates";
import { format } from "@/lib/localized";
import { Button } from "@/components/ui/Button";
import { Notice } from "@/components/ui/Notice";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAvailability } from "../hooks/useAvailability";
import { dayHasAvailability } from "../services/availability";
import type { AppointmentSlot, ClockTime, DoctorChoice, IsoDate } from "../types";
import { DateStrip } from "./DateStrip";
import { StepActions, StepHeading } from "./StepHeading";
import { TimeSlots } from "./TimeSlots";

function ScheduleSkeleton({ label }: { label: string }) {
  return (
    <div aria-busy="true" className="mt-8">
      <p role="status" className="visually-hidden">
        {label}
      </p>
      <div className="flex gap-2 overflow-hidden">
        {Array.from({ length: 8 }, (_, i) => (
          <Skeleton key={i} className="h-[5.75rem] w-[4.75rem] shrink-0" />
        ))}
      </div>
      <Skeleton className="mt-10 h-4 w-24" />
      <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
        {Array.from({ length: 10 }, (_, i) => (
          <Skeleton key={i} className="h-12" />
        ))}
      </div>
    </div>
  );
}

export function StepSchedule({
  clinicId,
  doctorChoice,
  date,
  time,
  assignedDoctorId,
  now,
  onSelectDate,
  onSelectSlot,
  onClearSlot,
  onContinue,
  onBack,
}: {
  clinicId: string;
  doctorChoice: DoctorChoice;
  date: IsoDate | null;
  time: ClockTime | null;
  assignedDoctorId: string | null;
  now: Date | null;
  onSelectDate: (date: IsoDate) => void;
  onSelectSlot: (slot: AppointmentSlot) => void;
  onClearSlot: () => void;
  onContinue: () => void;
  onBack: () => void;
}) {
  const { locale, dict } = useI18n();
  const copy = dict.booking.schedule;
  const { state, retry } = useAvailability(clinicId, doctorChoice, now);
  const days = useMemo(() => (state.status === "success" ? state.days : []), [state]);
  const firstAvailable = days.find(dayHasAvailability);
  const selectedDay = days.find((d) => d.date === date);
  const dateLabelId = useId();
  const timeLabelId = useId();
  const slotsRef = useRef<HTMLDivElement>(null);
  const [missingSlot, setMissingSlot] = useState(false);

  // Once availability arrives, land on a sensible day: the chosen one if it is
  // in range, otherwise the first day with openings.
  useEffect(() => {
    if (state.status !== "success") return;
    if ((!date || !days.some((d) => d.date === date)) && firstAvailable) onSelectDate(firstAvailable.date);
  }, [state.status, date, days, firstAvailable, onSelectDate]);

  // A previously chosen time that is no longer free (refetch, same-day cutoff) is released.
  useEffect(() => {
    if (state.status !== "success" || !time || !selectedDay) return;
    if (!selectedDay.slots.some((s) => s.time === time && s.available)) onClearSlot();
  }, [state.status, time, selectedDay, onClearSlot]);

  const assigned = getDoctor(assignedDoctorId);
  const handleContinue = () => {
    if (!time) {
      setMissingSlot(true);
      slotsRef.current?.querySelector<HTMLButtonElement>("button:not(:disabled)")?.focus();
      return;
    }
    onContinue();
  };

  return (
    <div>
      <StepHeading index={3} title={copy.title} description={copy.description} />

      {(state.status === "loading" || state.status === "idle") && <ScheduleSkeleton label={copy.loading} />}

      {state.status === "error" && (
        <div data-step-item className="mt-8">
          <Notice
            tone="error"
            title={copy.error}
            action={
              <Button variant="secondary" size="sm" onClick={retry}>
                {dict.common.retry}
              </Button>
            }
          >
            {copy.errorHint}
          </Notice>
        </div>
      )}

      {state.status === "success" && !firstAvailable && (
        <div data-step-item className="mt-8">
          <Notice
            tone="info"
            title={copy.noDays}
            action={
              <Button variant="secondary" size="sm" onClick={onBack}>
                {copy.changeDoctor}
              </Button>
            }
          >
            {copy.noDaysHint}
          </Notice>
        </div>
      )}

      {state.status === "success" && firstAvailable && now && (
        <>
          <section data-step-item className="mt-8" aria-labelledby={dateLabelId}>
            <h3 id={dateLabelId} className="mb-3 text-[0.9375rem] font-medium text-ink">
              {copy.dateLabel}
            </h3>
            <DateStrip
              days={days}
              selected={date}
              todayIso={toIsoDate(now)}
              labelledBy={dateLabelId}
              onSelect={(d) => {
                setMissingSlot(false);
                onSelectDate(d);
              }}
            />
          </section>

          <section data-step-item className="mt-10" aria-labelledby={timeLabelId}>
            <h3 id={timeLabelId} className="text-[0.9375rem] font-medium text-ink">
              {copy.timeLabel}
              {date && <span className="ms-2 font-normal text-muted">· {formatDate(date, locale)}</span>}
            </h3>
            <div ref={slotsRef} className="mt-4">
              {!selectedDay ? (
                <p className="text-meta">{copy.pickDate}</p>
              ) : dayHasAvailability(selectedDay) ? (
                <TimeSlots
                  day={selectedDay}
                  selectedTime={time}
                  onSelect={(slot) => {
                    setMissingSlot(false);
                    onSelectSlot(slot);
                  }}
                />
              ) : (
                <div className="border border-dashed border-line-strong px-6 py-8">
                  <p className="font-medium text-ink">{copy.noSlots}</p>
                  <p className="mt-1 text-meta">{copy.noSlotsHint}</p>
                  <Button variant="secondary" size="sm" className="mt-5" onClick={() => onSelectDate(firstAvailable.date)}>
                    {copy.jumpToNext}
                  </Button>
                </div>
              )}
            </div>
            {assigned && doctorChoice === "any" && time && (
              <p className="mt-5 text-[0.9375rem] text-ink-2" aria-live="polite">
                {format(copy.assigned, { doctor: assigned.name[locale] })}
              </p>
            )}
            {missingSlot && !time && (
              <p role="alert" className="mt-5 text-[0.9375rem] text-medical">
                {dict.doctorProfile.pickSlot}
              </p>
            )}
          </section>
        </>
      )}

      <StepActions>
        <Button variant="quiet" onClick={onBack}>
          {dict.common.back}
        </Button>
        {state.status === "success" && firstAvailable && (
          <Button size="lg" arrow onClick={handleContinue}>
            {copy.continue}
          </Button>
        )}
      </StepActions>
    </div>
  );
}
