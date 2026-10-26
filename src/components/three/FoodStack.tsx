"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import type { FlavorId } from "@/data/menu";
import { FLOOR_LIFT, getRiceTexture, innerAt, rng, slabGeometry, type TrayDims } from "./geometry";

/** Fractions of the tray depth taken by each layer, bottom to top. */
const THICKNESS = { rice: 0.4, filling: 0.2, sauce: 0.13, crust: 0.06 };
/** Vertical gap between layers when fully exploded (scene units). */
export const EXPLODE_GAP = 0.14;

type Rect = { x0: number; x1: number; z0: number; z1: number };

type Recipe = {
  fillingBase: string;
  sauce: string;
  filling: PieceSpec[];
  toppings: PieceSpec[];
  lines?: "zigzag" | "lattice";
};

type PieceSpec = {
  geo: "strand" | "cube" | "flake" | "seed" | "roe" | "nori" | "shred";
  color: string;
  /** pieces per square unit of tray */
  density: number;
  size: [number, number];
};

const RECIPES: Record<FlavorId, Recipe> = {
  "california-maki": {
    fillingBase: "#f1d6a9",
    sauce: "#f6cf98",
    filling: [
      { geo: "cube", color: "#ffb21f", density: 260, size: [0.018, 0.026] },
      { geo: "cube", color: "#8cc16a", density: 200, size: [0.012, 0.018] },
      { geo: "strand", color: "#f4ece4", density: 260, size: [0.04, 0.07] },
      { geo: "strand", color: "#e2553a", density: 160, size: [0.04, 0.07] },
    ],
    toppings: [
      { geo: "roe", color: "#ff5a14", density: 900, size: [0.0035, 0.0045] },
      { geo: "seed", color: "#f2e6c4", density: 500, size: [0.006, 0.007] },
      { geo: "nori", color: "#1c271d", density: 90, size: [0.012, 0.022] },
    ],
    lines: "zigzag",
  },
  "creamy-kani": {
    fillingBase: "#efc9b4",
    sauce: "#f2c79a",
    filling: [
      { geo: "strand", color: "#f4ece4", density: 520, size: [0.045, 0.08] },
      { geo: "strand", color: "#e2553a", density: 330, size: [0.045, 0.08] },
    ],
    toppings: [
      { geo: "nori", color: "#16211a", density: 380, size: [0.018, 0.034] },
      { geo: "seed", color: "#f2e6c4", density: 700, size: [0.006, 0.007] },
      { geo: "roe", color: "#ff5a14", density: 500, size: [0.0035, 0.0045] },
    ],
  },
  "cheesy-spam": {
    fillingBase: "#e6c3a2",
    sauce: "#f3dfae",
    filling: [
      { geo: "cube", color: "#c97a63", density: 480, size: [0.022, 0.03] },
      { geo: "cube", color: "#a95d48", density: 160, size: [0.02, 0.026] },
    ],
    toppings: [
      { geo: "shred", color: "#f7c548", density: 1300, size: [0.04, 0.07] },
      { geo: "shred", color: "#efa22e", density: 700, size: [0.035, 0.06] },
      { geo: "nori", color: "#1c271d", density: 50, size: [0.01, 0.018] },
    ],
  },
  "spicy-tuna": {
    fillingBase: "#d9a383",
    sauce: "#e8834f",
    filling: [
      { geo: "flake", color: "#b98563", density: 520, size: [0.018, 0.028] },
      { geo: "flake", color: "#9c6b4f", density: 260, size: [0.016, 0.024] },
    ],
    toppings: [
      { geo: "seed", color: "#f2e6c4", density: 700, size: [0.006, 0.007] },
      { geo: "nori", color: "#16211a", density: 120, size: [0.01, 0.02] },
    ],
    lines: "lattice",
  },
};

