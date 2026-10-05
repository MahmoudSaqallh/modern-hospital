/**
 * The "patient care network" shared by the SVG diagram (DOM, always present)
 * and the WebGL layer (flowing light on top of the same paths). Both read
 * these coordinates so they line up exactly.
 *
 * Unit space: −1…1 on both axes inside a square frame, y up, x for
 * left-to-right reading (mirrored for RTL so "patient" sits at reading start).
 */
export type SupportNodeKey = "patient" | "procedure" | "community" | "hospital";

export interface SupportNode {
  key: SupportNodeKey;
  x: number;
  y: number;
  /** Brand accent of the connection: green for care, red reserved for one small accent. */
  tone: "care" | "medical";
}

export const SUPPORT_NODES: readonly SupportNode[] = [
  { key: "patient", x: -0.66, y: 0.56, tone: "medical" },
  { key: "procedure", x: 0.7, y: 0.46, tone: "care" },
  { key: "hospital", x: 0.52, y: -0.66, tone: "care" },
  { key: "community", x: -0.72, y: -0.44, tone: "care" },
];

/** Radius of the central "care" disc in unit space. */
export const SUPPORT_CORE_RADIUS = 0.17;

/** Quadratic control point for the curve from a node into the centre — a gentle, consistent bend. */
export function controlPoint(node: Pick<SupportNode, "x" | "y">): { x: number; y: number } {
  return { x: node.x * 0.5 - node.y * 0.18, y: node.y * 0.5 + node.x * 0.18 };
}

/** Where a node's curve ends: on the rim of the central disc, not inside it. */
export function rimPoint(node: Pick<SupportNode, "x" | "y">): { x: number; y: number } {
  const c = controlPoint(node);
  const length = Math.hypot(c.x, c.y) || 1;
  return { x: (c.x / length) * SUPPORT_CORE_RADIUS, y: (c.y / length) * SUPPORT_CORE_RADIUS };
}
