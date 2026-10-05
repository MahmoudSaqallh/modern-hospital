"use client";

import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { anchorToWorld } from "../anchor";
import { sceneStore } from "../sceneStore";
import { makeBookingPlaneTextures, PLANE_ASPECT, type PlaneCopy } from "../textures";

/**
 * Booking preview: four shallow interface planes — specialty, doctor,
 * schedule, confirmation — arranged as a gentle deck. The active step's
 * plane comes forward; the others recede in reading order.
 */
const center = new THREE.Vector3();

export function AppointmentPlanes({ copy }: { copy: PlaneCopy }) {
  const group = useRef<THREE.Group>(null);
  const planes = useRef<Array<THREE.Mesh | null>>([]);
  const presence = useRef(0);
  const [textures, setTextures] = useState<THREE.Texture[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    let made: THREE.Texture[] | null = null;
    const build = () => {
      if (cancelled) return;
      made = makeBookingPlaneTextures(copy);
      setTextures(made);
    };
    (document.fonts?.ready ?? Promise.resolve()).then(build, build);
    return () => {
      cancelled = true;
      made?.forEach((t) => t.dispose());
    };
  }, [copy]);

  useFrame((state, rawDelta) => {
    const g = group.current;
    if (!g) return;
    const delta = Math.min(rawDelta, 0.05);
    const reduced = sceneStore.reducedMotion;
    const anchor = sceneStore.anchors["booking-stage"];
    const target = sceneStore.mode === "home" ? anchor.weight : 0;
    presence.current = reduced ? target : THREE.MathUtils.damp(presence.current, target, 4, delta);
    const p = presence.current;
    g.visible = p > 0.02 && Boolean(textures);
    if (!g.visible) return;

    const size = anchorToWorld(anchor, state.camera as THREE.PerspectiveCamera, 0, center);
    g.position.set(center.x, center.y, -0.4 * (1 - p));
    const width = Math.min(size.width * 0.66, size.height * 0.78 * PLANE_ASPECT);
    if (!reduced) {
      g.rotation.y = sceneStore.pointer.x * 0.08;
      g.rotation.x = -sceneStore.pointer.y * 0.05;
    }

    const step = sceneStore.bookingStep;
    const dir = sceneStore.dir;
    planes.current.forEach((mesh, i) => {
      if (!mesh) return;
      const rel = i - step;
      const distance = Math.abs(rel);
      const float = reduced ? 0 : Math.sin(sceneStore.time * 0.6 + i * 1.4) * 0.025;
      mesh.position.set(rel * width * 0.34 * dir, -distance * 0.05 * width + float, -distance * 0.85);
      mesh.rotation.y = -rel * 0.24 * dir;
      mesh.scale.set(width, width / PLANE_ASPECT, 1);
      mesh.renderOrder = 20 - Math.round(distance * 4);
      (mesh.material as THREE.MeshBasicMaterial).opacity = THREE.MathUtils.clamp(1 - distance * 0.42, 0, 1) * p;
    });
  });

  return (
    <group ref={group} visible={false}>
      {textures?.map((texture, i) => (
        <mesh
          key={i}
          ref={(el) => {
            planes.current[i] = el;
          }}
        >
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial map={texture} transparent depthWrite={false} toneMapped={false} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}