const GEOMETRIES = {
  strand: new THREE.CylinderGeometry(0.5, 0.5, 1, 5).rotateZ(Math.PI / 2), // unit length along X
  cube: new THREE.BoxGeometry(1, 1, 1),
  flake: new THREE.IcosahedronGeometry(0.5, 0),
  seed: new THREE.SphereGeometry(0.5, 7, 5),
  roe: new THREE.SphereGeometry(0.5, 6, 5),
  nori: new THREE.CircleGeometry(0.5, 5).rotateX(-Math.PI / 2),
  shred: new THREE.CylinderGeometry(0.5, 0.5, 1, 4).rotateZ(Math.PI / 2),
};

/** Instanced pieces scattered over a rect at height `y` (local to the layer group). */
function Pieces({ spec, rect, y, seed }: { spec: PieceSpec; rect: Rect; y: number; seed: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const area = (rect.x1 - rect.x0) * (rect.z1 - rect.z0);
  const count = Math.max(4, Math.round(spec.density * area));

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const r = rng(seed);
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const e = new THREE.Euler();
    const s = new THREE.Vector3();
    const p = new THREE.Vector3();
    const margin = 0.02;
    for (let i = 0; i < count; i++) {
      const size = spec.size[0] + r() * (spec.size[1] - spec.size[0]);
      p.set(
        rect.x0 + margin + r() * (rect.x1 - rect.x0 - margin * 2),
        y + r() * 0.012,
        rect.z0 + margin + r() * (rect.z1 - rect.z0 - margin * 2),
      );
      switch (spec.geo) {
        case "strand":
          s.set(size, 0.008, 0.008);
          e.set(r() * 0.4, r() * Math.PI * 2, r() * 0.3);
          break;
        case "shred":
          s.set(size, 0.004, 0.004);
          e.set(r() * 0.6, r() * Math.PI * 2, r() * 0.5);
          break;
        case "cube":
          s.set(size, size * 0.8, size);
          e.set(r() * 0.5, r() * Math.PI, r() * 0.5);
          break;
        case "flake":
          s.set(size, size * 0.45, size * 0.8);
          e.set(r() * 0.6, r() * Math.PI * 2, r() * 0.6);
          break;
        case "seed":
          s.set(size, size * 0.4, size * 0.6);
          e.set(0, r() * Math.PI * 2, r() * 0.3);
          break;
        case "roe":
          s.setScalar(size);
          e.set(0, 0, 0);
          break;
        case "nori":
          s.set(size, 1, size * (0.5 + r() * 0.7));
          e.set((r() - 0.5) * 0.4, r() * Math.PI * 2, (r() - 0.5) * 0.4);
          break;
      }
      q.setFromEuler(e);
      m.compose(p, q, s);
      mesh.setMatrixAt(i, m);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, [count, rect, seed, spec, y]);

  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: spec.color,
        roughness: spec.geo === "roe" ? 0.25 : spec.geo === "nori" ? 0.7 : 0.55,
        side: spec.geo === "nori" ? THREE.DoubleSide : THREE.FrontSide,
        emissive: spec.geo === "roe" ? new THREE.Color("#ff3d00") : new THREE.Color(0),
        emissiveIntensity: spec.geo === "roe" ? 0.25 : 0,
      }),
    [spec],
  );

  return <instancedMesh ref={ref} args={[GEOMETRIES[spec.geo], material, count]} castShadow />;
}

