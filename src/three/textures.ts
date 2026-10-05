import * as THREE from "three";

/**
 * Canvas-drawn textures for the home scene: icon badges, labels and the
 * booking "interface planes". Drawn once (after fonts load), shared, and
 * disposed by their owners. Icons use the same 24px / 1.5-stroke language
 * as the site's iconography.
 */

const INK = "#17201a";
const MUTED = "#667069";
const LINE = "#e4e8e3";
const CARE = "#169b3a";
const CARE_DEEP = "#0b6b2c";
const CARE_TINT = "#e8f2ea";
const MEDICAL = "#c9151e";

export type JourneyIcon = "patient" | "department" | "doctor" | "appointment" | "care";

/** Path data on a 24×24 grid. Circles are expressed as arcs so Path2D can draw them. */
const ICONS: Record<JourneyIcon, string[]> = {
  patient: ["M12 4a4 4 0 1 0 0.01 0Z", "M4.5 21c0.6-4 3.8-6.5 7.5-6.5s6.9 2.5 7.5 6.5"],
  department: ["M3.5 21h17", "M5.5 21V7.5L12 3.5l6.5 4V21", "M12 8.5v5", "M9.5 11h5", "M10 21v-3.5h4V21"],
  doctor: [
    "M6 3.5H4.5v5a4.5 4.5 0 0 0 9 0v-5H12",
    "M9 13v1.5a5.5 5.5 0 0 0 11 0V12",
    "M20 8.5a1.75 1.75 0 1 0 0.01 0Z",
  ],
  appointment: ["M5 5.5h14a1.5 1.5 0 0 1 1.5 1.5v12.5A1.5 1.5 0 0 1 19 21H5a1.5 1.5 0 0 1-1.5-1.5V7A1.5 1.5 0 0 1 5 5.5Z", "M8 3.5v4", "M16 3.5v4", "M3.5 10.5h17", "M9 15.5l2 2 4-4"],
  care: [
    "M19.5 13.5c1.4-1.4 2.5-3 2.5-5A5 5 0 0 0 17 3.5c-1.8 0-3 .6-5 2.4-2-1.8-3.2-2.4-5-2.4a5 5 0 0 0-5 5c0 2 1.1 3.6 2.5 5L12 21Z",
    "M3.5 12h4.5l1.5-2.5 3 5 1.5-2.5h6.5",
  ],
};

function canvas(width: number, height: number) {
  const c = document.createElement("canvas");
  c.width = width;
  c.height = height;
  const ctx = c.getContext("2d");
  if (!ctx) throw new Error("2D canvas unavailable");
  return { c, ctx };
}

function toTexture(c: HTMLCanvasElement): THREE.CanvasTexture {
  const texture = new THREE.CanvasTexture(c);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  texture.needsUpdate = true;
  return texture;
}

function drawIcon(ctx: CanvasRenderingContext2D, paths: string[], cx: number, cy: number, size: number, color: string) {
  const scale = size / 24;
  ctx.save();
  ctx.translate(cx - size / 2, cy - size / 2);
  ctx.scale(scale, scale);
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.6;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (const d of paths) ctx.stroke(new Path2D(d));
  ctx.restore();
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

/** The site's body font, resolved from the DOM (next/font uses hashed family names). */
export function siteFontFamily(): string {
  return getComputedStyle(document.body).fontFamily || "sans-serif";
}

/** Circular icon badge for a journey node. */
export function makeBadgeTexture(icon: JourneyIcon, ring: string): THREE.CanvasTexture {
  const size = 192;
  const { c, ctx } = canvas(size, size);
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2 - 8, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.97)";
  ctx.fill();
  ctx.lineWidth = 5;
  ctx.strokeStyle = ring;
  ctx.stroke();
  drawIcon(ctx, ICONS[icon], size / 2, size / 2, 84, icon === "care" ? MEDICAL : INK);
  return toTexture(c);
}

/** A short text label, rendered in the site font with correct Arabic shaping. */
export function makeLabelTexture(text: string, rtl: boolean): THREE.CanvasTexture {
  const { c, ctx } = canvas(384, 96);
  ctx.direction = rtl ? "rtl" : "ltr";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `500 38px ${siteFontFamily()}`;
  ctx.fillStyle = INK;
  ctx.fillText(text, 192, 50);
  return toTexture(c);
}

