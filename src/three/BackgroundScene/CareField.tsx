"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { sceneStore } from "../sceneStore";

/**
 * The "care field": rows of thin wave lines receding into depth — the
 * flowing waves of the society's emblem, rendered as a calm surface.
 * One LineSegments draw call; displacement happens in the vertex shader.
 */

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uRows;
  uniform float uPulseX;
  uniform float uAmp;
  attribute float aRow;
  varying float vAlpha;
  varying float vRow;
  varying float vPulse;

  void main() {
    vec3 p = position;
    float r = aRow;
    p.y += (sin(p.x * 0.32 + uTime * 0.22 + r * 0.42) * 0.30
         + sin(p.x * 0.85 - uTime * 0.16 + r * 0.9) * 0.07) * uAmp;

    float edge = smoothstep(14.0, 7.0, abs(p.x));
    float depth = 1.0 - r / uRows;
    vRow = r / uRows;
    vAlpha = edge * (0.25 + depth * 0.75);

    // A faint pulse travelling along the nearest rows.
    float d = (p.x - uPulseX) / 1.6;
    vPulse = exp(-d * d) * smoothstep(4.0, 0.0, r);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uCare;
  uniform vec3 uNeutral;
  uniform vec3 uPulseColor;
  uniform float uOpacity;
  varying float vAlpha;
  varying float vRow;
  varying float vPulse;

  void main() {
    vec3 color = mix(uCare, uNeutral, smoothstep(0.0, 0.85, vRow));
    color = mix(color, uPulseColor, vPulse * 0.8);
    float alpha = (vAlpha * 0.22 + vPulse * 0.35) * uOpacity;
    gl_FragColor = vec4(color, alpha);
  }
`;

interface CareFieldProps {
  rows: number;
  points: number;
}

const MODE_OPACITY = { home: 1, ambient: 0.7, quiet: 0.4 } as const;
const PULSE_PERIOD = 9; // seconds per sweep

export function CareField({ rows, points }: CareFieldProps) {
  const material = useRef<THREE.ShaderMaterial>(null);

  const { positions, rowAttr, indices } = useMemo(() => {
    const positions = new Float32Array(rows * points * 3);
    const rowAttr = new Float32Array(rows * points);
    const indices: number[] = [];
    for (let r = 0; r < rows; r++) {
      for (let i = 0; i < points; i++) {
        const k = r * points + i;
        const x = -15 + (30 * i) / (points - 1);
        positions[k * 3] = x;
        positions[k * 3 + 1] = -2.7 + r * 0.06;
        positions[k * 3 + 2] = -2.5 - r * 0.62;
        rowAttr[k] = r;
        if (i < points - 1) indices.push(k, k + 1);
      }
    }
    return { positions, rowAttr, indices: new Uint32Array(indices) };
  }, [rows, points]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uRows: { value: rows },
      uPulseX: { value: -20 },
      uAmp: { value: 1 },
      uOpacity: { value: 0 },
      uCare: { value: new THREE.Color("#169b3a") },
      uNeutral: { value: new THREE.Color("#9aa69d") },
      uPulseColor: { value: new THREE.Color("#c9151e") },
    }),
    [rows],
  );

  useFrame((_, delta) => {
    const m = material.current;
    if (!m) return;
    const t = sceneStore.time;
    m.uniforms.uTime.value = t;
    m.uniforms.uAmp.value = sceneStore.env.wave;
    m.uniforms.uPulseX.value = sceneStore.reducedMotion ? -40 : ((t % PULSE_PERIOD) / PULSE_PERIOD) * 40 - 20;

    // Ease toward the mode's intensity; on the home page the chapter mood shapes it further.
    const target = MODE_OPACITY[sceneStore.mode] * (sceneStore.mode === "home" ? 0.55 + sceneStore.env.wave * 0.45 : 1);
    const current = m.uniforms.uOpacity.value as number;
    m.uniforms.uOpacity.value = sceneStore.reducedMotion
      ? target
      : THREE.MathUtils.damp(current, target, 2.2, Math.min(delta, 0.05));
  });

  return (
    <lineSegments frustumCulled={false} renderOrder={-2}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aRow" args={[rowAttr, 1]} />
        <bufferAttribute attach="index" args={[indices, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={material}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </lineSegments>
  );
}
