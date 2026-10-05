import { complaintSchema, checkComplaint } from "@/features/complaints/validation";
import { toIsoDate } from "@/lib/dates";
import { createReference, isRateLimited, json, readJsonBody, readSimulation } from "@/lib/server/api";

const MAX_BODY_BYTES = 8_192;

/**
 * Mock complaints endpoint. Validates everything server-side and returns a
 * reference number. It never logs or stores the complaint: a production
 * backend must persist it securely, restrict access to authorized staff, and
 * route it to the team responsible.
 */
export async function POST(request: Request) {
  if (isRateLimited(request, "complaints", 5)) return json({ error: "rate_limited" }, 429);

  const read = await readJsonBody(request, MAX_BODY_BYTES);
  if (!read.ok) return read.response;

  const simulation = readSimulation(request);
  if (simulation === "slow") await new Promise((r) => setTimeout(r, 2500));
  if (simulation === "fail") return json({ error: "server" }, 500);

  const parsed = complaintSchema.safeParse(read.body);
  if (!parsed.success) return json({ error: "invalid_request" }, 400);
  const complaint = checkComplaint(parsed.data);
  if (!complaint) return json({ error: "invalid_request" }, 400);

  return json({ receipt: { reference: createReference("CMP", toIsoDate(new Date())) } }, 201);
}
