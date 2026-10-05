"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { departmentsByCategory } from "@/data/departments";
import { anchorToWorld } from "../anchor";
import { sceneStore } from "../sceneStore";

/**
 * The care network: the patient at the centre, therapeutic departments on
 * the reading-start side, supporting departments on the other, each joined
 * to the centre by a soft connection with care flowing along it. Hovering a
 * department in the page lights its node and connection.
 */

const SEG_POINTS = 26;
const center = new THREE.Vector3();
const IDLE = { therapeutic: new THREE.Color("#86b896"), supporting: new THREE.Color("#a9b1ab") };
const HOT = { therapeutic: new THREE.Color("#169b3a"), supporting: new THREE.Color("#2b352e") };

interface NetworkNode {
  id: string;
  side: 0 | 1; // 0 therapeutic, 1 supporting
  /** Position in unit space for left-to-right reading (x is mirrored for RTL at runtime). */
  base: THREE.Vector3;
}

/** Bracket-shaped columns "( • )": middle nodes sit closer to the patient. */
function layoutColumn(ids: string[], side: 0 | 1): NetworkNode[] {
  const sign = side === 0 ? -1 : 1; // LTR: therapeutic on the left (reading start)
  return ids.map((id, i) => {
    const y = ids.length === 1 ? 0 : 0.74 - (1.48 * i) / (ids.length - 1);
    const x = sign * (0.56 + 0.3 * (y / 0.74) ** 2);
    return { id, side, base: new THREE.Vector3(x, y, Math.sin(i * 1.9 + side) * 0.08) };
  });
}

const lineVertex = /* glsl */ `
  attribute float aProgress;
  attribute float aNode;
  attribute float aSide;
  uniform float uFocus;
  uniform float uTime;
  varying float vProgress;
  varying float vHot;
  varying float vSide;
  varying float vPhase;
  void main() {
    vProgress = aProgress;
    vHot = abs(aNode - uFocus) < 0.5 ? 1.0 : 0.0;
    vSide = aSide;
    vPhase = fract(uTime * 0.22 + aNode * 0.137);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const lineFragment = /* glsl */ `
  uniform float uOpacity;
  varying float vProgress;
  varying float vHot;
  varying float vSide;
  varying float vPhase;
  void main() {
    vec3 therapeutic = vec3(0.086, 0.608, 0.227);
    vec3 supporting = vec3(0.42, 0.47, 0.44);
    vec3 color = mix(therapeutic, supporting, vSide);
    float d = (vProgress - vPhase) / 0.07;
    float pulse = exp(-d * d);
    float alpha = (0.2 + vHot * 0.5 + pulse * (0.35 + vHot * 0.4)) * uOpacity;
    gl_FragColor = vec4(color, alpha);
  }
