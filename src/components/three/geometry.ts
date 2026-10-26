import * as THREE from "three";
import type { TraySize } from "@/data/menu";

/** Scene units per inch. A 12" tray is 1.2 units long. */
export const INCH = 0.1;

// Mirrors scripts/blender_tray.py: the tray GLB is normalized so the flange is 1 x 1 and
// the wall is 1 tall. Food sits between the floor and the wall top.
const FLOOR_HALF = 0.4;
const TOP_HALF = 0.455;
export const FLOOR_LIFT = 0.035; // embossed floor panel height (fraction of wall)

export type TrayDims = { length: number; width: number; depth: number };

export const trayDims = (size: TraySize): TrayDims => ({
  length: size.inches.length * INCH,
  width: size.inches.width * INCH,
  depth: size.inches.depth * INCH,
});

/** Inner food footprint (full length/width) at fraction `t` of the wall height. */
export function innerAt(dims: TrayDims, t: number) {
  const half = FLOOR_HALF + (TOP_HALF - FLOOR_HALF) * t;
  return { length: dims.length * half * 2, width: dims.width * half * 2 };
}

export function roundedRectShape(w: number, h: number, r: number) {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  r = Math.min(r, w / 2, h / 2);
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

/**
 * A flat rounded slab lying on XZ, bottom at y=0, top at y=thickness.
 * UVs are remapped so the top face spans 0..1 (for photo textures), optionally
 * into a sub-rectangle [u0,v0,u1,v1] of the texture.
 */
export function slabGeometry(w: number, d: number, thickness: number, radius: number, uv: [number, number, number, number] = [0, 0, 1, 1]) {
  const bevel = Math.min(thickness * 0.35, 0.012);
  const geo = new THREE.ExtrudeGeometry(roundedRectShape(w - bevel * 2, d - bevel * 2, Math.max(radius - bevel, 0.002)), {
    depth: Math.max(thickness - bevel * 2, 0.001),
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 3,
    curveSegments: 8,
  });
  // Extrude runs along +Z; lay it flat so the extrusion is +Y.
  geo.rotateX(-Math.PI / 2);
  geo.translate(0, bevel, 0);
  const pos = geo.attributes.position;
  const uvs = geo.attributes.uv;
  const [u0, v0, u1, v1] = uv;
  for (let i = 0; i < pos.count; i++) {
    const u = pos.getX(i) / w + 0.5;
    const v = 0.5 - pos.getZ(i) / d; // texture top edge = far side of the tray
    uvs.setXY(i, u0 + u * (u1 - u0), v0 + v * (v1 - v0));
  }
  uvs.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}

/** Deterministic PRNG so layers look the same on every render. */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(Math.max((x - a) / (b - a), 0), 1);
  return t * t * (3 - 2 * t);
};

/** Grainy rice texture drawn once on a canvas (no network fetch). */
let riceTexture: THREE.CanvasTexture | null = null;
export function getRiceTexture() {
  if (riceTexture) return riceTexture;
  const c = document.createElement("canvas");
  c.width = c.height = 512;
  const g = c.getContext("2d")!;
  g.fillStyle = "#efe6d3";
  g.fillRect(0, 0, 512, 512);
  const r = rng(7);
  for (let i = 0; i < 900; i++) {
    const x = r() * 512;
    const y = r() * 512;
    const shade = 225 + Math.floor(r() * 30);
    g.fillStyle = `rgb(${shade},${shade - 6},${shade - 22})`;
    g.beginPath();
    g.ellipse(x, y, 13 + r() * 5, 6 + r() * 2, r() * Math.PI, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = "rgba(150,130,100,0.25)";
    g.lineWidth = 1.2;
    g.stroke();
  }
  riceTexture = new THREE.CanvasTexture(c);
  riceTexture.wrapS = riceTexture.wrapT = THREE.RepeatWrapping;
  riceTexture.repeat.set(1.5, 1.5);
  riceTexture.colorSpace = THREE.SRGBColorSpace;
  return riceTexture;
}
