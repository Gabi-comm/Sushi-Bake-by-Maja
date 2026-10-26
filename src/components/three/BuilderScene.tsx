"use client";

import { Suspense, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import { sizeById, type FlavorId, type SizeId } from "@/data/menu";
import Filling from "./Filling";
import Tray from "./Tray";
import { trayDims } from "./geometry";

/**
 * The tray being built, in the same foil model as the size lineup. The camera never moves,
 * so a Regular really looks smaller than a Quad. Each change drops a fresh tray in.
 */
function BuiltTray({ size, flavors, drag }: { size: SizeId; flavors: FlavorId[]; drag: React.RefObject<number> }) {
  const g = useRef<THREE.Group>(null);
  const born = useRef<number | null>(null);
  const dims = trayDims(sizeById(size));
  const textures = size === "quad" ? ["/tex/quad.webp"] : flavors.map((id) => `/tex/${id}.webp`);

  useFrame((state, dt) => {
    const o = g.current;
    if (!o) return;
    born.current ??= state.clock.elapsedTime;
    const t = Math.min((state.clock.elapsedTime - born.current) / 0.7, 1);
    const ease = 1 - Math.pow(1 - t, 3);
    o.position.y = (1 - ease) * 0.5;
    o.scale.setScalar(0.85 + ease * 0.15);
    // Gentle idle sway plus whatever the visitor dragged.
    const idle = Math.sin(state.clock.elapsedTime * 0.5) * 0.25;
    o.rotation.y = THREE.MathUtils.damp(o.rotation.y, -0.35 + idle + drag.current, 4, dt);
  });

  return (
    <group ref={g}>
      <Tray dims={dims} />
      <Filling dims={dims} textures={textures} />
    </group>
  );
}

export default function BuilderScene({ size, flavors }: { size: SizeId; flavors: FlavorId[] }) {
  const drag = useRef(0);
  const start = useRef<{ x: number; base: number } | null>(null);
  // Remount the tray whenever the order changes so it drops in again.
  const key = `${size}:${flavors.join("+")}`;

  return (
    <Canvas
      className="touch-pan-y"
      dpr={[1, 1.5]}
      shadows={{ type: THREE.PCFShadowMap }}
      camera={{ fov: 30, position: [0, 1.75, 2.35], near: 0.1, far: 20 }}
      gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping }}
      onCreated={({ camera }) => camera.lookAt(0, 0.02, 0)}
      onPointerDown={(e) => (start.current = { x: e.clientX, base: drag.current })}
      onPointerMove={(e) => {
        if (start.current) drag.current = start.current.base + (e.clientX - start.current.x) * 0.01;
      }}
      onPointerUp={() => (start.current = null)}
      onPointerLeave={() => (start.current = null)}
    >
      <ambientLight intensity={0.45} />
      <directionalLight position={[1.5, 3, 2]} intensity={2.2} color="#fff3e0" castShadow shadow-mapSize={[1024, 1024]}>
        <orthographicCamera attach="shadow-camera" args={[-1.5, 1.5, 1.5, -1.5, 0.1, 8]} />
      </directionalLight>
      <pointLight position={[-2, 0.8, -1]} intensity={4} color="#e8631a" distance={6} />
      <Suspense fallback={null}>
        <BuiltTray key={key} size={size} flavors={flavors} drag={drag} />
        <Environment resolution={256}>
          <Lightformer form="rect" intensity={3} position={[0, 4, 0]} rotation-x={Math.PI / 2} scale={[6, 6, 1]} color="#fff6ea" />
          <Lightformer form="rect" intensity={2.2} position={[0, 0.6, 4]} scale={[10, 3, 1]} color="#fff1e2" />
          <Lightformer form="rect" intensity={1.5} position={[-4, 1, -2]} rotation-y={Math.PI / 2} scale={[4, 2, 1]} color="#e8631a" />
        </Environment>
      </Suspense>
      <ContactShadows position={[0, -0.001, 0]} opacity={0.55} scale={4} blur={2.4} far={0.8} />
    </Canvas>
  );
}
