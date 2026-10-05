import "server-only";

/**
 * Shared helpers for the mock API route handlers (booking, complaints).
 * When a real backend is connected these routes become thin proxies or are
 * removed — client code only depends on each feature's service module.
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

/** e.g. createReference("PAS", "2026-10-05") → "PAS-261005-7KQ2M" */
export function createReference(prefix: string, date: string): string {
  const bytes = crypto.getRandomValues(new Uint8Array(5));
  const suffix = Array.from(bytes, (b) => REFERENCE_ALPHABET[b % REFERENCE_ALPHABET.length]).join("");
  return `${prefix}-${date.slice(2).replaceAll("-", "")}-${suffix}`;
}

/**
 * Best-effort, per-instance rate limiter (separate bucket per endpoint). It
 * does not survive restarts or scale across instances — the production
 * backend must enforce its own limits.
 */
const WINDOW_MS = 60_000;
const hits = new Map<string, number[]>();

export function isRateLimited(request: Request, bucket: string, maxRequests = 8): boolean {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const key = `${bucket}:${ip}`;
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5_000) hits.clear();
  return recent.length > maxRequests;
}

/**
 * Read a JSON body defensively: JSON content type only, size-capped, parsed
 * safely. Returns the parsed value or a ready-made error Response.
 */
export async function readJsonBody(
  request: Request,
  maxBytes: number,
): Promise<{ ok: true; body: unknown } | { ok: false; response: Response }> {
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return { ok: false, response: json({ error: "invalid_request" }, 415) };
  }
  const raw = await request.text();
  if (raw.length > maxBytes) return { ok: false, response: json({ error: "invalid_request" }, 413) };
  try {
    return { ok: true, body: JSON.parse(raw) };
  } catch {
    return { ok: false, response: json({ error: "invalid_request" }, 400) };
  }
}
