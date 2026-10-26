"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import type { TrayDims } from "./geometry";

const MODEL = "/models/tray.glb";
const DRACO = "/draco/"; // decoder is self-hosted, see public/draco

const foil = new THREE.MeshStandardMaterial({
  color: "#e4e6ea",
  metalness: 0.92,
  roughness: 0.3,
  envMapIntensity: 1.4,
});

/** Maja's foil tray (modelled in Blender), stretched to real inch dimensions. */
export default function Tray({ dims, ...props }: { dims: TrayDims } & React.JSX.IntrinsicElements["group"]) {
  const { scene } = useGLTF(MODEL, DRACO);
  const mesh = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) {
        const m = o as THREE.Mesh;
        m.material = foil;
        m.castShadow = true;
        m.receiveShadow = true;
      }
    });
    return clone;
  }, [scene]);

  return (
    <group {...props}>
      <primitive object={mesh} scale={[dims.length, dims.depth, dims.width]} />
    </group>
  );
}

useGLTF.preload(MODEL, DRACO);
