import type { ComplaintFailure, ComplaintReceipt, ComplaintSubmission } from "./types";

/**
 * Typed client for the complaints backend. Point API_BASE (or this module)
 * at the real service when it exists.
 */
const API_BASE = process.env.NEXT_PUBLIC_BOOKING_API_BASE ?? "/api";

export class ComplaintApiError extends Error {
  constructor(public readonly code: ComplaintFailure) {
    super(code);
    this.name = "ComplaintApiError";
  }
}

/** Development-only: `?simulate=offline|fail|slow` to review failure states. */
function simulation(): string | null {
  if (process.env.NODE_ENV === "production" || typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get("simulate");
}

export async function submitComplaint(submission: ComplaintSubmission, signal?: AbortSignal): Promise<ComplaintReceipt> {
  const simulate = simulation();
  if (simulate === "offline") throw new ComplaintApiError("network");

  let response: Response;
  try {
    response = await fetch(`${API_BASE}/complaints`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(simulate ? { "x-simulate": simulate } : {}),
      },
      body: JSON.stringify(submission),
      signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new ComplaintApiError("network");
  }

  if (!response.ok) {
    if (response.status === 429) throw new ComplaintApiError("rate_limited");
    throw new ComplaintApiError(response.status >= 500 ? "server" : "invalid_request");
  }
  try {
    const { receipt } = (await response.json()) as { receipt: ComplaintReceipt };
    return receipt;
  } catch {
    throw new ComplaintApiError("server");
  }
}
