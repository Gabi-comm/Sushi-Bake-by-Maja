"use client";

import { Suspense, useEffect, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Html, Lightformer } from "@react-three/drei";
import { QUAD, flavorById, sizeById, type FlavorId } from "@/data/menu";
import FoodStack, { EXPLODE_GAP, layerTops } from "./FoodStack";
import Tray from "./Tray";
import { trayDims } from "./geometry";

export type SceneItem = FlavorId | "quad";

type Props = {
  item: SceneItem;
  /** 0 assembled → 1 exploded, written by the scroll driver. */
  explode: React.RefObject<number>;
  active: boolean;
};

const QUADRANTS = [
  // region (u = left→right, v = far→near), crust UV in texture space, spread direction
  { region: { u0: 0, u1: 0.5, v0: 0, v1: 0.5 }, uv: [0, 0.5, 0.5, 1], dir: [-1, -1] },
  { region: { u0: 0.5, u1: 1, v0: 0, v1: 0.5 }, uv: [0.5, 0.5, 1, 1], dir: [1, -1] },
  { region: { u0: 0, u1: 0.5, v0: 0.5, v1: 1 }, uv: [0, 0, 0.5, 0.5], dir: [-1, 1] },
  { region: { u0: 0.5, u1: 1, v0: 0.5, v1: 1 }, uv: [0.5, 0, 1, 0.5], dir: [1, 1] },
] as const;

function Rig({ explode, fit }: { explode: React.RefObject<number>; fit: number }) {
  const { camera, size } = useThree();
  const look = useRef(new THREE.Vector3());
  useFrame(() => {
    const e = explode.current ?? 0;
    const narrow = size.width < size.height;
    const dist = (narrow ? 1.25 : 1) * fit;
    // Pull back and lower as the stack grows so every layer stays in frame.
    camera.position.lerp(new THREE.Vector3(0, (1.25 - e * 0.25) * dist, (2.5 + e * 0.55) * dist), 0.08);
    look.current.lerp(new THREE.Vector3(0, 0.1 + e * 0.3, 0), 0.08);
    camera.lookAt(look.current);
  });
  return null;
}

