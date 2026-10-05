"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { SUPPORT_NODES, controlPoint, rimPoint } from "@/features/patient-support/network";
import { anchorToWorld } from "../anchor";
import { sceneStore } from "../sceneStore";

/**
 * Patient sponsorship: soft light travelling along the support paths into
 * the care centre, a gentle glow at the centre and a few slow particles
 * around it. The SVG diagram draws the structure; this only adds depth and
 * life. Kept flat and anchored so it always lines up with the DOM.
 */

const PULSES_PER_PATH = 3;
const ORBIT_COUNT = 36;
const center = new THREE.Vector3();

const flowVertex = /* glsl */ `
  attribute vec2 aStart;
  attribute vec2 aCtrl;
  attribute vec2 aEnd;
  attribute float aOffset;
  attribute float aTone;
  uniform float uTime;
  uniform float uPixelRatio;
  varying float vAlpha;
  varying float vTone;
  void main() {
    float t = fract(uTime * 0.11 + aOffset);
    vec2 p = mix(mix(aStart, aCtrl, t), mix(aCtrl, aEnd, t), t);
    vAlpha = sin(t * 3.14159);
    vTone = aTone;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 0.0, 1.0);
    gl_PointSize = (5.0 + 7.0 * vAlpha) * uPixelRatio;
  }
`;
const flowFragment = /* glsl */ `
  uniform float uOpacity;
  varying float vAlpha;
  varying float vTone;
  void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    float soft = smoothstep(1.0, 0.0, d);
    vec3 care = vec3(0.086, 0.608, 0.227);
    vec3 medical = vec3(0.788, 0.082, 0.118);
    gl_FragColor = vec4(mix(care, medical, vTone), soft * soft * vAlpha * 0.75 * uOpacity);
  }
`;

const orbitVertex = /* glsl */ `
  attribute float aAngle;
  attribute float aRadius;
  attribute float aSpeed;
  uniform float uTime;
  uniform float uPixelRatio;
  varying float vTwinkle;
  void main() {
    float a = aAngle + uTime * aSpeed;
    vec2 p = vec2(cos(a), sin(a)) * aRadius;
    vTwinkle = 0.55 + 0.45 * sin(uTime * 0.8 + aAngle * 5.0);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, -0.05, 1.0);
    gl_PointSize = 3.0 * uPixelRatio;
  }
`;
const orbitFragment = /* glsl */ `
  uniform float uOpacity;
  varying float vTwinkle;
  void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    gl_FragColor = vec4(0.086, 0.608, 0.227, smoothstep(1.0, 0.2, d) * 0.35 * vTwinkle * uOpacity);
  }
`;