/** Mayo zig-zag (California Maki) or sriracha + mayo lattice (Spicy Tuna) as tubes. */
function Drizzle({ kind, rect, y }: { kind: "zigzag" | "lattice"; rect: Rect; y: number }) {
  const tubes = useMemo(() => {
    const m = 0.03;
    const [x0, x1, z0, z1] = [rect.x0 + m, rect.x1 - m, rect.z0 + m, rect.z1 - m];
    const out: { geo: THREE.TubeGeometry; color: string }[] = [];
    if (kind === "zigzag") {
      const pts: THREE.Vector3[] = [];
      const steps = Math.max(4, Math.round((x1 - x0) / 0.045));
      for (let i = 0; i <= steps; i++) {
        pts.push(new THREE.Vector3(x0 + ((x1 - x0) * i) / steps, y, i % 2 ? z1 : z0));
      }
      out.push({ geo: new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.2), steps * 12, 0.007, 6), color: "#fbf3d9" });
    } else {
      // Diagonals in the rect's normalized (u, v) space: v = slope * u + c, clipped to the unit square.
      const toWorld = (u: number, v: number, lift: number) => new THREE.Vector3(x0 + u * (x1 - x0), y + lift, z0 + v * (z1 - z0));
      const lines = Math.max(3, Math.round((x1 - x0) / 0.07));
      for (const [slope, color, lift] of [[1, "#c8261b", 0], [-1, "#fbf3d9", 0.004]] as const) {
        for (let k = 1; k < lines * 2; k++) {
          const c = slope > 0 ? -1 + k / lines : k / lines;
          const hits: [number, number][] = [];
          for (const u of [0, 1]) {
            const v = slope * u + c;
            if (v >= 0 && v <= 1) hits.push([u, v]);
          }
          for (const v of [0, 1]) {
            const u = (v - c) / slope;
            if (u > 0 && u < 1) hits.push([u, v]);
          }
          if (hits.length < 2) continue;
          const [a, b] = [toWorld(...hits[0], lift), toWorld(...hits[1], lift)];
          if (a.distanceTo(b) < 0.03) continue;
          out.push({ geo: new THREE.TubeGeometry(new THREE.LineCurve3(a, b), 8, 0.006, 6), color });
        }
      }
    }
    return out;
  }, [kind, rect, y]);

  return (
    <>
      {tubes.map((t, i) => (
        <mesh key={i} geometry={t.geo} castShadow>
          <meshStandardMaterial color={t.color} roughness={0.3} />
        </mesh>
      ))}
    </>
  );
}

export type StackProps = {
  flavor: FlavorId;
  dims: TrayDims;
  /** Fractions (0..1) of the inner footprint this stack fills; default the whole tray. */
  region?: { u0: number; u1: number; v0: number; v1: number };
  /** Texture for the baked top, and which part of it to use. */
  crust: string;
  crustUv?: [number, number, number, number];
  /** 0 assembled → 1 fully exploded. Read every frame. */
  explode: React.RefObject<number>;
  /** Horizontal push (x, z) applied with the explode, used by the Quad. */
  spread?: [number, number];
  seed?: number;
};

const LAYER_ORDER = ["rice", "filling", "sauce", "toppings", "crust"] as const;

