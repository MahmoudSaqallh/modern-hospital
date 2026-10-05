"use client";

import { useRef, type ReactNode } from "react";
import { useSceneAnchor } from "@/animations/sceneBridge";
import type { AnchorKey } from "@/three/sceneStore";

/**
 * Marks an element as the place a shared WebGL visual should appear. Lets
 * server components opt into the 3D layer without becoming client components.
 * Purely presentational: the visual is decorative and the content stands alone.
 */
export function SceneAnchor({
  anchor,
  className,
  children,
}: {
  anchor: AnchorKey;
  className?: string;
  children?: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useSceneAnchor(ref, anchor);
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