`;

export function DepartmentNetwork() {
  const group = useRef<THREE.Group>(null);
  const nodeMeshes = useRef<Array<THREE.Mesh | null>>([]);
  const halo = useRef<THREE.Mesh>(null);
  const lineMaterial = useRef<THREE.ShaderMaterial>(null);
  const presence = useRef(0);
  const glow = useRef<number[]>([]);

  const { nodes, lines, uniforms } = useMemo(() => {
    const therapeutic = departmentsByCategory("therapeutic").map((d) => d.id);
    const supporting = departmentsByCategory("supporting").map((d) => d.id);
    const all = [...layoutColumn(therapeutic, 0), ...layoutColumn(supporting, 1)];

    // One curve per node, from the node into the patient at the centre.
    const count = all.length * SEG_POINTS;
    const position = new Float32Array(count * 3);
    const progress = new Float32Array(count);
    const node = new Float32Array(count);
    const side = new Float32Array(count);
    const index: number[] = [];
    const a = new THREE.Vector3();
    const b = new THREE.Vector3();
    all.forEach((n, i) => {
      const control = new THREE.Vector3(n.base.x * 0.42, n.base.y * 0.9, 0);
      for (let k = 0; k < SEG_POINTS; k++) {
        const u = k / (SEG_POINTS - 1);
        a.copy(n.base).lerp(control, u);
        b.copy(control).lerp(new THREE.Vector3(0, 0, 0), u);
        a.lerp(b, u);
        const v = i * SEG_POINTS + k;
        position.set([a.x, a.y, a.z], v * 3);
        progress[v] = u;
        node[v] = i;
        side[v] = n.side;
        if (k < SEG_POINTS - 1) index.push(v, v + 1);
      }
    });
    return {
      nodes: all,
      lines: { position, progress, node, side, index: new Uint16Array(index) },
      uniforms: { uFocus: { value: -1 }, uTime: { value: 0 }, uOpacity: { value: 0 } },
    };
  }, []);

  useFrame((state, rawDelta) => {
    const g = group.current;
    if (!g) return;
    const delta = Math.min(rawDelta, 0.05);
    const reduced = sceneStore.reducedMotion;
    const anchor = sceneStore.anchors["care-network"];
    presence.current = reduced ? anchor.weight : THREE.MathUtils.damp(presence.current, anchor.weight, 4, delta);
    const p = presence.current;
    g.visible = p > 0.02;
    if (!g.visible) return;

    const size = anchorToWorld(anchor, state.camera as THREE.PerspectiveCamera, -0.4, center);
    g.position.copy(center);
    const unit = Math.min(size.width / 2.1, size.height / 1.75);
    g.scale.set(unit * sceneStore.dir, unit, unit); // mirror for RTL so therapeutic sits at reading start
    if (!reduced) {
      g.rotation.y = sceneStore.pointer.x * 0.1 + Math.sin(sceneStore.time * 0.18) * 0.06;
      g.rotation.x = -sceneStore.pointer.y * 0.06;
    }

    const focusIndex = nodes.findIndex((n) => n.id === sceneStore.focusNetwork);
    const material = lineMaterial.current;
    if (material) {
      material.uniforms.uFocus.value = focusIndex;
      material.uniforms.uTime.value = sceneStore.time;
      material.uniforms.uOpacity.value = p;
    }

    nodes.forEach((n, i) => {
      const mesh = nodeMeshes.current[i];
      if (!mesh) return;
      const target = i === focusIndex ? 1 : 0;
      glow.current[i] = reduced ? target : THREE.MathUtils.damp(glow.current[i] ?? 0, target, 7, delta);
      const k = glow.current[i];
      mesh.scale.setScalar(0.045 + k * 0.03);
      const m = mesh.material as THREE.MeshBasicMaterial;
      const key = n.side === 0 ? "therapeutic" : "supporting";
      m.color.copy(IDLE[key]).lerp(HOT[key], k);
      m.opacity = p;
    });

    const ring = halo.current;
    if (ring) {
      const focused = focusIndex >= 0 ? nodes[focusIndex] : null;
      ring.visible = Boolean(focused);
      if (focused) {
        ring.position.copy(focused.base);
        const pulse = reduced ? 0.5 : (Math.sin(sceneStore.time * 3) + 1) / 2;
        ring.scale.setScalar(0.11 + pulse * 0.02);
        (ring.material as THREE.MeshBasicMaterial).opacity = 0.5 * p;
      }
    }
  });

  return (
    <group ref={group} visible={false}>
      <lineSegments frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[lines.position, 3]} />
          <bufferAttribute attach="attributes-aProgress" args={[lines.progress, 1]} />
          <bufferAttribute attach="attributes-aNode" args={[lines.node, 1]} />
          <bufferAttribute attach="attributes-aSide" args={[lines.side, 1]} />
          <bufferAttribute attach="index" args={[lines.index, 1]} />
        </bufferGeometry>
        <shaderMaterial
          ref={lineMaterial}
          vertexShader={lineVertex}
          fragmentShader={lineFragment}
          uniforms={uniforms}
          transparent
          depthWrite={false}
        />
      </lineSegments>

      {nodes.map((n, i) => (
        <mesh
          key={n.id}
          ref={(el) => {
            nodeMeshes.current[i] = el;
          }}
          position={n.base}
        >
          <sphereGeometry args={[1, 16, 12]} />
          <meshBasicMaterial transparent toneMapped={false} />
        </mesh>
      ))}

      {/* The patient at the centre: a calm ring around a small red core. */}
      <mesh>
        <ringGeometry args={[0.14, 0.152, 64]} />
        <meshBasicMaterial color="#169b3a" transparent opacity={0.85} toneMapped={false} />
      </mesh>
      <mesh>
        <circleGeometry args={[0.13, 48]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.95} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0, 0.01]}>
        <circleGeometry args={[0.04, 32]} />
        <meshBasicMaterial color="#c9151e" toneMapped={false} />
      </mesh>

      <mesh ref={halo} visible={false}>
        <ringGeometry args={[0.85, 1, 48]} />
        <meshBasicMaterial color="#169b3a" transparent opacity={0} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  );
}
