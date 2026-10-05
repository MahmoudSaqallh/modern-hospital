"use client";

import { LoaderCircle } from "lucide-react";
import { getClinic } from "@/data/clinics";
import { getDoctor } from "@/data/doctors";
import { useI18n } from "@/i18n/I18nProvider";
import { formatDate, formatTime } from "@/lib/dates";
import { format } from "@/lib/localized";
import { Button } from "@/components/ui/Button";
import { Notice } from "@/components/ui/Notice";
import type { BookingStep, SubmissionState } from "../hooks/bookingState";
import type { ClockTime, IsoDate, PatientDetails } from "../types";
import { normalizePhone } from "../validation/patient";
import { StepActions, StepHeading } from "./StepHeading";

export function StepReview({
  clinicId,
  doctorId,
  date,
  time,
  patient,
  submission,
  onEdit,
  onConfirm,
  onRecover,
}: {
  clinicId: string;
  doctorId: string;
  date: IsoDate;
  time: ClockTime;
  patient: PatientDetails;
  submission: SubmissionState;
  onEdit: (step: BookingStep) => void;
  onConfirm: () => void;
  /** Recovery for a failed submission — the flow decides where to send the patient. */
  onRecover: () => void;
}) {
  const { locale, dict } = useI18n();
  const copy = dict.booking.review;
  const clinic = getClinic(clinicId);
  const doctor = getDoctor(doctorId);
  const submitting = submission.status === "submitting";
  const error = submission.status === "error" ? copy.errors[submission.code] : null;

  const rows: Array<{ label: string; value: React.ReactNode; step: BookingStep }> = [
    { label: copy.clinic, value: clinic?.name[locale], step: 1 },
    { label: copy.doctor, value: doctor ? `${doctor.name[locale]} — ${doctor.title[locale]}` : null, step: 2 },
    { label: copy.date, value: formatDate(date, locale, { weekday: "long", day: "numeric", month: "long", year: "numeric" }), step: 3 },
    { label: copy.time, value: <span className="tabular">{formatTime(time, locale)}</span>, step: 3 },
    { label: copy.patient, value: patient.fullName.trim(), step: 4 },
    { label: copy.phone, value: <bdi dir="ltr" className="tabular">{normalizePhone(patient.phone)}</bdi>, step: 4 },
  ];

  return (
    <div>
      <StepHeading index={5} title={copy.title} description={copy.description} />

      <dl data-step-item className="mt-8 border-t border-ink/15">
        {rows.map((row) => (
          <div key={row.label} className="grid grid-cols-[minmax(0,7.5rem)_minmax(0,1fr)_auto] items-center gap-4 border-b border-line py-4 sm:grid-cols-[10rem_minmax(0,1fr)_auto]">
            <dt className="text-meta">{row.label}</dt>
            <dd className="min-w-0 break-words text-[1rem] font-medium text-ink">{row.value}</dd>
            <dd>
              <button
                type="button"
                disabled={submitting}
                onClick={() => onEdit(row.step)}
                className="inline-flex min-h-10 items-center px-2 text-[0.875rem] text-care-deep underline-offset-4 hover:underline disabled:opacity-40"
              >
                {dict.common.edit}
                <span className="visually-hidden"> {format(copy.editField, { field: row.label })}</span>
              </button>
            </dd>
          </div>
        ))}
      </dl>

      {error && (
        <div data-step-item className="mt-8">
          <Notice
            tone="error"
            title={error.title}
            action={
              <Button variant="secondary" size="sm" onClick={onRecover}>
                {error.action}
              </Button>
            }
          >
            {error.text}
          </Notice>
        </div>
      )}

      <p data-step-item className="mt-8 text-meta">
        {copy.consent}
      </p>

      <StepActions>
        <Button variant="secondary" disabled={submitting} onClick={() => onEdit(3)}>
          {copy.modify}
        </Button>
        <Button
          size="lg"
          onClick={onConfirm}
          aria-disabled={submitting}
          disabled={submitting}
          icon={submitting ? <LoaderCircle aria-hidden strokeWidth={1.75} className="size-4 animate-spin" /> : undefined}
          arrow={!submitting}
        >
          {submitting ? copy.confirming : copy.confirm}
        </Button>
      </StepActions>
      <p role="status" className="visually-hidden">
        {submitting ? copy.confirming : ""}
      </p>
    </div>
  );
}
