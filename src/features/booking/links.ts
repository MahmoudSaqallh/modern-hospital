import { localePath, type Locale } from "@/i18n/config";
import type { BookingPrefill } from "./hooks/bookingState";

/** Deep link into the booking flow with any known selections pre-filled. */
export function bookingHref(locale: Locale, prefill: BookingPrefill = {}): string {
  const params = new URLSearchParams();
  if (prefill.clinic) params.set("clinic", prefill.clinic);
  if (prefill.doctor) params.set("doctor", prefill.doctor);
  if (prefill.date) params.set("date", prefill.date);
  if (prefill.time) params.set("time", prefill.time);
  const query = params.toString();
  return `${localePath(locale, "/booking")}${query ? `?${query}` : ""}`;
}
