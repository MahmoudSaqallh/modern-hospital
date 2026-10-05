"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { sceneStore } from "../sceneStore";

/** Low-density drifting points — depth and air, never sparkle. One draw call. */

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  attribute float aSeed;
  attribute float aSize;
  attribute vec3 aColor;
  varying vec3 vColor;
  varying float vFade;

  void main() {
    vec3 p = position;
    p.x += sin(uTime * 0.05 + aSeed * 6.28) * 0.35;
    p.y += cos(uTime * 0.07 + aSeed * 4.0) * 0.25;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = aSize * uPixelRatio * (7.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
    vColor = aColor;
    vFade = smoothstep(-16.0, -4.0, mv.z);
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uOpacity;
  varying vec3 vColor;
  varying float vFade;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    float alpha = smoothstep(0.5, 0.1, d) * uOpacity * (0.35 + vFade * 0.65);
    if (alpha < 0.01) discard;
    gl_FragColor = vec4(vColor, alpha * 0.42);
  }
`;

const MODE_OPACITY = { home: 1, ambient: 0.65, quiet: 0.35 } as const;

/** Deterministic pseudo-random so the layout is stable between renders. */
function seeded(i: number): number {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

export function CareParticles({ count }: { count: number }) {
  const material = useRef<THREE.ShaderMaterial>(null);

  const { positions, seeds, sizes, colors } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    const sizes = new Float32Array(count);
    const colors = new Float32Array(count * 3);
    const neutral = new THREE.Color("#7d897f");
    const care = new THREE.Color("#169b3a");
    const medical = new THREE.Color("#c9151e");
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (seeded(i) - 0.5) * 26;
      positions[i * 3 + 1] = (seeded(i + 1000) - 0.5) * 12;
      positions[i * 3 + 2] = -2 - seeded(i + 2000) * 14;
      seeds[i] = seeded(i + 3000);
      sizes[i] = 1.2 + seeded(i + 4000) * 2.4;
      const pick = seeded(i + 5000);
      const color = pick > 0.94 ? medical : pick > 0.8 ? care : neutral;
      colors.set([color.r, color.g, color.b], i * 3);
    }
    return { positions, seeds, sizes, colors };
  }, [count]);

  const uniforms = useMemo(
    () => ({ uTime: { value: 0 }, uPixelRatio: { value: 1 }, uOpacity: { value: 0 } }),
    [],
  );

  useFrame((state, delta) => {
    const m = material.current;
    if (!m) return;
    m.uniforms.uTime.value = sceneStore.time;
    m.uniforms.uPixelRatio.value = state.gl.getPixelRatio();
    const target = MODE_OPACITY[sceneStore.mode] * (sceneStore.mode === "home" ? sceneStore.env.particles : 1);
    m.uniforms.uOpacity.value = sceneStore.reducedMotion
      ? target
      : THREE.MathUtils.damp(m.uniforms.uOpacity.value as number, target, 2, Math.min(delta, 0.05));
  });

  return (
    <points frustumCulled={false} renderOrder={-1}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aSeed" args={[seeds, 1]} />
        <bufferAttribute attach="attributes-aSize" args={[sizes, 1]} />
        <bufferAttribute attach="attributes-aColor" args={[colors, 3]} />
      </bufferGeometry>
      <shaderMaterial
        ref={material}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </points>
  );
}
