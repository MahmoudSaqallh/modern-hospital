"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { anchorToWorld, planeSize } from "../anchor";
import { sceneStore } from "../sceneStore";
import type { SceneQuality } from "../quality";
import { JourneyNetwork, type CoreShares } from "./JourneyNetwork";

/**
 * The care core — the story's protagonist. It appears in three places:
 *  · Hero: centred in the visual half, carrying the patient-journey network.
 *  · About: orbiting the real logo, the network widened into a community ring.
 *  · Closing: returning quietly around the logo before the footer.
 * Its parts: a pearl sphere, the emblem's three-colour ring (green · red · ink),
 * and a slow pulse timed with the sphere's breathing.
 */

const DEG = Math.PI / 180;
const PULSE_PERIOD = 3.6;
/** Diameter of the emblem ring in local units. */
const RING_DIAMETER = 3.24;

class ArcCurve extends THREE.Curve<THREE.Vector3> {
  constructor(
    private radius: number,
    private from: number,
    private to: number,
  ) {
    super();
  }
  getPoint(t: number, target = new THREE.Vector3()) {
    const a = this.from + (this.to - this.from) * t;
    return target.set(Math.cos(a) * this.radius, Math.sin(a) * this.radius, 0);
  }
}

/** Arc layout mirrors the emblem: green upper-left, red upper-right, ink below. */
const EMBLEM_ARCS = [
  { from: 100 * DEG, to: 208 * DEG, color: "#169b3a", emissive: 0.22 },
  { from: -28 * DEG, to: 80 * DEG, color: "#c9151e", emissive: 0.18 },
  { from: 228 * DEG, to: 312 * DEG, color: "#2b352e", emissive: 0 },
] as const;

const aboutPoint = new THREE.Vector3();
const closingPoint = new THREE.Vector3();

export interface JourneyCopy {
  labels: [string, string, string, string, string];
  rtl: boolean;
}

