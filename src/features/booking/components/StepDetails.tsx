"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import { format } from "@/lib/localized";
import { Button } from "@/components/ui/Button";
import { Field, describedBy, inputClasses } from "@/components/ui/Field";
import { Notice } from "@/components/ui/Notice";
import type { PatientDetails } from "../types";
import { LIMITS, validatePatient, validatePatientField, type PatientErrors } from "../validation/patient";
import { StepActions, StepHeading } from "./StepHeading";

const FIELDS: Array<keyof PatientDetails> = ["fullName", "phone", "age", "notes"];

/**
 * Patient details. Validation is blur-first (no errors while typing a first
 * time), errors clear the moment the value becomes valid, and submitting
 * focuses the first problem. Only four fields — nothing unnecessary.
 */
export function StepDetails({
  patient,
  onChange,
  onContinue,
  onBack,
}: {
  patient: PatientDetails;
  onChange: (field: keyof PatientDetails, value: string) => void;
  onContinue: () => void;
  onBack: () => void;
}) {
  const { dict } = useI18n();
  const copy = dict.booking.details;
  const baseId = useId();
  const form = useRef<HTMLFormElement>(null);
  const [touched, setTouched] = useState<Partial<Record<keyof PatientDetails, boolean>>>({});
  const [showSummary, setShowSummary] = useState(false);

  const errors: PatientErrors = {};
  for (const field of FIELDS) {
    if (!touched[field]) continue;
    const code = validatePatientField(field, patient[field]);
    if (code) errors[field] = code;
  }
  const message = (field: keyof PatientDetails) => {
    const code = errors[field];
    return code ? copy.errors[code] : null;
  };
  const ids = Object.fromEntries(FIELDS.map((f) => [f, `${baseId}-${f}`])) as Record<keyof PatientDetails, string>;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const all = validatePatient(patient);
    const invalid = FIELDS.filter((f) => all[f]);
    if (invalid.length > 0) {
      setTouched({ fullName: true, phone: true, age: true, notes: true });
      setShowSummary(true);
      form.current?.querySelector<HTMLElement>(`#${CSS.escape(ids[invalid[0]])}`)?.focus();
      return;
    }
    onContinue();
  };

  const blur = (field: keyof PatientDetails) => () => setTouched((t) => ({ ...t, [field]: true }));
  const invalidFields = FIELDS.filter((f) => errors[f]);
  const notesLeft = LIMITS.notesMax - patient.notes.length;

  return (
    <form ref={form} noValidate onSubmit={handleSubmit}>
      <StepHeading index={4} title={copy.title} description={copy.description} />

      {showSummary && invalidFields.length > 0 && (
        <div data-step-item className="mt-8">
          <Notice tone="error" title={copy.errorSummary}>
            <ul className="mt-1 space-y-1">
              {invalidFields.map((field) => (
                <li key={field}>
                  <a href={`#${ids[field]}`} className="underline underline-offset-4 hover:text-ink">
                    {message(field)}
                  </a>
                </li>
              ))}
            </ul>
          </Notice>
        </div>
      )}

      <div data-step-item className="mt-8 grid gap-7 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field id={ids.fullName} label={copy.fullName} hint={copy.fullNameHint} error={message("fullName")}>
            <input
              id={ids.fullName}
              name="fullName"
              type="text"
              autoComplete="name"
              required
              maxLength={LIMITS.nameMax}
              value={patient.fullName}
              onChange={(e) => onChange("fullName", e.target.value)}
              onBlur={blur("fullName")}
              aria-invalid={Boolean(errors.fullName)}
              aria-describedby={describedBy(ids.fullName, true, Boolean(errors.fullName))}
              className={`${inputClasses(Boolean(errors.fullName))} h-13`}
            />
          </Field>
        </div>

        <Field id={ids.phone} label={copy.phone} hint={copy.phoneHint} error={message("phone")}>
          <input
            id={ids.phone}
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            dir="ltr"
            required
            maxLength={24}
            value={patient.phone}
            onChange={(e) => onChange("phone", e.target.value)}
            onBlur={blur("phone")}
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={describedBy(ids.phone, true, Boolean(errors.phone))}
            className={`${inputClasses(Boolean(errors.phone))} h-13 tabular rtl:text-right`}
          />
        </Field>

        <Field id={ids.age} label={copy.age} hint={copy.ageHint} error={message("age")}>
          <input
            id={ids.age}
            name="age"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            required
            maxLength={3}
            value={patient.age}
            onChange={(e) => onChange("age", e.target.value)}
            onBlur={blur("age")}
            aria-invalid={Boolean(errors.age)}
            aria-describedby={describedBy(ids.age, true, Boolean(errors.age))}
            className={`${inputClasses(Boolean(errors.age))} h-13 tabular`}
          />
        </Field>

        <div className="sm:col-span-2">
          <Field
            id={ids.notes}
            label={copy.notes}
            optionalLabel={copy.optional}
            hint={copy.notesHint}
            error={message("notes")}
            counter={
              <span className="text-meta tabular" aria-live="polite">
                {notesLeft <= 60 ? format(copy.charsLeft, { count: Math.max(notesLeft, 0) }) : ""}
              </span>
            }
          >
            <textarea
              id={ids.notes}
              name="notes"
              rows={3}
              maxLength={LIMITS.notesMax}
              value={patient.notes}
              onChange={(e) => onChange("notes", e.target.value)}
              onBlur={blur("notes")}
              aria-invalid={Boolean(errors.notes)}
              aria-describedby={describedBy(ids.notes, true, Boolean(errors.notes))}
              className={`${inputClasses(Boolean(errors.notes))} min-h-28 resize-y py-3 leading-7`}
            />
          </Field>
        </div>
      </div>

      <div data-step-item className="mt-8">
        <Notice tone="privacy" title={copy.privacyTitle}>
          {copy.privacyText}
        </Notice>
      </div>

      <StepActions>
        <Button variant="quiet" onClick={onBack}>
          {dict.common.back}
        </Button>
        <Button type="submit" size="lg" arrow>
          {copy.continue}
        </Button>
      </StepActions>
    </form>
  );
}