export default function FoodStack({
  flavor,
  dims,
  region = { u0: 0, u1: 1, v0: 0, v1: 1 },
  crust,
  crustUv,
  explode,
  spread = [0, 0],
  seed = 1,
}: StackProps) {
  const recipe = RECIPES[flavor];
  const crustTex = useTexture(crust, (t) => {
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
  });

  const groups = useRef<(THREE.Group | null)[]>([]);

  const layout = useMemo(() => {
    const D = dims.depth;
    const fracs = [THICKNESS.rice, THICKNESS.filling, THICKNESS.sauce, THICKNESS.crust];
    const bottoms = fracs.map((_, i) => (FLOOR_LIFT + fracs.slice(0, i).reduce((a, b) => a + b, 0)) * D);
    const at = (i: number) => {
      const bottom = bottoms[i];
      const top = bottom + fracs[i] * D;
      // Size each slab by the (narrower) footprint at its base so it never pokes through the flared walls.
      const inner = innerAt(dims, bottom / D);
      // region inside the inner footprint, inset slightly so quadrants don't touch
      const gap = region.u1 - region.u0 < 1 ? 0.006 : 0;
      const rect: Rect = {
        x0: -inner.length / 2 + region.u0 * inner.length + gap,
        x1: -inner.length / 2 + region.u1 * inner.length - gap,
        z0: -inner.width / 2 + region.v0 * inner.width + gap,
        z1: -inner.width / 2 + region.v1 * inner.width - gap,
      };
      return { bottom, top, rect };
    };
    return { rice: at(0), filling: at(1), sauce: at(2), crust: at(3) };
  }, [dims, region]);

  const slabs = useMemo(() => {
    const make = (l: { bottom: number; top: number; rect: Rect }, uv?: [number, number, number, number]) => {
      const w = l.rect.x1 - l.rect.x0;
      const d = l.rect.z1 - l.rect.z0;
      const geo = slabGeometry(w, d, l.top - l.bottom, region.u1 - region.u0 < 1 ? 0.02 : 0.06 * Math.min(dims.length, dims.width), uv);
      geo.translate((l.rect.x0 + l.rect.x1) / 2, l.bottom, (l.rect.z0 + l.rect.z1) / 2);
      return geo;
    };
    return {
      rice: make(layout.rice),
      filling: make(layout.filling),
      sauce: make(layout.sauce),
      crust: make(layout.crust, crustUv),
    };
  }, [layout, crustUv, region, dims]);

  const materials = useMemo(
    () => ({
      rice: new THREE.MeshStandardMaterial({ map: getRiceTexture(), roughness: 0.85 }),
      filling: new THREE.MeshStandardMaterial({ color: recipe.fillingBase, roughness: 0.7 }),
      sauce: new THREE.MeshPhysicalMaterial({ color: recipe.sauce, roughness: 0.35, clearcoat: 0.6, clearcoatRoughness: 0.4 }),
      crust: new THREE.MeshStandardMaterial({ map: crustTex, roughness: 0.6 }),
    }),
    [recipe, crustTex],
  );

  useFrame(() => {
    const e = explode.current ?? 0;
    // Upper layers drift outward more, so the rice stays inside the tray walls.
    groups.current.forEach((g, i) => {
      const k = (i / (LAYER_ORDER.length - 1)) * e;
      if (g) g.position.set(spread[0] * k, e * EXPLODE_GAP * i, spread[1] * k);
    });
  });

  return (
    <group>
      <group ref={(g) => void (groups.current[0] = g)} name={LAYER_ORDER[0]}>
        <mesh geometry={slabs.rice} material={materials.rice} castShadow receiveShadow />
      </group>
      <group ref={(g) => void (groups.current[1] = g)} name={LAYER_ORDER[1]}>
        <mesh geometry={slabs.filling} material={materials.filling} castShadow receiveShadow />
        {recipe.filling.map((spec, i) => (
          <Pieces key={i} spec={spec} rect={layout.filling.rect} y={layout.filling.top} seed={seed * 31 + i} />
        ))}
      </group>
      <group ref={(g) => void (groups.current[2] = g)} name={LAYER_ORDER[2]}>
        <mesh geometry={slabs.sauce} material={materials.sauce} castShadow receiveShadow />
      </group>
      <group ref={(g) => void (groups.current[3] = g)} name={LAYER_ORDER[3]}>
        {recipe.toppings.map((spec, i) => (
          <Pieces key={i} spec={spec} rect={layout.sauce.rect} y={layout.sauce.top + 0.004} seed={seed * 57 + i} />
        ))}
        {recipe.lines && <Drizzle kind={recipe.lines} rect={layout.sauce.rect} y={layout.sauce.top + 0.012} />}
      </group>
      <group ref={(g) => void (groups.current[4] = g)} name={LAYER_ORDER[4]}>
        <mesh geometry={slabs.crust} material={materials.crust} castShadow receiveShadow />
      </group>
    </group>
  );
}

/** Heights (assembled) of each layer's top, for placing labels. */
export function layerTops(dims: TrayDims) {
  const D = dims.depth;
  const f = FLOOR_LIFT * D;
  const rice = f + THICKNESS.rice * D;
  const filling = rice + THICKNESS.filling * D;
  const sauce = filling + THICKNESS.sauce * D;
  return [rice, filling + 0.01, sauce, sauce + 0.02, sauce + THICKNESS.crust * D];
}