export interface PlaneCopy {
  rtl: boolean;
  specialtyTitle: string;
  specialties: string[];
  doctorTitle: string;
  doctorName: string;
  doctorRole: string;
  nextSlot: string;
  scheduleTitle: string;
  confirmTitle: string;
  confirmText: string;
}

const PLANE_W = 640;
const PLANE_H = 420;

function planeBase(title: string, copy: PlaneCopy, step: number) {
  const { c, ctx } = canvas(PLANE_W, PLANE_H);
  const font = siteFontFamily();
  ctx.direction = copy.rtl ? "rtl" : "ltr";
  // Card
  roundRect(ctx, 4, 4, PLANE_W - 8, PLANE_H - 8, 22);
  ctx.fillStyle = "rgba(255,255,255,0.97)";
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = LINE;
  ctx.stroke();
  // Emblem rule
  const third = (PLANE_W - 60) / 8;
  ctx.fillStyle = CARE;
  ctx.fillRect(30, 30, third * 3, 4);
  ctx.fillStyle = MEDICAL;
  ctx.fillRect(30 + third * 3 + 6, 30, third * 3 - 6, 4);
  ctx.fillStyle = INK;
  ctx.fillRect(30 + third * 6 + 6, 30, third * 2 - 6, 4);
  // Header
  const startX = copy.rtl ? PLANE_W - 36 : 36;
  ctx.textAlign = copy.rtl ? "right" : "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = CARE_DEEP;
  ctx.font = `500 22px ${font}`;
  ctx.fillText(`0${step}`, startX, 82);
  ctx.fillStyle = INK;
  ctx.font = `500 34px ${font}`;
  ctx.fillText(title, copy.rtl ? startX - 50 : startX + 50, 84);
  return { c, ctx, font, startX };
}

function specialtyPlane(copy: PlaneCopy) {
  const { c, ctx, font } = planeBase(copy.specialtyTitle, copy, 1);
  copy.specialties.slice(0, 4).forEach((name, i) => {
    const y = 120 + i * 68;
    const selected = i === 1;
    roundRect(ctx, 30, y, PLANE_W - 60, 56, 10);
    ctx.fillStyle = selected ? CARE_TINT : "#f7f8f6";
    ctx.fill();
    if (selected) {
      ctx.fillStyle = CARE_DEEP;
      ctx.fillRect(copy.rtl ? PLANE_W - 36 : 30, y, 6, 56);
    }
    const iconX = copy.rtl ? PLANE_W - 74 : 74;
    ctx.beginPath();
    ctx.arc(iconX, y + 28, 15, 0, Math.PI * 2);
    ctx.strokeStyle = selected ? CARE_DEEP : MUTED;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = INK;
    ctx.font = `${selected ? 600 : 400} 26px ${font}`;
    ctx.textAlign = copy.rtl ? "right" : "left";
    ctx.fillText(name, copy.rtl ? iconX - 32 : iconX + 32, y + 37);
    if (selected) drawIcon(ctx, ["M5 12.5l4.5 4.5L19 7.5"], copy.rtl ? 66 : PLANE_W - 66, y + 28, 30, CARE_DEEP);
  });
  return toTexture(c);
}

function doctorPlane(copy: PlaneCopy) {
  const { c, ctx, font } = planeBase(copy.doctorTitle, copy, 2);
  const avatarX = copy.rtl ? PLANE_W - 110 : 110;
  ctx.beginPath();
  ctx.arc(avatarX, 200, 62, 0, Math.PI * 2);
  ctx.fillStyle = "#ecf0eb";
  ctx.fill();
  drawIcon(ctx, ICONS.patient, avatarX, 204, 78, "#a9b4ab");
  const textX = copy.rtl ? avatarX - 92 : avatarX + 92;
  ctx.textAlign = copy.rtl ? "right" : "left";
  ctx.fillStyle = INK;
  ctx.font = `600 32px ${font}`;
  ctx.fillText(copy.doctorName, textX, 188);
  ctx.fillStyle = MUTED;
  ctx.font = `400 23px ${font}`;
  ctx.fillText(copy.doctorRole, textX, 226);
  // Availability
  roundRect(ctx, 30, 300, PLANE_W - 60, 76, 12);
  ctx.fillStyle = CARE_TINT;
  ctx.fill();
  const dotX = copy.rtl ? PLANE_W - 64 : 64;
  ctx.beginPath();
  ctx.arc(dotX, 338, 8, 0, Math.PI * 2);
  ctx.fillStyle = CARE;
  ctx.fill();
  ctx.fillStyle = CARE_DEEP;
  ctx.font = `500 26px ${font}`;
  ctx.fillText(copy.nextSlot, copy.rtl ? dotX - 26 : dotX + 26, 347);
  return toTexture(c);
}

