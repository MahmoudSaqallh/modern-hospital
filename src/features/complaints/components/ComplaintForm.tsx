"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { LoaderCircle } from "lucide-react";
import { clinics } from "@/data/clinics";
import { complaintSettings, complaintTypes, contactPreferences } from "@/data/complaints";
import { departments } from "@/data/departments";
import { gsap, useGSAP } from "@/animations/gsap";
import { playSuccess } from "@/animations/booking";
import { MEDIA } from "@/animations/motion";
import { localePath } from "@/i18n/config";
import { useI18n } from "@/i18n/I18nProvider";
import { cn, format } from "@/lib/localized";
import { arcPath, ARC_SEGMENTS } from "@/components/ui/ArcMark";
import { Button, buttonClasses } from "@/components/ui/Button";
import { Field, describedBy, inputClasses } from "@/components/ui/Field";
import { Notice } from "@/components/ui/Notice";
import { ComplaintApiError, submitComplaint } from "../complaintsApi";
import type { ComplaintFailure, ComplaintForm as FormValues, ComplaintReceipt } from "../types";
import { complaintTarget, toSubmission, validateComplaint, validateComplaintField, type ComplaintErrors } from "../validation";

const EMPTY: FormValues = { type: "", target: "", subject: "", details: "", name: "", phone: "", email: "", contactPreference: "" };
const ORDER: Array<keyof FormValues> = ["type", "subject", "details", "name", "phone", "email", "contactPreference"];

function ComplaintSuccess({ receipt }: { receipt: ComplaintReceipt }) {
  const { locale, dict } = useI18n();
  const copy = dict.complaints.success;
  const root = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MEDIA.motionOk, () => {
        if (root.current) playSuccess(root.current);
      });
    },
    { scope: root },
  );
  useEffect(() => heading.current?.focus(), []);

  return (
    <div ref={root} className="flex flex-col items-center px-6 py-14 text-center sm:px-10">
      <svg viewBox="0 0 120 120" className="size-24" fill="none" aria-hidden>
        {ARC_SEGMENTS.map((segment) => (
          <path
            key={segment.key}
            data-success-arc
            d={arcPath(60, 60, 54, segment.from, segment.to)}
            className={segment.className}
            strokeWidth={3}
            strokeLinecap="round"
          />
        ))}
        <path data-success-check d="M40 61.5 54 75l27-30" className="stroke-care-deep" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <h2 ref={heading} tabIndex={-1} data-success-item className="mt-7 font-display text-[1.9rem] leading-snug text-ink">
        {copy.title}
      </h2>
      <p data-success-item className="mt-3 max-w-[44ch] text-[1rem] leading-8 text-muted">
        {copy.text}
      </p>
      <div data-success-item className="mt-8 w-full max-w-sm border border-dashed border-line-strong px-6 py-5">
        <p className="text-meta">{copy.reference}</p>
        <p dir="ltr" className="mt-1 font-mono text-[1.4rem] font-medium tracking-[0.06em] text-ink">
          {receipt.reference}
        </p>
      </div>
      <p data-success-item className="mt-4 text-meta">
        {copy.keep}
      </p>
      <div data-success-item className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href={localePath(locale)} className={buttonClasses()}>
          {copy.home}
        </Link>
        <Link href={localePath(locale, "/contact")} className={buttonClasses({ variant: "secondary" })}>
          {copy.contact}
        </Link>
      </div>
    </div>
  );
}

/**
 * Complaint form. Blur-first validation, errors clear as soon as the value
 * is valid, and submitting focuses the first problem. The server re-checks
 * every rule; the form only guides.
 */
