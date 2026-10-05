"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { anchorToWorld } from "../anchor";
import { flowLineShader, makeFlowArrays, makeFlowUniforms } from "../flowLine";
import { sceneStore } from "../sceneStore";

/** A single calm connection line running behind the contact actions. */
const POINTS = 140;
const center = new THREE.Vector3();

export function ContactLine() {
  const line = useRef<THREE.LineSegments>(null);
  const geometry = useRef<THREE.BufferGeometry>(null);
  const material = useRef<THREE.ShaderMaterial>(null);
  const presence = useRef(0);

  const data = useMemo(() => {
    const arrays = makeFlowArrays(POINTS);
    const index = new Uint16Array((POINTS - 1) * 2);
    for (let i = 0; i < POINTS; i++) {
      arrays.progress[i] = i / (POINTS - 1);
      if (i < POINTS - 1) index.set([i, i + 1], i * 2);
    }
    return { ...arrays, index, uniforms: makeFlowUniforms("#b8c2b9", "#169b3a") };
  }, []);

  useFrame((state, rawDelta) => {
    const mesh = line.current;
    const g = geometry.current;
    const m = material.current;
    if (!mesh || !g || !m) return;
    const delta = Math.min(rawDelta, 0.05);
    const anchor = sceneStore.anchors["contact-strip"];
    // Anchors only exist on pages that show this visual, so the weight alone decides presence.
    const target = anchor.weight;
    presence.current = sceneStore.reducedMotion ? target : THREE.MathUtils.damp(presence.current, target, 3, delta);
    mesh.visible = presence.current > 0.02;
    if (!mesh.visible) return;

    const size = anchorToWorld(anchor, state.camera as THREE.PerspectiveCamera, -0.6, center);
    const pos = g.getAttribute("position") as THREE.BufferAttribute;
    const alpha = g.getAttribute("aAlpha") as THREE.BufferAttribute;
    const t = sceneStore.time;
    // A gentle wave whatever the strip's shape (it stacks into a tall column on phones).
    const amplitude = Math.min(size.height * 0.18, size.width * 0.04);
    for (let i = 0; i < POINTS; i++) {
      const u = i / (POINTS - 1);
      const x = center.x + (u - 0.5) * size.width * 1.1;
      const y = center.y + Math.sin(u * Math.PI * 2.2 + t * 0.4) * amplitude;
      pos.setXYZ(i, x, y, center.z);
      alpha.setX(i, Math.sin(u * Math.PI));
    }
    pos.needsUpdate = true;
    alpha.needsUpdate = true;
    // The pulse travels in the reading direction.
    const pulse = sceneStore.reducedMotion ? -1 : (t * 0.12) % 1;
    m.uniforms.uPulse.value = sceneStore.dir === 1 ? pulse : 1 - pulse;
    m.uniforms.uOpacity.value = presence.current * 0.9;
  });

  return (
    <lineSegments ref={line} frustumCulled={false} visible={false}>
      <bufferGeometry ref={geometry}>
        <bufferAttribute attach="attributes-position" args={[data.position, 3]} />
        <bufferAttribute attach="attributes-aProgress" args={[data.progress, 1]} />
        <bufferAttribute attach="attributes-aAlpha" args={[data.alpha, 1]} />
        <bufferAttribute attach="index" args={[data.index, 1]} />
      </bufferGeometry>
      <shaderMaterial ref={material} {...flowLineShader} uniforms={data.uniforms} />
    </lineSegments>
  );
}
