"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { sceneStore } from "../sceneStore";

/**
 * A faint technical grid receding as a floor beneath the care waves — the
 * "organized" counterpoint to the organic waves. Drifts very slowly toward
 * the viewer; strongest in the structured/clinical chapters.
 */
const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uOpacity;
  varying vec2 vUv;

  float gridLine(vec2 p, float width) {
    vec2 g = abs(fract(p - 0.5) - 0.5) / fwidth(p);
    return 1.0 - min(min(g.x, g.y) / width, 1.0);
  }

  void main() {
    vec2 p = vUv * vec2(40.0, 24.0) + vec2(0.0, uTime * 0.12);
    float minor = gridLine(p, 1.0);
    float major = gridLine(p / 4.0, 1.2);
    float fadeDepth = smoothstep(0.0, 0.45, vUv.y) * smoothstep(1.0, 0.6, vUv.y);
    float fadeSides = smoothstep(0.0, 0.25, vUv.x) * smoothstep(1.0, 0.75, vUv.x);
    float a = (minor * 0.35 + major * 0.65) * fadeDepth * fadeSides * uOpacity;
    gl_FragColor = vec4(vec3(0.42, 0.47, 0.43), a * 0.16);
  }
`;

export function GridLayer() {
  const material = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uOpacity: { value: 0 } }), []);

  useFrame(() => {
    const m = material.current;
    if (!m) return;
    m.uniforms.uTime.value = sceneStore.time;
    m.uniforms.uOpacity.value = sceneStore.env.grid;
  });

  return (
    <mesh position={[0, -3.4, -9]} rotation={[-Math.PI / 2.15, 0, 0]} renderOrder={-3} frustumCulled={false}>
      <planeGeometry args={[40, 24]} />
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
