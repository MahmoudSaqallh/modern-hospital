"use client";

import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { flowLineShader, makeFlowArrays, makeFlowUniforms } from "../flowLine";
import { sceneStore } from "../sceneStore";
import { makeBadgeTexture, makeLabelTexture, type JourneyIcon } from "../textures";

/**
 * The patient journey as a connected network around the care core:
 * Patient → Department → Doctor → Appointment → Care. A light pulse flows
 * along the connections. In the About chapter the arc widens into a closed
 * ring — the same people and services, seen as a community.
 */

export interface CoreShares {
  about: number;
  presence: number;
  narrow: boolean;
}

const NODES: Array<{ icon: JourneyIcon; ring: string }> = [
  { icon: "patient", ring: "#2b352e" },
  { icon: "department", ring: "#169b3a" },
  { icon: "doctor", ring: "#169b3a" },
  { icon: "appointment", ring: "#0b6b2c" },
  { icon: "care", ring: "#c9151e" },
];
const COUNT = NODES.length;
/** Hero arc angles for left-to-right reading (degrees); mirrored for RTL. */
const HERO_ANGLES_LTR = [168, 124, 80, 36, -8];
const HERO_RADIUS = 2.3;
/** Just outside the emblem ring (r 1.62), so the community ring hugs the logo instead of reaching the copy. */
const ABOUT_RADIUS = 1.85;
/** Nodes shrink around the logo — the logo stays the focal point. */
const ABOUT_NODE_SCALE = 0.62;
const SEG_POINTS = 28;
const SEGMENTS = COUNT; // includes the closing Care → Patient segment (About only)
const LINE_VERTICES = SEGMENTS * SEG_POINTS;
const DEG = Math.PI / 180;

const tmpA = new THREE.Vector3();
const tmpB = new THREE.Vector3();
const tmpC = new THREE.Vector3();
const parentQuat = new THREE.Quaternion();

type Textures = { badges: THREE.Texture[]; labels: THREE.Texture[] };