export function CareCore({ quality, journey }: { quality: SceneQuality; journey: JourneyCopy }) {
  const root = useRef<THREE.Group>(null);
  const tilt = useRef<THREE.Group>(null);
  const emblem = useRef<THREE.Group>(null);
  const sphere = useRef<THREE.Mesh>(null);
  const pulses = useRef<Array<THREE.Mesh | null>>([]);
  const keyLight = useRef<THREE.DirectionalLight>(null);
  const rimLight = useRef<THREE.DirectionalLight>(null);
  const accentLight = useRef<THREE.DirectionalLight>(null);
  const presence = useRef(0);
  const shares = useRef<CoreShares>({ about: 0, closing: 0, presence: 0, narrow: false });

  const arcs = useMemo(() => EMBLEM_ARCS.map((arc) => new ArcCurve(1.62, arc.from, arc.to)), []);
  /** Lights aim at the core itself, so the lighting holds wherever the core sits on screen. */
  const lightTarget = useMemo(() => new THREE.Object3D(), []);

  useFrame((state, rawDelta) => {
    const g = root.current;
    if (!g) return;
    const delta = Math.min(rawDelta, 0.05);
    const reduced = sceneStore.reducedMotion;
    const t = sceneStore.time;
    const onHome = sceneStore.mode === "home";
    const camera = state.camera as THREE.PerspectiveCamera;

    // Where should the core be, and how present?
    const heroW = onHome ? sceneStore.intro * (1 - sceneStore.heroProgress) : 0;
    const aboutW = onHome ? sceneStore.anchors["about-logo"].weight : 0;
    const closingW = onHome ? sceneStore.anchors["closing-logo"].weight * 0.85 : 0;
    const total = heroW + aboutW + closingW;
    const target = Math.min(1, total);
    const rate = target > presence.current ? 3.2 : 5;
    presence.current = reduced ? target : THREE.MathUtils.damp(presence.current, target, rate, delta);
    const p = presence.current;
    g.visible = p > 0.04;
    shares.current.presence = p;
    if (!g.visible) return;

    // Measured from the live camera every frame (it dollies during the intro and between chapters).
    const view = planeSize(camera, 0);
    const narrow = view.width < 7.2;
    shares.current.narrow = narrow;
    const heroScale = narrow
      ? THREE.MathUtils.clamp(view.width * 0.15, 0.3, 0.5)
      : THREE.MathUtils.clamp(view.width * 0.066, 0.52, 0.82);
    const heroX = narrow ? 0 : sceneStore.dir * view.width * 0.25;
    // Narrow screens: above the copy, low enough that the node arc clears the header.
    const heroY = narrow ? view.height * 0.2 : view.height * 0.02;

    const sum = Math.max(total, 0.0001);
    const wh = heroW / sum;
    const wa = aboutW / sum;
    const wc = closingW / sum;
    shares.current.about = wa;
    shares.current.closing = wc;

    // Depth first, then project the anchors at that depth so the ring stays centred on the
    // logo even while it is still arriving from the background.
    const z = -3.2 * (1 - p) - sceneStore.heroProgress * 1.4 * wh;
    const aboutSize = anchorToWorld(sceneStore.anchors["about-logo"], camera, z, aboutPoint);
    const closingSize = anchorToWorld(sceneStore.anchors["closing-logo"], camera, z, closingPoint);
    // The ring wraps the logo at ~1.3× (About) / ~1.7× (closing) its size.
    const aboutScale = (aboutSize.width * 1.3) / RING_DIAMETER;
    const closingScale = (closingSize.width * 1.7) / RING_DIAMETER;

    const x = heroX * wh + aboutPoint.x * wa + closingPoint.x * wc;
    const y = (heroY + sceneStore.heroProgress * 0.9) * wh + aboutPoint.y * wa + closingPoint.y * wc;
    const scale = heroScale * wh + aboutScale * wa + closingScale * wc;

    if (reduced) {
      g.position.set(x, y, z);
    } else {
      // Stiffer follow while anchored to scrolling DOM, softer for the hero.
      const follow = THREE.MathUtils.lerp(4, 16, wa + wc);
      g.position.x = THREE.MathUtils.damp(g.position.x, x, follow, delta);
      g.position.y = THREE.MathUtils.damp(g.position.y, y, follow, delta);
      g.position.z = THREE.MathUtils.damp(g.position.z, z, 4, delta);
    }
    // Anchored placements already account for depth; only the hero scales with presence.
    g.scale.setScalar(scale * (0.8 + 0.2 * p * wh + 0.2 * (1 - wh)));

    // Lights rise with presence — "the light appears" before the form arrives —
    // and lean gently toward the pointer.
    const px = reduced ? 0 : sceneStore.pointer.x;
    const py = reduced ? 0 : sceneStore.pointer.y;
    if (keyLight.current) {
      keyLight.current.intensity = 1.6 * p;
      keyLight.current.position.set(4 + px * 1.6, 6 - py * 1.2, 7);
    }
    if (rimLight.current) rimLight.current.intensity = 2.2 * p;
    if (accentLight.current) {
      accentLight.current.intensity = 1.1 * p * (1 - wc * 0.6);
      accentLight.current.position.set(3.6 - px * 1.2, -0.6, -4.2);
    }

    if (tilt.current && !reduced) {
      tilt.current.rotation.y = THREE.MathUtils.damp(tilt.current.rotation.y, px * 0.16, 2.5, delta);
      tilt.current.rotation.x = THREE.MathUtils.damp(tilt.current.rotation.x, -py * 0.1, 2.5, delta);
    }

    if (emblem.current) emblem.current.rotation.z = t * 0.045;

    // Breathing + pulse share one rhythm.
    const phase = (t % PULSE_PERIOD) / PULSE_PERIOD;
    if (sphere.current) sphere.current.scale.setScalar(1 + Math.sin(phase * Math.PI * 2) * 0.012);
    pulses.current.forEach((mesh, i) => {
      if (!mesh) return;
      const local = (phase + i * 0.5) % 1;
      mesh.scale.setScalar(0.85 + local * 1.5);
      (mesh.material as THREE.MeshBasicMaterial).opacity = reduced ? 0 : (1 - local) * 0.16 * p;
    });
  });

  return (
    <group ref={root} visible={false}>
      <primitive object={lightTarget} />
      <directionalLight ref={keyLight} position={[4, 6, 7]} color="#fffaf2" intensity={0} target={lightTarget} />
      {/* Green rim from behind-left; a restrained red accent from behind-right. */}
      <directionalLight ref={rimLight} position={[-3.6, 1.4, -4]} color="#4fd07a" intensity={0} target={lightTarget} />
      <directionalLight ref={accentLight} position={[3.6, -0.6, -4.2]} color="#ff4a52" intensity={0} target={lightTarget} />

      <group ref={tilt}>
        <mesh ref={sphere}>
          <sphereGeometry args={[0.8, ...quality.sphereSegments]} />
          {quality.tier === "high" ? (
            <meshPhysicalMaterial
              color="#f2f4ef"
              roughness={0.32}
              metalness={0}
              clearcoat={0.6}
              clearcoatRoughness={0.38}
              sheen={0.35}
              sheenColor="#dcefe2"
            />
          ) : (
            <meshStandardMaterial color="#f2f4ef" roughness={0.42} metalness={0} />
          )}
        </mesh>

        {[0, 1].map((i) => (
          <mesh
            key={i}
            ref={(el) => {
              pulses.current[i] = el;
            }}
            position={[0, 0, -0.05]}
          >
            <ringGeometry args={[0.99, 1, 96]} />
            <meshBasicMaterial color="#169b3a" transparent opacity={0} depthWrite={false} />
          </mesh>
        ))}

        <group ref={emblem} rotation={[0.32, -0.22, 0]}>
          {arcs.map((curve, i) => (
            <mesh key={i}>
              <tubeGeometry args={[curve, quality.tubeSegments, 0.024, 10, false]} />
              <meshStandardMaterial
                color={EMBLEM_ARCS[i].color}
                emissive={EMBLEM_ARCS[i].color}
                emissiveIntensity={EMBLEM_ARCS[i].emissive}
                roughness={0.38}
                metalness={0.15}
              />
            </mesh>
          ))}
        </group>

        <JourneyNetwork shares={shares} labels={journey.labels} rtl={journey.rtl} />
      </group>

      {quality.contactShadows && (
        <ContactShadows position={[0, -2.2, 0]} opacity={0.18} scale={6} blur={2.8} far={3.2} resolution={256} color="#17201a" />
      )}
    </group>
  );
}