function schedulePlane(copy: PlaneCopy) {
  const { c, ctx, font } = planeBase(copy.scheduleTitle, copy, 3);
  const days = [4, 5, 6, 7, 8, 9, 10];
  const cellW = (PLANE_W - 60 - 6 * 10) / 7;
  days.forEach((day, i) => {
    const index = copy.rtl ? 6 - i : i;
    const x = 30 + index * (cellW + 10);
    const selected = i === 2;
    const closed = i === 5;
    roundRect(ctx, x, 116, cellW, 92, 10);
    ctx.fillStyle = selected ? CARE_DEEP : closed ? "#f1f3f0" : "#ffffff";
    ctx.fill();
    ctx.strokeStyle = selected ? CARE_DEEP : LINE;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.textAlign = "center";
    ctx.fillStyle = selected ? "#ffffff" : closed ? "#b5bdb7" : INK;
    ctx.font = `500 34px ${font}`;
    ctx.fillText(String(day), x + cellW / 2, 172);
    if (!closed) {
      ctx.beginPath();
      ctx.arc(x + cellW / 2, 192, 4, 0, Math.PI * 2);
      ctx.fillStyle = selected ? "#ffffff" : CARE;
      ctx.fill();
    }
  });
  const times = ["9:00", "9:30", "10:00", "10:30", "11:00", "11:30", "4:00", "4:30"];
  const slotW = (PLANE_W - 60 - 3 * 12) / 4;
  times.forEach((time, i) => {
    const col = copy.rtl ? 3 - (i % 4) : i % 4;
    const x = 30 + col * (slotW + 12);
    const y = 236 + Math.floor(i / 4) * 74;
    const selected = i === 5;
    const booked = i === 1 || i === 6;
    roundRect(ctx, x, y, slotW, 60, 10);
    ctx.fillStyle = selected ? CARE_DEEP : booked ? "#f1f3f0" : "#ffffff";
    ctx.fill();
    ctx.strokeStyle = selected ? CARE_DEEP : LINE;
    ctx.stroke();
    ctx.textAlign = "center";
    ctx.fillStyle = selected ? "#ffffff" : booked ? "#b5bdb7" : INK;
    ctx.font = `500 26px ${font}`;
    ctx.fillText(time, x + slotW / 2, y + 39);
    if (booked) {
      ctx.strokeStyle = "#b5bdb7";
      ctx.beginPath();
      ctx.moveTo(x + slotW / 2 - 34, y + 30);
      ctx.lineTo(x + slotW / 2 + 34, y + 30);
      ctx.stroke();
    }
  });
  return toTexture(c);
}

function confirmPlane(copy: PlaneCopy) {
  const { c, ctx, font } = planeBase(copy.confirmTitle, copy, 4);
  const cx = PLANE_W / 2;
  const cy = 210;
  const r = 66;
  const arcs: Array<[number, number, string]> = [
    [100, 208, CARE],
    [-28, 80, MEDICAL],
    [228, 312, INK],
  ];
  ctx.lineWidth = 7;
  ctx.lineCap = "round";
  for (const [from, to, color] of arcs) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, (-to * Math.PI) / 180, (-from * Math.PI) / 180);
    ctx.strokeStyle = color;
    ctx.stroke();
  }
  drawIcon(ctx, ["M6 12.5l4 4L18 8"], cx, cy, 82, CARE_DEEP);
  ctx.textAlign = "center";
  ctx.fillStyle = INK;
  ctx.font = `600 30px ${font}`;
  ctx.fillText(copy.confirmText, cx, 330);
  ctx.fillStyle = MUTED;
  ctx.font = `500 22px ui-monospace, monospace`;
  // Reference numbers are always left-to-right, even on an Arabic plane.
  ctx.direction = "ltr";
  ctx.fillText("PAS-•••-•••••", cx, 370);
  return toTexture(c);
}

/** The four booking-preview planes, in step order. */
export function makeBookingPlaneTextures(copy: PlaneCopy): THREE.CanvasTexture[] {
  return [specialtyPlane(copy), doctorPlane(copy), schedulePlane(copy), confirmPlane(copy)];
}

export const PLANE_ASPECT = PLANE_W / PLANE_H;