export function JourneyNetwork({
  shares,
  labels,
  rtl,
}: {
  shares: RefObject<CoreShares>;
  labels: string[];
  rtl: boolean;
}) {
  const nodeGroups = useRef<Array<THREE.Group | null>>([]);
  const labelMeshes = useRef<Array<THREE.Mesh | null>>([]);
  const haloMeshes = useRef<Array<THREE.Mesh | null>>([]);
  const packet = useRef<THREE.Mesh>(null);
  const flowGeometry = useRef<THREE.BufferGeometry>(null);
  const flowMaterial = useRef<THREE.ShaderMaterial>(null);
  const spokeGeometry = useRef<THREE.BufferGeometry>(null);
  const positions = useRef(Array.from({ length: COUNT }, () => new THREE.Vector3()));
  const focusScale = useRef(new Array(COUNT).fill(1));
  const [textures, setTextures] = useState<Textures | null>(null);

  // Textures are drawn once the site font is ready, so Arabic labels render in the brand typeface.
  useEffect(() => {
    let cancelled = false;
    const made: Textures = { badges: [], labels: [] };
    const build = () => {
      if (cancelled) return;
      made.badges = NODES.map((n) => makeBadgeTexture(n.icon, n.ring));
      made.labels = labels.map((text) => makeLabelTexture(text, rtl));
      setTextures({ ...made });
    };
    (document.fonts?.ready ?? Promise.resolve()).then(build, build);
    return () => {
      cancelled = true;
      made.badges.forEach((t) => t.dispose());
      made.labels.forEach((t) => t.dispose());
    };
  }, [labels, rtl]);

  const flow = useMemo(() => {
    const arrays = makeFlowArrays(LINE_VERTICES);
    for (let s = 0; s < SEGMENTS; s++) {
      for (let k = 0; k < SEG_POINTS; k++) arrays.progress[s * SEG_POINTS + k] = (s + k / (SEG_POINTS - 1)) / SEGMENTS;
    }
    // Index pairs → independent segments within one LineSegments draw call.
    const index: number[] = [];
    for (let s = 0; s < SEGMENTS; s++) {
      for (let k = 0; k < SEG_POINTS - 1; k++) index.push(s * SEG_POINTS + k, s * SEG_POINTS + k + 1);
    }
    return { ...arrays, index: new Uint16Array(index), uniforms: makeFlowUniforms("#9aa79d", "#169b3a") };
  }, []);
  const spokePositions = useMemo(() => new Float32Array(COUNT * 2 * 3), []);

  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const reduced = sceneStore.reducedMotion;
    const { about, narrow } = shares.current;
    const networkPresence = 1;
    const introLines = sceneStore.mode === "home" ? Math.max(sceneStore.introLines, about) : 0;
    const t = sceneStore.time;

    // Layout: hero arc → community ring.
    for (let i = 0; i < COUNT; i++) {
      const heroAngle = (rtl ? 180 - HERO_ANGLES_LTR[i] : HERO_ANGLES_LTR[i]) * DEG;
      const ringAngle = (90 + (rtl ? 1 : -1) * i * (360 / COUNT)) * DEG;
      const angle = THREE.MathUtils.lerp(heroAngle, ringAngle, about);
      const radius = THREE.MathUtils.lerp(HERO_RADIUS, ABOUT_RADIUS, about);
      const bob = reduced ? 0 : Math.sin(t * 0.6 + i * 1.3) * 0.05;
      positions.current[i].set(Math.cos(angle) * radius, Math.sin(angle) * radius + bob, Math.sin(i * 1.7) * 0.18);
    }

    // Billboards face the camera regardless of the parent's pointer tilt.
    const parent = nodeGroups.current[0]?.parent;
    if (parent) parent.getWorldQuaternion(parentQuat).invert().multiply(state.camera.quaternion);

    for (let i = 0; i < COUNT; i++) {
      const node = nodeGroups.current[i];
      if (!node) continue;
      const appear = THREE.MathUtils.clamp(introLines * COUNT - i + 0.4, 0, 1);
      const focused = sceneStore.focusJourney === i && about < 0.5;
      focusScale.current[i] = reduced
        ? focused ? 1.16 : 1
        : THREE.MathUtils.damp(focusScale.current[i], focused ? 1.16 : 1, 8, delta);
      const s =
        appear * networkPresence * focusScale.current[i] * (narrow ? 0.8 : 1) * THREE.MathUtils.lerp(1, ABOUT_NODE_SCALE, about);
      node.visible = s > 0.02;
      node.position.copy(positions.current[i]);
      node.scale.setScalar(Math.max(s, 0.0001));
      node.quaternion.copy(parentQuat);

      const label = labelMeshes.current[i];
      if (label) (label.material as THREE.MeshBasicMaterial).opacity = (1 - about) * appear * (narrow ? 0 : 1);
      const halo = haloMeshes.current[i];
      if (halo) {
        const pulse = reduced ? 0.5 : (Math.sin(t * 2 + i) + 1) / 2;
        (halo.material as THREE.MeshBasicMaterial).opacity = focused ? 0.35 + pulse * 0.2 : 0;
      }
    }

    // Connections: gentle arcs between consecutive nodes (+ closing arc in the ring).
    const geometry = flowGeometry.current;
    const material = flowMaterial.current;
    if (!geometry || !material) return;
    const pos = geometry.getAttribute("position") as THREE.BufferAttribute;
    const alpha = geometry.getAttribute("aAlpha") as THREE.BufferAttribute;
    for (let s = 0; s < SEGMENTS; s++) {
      const a = positions.current[s];
      const b = positions.current[(s + 1) % COUNT];
      tmpC.addVectors(a, b).multiplyScalar(0.5);
      tmpC.setLength(tmpC.length() * 1.12 + 0.12);
      const segAlpha = s === SEGMENTS - 1 ? about : 1;
      for (let k = 0; k < SEG_POINTS; k++) {
        const u = k / (SEG_POINTS - 1);
        tmpA.copy(a).lerp(tmpC, u);
        tmpB.copy(tmpC).lerp(b, u);
        tmpA.lerp(tmpB, u);
        pos.setXYZ(s * SEG_POINTS + k, tmpA.x, tmpA.y, tmpA.z);
        alpha.setX(s * SEG_POINTS + k, segAlpha);
      }
    }
    pos.needsUpdate = true;
    alpha.needsUpdate = true;

    const pulse = reduced ? -1 : (t * 0.09) % 1;
    material.uniforms.uPulse.value = pulse;
    material.uniforms.uDraw.value = introLines;
    material.uniforms.uOpacity.value = networkPresence;

    // Spokes: faint lines from the core to each node.
    const spokes = spokeGeometry.current?.getAttribute("position") as THREE.BufferAttribute | undefined;
    if (spokes) {
      for (let i = 0; i < COUNT; i++) {
        const p = positions.current[i];
        const visible = THREE.MathUtils.clamp(introLines * COUNT - i, 0, 1);
        spokes.setXYZ(i * 2, p.x * 0.42, p.y * 0.42, p.z * 0.42);
        spokes.setXYZ(i * 2 + 1, p.x * (0.42 + 0.44 * visible), p.y * (0.42 + 0.44 * visible), p.z);
      }
      spokes.needsUpdate = true;
    }

    // A travelling "packet" makes the direction of care legible.
    if (packet.current) {
      const segFloat = pulse * SEGMENTS;
      const seg = Math.floor(segFloat);
      const showPacket = pulse >= 0 && (seg < SEGMENTS - 1 || about > 0.5) && pulse <= introLines;
      packet.current.visible = showPacket && networkPresence > 0.3;
      if (showPacket) {
        const index = Math.min(LINE_VERTICES - 1, seg * SEG_POINTS + Math.round((segFloat - seg) * (SEG_POINTS - 1)));
        packet.current.position.set(pos.getX(index), pos.getY(index), pos.getZ(index) + 0.02);
      }
    }
  });

  return (
    <group>
      <lineSegments frustumCulled={false}>
        <bufferGeometry ref={flowGeometry}>
          <bufferAttribute attach="attributes-position" args={[flow.position, 3]} />
          <bufferAttribute attach="attributes-aProgress" args={[flow.progress, 1]} />
          <bufferAttribute attach="attributes-aAlpha" args={[flow.alpha, 1]} />
          <bufferAttribute attach="index" args={[flow.index, 1]} />
        </bufferGeometry>
        <shaderMaterial ref={flowMaterial} {...flowLineShader} uniforms={flow.uniforms} />
      </lineSegments>
      <lineSegments frustumCulled={false}>
        <bufferGeometry ref={spokeGeometry}>
          <bufferAttribute attach="attributes-position" args={[spokePositions, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color="#b8c2b9" transparent opacity={0.35} depthWrite={false} />
      </lineSegments>
      <mesh ref={packet} visible={false}>
        <sphereGeometry args={[0.045, 12, 10]} />
        <meshBasicMaterial color="#169b3a" toneMapped={false} />
      </mesh>

      {NODES.map((node, i) => (
        <group
          key={node.icon}
          ref={(el) => {
            nodeGroups.current[i] = el;
          }}
          visible={false}
        >
          <mesh
            ref={(el) => {
              haloMeshes.current[i] = el;
            }}
            position={[0, 0, -0.01]}
          >
            <ringGeometry args={[0.3, 0.33, 48]} />
            <meshBasicMaterial color="#169b3a" transparent opacity={0} depthWrite={false} toneMapped={false} />
          </mesh>
          {textures && (
            <>
              <mesh renderOrder={2}>
                <planeGeometry args={[0.48, 0.48]} />
                <meshBasicMaterial map={textures.badges[i]} transparent depthWrite={false} toneMapped={false} />
              </mesh>
              <mesh
                ref={(el) => {
                  labelMeshes.current[i] = el;
                }}
                position={[0, -0.39, 0]}
                renderOrder={2}
              >
                <planeGeometry args={[0.96, 0.24]} />
                <meshBasicMaterial map={textures.labels[i]} transparent depthWrite={false} toneMapped={false} />
              </mesh>
            </>
          )}
        </group>
      ))}
    </group>
  );
}
