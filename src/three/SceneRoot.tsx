"use client";

import { useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer, PerformanceMonitor } from "@react-three/drei";
import * as THREE from "three";
import { AmbientGlow } from "./BackgroundScene/AmbientGlow";
import { CareField } from "./BackgroundScene/CareField";
import { CareParticles } from "./BackgroundScene/CareParticles";
import { GridLayer } from "./BackgroundScene/GridLayer";
import { CareCore, type JourneyCopy } from "./HeroScene/CareCore";
import { AppointmentPlanes } from "./HomeScene/AppointmentPlanes";
import { ContactLine } from "./HomeScene/ContactLine";
import { ClinicLattice } from "./HomeScene/ClinicLattice";
import { DepartmentNetwork } from "./HomeScene/DepartmentNetwork";
import { SupportFlow } from "./SupportScene/SupportFlow";
import { FrameDriver, SceneReadySignal } from "./FrameDriver";
import { sceneStore } from "./sceneStore";
import type { SceneQuality } from "./quality";
import type { PlaneCopy } from "./textures";

const CAMERA_Z = 9;

/** Advances scene time at the current mood's speed — motion can slow without jumping. Mounted first. */
function TimeKeeper() {
  useFrame((_, delta) => {
    if (!sceneStore.reducedMotion) sceneStore.time += Math.min(delta, 0.05) * sceneStore.env.speed;
  });
  return null;
}

/**
 * Camera: arrives from slightly further away during the intro, then follows
 * each chapter's subtle offset. No travel on narrow screens or with reduced motion.
 */
function CameraRig() {
  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const cam = state.camera;
    const narrow = state.viewport.aspect < 0.85;
    const still = sceneStore.reducedMotion || narrow;
    const home = sceneStore.mode === "home";
    const introPull = home ? (1 - sceneStore.intro) * 1.6 : 0;
    const targetZ = CAMERA_Z + (still ? 0 : sceneStore.env.camZ + introPull) + (home ? 0 : 0.8);
    const targetY = still ? 0 : sceneStore.env.camY + sceneStore.pointer.y * 0.08;
    const targetX = still ? 0 : sceneStore.pointer.x * 0.12;
    if (sceneStore.reducedMotion) {
      cam.position.set(targetX, targetY, targetZ);
    } else {
      cam.position.x = THREE.MathUtils.damp(cam.position.x, targetX, 2, delta);
      cam.position.y = THREE.MathUtils.damp(cam.position.y, targetY, 2, delta);
      cam.position.z = THREE.MathUtils.damp(cam.position.z, targetZ, 1.8, delta);
    }
    cam.lookAt(0, 0, 0);
  });
  return null;
}

/** Soft studio reflections built from light panels — no HDR download, rendered once. */
function StudioEnvironment() {
  return (
    <Environment resolution={64} frames={1}>
      <Lightformer form="rect" intensity={1.6} color="#ffffff" position={[0, 4, 4]} scale={[8, 3, 1]} />
      <Lightformer form="rect" intensity={0.7} color="#dff3e5" position={[-5, 0, 2]} rotation-y={Math.PI / 2} scale={[6, 4, 1]} />
      <Lightformer form="ring" intensity={0.6} color="#ffd9d6" position={[4, 1, -4]} scale={2.5} />
    </Environment>
  );
}

export default function SceneRoot({
  quality,
  journey,
  planes,
}: {
  quality: SceneQuality;
  journey: JourneyCopy;
  planes: PlaneCopy;
}) {
  const [dpr, setDpr] = useState(quality.maxDpr);

  return (
    <Canvas
      frameloop="demand"
      dpr={[1, dpr]}
      camera={{ fov: 32, position: [0, 0, CAMERA_Z + 1.6], near: 0.1, far: 80 }}
      gl={{
        antialias: quality.tier === "high",
        alpha: true,
        stencil: false,
        powerPreference: "high-performance",
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.05,
      }}
      onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      style={{ position: "absolute", inset: 0 }}
    >
      <TimeKeeper />
      <PerformanceMonitor onDecline={() => setDpr(1)} flipflops={2} onFallback={() => setDpr(1)} />
      <FrameDriver />
      <SceneReadySignal />
      <CameraRig />

      <ambientLight intensity={0.6} color="#fbfaf5" />
      {quality.environment && <StudioEnvironment />}

      {/* Background layers, far → near: moving lights, grid, care waves, particles. */}
      <AmbientGlow />
      <GridLayer />
      <CareField rows={quality.fieldLines} points={quality.fieldPoints} />
      <CareParticles count={quality.particles} />

      {/* Story objects — each appears only where its DOM anchor is on screen. */}
      <CareCore quality={quality} journey={journey} />
      {quality.tier === "high" && <ClinicLattice />}
      <DepartmentNetwork />
      <AppointmentPlanes copy={planes} />
      <ContactLine />
      <SupportFlow />
    </Canvas>
  );
}
