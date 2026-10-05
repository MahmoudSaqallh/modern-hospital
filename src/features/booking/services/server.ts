import "server-only";

/**
 * Server-side helpers for the mock booking API routes.
 * When connecting a real backend, these route handlers become a thin proxy
 * (or are removed) — the client only depends on `bookingApi.ts`.
 */

const SIMULATIONS = ["fail", "taken", "empty", "slow"] as const;
export type Simulation = (typeof SIMULATIONS)[number];

/** Development-only failure simulation, so error states can be reviewed. Ignored in production. */
export function readSimulation(request: Request): Simulation | null {
  if (process.env.NODE_ENV === "production") return null;
  const value = request.headers.get("x-simulate");
  return SIMULATIONS.find((s) => s === value) ?? null;
}

export function json(body: unknown, status = 200): Response {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

const REFERENCE_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"; // no 0/O/1/I

export function createReference(date: string): string {
  const bytes = crypto.getRandomValues(new Uint8Array(5));
  const suffix = Array.from(bytes, (b) => REFERENCE_ALPHABET[b % REFERENCE_ALPHABET.length]).join("");
  return `PAS-${date.slice(2).replaceAll("-", "")}-${suffix}`;
}

/**
 * Best-effort, per-instance rate limiter. It does not survive restarts or
 * scale across instances — the production backend must enforce its own limits.
 */
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 8;
const hits = new Map<string, number[]>();

export function isRateLimited(request: Request): boolean {
  const key = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5_000) hits.clear();
  return recent.length > MAX_REQUESTS;
}

export const MAX_BODY_BYTES = 4_096;
