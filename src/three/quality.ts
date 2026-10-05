export type QualityTier = "high" | "low";

export interface SceneQuality {
  tier: QualityTier;
  maxDpr: number;
  fieldLines: number;
  fieldPoints: number;
  particles: number;
  sphereSegments: [number, number];
  tubeSegments: number;
  environment: boolean;
  contactShadows: boolean;
}

const HIGH: SceneQuality = {
  tier: "high",
  maxDpr: 1.5,
  fieldLines: 26,
  fieldPoints: 150,
  particles: 220,
  sphereSegments: [64, 40],
  tubeSegments: 96,
  environment: true,
  contactShadows: true,
};

const LOW: SceneQuality = {
  tier: "low",
  maxDpr: 1.25,
  fieldLines: 13,
  fieldPoints: 72,
  particles: 70,
  sphereSegments: [36, 22],
  tubeSegments: 48,
  environment: false,
  contactShadows: false,
};

/** Small screens, few cores or little memory → the light scene. */
export function detectQuality(): SceneQuality {
  if (typeof window === "undefined") return LOW;
  const nav = navigator as Navigator & { deviceMemory?: number };
  const smallScreen = Math.min(window.innerWidth, window.innerHeight) < 640 || window.innerWidth < 900;
  const weakCpu = (nav.hardwareConcurrency ?? 8) <= 4;
  const lowMemory = (nav.deviceMemory ?? 8) <= 4;
  return smallScreen || weakCpu || lowMemory ? LOW : HIGH;
}

export function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}
