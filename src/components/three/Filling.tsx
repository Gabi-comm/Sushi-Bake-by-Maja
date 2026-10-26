"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { useTexture } from "@react-three/drei";
import { FLOOR_LIFT, getRiceTexture, innerAt, slabGeometry, type TrayDims } from "./geometry";

const GAP = 0.006; // seam between the two halves of a split tray

/**
 * Baked filling seen from outside: rice body sized to the floor, then a thin photo-textured
 * crust sized to where it sits up the flared wall. Two textures = a two-flavor split, each
 * half showing its own side of the photo so neither looks squashed.
 */
export default function Filling({ dims, textures }: { dims: TrayDims; textures: string[] }) {
  const maps = useTexture(textures, (loaded) => {
    for (const t of [loaded].flat()) t.colorSpace = THREE.SRGBColorSpace;
  });
  const { body, crusts, rice, tops } = useMemo(() => {
    const D = dims.depth;
    const base = innerAt(dims, FLOOR_LIFT);
    const body = slabGeometry(base.length, base.width, D * 0.74, 0.06 * dims.width);
    body.translate(0, FLOOR_LIFT * D, 0);

    const lip = innerAt(dims, 0.76);
    const y = (FLOOR_LIFT + 0.74) * D;
    const t = D * 0.08;
    const r = 0.07 * dims.width;
    const crusts =
      maps.length === 2
        ? ([0, 1] as const).map((i) => {
            const half = lip.length / 2 - GAP / 2;
            const g = slabGeometry(half, lip.width, t, r, i === 0 ? [0, 0, 0.5, 1] : [0.5, 0, 1, 1]);
            g.translate((i === 0 ? -1 : 1) * (half / 2 + GAP / 2), y, 0);
            return g;
          })
        : [slabGeometry(lip.length, lip.width, t, r)].map((g) => g.translate(0, y, 0));

    return {
      body,
      crusts,
      rice: new THREE.MeshStandardMaterial({ map: getRiceTexture(), roughness: 0.85 }),
      tops: maps.map((map) => new THREE.MeshStandardMaterial({ map, roughness: 0.6 })),
    };
  }, [dims, maps]);

  return (
    <>
      <mesh geometry={body} material={rice} castShadow receiveShadow />
      {crusts.map((g, i) => (
        <mesh key={i} geometry={g} material={[tops[i], rice]} castShadow receiveShadow />
      ))}
    </>
  );
}
