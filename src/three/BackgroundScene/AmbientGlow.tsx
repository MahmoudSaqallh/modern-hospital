"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { sceneStore } from "../sceneStore";

/**
 * Deepest layers: two soft moving lights (care green, faint medical red) and
 * a whisper of noise, on one far plane. Very low alpha — it gives the white
 * page air and depth without ever reading as a gradient wash.
 */
const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uGlow;
  uniform float uCare;
  uniform float uDir;
  varying vec2 vUv;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }

  void main() {
    vec2 uv = vUv;
    // Lights drift slowly around the visual (end) side of the layout.
    vec2 g = vec2(0.5 - uDir * 0.22 + sin(uTime * 0.07) * 0.08, 0.58 + cos(uTime * 0.05) * 0.06);
    vec2 r = vec2(0.5 - uDir * 0.06 + cos(uTime * 0.06) * 0.12, 0.34 + sin(uTime * 0.08) * 0.05);
    float green = exp(-pow(distance(uv * vec2(1.6, 1.0), g * vec2(1.6, 1.0)) / 0.26, 2.0));
    float red = exp(-pow(distance(uv * vec2(1.6, 1.0), r * vec2(1.6, 1.0)) / 0.18, 2.0));
    float n = noise(uv * 6.0 + uTime * 0.02) * 0.5 + noise(uv * 13.0 - uTime * 0.015) * 0.25;

    vec3 careColor = vec3(0.086, 0.608, 0.227);
    vec3 redColor = vec3(0.788, 0.082, 0.118);
    float a = green * (0.07 + uCare * 0.05) + red * 0.022;
    vec3 color = (careColor * green * (0.07 + uCare * 0.05) + redColor * red * 0.022) / max(a, 0.0001);
    a = (a + n * 0.012) * uGlow;
    gl_FragColor = vec4(color, a);
  }
`;

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export function AmbientGlow() {
  const material = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({ uTime: { value: 0 }, uGlow: { value: 0 }, uCare: { value: 0 }, uDir: { value: 1 } }),
    [],
  );

  useFrame(() => {
    const m = material.current;
    if (!m) return;
    m.uniforms.uTime.value = sceneStore.time;
    m.uniforms.uGlow.value = sceneStore.env.glow;
    m.uniforms.uCare.value = sceneStore.env.care;
    m.uniforms.uDir.value = sceneStore.dir;
  });

  return (
    <mesh position={[0, 0, -22]} renderOrder={-4} frustumCulled={false}>
      <planeGeometry args={[90, 56]} />
      <shaderMaterial
        ref={material}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}
