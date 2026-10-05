"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { anchorToWorld } from "../anchor";
import { sceneStore } from "../sceneStore";

/**
 * Clinics: the care network reorganizes into a structured lattice — one
 * node per clinic. Hovering a clinic in a list lights its node and the
 * connections around it.
 */

const COUNT = 9;
const EDGE_REACH = 0.86;
const center = new THREE.Vector3();
const IDLE = new THREE.Color("#9fb2a4");
const HOT = new THREE.Color("#169b3a");

/** 3 × 3 offset lattice, recentred, in unit space (≈ -1…1). */
function latticePoints(): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      points.push(new THREE.Vector3((c - 1) * 0.72 + (r === 1 ? 0.36 : 0), (1 - r) * 0.64, Math.sin(r * 2.1 + c) * 0.12));
    }
  }
  const meanX = points.reduce((sum, p) => sum + p.x, 0) / points.length;
  points.forEach((p) => (p.x -= meanX));
  return points;
}

const edgeVertex = /* glsl */ `
  attribute float aA;
  attribute float aB;
  uniform float uFocus;
  varying float vHot;
  void main() {
    vHot = (abs(aA - uFocus) < 0.5 || abs(aB - uFocus) < 0.5) ? 1.0 : 0.0;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const edgeFragment = /* glsl */ `
  uniform float uOpacity;
  varying float vHot;
  void main() {
    vec3 base = vec3(0.6, 0.66, 0.62);
    vec3 hot = vec3(0.086, 0.608, 0.227);
    gl_FragColor = vec4(mix(base, hot, vHot), (0.28 + vHot * 0.55) * uOpacity);
  }
`;

export function ClinicLattice() {
  const group = useRef<THREE.Group>(null);
  const nodes = useRef<Array<THREE.Mesh | null>>([]);
  const halo = useRef<THREE.Mesh>(null);
  const edgeMaterial = useRef<THREE.ShaderMaterial>(null);
  const glow = useRef(new Array(COUNT).fill(0));
  const presence = useRef(0);

  const { points, edges, uniforms } = useMemo(() => {
    const pts = latticePoints();
    const pos: number[] = [];
    const a: number[] = [];
    const b: number[] = [];
    for (let i = 0; i < COUNT; i++) {
      for (let j = i + 1; j < COUNT; j++) {
        if (pts[i].distanceTo(pts[j]) > EDGE_REACH) continue;
        pos.push(...pts[i].toArray(), ...pts[j].toArray());
        a.push(i, i);
        b.push(j, j);
      }
    }
    return {
      points: pts,
      edges: { position: new Float32Array(pos), a: new Float32Array(a), b: new Float32Array(b) },
      uniforms: { uFocus: { value: -1 }, uOpacity: { value: 0 } },
    };
  }, []);

  useFrame((state, rawDelta) => {
    const g = group.current;
    if (!g) return;
    const delta = Math.min(rawDelta, 0.05);
    const reduced = sceneStore.reducedMotion;
    const anchor = sceneStore.anchors["clinic-orbit"];
    // Anchors only exist on pages that show this visual, so the weight alone decides presence.
    const target = anchor.weight;
    presence.current = reduced ? target : THREE.MathUtils.damp(presence.current, target, 4, delta);
    const p = presence.current;
    g.visible = p > 0.02;
    if (!g.visible) return;

    const size = anchorToWorld(anchor, state.camera as THREE.PerspectiveCamera, -0.5, center);
    g.position.copy(center);
    const unit = Math.min(size.width, size.height) * 0.42;
    g.scale.setScalar(unit * (0.85 + 0.15 * p));
    if (!reduced) {
      g.rotation.y = Math.sin(sceneStore.time * 0.2) * 0.18 + sceneStore.pointer.x * 0.12;
      g.rotation.x = -sceneStore.pointer.y * 0.08;
    }

    const focus = sceneStore.focusClinic;
    if (edgeMaterial.current) {
      edgeMaterial.current.uniforms.uFocus.value = focus;
      edgeMaterial.current.uniforms.uOpacity.value = p;
    }
    for (let i = 0; i < COUNT; i++) {
      const mesh = nodes.current[i];
      if (!mesh) continue;
      glow.current[i] = reduced ? Number(i === focus) : THREE.MathUtils.damp(glow.current[i], i === focus ? 1 : 0, 7, delta);
      const k = glow.current[i];
      const breathe = reduced ? 0 : Math.sin(sceneStore.time * 1.2 + i) * 0.006;
      mesh.scale.setScalar(0.055 + k * 0.035 + breathe);
      const material = mesh.material as THREE.MeshBasicMaterial;
      material.color.copy(IDLE).lerp(HOT, k);
      material.opacity = p;
    }

    const ring = halo.current;
    if (ring) {
      const focused = focus >= 0 ? points[focus] : null;
      ring.visible = Boolean(focused);
      if (focused) {
        ring.position.copy(focused);
        const pulse = reduced ? 0.5 : (Math.sin(sceneStore.time * 3) + 1) / 2;
        ring.scale.setScalar(0.16 + pulse * 0.03);
        (ring.material as THREE.MeshBasicMaterial).opacity = 0.45 * p;
        ring.quaternion.copy(state.camera.quaternion);
      }
    }
  });

  return (
    <group ref={group} visible={false}>
      <lineSegments frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[edges.position, 3]} />
          <bufferAttribute attach="attributes-aA" args={[edges.a, 1]} />
          <bufferAttribute attach="attributes-aB" args={[edges.b, 1]} />
        </bufferGeometry>
        <shaderMaterial
          ref={edgeMaterial}
          vertexShader={edgeVertex}
          fragmentShader={edgeFragment}
          uniforms={uniforms}
          transparent
          depthWrite={false}
        />
      </lineSegments>
      {points.map((point, i) => (
        <mesh
          key={i}
          ref={(el) => {
            nodes.current[i] = el;
          }}
          position={point}
        >
          <sphereGeometry args={[1, 16, 12]} />
          <meshBasicMaterial color="#9fb2a4" transparent toneMapped={false} />
        </mesh>
      ))}
      <mesh ref={halo} visible={false}>
        <ringGeometry args={[0.92, 1, 48]} />
        <meshBasicMaterial color="#169b3a" transparent opacity={0} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  );
}