export function ComplaintFormPanel() {
  const { locale, dict } = useI18n();
  const copy = dict.complaints;
  const baseId = useId();
  const form = useRef<HTMLFormElement>(null);
  const inFlight = useRef<AbortController | null>(null);
  const [values, setValues] = useState<FormValues>(EMPTY);
  const [touched, setTouched] = useState<Partial<Record<keyof FormValues, boolean>>>({});
  const [showSummary, setShowSummary] = useState(false);
  const [status, setStatus] = useState<"idle" | "submitting">("idle");
  const [failure, setFailure] = useState<ComplaintFailure | null>(null);
  const [receipt, setReceipt] = useState<ComplaintReceipt | null>(null);

  useEffect(() => () => inFlight.current?.abort(), []);

  const id = (field: keyof FormValues) => `${baseId}-${field}`;
  const errors: ComplaintErrors = {};
  for (const field of ORDER) {
    if (!touched[field]) continue;
    const code = validateComplaintField(field, values);
    if (code) errors[field] = code;
  }
  const message = (field: keyof FormValues) => (errors[field] ? copy.errors[errors[field]!] : null);
  const set = (field: keyof FormValues, value: string) => setValues((v) => ({ ...v, [field]: value }));
  const blur = (field: keyof FormValues) => () => setTouched((t) => ({ ...t, [field]: true }));

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (inFlight.current) return; // double-submit guard
    const all = validateComplaint(values);
    const invalid = ORDER.filter((f) => all[f]);
    if (invalid.length > 0) {
      setTouched(Object.fromEntries(ORDER.map((f) => [f, true])));
      setShowSummary(true);
      form.current?.querySelector<HTMLElement>(`[data-field="${invalid[0]}"]`)?.focus();
      return;
    }
    const submission = toSubmission(values);
    if (!submission) return;
    const controller = new AbortController();
    inFlight.current = controller;
    setStatus("submitting");
    setFailure(null);
    try {
      setReceipt(await submitComplaint(submission, controller.signal));
      // Personal details are not kept once the complaint has been received.
      setValues(EMPTY);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setFailure(error instanceof ComplaintApiError ? error.code : "server");
    } finally {
      inFlight.current = null;
      setStatus("idle");
    }
  };

  if (receipt) return <ComplaintSuccess receipt={receipt} />;

  const invalidFields = ORDER.filter((f) => errors[f]);
  const detailsLeft = complaintSettings.detailsMax - values.details.length;
  const submitting = status === "submitting";

  return (
    <form ref={form} noValidate onSubmit={onSubmit} className="p-6 sm:p-8 lg:p-10" aria-describedby={`${baseId}-privacy`}>
      <h2 className="font-display text-[1.5rem] text-ink">{copy.formTitle}</h2>

      {showSummary && invalidFields.length > 0 && (
        <div className="mt-6">
          <Notice tone="error" title={copy.errorSummary}>
            <ul className="mt-1 space-y-1">
              {invalidFields.map((field) => (
                <li key={field}>
                  <a href={`#${id(field)}`} className="underline underline-offset-4 hover:text-ink">
                    {message(field)}
                  </a>
                </li>
              ))}
            </ul>
          </Notice>
        </div>
      )}

      <fieldset className="mt-8">
        <legend className="text-eyebrow">{copy.sections.about}</legend>

        <fieldset className="mt-5" aria-describedby={errors.type ? `${id("type")}-error` : undefined}>
          <legend id={id("type")} className="text-[0.9375rem] font-medium text-ink">
            {copy.fields.type}
          </legend>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {complaintTypes.map((type, i) => (
              <label
                key={type.id}
                className={cn(
                  "relative flex min-h-12 cursor-pointer items-center gap-2.5 border px-3.5 text-[0.9375rem] transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-care-deep",
                  values.type === type.id ? "border-care-deep bg-care-tint/60 text-ink" : "border-line-strong bg-white text-ink-2 hover:border-ink/40",
                )}
              >
                <input
                  type="radio"
                  name="type"
                  value={type.id}
                  checked={values.type === type.id}
                  onChange={() => {
                    set("type", type.id);
                    setTouched((t) => ({ ...t, type: true }));
                  }}
                  data-field={i === 0 ? "type" : undefined}
                  className="size-4 accent-[var(--color-care-deep)]"
                />
                {type.label[locale]}
              </label>
            ))}
          </div>
          {message("type") && (
            <p id={`${id("type")}-error`} className="mt-2 text-[0.875rem] text-medical">
              {message("type")}
            </p>
          )}
        </fieldset>

        <div className="mt-7 grid gap-7">
          <Field id={id("target")} label={copy.fields.department} optionalLabel={copy.fields.optional}>
            <select
              id={id("target")}
              value={values.target}
              onChange={(e) => set("target", e.target.value)}
              className={`${inputClasses(false)} h-13`}
            >
              <option value="">{copy.fields.departmentNone}</option>
              <optgroup label={copy.fields.clinicsGroup}>
                {clinics.map((c) => (
                  <option key={c.id} value={complaintTarget("clinic", c.id)}>
                    {c.name[locale]}
                  </option>
                ))}
              </optgroup>
              <optgroup label={copy.fields.departmentsGroup}>
                {departments.map((d) => (
                  <option key={d.id} value={complaintTarget("department", d.id)}>
                    {d.name[locale]}
                  </option>
                ))}
              </optgroup>
            </select>
          </Field>

          <Field id={id("subject")} label={copy.fields.subject} hint={copy.fields.subjectHint} error={message("subject")}>
            <input
              id={id("subject")}
              data-field="subject"
              type="text"
              maxLength={complaintSettings.subjectMax}
              value={values.subject}
              onChange={(e) => set("subject", e.target.value)}
              onBlur={blur("subject")}
              aria-invalid={Boolean(errors.subject)}
              aria-describedby={describedBy(id("subject"), true, Boolean(errors.subject))}
              className={`${inputClasses(Boolean(errors.subject))} h-13`}
            />
          </Field>

          <Field
            id={id("details")}
            label={copy.fields.details}
            hint={copy.fields.detailsHint}
            error={message("details")}
            counter={
              <span className="text-meta tabular" aria-live="polite">
                {detailsLeft <= 150 ? format(copy.charsLeft, { count: Math.max(detailsLeft, 0) }) : ""}
              </span>
            }
          >
            <textarea
              id={id("details")}
              data-field="details"
              rows={6}
              maxLength={complaintSettings.detailsMax}
              value={values.details}
              onChange={(e) => set("details", e.target.value)}
              onBlur={blur("details")}
              aria-invalid={Boolean(errors.details)}
              aria-describedby={describedBy(id("details"), true, Boolean(errors.details))}
              className={`${inputClasses(Boolean(errors.details))} min-h-40 resize-y py-3 leading-8`}
            />
          </Field>
        </div>
      </fieldset>

      <fieldset className="mt-10 border-t border-line pt-8">
        <legend className="text-eyebrow float-start w-full">{copy.sections.you}</legend>
        <div className="clear-both grid gap-7 pt-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field id={id("name")} label={copy.fields.name} error={message("name")}>
              <input
                id={id("name")}
                data-field="name"
                type="text"
                autoComplete="name"
                maxLength={80}
                value={values.name}
                onChange={(e) => set("name", e.target.value)}
                onBlur={blur("name")}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={describedBy(id("name"), false, Boolean(errors.name))}
                className={`${inputClasses(Boolean(errors.name))} h-13`}
              />
            </Field>
          </div>
          <Field id={id("phone")} label={copy.fields.phone} error={message("phone")}>
            <input
              id={id("phone")}
              data-field="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              dir="ltr"
              maxLength={24}
              value={values.phone}
              onChange={(e) => set("phone", e.target.value)}
              onBlur={blur("phone")}
              aria-invalid={Boolean(errors.phone)}
              aria-describedby={describedBy(id("phone"), false, Boolean(errors.phone))}
              className={`${inputClasses(Boolean(errors.phone))} h-13 tabular rtl:text-right`}
            />
          </Field>
          <Field
            id={id("email")}
            label={copy.fields.email}
            optionalLabel={values.contactPreference === "email" ? undefined : copy.fields.optional}
            error={message("email")}
          >
            <input
              id={id("email")}
              data-field="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              dir="ltr"
              maxLength={254}
              value={values.email}
              onChange={(e) => set("email", e.target.value)}
              onBlur={blur("email")}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={describedBy(id("email"), false, Boolean(errors.email))}
              className={`${inputClasses(Boolean(errors.email))} h-13 rtl:text-right`}
            />
          </Field>

          <fieldset className="sm:col-span-2" aria-describedby={errors.contactPreference ? `${id("contactPreference")}-error` : undefined}>
            <legend id={id("contactPreference")} className="text-[0.9375rem] font-medium text-ink">
              {copy.fields.contactPreference}
            </legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {contactPreferences.map((pref, i) => (
                <label
                  key={pref}
                  className={cn(
                    "flex min-h-12 cursor-pointer items-center gap-2.5 border px-4 text-[0.9375rem] transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-care-deep",
                    values.contactPreference === pref ? "border-care-deep bg-care-tint/60 text-ink" : "border-line-strong bg-white text-ink-2 hover:border-ink/40",
                  )}
                >
                  <input
                    type="radio"
                    name="contactPreference"
                    value={pref}
                    checked={values.contactPreference === pref}
                    onChange={() => {
                      set("contactPreference", pref);
                      setTouched((t) => ({ ...t, contactPreference: true }));
                    }}
                    data-field={i === 0 ? "contactPreference" : undefined}
                    className="size-4 accent-[var(--color-care-deep)]"
                  />
                  {copy.preferences[pref]}
                </label>
              ))}
            </div>
            {message("contactPreference") && (
              <p id={`${id("contactPreference")}-error`} className="mt-2 text-[0.875rem] text-medical">
                {message("contactPreference")}
              </p>
            )}
          </fieldset>
        </div>
      </fieldset>

      {failure && (
        <div className="mt-8">
          <Notice tone="error">{copy.failure[failure]}</Notice>
        </div>
      )}

      <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
        <p id={`${baseId}-privacy`} className="max-w-[40ch] text-meta">
          {copy.privacy}
        </p>
        <Button
          type="submit"
          size="lg"
          disabled={submitting}
          icon={submitting ? <LoaderCircle aria-hidden strokeWidth={1.75} className="size-4 animate-spin" /> : undefined}
          arrow={!submitting}
        >
          {submitting ? copy.submitting : copy.submit}
        </Button>
      </div>
      <p role="status" className="visually-hidden">
        {submitting ? copy.submitting : ""}
      </p>
    </form>
  );
}
