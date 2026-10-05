import { cn } from "@/lib/localized";

/**
 * The emblem's three-arc ring (green · red · ink) as a reusable glyph.
 * Angles follow the emblem: green upper-left, red upper-right, ink below.
 */

export const ARC_SEGMENTS = [
  { key: "care", from: 100, to: 208, className: "stroke-care" },
  { key: "medical", from: -28, to: 80, className: "stroke-medical" },
  { key: "ink", from: 228, to: 312, className: "stroke-ink" },
] as const;

/** SVG path for an arc drawn counter-clockwise (math angles, y-up) on a y-down canvas. */
export function arcPath(cx: number, cy: number, r: number, fromDeg: number, toDeg: number): string {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const x1 = cx + r * Math.cos(toRad(fromDeg));
  const y1 = cy - r * Math.sin(toRad(fromDeg));
  const x2 = cx + r * Math.cos(toRad(toDeg));
  const y2 = cy - r * Math.sin(toRad(toDeg));
  const large = toDeg - fromDeg > 180 ? 1 : 0;
  return `M ${x1.toFixed(3)} ${y1.toFixed(3)} A ${r} ${r} 0 ${large} 0 ${x2.toFixed(3)} ${y2.toFixed(3)}`;
}

interface ArcMarkProps {
  size?: number;
  strokeWidth?: number;
  className?: string;
  /** Accessible name; omit when the mark is decorative. */
  title?: string;
}

export function ArcMark({ size = 16, strokeWidth = 2.4, className, title }: ArcMarkProps) {
  const r = 12 - strokeWidth / 2;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("shrink-0", className)}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {ARC_SEGMENTS.map((segment) => (
        <path
          key={segment.key}
          d={arcPath(12, 12, r, segment.from, segment.to)}
          className={segment.className}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
      ))}
    </svg>
  );
}
