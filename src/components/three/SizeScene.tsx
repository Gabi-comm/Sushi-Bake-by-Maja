"use client";

import { Suspense, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Html, Lightformer, Line } from "@react-three/drei";
import { SIZES, type SizeId } from "@/data/menu";
import { useTheme } from "@/lib/theme";
import Filling from "./Filling";
import Tray from "./Tray";
import { trayDims, type TrayDims } from "./geometry";

const GAP = 0.32;
const FILL: Record<SizeId, string> = {
  regular: "/tex/california-maki.webp",
  large: "/tex/creamy-kani.webp",
  family: "/tex/cheesy-spam.webp",
  quad: "/tex/quad.webp",
};

/** x centre of each tray when laid out left→right at true scale. */
const LAYOUT = (() => {
  let x = 0;
  const out = SIZES.map((s) => {
    const d = trayDims(s);
    const cx = x + d.length / 2;
    x += d.length + GAP;
    return { id: s.id, dims: d, x: cx };
  });
  const shift = (x - GAP) / 2;
  return out.map((o) => ({ ...o, x: o.x - shift }));
})();

function Dimension({ dims, visible }: { dims: TrayDims; visible: number }) {
  const y = 0.004;
  const l = dims.length / 2;
  const w = dims.width / 2;
  const off = 0.09;
  const ref = useRef<THREE.Group>(null);
  const theme = useTheme();
  useFrame(() => {
    if (!ref.current) return;
    ref.current.scale.setScalar(THREE.MathUtils.lerp(ref.current.scale.x, visible ? 1 : 0.0001, 0.12));
  });
  // Accent per theme: orange lines on nori, ink lines on the orange page.
  const color = theme === "dark" ? "#e8631a" : "#1a0f08";
  return (
    <group ref={ref}>
      <Line points={[[-l, y, w + off], [l, y, w + off]]} color={color} lineWidth={1.5} />
      <Line points={[[-l, y, w + off - 0.03], [-l, y, w + off + 0.03]]} color={color} lineWidth={1.5} />
      <Line points={[[l, y, w + off - 0.03], [l, y, w + off + 0.03]]} color={color} lineWidth={1.5} />
      <Line points={[[l + off, y, -w], [l + off, y, w]]} color={color} lineWidth={1.5} />
      <Line points={[[l + off - 0.03, y, -w], [l + off + 0.03, y, -w]]} color={color} lineWidth={1.5} />
      <Line points={[[l + off - 0.03, y, w], [l + off + 0.03, y, w]]} color={color} lineWidth={1.5} />
    </group>
  );
}

function Trays({ selected, onSelect }: { selected: SizeId; onSelect: (id: SizeId) => void }) {
  const groups = useRef<(THREE.Group | null)[]>([]);
  useFrame((state) => {
    LAYOUT.forEach((t, i) => {
      const g = groups.current[i];
      if (!g) return;
      const on = t.id === selected;
      g.position.y = THREE.MathUtils.lerp(g.position.y, on ? 0.06 + Math.sin(state.clock.elapsedTime * 1.6) * 0.01 : 0, 0.1);
      g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, on ? -0.18 : 0, 0.08);
    });
  });
  return (
    <>
      {LAYOUT.map((t, i) => {
        const size = SIZES[i];
        const on = t.id === selected;
        return (
          <group key={t.id} position={[t.x, 0, 0]}>
            <group
              ref={(g) => void (groups.current[i] = g)}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(t.id);
              }}
              onPointerOver={() => (document.body.style.cursor = "pointer")}
              onPointerOut={() => (document.body.style.cursor = "")}
            >
              <Tray dims={t.dims} />
              <Filling dims={t.dims} textures={[FILL[t.id]]} />
            </group>
            <Dimension dims={t.dims} visible={on ? 1 : 0} />
            {on && (
              <>
                <Html position={[0, 0, t.dims.width / 2 + 0.2]} center zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
                  <span className="whitespace-nowrap rounded-full bg-orange px-2.5 py-1 text-[0.7rem] font-bold text-on-accent">{size.inches.length}″</span>
                </Html>
                <Html position={[t.dims.length / 2 + 0.2, 0, 0]} center zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
                  <span className="whitespace-nowrap rounded-full bg-orange px-2.5 py-1 text-[0.7rem] font-bold text-on-accent">{size.inches.width}″</span>
                </Html>
              </>
            )}
          </group>
        );
      })}
    </>
  );
}

function Rig({ selected }: { selected: SizeId }) {
  const { camera, size } = useThree();
  const target = useRef(new THREE.Vector3());
  useFrame(() => {
    const t = LAYOUT.find((l) => l.id === selected)!;
    const narrow = size.width / size.height < 1.1;
    // Phones frame the chosen tray; wide screens keep the whole lineup in view.
    const x = narrow ? t.x : t.x * 0.35;
    const dist = narrow ? 1.7 + t.dims.length * 0.9 : 3.7;
    camera.position.lerp(new THREE.Vector3(x, dist * 0.62, dist * 0.78), 0.06);
    target.current.lerp(new THREE.Vector3(x, 0, 0.05), 0.06);
    camera.lookAt(target.current);
  });
  return null;
}

export default function SizeScene({ selected, onSelect, active }: { selected: SizeId; onSelect: (id: SizeId) => void; active: boolean }) {
  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={[1, 1.5]}
      shadows={{ type: THREE.PCFShadowMap }}
      camera={{ fov: 30, position: [0, 2.7, 3.4], near: 0.1, far: 30 }}
      gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping }}
    >
      <Rig selected={selected} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[2, 4, 3]} intensity={2.2} color="#fff3e0" castShadow shadow-mapSize={[1024, 1024]}>
        <orthographicCamera attach="shadow-camera" args={[-3, 3, 3, -3, 0.1, 12]} />
      </directionalLight>
      <pointLight position={[-3, 1, -1.5]} intensity={6} color="#e8631a" distance={8} />
      <Suspense fallback={null}>
        <Trays selected={selected} onSelect={onSelect} />
        <Environment resolution={256}>
          <Lightformer form="rect" intensity={3} position={[0, 4, 0]} rotation-x={Math.PI / 2} scale={[8, 8, 1]} color="#fff6ea" />
          <Lightformer form="rect" intensity={2.2} position={[0, 0.6, 5]} scale={[12, 3, 1]} color="#fff1e2" />
          <Lightformer form="rect" intensity={1.5} position={[-5, 1, -2]} rotation-y={Math.PI / 2} scale={[4, 2, 1]} color="#e8631a" />
        </Environment>
      </Suspense>
      <ContactShadows position={[0, -0.001, 0]} opacity={0.6} scale={8} blur={2.2} far={1} />
    </Canvas>
  );
}
