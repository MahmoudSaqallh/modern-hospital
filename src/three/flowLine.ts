import * as THREE from "three";

/**
 * Connection line with a travelling light pulse. Each vertex carries its
 * progress (0…1) along the path, so one draw call can show:
 *  · a quiet base line,
 *  · a soft pulse moving along the connection (care flowing through the system),
 *  · a draw-in reveal (uDraw) for intro sequences.
 *
 * Used declaratively: `<shaderMaterial ref={…} {...flowLineShader} uniforms={makeFlowUniforms(…)} />`
 * so R3F owns disposal and per-frame updates go through the ref.
 */
export const flowLineShader = {
  transparent: true,
  depthWrite: false,
  vertexShader: /* glsl */ `
    attribute float aProgress;
    attribute float aAlpha;
    varying float vProgress;
    varying float vAlpha;
    void main() {
      vProgress = aProgress;
      vAlpha = aAlpha;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform vec3 uColor;
    uniform vec3 uPulseColor;
    uniform float uPulse;
    uniform float uDraw;
    uniform float uOpacity;
    uniform float uBase;
    varying float vProgress;
    varying float vAlpha;
    void main() {
      if (vProgress > uDraw) discard;
      float d = (vProgress - uPulse) / 0.06;
      float pulse = exp(-d * d);
      vec3 color = mix(uColor, uPulseColor, pulse);
      gl_FragColor = vec4(color, (uBase + pulse * 0.68) * uOpacity * vAlpha);
    }
  `,
} as const;

export function makeFlowUniforms(color: string, pulseColor: string) {
  return {
    uColor: { value: new THREE.Color(color) },
    uPulseColor: { value: new THREE.Color(pulseColor) },
    uPulse: { value: 0 },
    uDraw: { value: 1 },
    uOpacity: { value: 1 },
    uBase: { value: 0.32 },
  };
}

/** Typed arrays for a flow line of `count` vertices (alpha defaults to 1). */
export function makeFlowArrays(count: number) {
  return {
    position: new Float32Array(count * 3),
    progress: new Float32Array(count),
    alpha: new Float32Array(count).fill(1),
  };
}
