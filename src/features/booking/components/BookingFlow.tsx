"use client";

import { useCallback, useEffect, useRef } from "react";
import { gsap, useGSAP } from "@/animations/gsap";
import { animateStepIn } from "@/animations/booking";
import { MEDIA } from "@/animations/motion";
import { useClientNow } from "@/features/doctors/hooks/useClientNow";
import { useI18n } from "@/i18n/I18nProvider";
import { format } from "@/lib/localized";
import { BOOKING_STEPS, maxReachableStep, type BookingStep } from "../hooks/bookingState";
import { useBookingFlow } from "../hooks/useBookingFlow";
import type { AppointmentSlot, DoctorChoice, IsoDate, PatientDetails } from "../types";
import { BookingProgress } from "./BookingProgress";
import { BookingSuccess } from "./BookingSuccess";
import { BookingSummary, BookingSummaryInline } from "./BookingSummary";
import { StepDepartment } from "./StepDepartment";
import { StepDetails } from "./StepDetails";
import { StepDoctor } from "./StepDoctor";
import { StepReview } from "./StepReview";
import { StepSchedule } from "./StepSchedule";

/**
 * The booking product: five steps, one decision each. Presentation lives in
 * the step components; state and rules live in useBookingFlow/bookingReducer.
 */
export function BookingFlow() {
  const { dict } = useI18n();
  const { state, dispatch, submit } = useBookingFlow();
  const now = useClientNow();
  const panel = useRef<HTMLDivElement>(null);
  const top = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  // Step transition + focus management (never on the initial render).
  useGSAP(
    () => {
      if (isFirstRender.current) {
        isFirstRender.current = false;
        return;
      }
      const el = panel.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add(MEDIA.motionOk, () => {
        animateStepIn(el, state.direction);
      });
      el.querySelector<HTMLElement>("[data-step-heading]")?.focus({ preventScroll: true });
      const rect = top.current?.getBoundingClientRect();
      if (rect && rect.top < 0) top.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    { dependencies: [state.step], scope: panel },
  );

  const goTo = useCallback((step: BookingStep) => dispatch({ type: "goToStep", step }), [dispatch]);
  const selectDate = useCallback((date: IsoDate) => dispatch({ type: "selectDate", date }), [dispatch]);
  const clearSlot = useCallback(() => dispatch({ type: "clearSlot" }), [dispatch]);
  const selectSlot = useCallback(
    (slot: AppointmentSlot) => {
      if (slot.doctorId) dispatch({ type: "selectSlot", time: slot.time, doctorId: slot.doctorId });
    },
    [dispatch],
  );

  // A taken slot sends the patient straight back to choose another time.
  const recover = useCallback(() => {
    if (state.submission.status !== "error") return;
    const code = state.submission.code;
    if (code === "slot_unavailable") {
      dispatch({ type: "clearSlot" });
      dispatch({ type: "goToStep", step: 3 });
    } else if (code === "invalid_request") {
      dispatch({ type: "goToStep", step: 4 });
    } else {
      void submit();
    }
  }, [state.submission, dispatch, submit]);

  // Keep the URL clean after success so a refresh doesn't re-open a stale prefill.
  useEffect(() => {
    if (state.appointment && window.location.search) {
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, [state.appointment]);

  if (state.appointment) {
    return (
      <div className="container-site pb-24 pt-4">
        <BookingSuccess
          appointment={state.appointment}
          phone={state.patient.phone}
          onBookAnother={() => dispatch({ type: "reset" })}
        />
      </div>
    );
  }

  const stepName = dict.booking.steps[BOOKING_STEPS[state.step - 1]];

  return (
    <div ref={top} className="container-site scroll-mt-24 pb-24">
      <BookingProgress current={state.step} maxReachable={maxReachableStep(state)} onSelect={goTo} />
      <BookingSummaryInline state={state} />
      <p className="visually-hidden" aria-live="polite">
        {format(dict.booking.liveStep, { current: state.step, total: BOOKING_STEPS.length, name: stepName })}
      </p>

      <div className="mt-10 grid gap-12 lg:grid-cols-12 lg:gap-14">
        <div ref={panel} className="min-w-0 lg:col-span-8">
          {state.step === 1 && (
            <StepDepartment
              selectedId={state.departmentId}
              onSelect={(departmentId) => dispatch({ type: "selectDepartment", departmentId })}
            />
          )}
          {state.step === 2 && state.departmentId && (
            <StepDoctor
              departmentId={state.departmentId}
              selected={state.doctorChoice}
              now={now}
              onSelect={(choice: DoctorChoice) => dispatch({ type: "selectDoctor", choice })}
              onBack={() => goTo(1)}
            />
          )}
          {state.step === 3 && state.departmentId && state.doctorChoice && (
            <StepSchedule
              departmentId={state.departmentId}
              doctorChoice={state.doctorChoice}
              date={state.date}
              time={state.time}
              assignedDoctorId={state.assignedDoctorId}
              now={now}
              onSelectDate={selectDate}
              onSelectSlot={selectSlot}
              onClearSlot={clearSlot}
              onContinue={() => dispatch({ type: "next" })}
              onBack={() => goTo(2)}
            />
          )}
          {state.step === 4 && (
            <StepDetails
              patient={state.patient}
              onChange={(field: keyof PatientDetails, value: string) => dispatch({ type: "updatePatient", field, value })}
              onContinue={() => dispatch({ type: "next" })}
              onBack={() => goTo(3)}
            />
          )}
          {state.step === 5 && state.departmentId && state.assignedDoctorId && state.date && state.time && (
            <StepReview
              departmentId={state.departmentId}
              doctorId={state.assignedDoctorId}
              date={state.date}
              time={state.time}
              patient={state.patient}
              submission={state.submission}
              onEdit={goTo}
              onConfirm={() => void submit()}
              onRecover={recover}
            />
          )}
        </div>

        <div className="hidden lg:col-span-4 lg:block">
          <BookingSummary state={state} />
        </div>
      </div>
    </div>
  );
}