const glowFragment = /* glsl */ `
  uniform float uOpacity;
  uniform float uTime;
  varying vec2 vUv;
  void main() {
    float d = length(vUv - 0.5) * 2.0;
    float breathe = 0.85 + 0.15 * sin(uTime * 0.6);
    gl_FragColor = vec4(0.56, 0.86, 0.65, smoothstep(1.0, 0.0, d) * 0.28 * breathe * uOpacity);
  }
`;
const glowVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export function SupportFlow() {
  const group = useRef<THREE.Group>(null);
  const flowMaterial = useRef<THREE.ShaderMaterial>(null);
  const orbitMaterial = useRef<THREE.ShaderMaterial>(null);
  const glowMaterial = useRef<THREE.ShaderMaterial>(null);
  const presence = useRef(0);
  const shownFor = useRef(0);

  const { flow, orbit, uniforms } = useMemo(() => {
    const count = SUPPORT_NODES.length * PULSES_PER_PATH;
    const start = new Float32Array(count * 2);
    const ctrl = new Float32Array(count * 2);
    const end = new Float32Array(count * 2);
    const offset = new Float32Array(count);
    const tone = new Float32Array(count);
    const position = new Float32Array(count * 3);
    SUPPORT_NODES.forEach((node, n) => {
      const c = controlPoint(node);
      const r = rimPoint(node);
      for (let k = 0; k < PULSES_PER_PATH; k++) {
        const i = n * PULSES_PER_PATH + k;
        start.set([node.x, node.y], i * 2);
        ctrl.set([c.x, c.y], i * 2);
        end.set([r.x, r.y], i * 2);
        offset[i] = k / PULSES_PER_PATH + n * 0.137;
        tone[i] = node.tone === "medical" ? 1 : 0;
      }
    });

    const angle = new Float32Array(ORBIT_COUNT);
    const radius = new Float32Array(ORBIT_COUNT);
    const speed = new Float32Array(ORBIT_COUNT);
    const orbitPosition = new Float32Array(ORBIT_COUNT * 3);
    for (let i = 0; i < ORBIT_COUNT; i++) {
      // Deterministic spread (no Math.random) — stable across renders.
      angle[i] = (i / ORBIT_COUNT) * Math.PI * 2 + Math.sin(i * 12.9898) * 0.4;
      radius[i] = 0.3 + ((Math.sin(i * 78.233) + 1) / 2) * 0.62;
      speed[i] = (0.03 + ((Math.sin(i * 3.7) + 1) / 2) * 0.05) * (i % 2 ? 1 : -1);
    }

    return {
      flow: { start, ctrl, end, offset, tone, position },
      orbit: { angle, radius, speed, position: orbitPosition },
      uniforms: {
        flow: { uTime: { value: 0 }, uPixelRatio: { value: 1 }, uOpacity: { value: 0 } },
        orbit: { uTime: { value: 0 }, uPixelRatio: { value: 1 }, uOpacity: { value: 0 } },
        glow: { uTime: { value: 0 }, uOpacity: { value: 0 } },
      },
    };
  }, []);

  useFrame((state, rawDelta) => {
    const g = group.current;
    if (!g) return;
    const delta = Math.min(rawDelta, 0.05);
    const reduced = sceneStore.reducedMotion;
    const anchor = sceneStore.anchors["support-network"];
    presence.current = reduced ? anchor.weight : THREE.MathUtils.damp(presence.current, anchor.weight, 4, delta);
    g.visible = presence.current > 0.02;
    if (!g.visible) {
      shownFor.current = 0;
      return;
    }
    // Let the SVG draw itself first; the light joins once the paths exist.
    shownFor.current += delta;
    const arrive = reduced ? 1 : THREE.MathUtils.smoothstep(shownFor.current, 1.4, 2.6);
    const opacity = presence.current * arrive;

    const size = anchorToWorld(anchor, state.camera as THREE.PerspectiveCamera, -0.4, center);
    g.position.copy(center);
    const unit = Math.min(size.width, size.height) / 2;
    g.scale.set(unit * sceneStore.dir, unit, unit);

    const pixelRatio = state.gl.getPixelRatio();
    const time = sceneStore.time;
    for (const material of [flowMaterial.current, orbitMaterial.current]) {
      if (!material) continue;
      material.uniforms.uTime.value = time;
      material.uniforms.uPixelRatio.value = pixelRatio;
      material.uniforms.uOpacity.value = opacity;
    }
    const glow = glowMaterial.current;
    if (glow) {
      glow.uniforms.uTime.value = time;
      glow.uniforms.uOpacity.value = presence.current;
    }
  });

  return (
    <group ref={group} visible={false}>
      <mesh position={[0, 0, -0.1]}>
        <planeGeometry args={[1.5, 1.5]} />
        <shaderMaterial
          ref={glowMaterial}
          vertexShader={glowVertex}
          fragmentShader={glowFragment}
          uniforms={uniforms.glow}
          transparent
          depthWrite={false}
        />
      </mesh>

      <points frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[orbit.position, 3]} />
          <bufferAttribute attach="attributes-aAngle" args={[orbit.angle, 1]} />
          <bufferAttribute attach="attributes-aRadius" args={[orbit.radius, 1]} />
          <bufferAttribute attach="attributes-aSpeed" args={[orbit.speed, 1]} />
        </bufferGeometry>
        <shaderMaterial
          ref={orbitMaterial}
          vertexShader={orbitVertex}
          fragmentShader={orbitFragment}
          uniforms={uniforms.orbit}
          transparent
          depthWrite={false}
        />
      </points>

      <points frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[flow.position, 3]} />
          <bufferAttribute attach="attributes-aStart" args={[flow.start, 2]} />
          <bufferAttribute attach="attributes-aCtrl" args={[flow.ctrl, 2]} />
          <bufferAttribute attach="attributes-aEnd" args={[flow.end, 2]} />
          <bufferAttribute attach="attributes-aOffset" args={[flow.offset, 1]} />
          <bufferAttribute attach="attributes-aTone" args={[flow.tone, 1]} />
        </bufferGeometry>
        <shaderMaterial
          ref={flowMaterial}
          vertexShader={flowVertex}
          fragmentShader={flowFragment}
          uniforms={uniforms.flow}
          transparent
          depthWrite={false}
        />
      </points>
    </group>
  );
}
