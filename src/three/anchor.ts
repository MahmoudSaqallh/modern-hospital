import * as THREE from "three";
import type { SceneAnchor } from "./sceneStore";

const tmpDir = new THREE.Vector3();

/** Exact screen → world mapping: where an NDC point lands on the plane z = planeZ. */
export function ndcToPlane(ndcX: number, ndcY: number, camera: THREE.Camera, planeZ: number, out: THREE.Vector3) {
  out.set(ndcX, ndcY, 0.5).unproject(camera);
  tmpDir.copy(out).sub(camera.position).normalize();
  const t = (planeZ - camera.position.z) / tmpDir.z;
  return out.copy(camera.position).addScaledVector(tmpDir, t);
}

/** World-space width and height of the viewport at depth `planeZ`. */
export function planeSize(camera: THREE.PerspectiveCamera, planeZ: number) {
  const distance = camera.position.z - planeZ;
  const height = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * distance;
  return { width: height * camera.aspect, height };
}

/**
 * Place a DOM anchor in the scene: writes its world centre into `out` and
 * returns its world width/height at depth `planeZ`.
 */
export function anchorToWorld(
  anchor: SceneAnchor,
  camera: THREE.PerspectiveCamera,
  planeZ: number,
  out: THREE.Vector3,
): { width: number; height: number } {
  ndcToPlane(anchor.x, anchor.y, camera, planeZ, out);
  const view = planeSize(camera, planeZ);
  return { width: (anchor.w / 2) * view.width, height: (anchor.h / 2) * view.height };
}