/** Spin + drag rotation, plus a small pop-in whenever the item changes. */
function Turntable({ item, drag, children }: { item: SceneItem; drag: React.RefObject<number>; children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  const appear = useRef(0);
  useEffect(() => {
    appear.current = 0;
  }, [item]);
  useFrame((_, dt) => {
    const g = ref.current;
    if (!g) return;
    appear.current = Math.min(1, appear.current + dt * 1.6);
    const a = 1 - Math.pow(1 - appear.current, 3);
    g.scale.setScalar(0.82 + 0.18 * a);
    g.rotation.y = -0.55 + drag.current + (1 - a) * 0.9 + Math.sin(performance.now() / 4000) * 0.08;
  });
  return <group ref={ref}>{children}</group>;
}

function Labels({ item, explode, dims }: { item: SceneItem; explode: React.RefObject<number>; dims: ReturnType<typeof trayDims> }) {
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const groups = useRef<(THREE.Group | null)[]>([]);
  const narrow = useThree((s) => s.size.width < 640);
  const tops = layerTops(dims);
  const labels =
    item === "quad"
      ? QUAD.quadrants.map((id) => ({ name: flavorById(id).name, detail: "" }))
      : flavorById(item).layers.map((l) => ({ name: l.name, detail: l.detail }));

  useFrame(() => {
    const e = explode.current ?? 0;
    labels.forEach((_, i) => {
      const el = refs.current[i];
      const g = groups.current[i];
      if (g && item !== "quad") g.position.y = tops[i] + e * EXPLODE_GAP * i - 0.06 * e;
      if (el) {
        const show = Math.min(1, Math.max(0, (e - 0.55 - i * 0.06) / 0.25));
        el.style.opacity = String(show);
        el.style.transform = `translateX(${(show - 1) * 16}px)`;
      }
    });
  });

  // Phones show the layer names as chips under the canvas instead.
  if (narrow) return null;

  return (
    <>
      {labels.map((l, i) => {
        const pos: [number, number, number] =
          item === "quad"
            ? [((i % 2) - 0.5) * dims.length * 1.15, 0.5, (Math.floor(i / 2) - 0.5) * dims.width * 1.1]
            : [-(dims.length * 0.5 + 0.03), 0, 0];
        return (
          <group key={`${item}-${i}`} ref={(g) => void (groups.current[i] = g)} position={pos}>
            <Html zIndexRange={[20, 0]} style={{ pointerEvents: "none" }} center={item === "quad"}>
              <div className={item === "quad" ? "" : "-translate-x-full -translate-y-1/2"}>
                <div ref={(el) => void (refs.current[i] = el)} className="flex items-center gap-2 whitespace-nowrap opacity-0">
                  <span className="rounded-full border border-line bg-nori/80 px-3 py-1.5 text-[0.72rem] font-semibold text-rice backdrop-blur">
                    {l.name}
                  </span>
                  {item !== "quad" && <span className="h-px w-8 bg-rice/50" />}
                </div>
              </div>
            </Html>
          </group>
        );
      })}
    </>
  );
}

function Stack({ item, explode }: { item: SceneItem; explode: React.RefObject<number> }) {
  const dims = trayDims(sizeById(item === "quad" ? "quad" : "family"));
  const trayRef = useRef<THREE.Group>(null);
  useFrame(() => {
    if (trayRef.current) trayRef.current.position.y = -(explode.current ?? 0) * 0.06;
  });
  return (
    <>
      <group ref={trayRef}>
        <Tray dims={dims} />
      </group>
      {item === "quad" ? (
        QUAD.quadrants.map((id, i) => (
          <FoodStack
            key={id}
            flavor={id}
            dims={dims}
            region={QUADRANTS[i].region}
            crust="/tex/quad.webp"
            crustUv={QUADRANTS[i].uv as unknown as [number, number, number, number]}
            spread={[QUADRANTS[i].dir[0] * 0.12, QUADRANTS[i].dir[1] * 0.1]}
            explode={explode}
            seed={i + 3}
          />
        ))
      ) : (
        <FoodStack flavor={item} dims={dims} crust={`/tex/${item}.webp`} explode={explode} />
      )}
    </>
  );
}

export default function LayerScene({ item, explode, active }: Props) {
  const drag = useRef(0);
  const dims = trayDims(sizeById(item === "quad" ? "quad" : "family"));

  // Horizontal drag rotates the tray; vertical movement is left to page scrolling.
  const start = useRef<{ x: number; base: number } | null>(null);
  const onDown = (e: React.PointerEvent) => (start.current = { x: e.clientX, base: drag.current });
  const onMove = (e: React.PointerEvent) => {
    if (start.current) drag.current = start.current.base + (e.clientX - start.current.x) * 0.008;
  };
  const onUp = () => (start.current = null);

  return (
    <div
      className="h-full w-full cursor-grab touch-pan-y active:cursor-grabbing"
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerLeave={onUp}
      onPointerCancel={onUp}
    >
      <Canvas
        frameloop={active ? "always" : "never"}
        dpr={[1, 1.5]}
        shadows={{ type: THREE.PCFShadowMap }}
        camera={{ fov: 30, position: [0, 1.25, 2.5], near: 0.1, far: 20 }}
        gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
      >
        <Rig explode={explode} fit={item === "quad" ? 1.22 : 1} />
        <ambientLight intensity={0.35} />
        <directionalLight position={[1.8, 3.2, 2]} intensity={2.4} color="#fff3e0" castShadow shadow-mapSize={[1024, 1024]} shadow-bias={-0.0004}>
          <orthographicCamera attach="shadow-camera" args={[-1.5, 1.5, 1.5, -1.5, 0.1, 10]} />
        </directionalLight>
        <pointLight position={[-1.6, 0.8, -1.2]} intensity={5} color="#e8631a" distance={6} />
        <Suspense fallback={null}>
          <Turntable item={item} drag={drag}>
            <Stack key={item} item={item} explode={explode} />
            {/* Quadrant names turn with the tray; layer names stay beside it. */}
            {item === "quad" && <Labels item={item} explode={explode} dims={dims} />}
          </Turntable>
          {item !== "quad" && <Labels item={item} explode={explode} dims={dims} />}
          <Environment resolution={256}>
            <Lightformer form="rect" intensity={3} position={[0, 4, 0]} rotation-x={Math.PI / 2} scale={[6, 6, 1]} color="#fff6ea" />
            <Lightformer form="rect" intensity={2} position={[4, 1, 2]} rotation-y={-Math.PI / 2} scale={[4, 2, 1]} color="#ffd2a8" />
            <Lightformer form="rect" intensity={1.5} position={[-4, 1, -2]} rotation-y={Math.PI / 2} scale={[4, 2, 1]} color="#e8631a" />
            <Lightformer form="rect" intensity={2.2} position={[0, 0.6, 5]} scale={[10, 3, 1]} color="#fff1e2" />
            <Lightformer form="rect" intensity={1.2} position={[0, -3, 0]} rotation-x={-Math.PI / 2} scale={[8, 8, 1]} color="#8a5a3a" />
            <Lightformer form="ring" intensity={1} position={[0, 1, 4]} scale={2} color="#ffffff" />
          </Environment>
        </Suspense>
        <ContactShadows position={[0, -0.08, 0]} opacity={0.55} scale={4} blur={2.6} far={1.2} color="#000000" />
      </Canvas>
    </div>
  );
}
