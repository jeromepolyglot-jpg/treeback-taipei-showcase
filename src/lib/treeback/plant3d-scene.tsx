import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Clone, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { usePlantStore, type CHPV } from "./plant3d-store";

/* ---------- 候選種樹位置（大安區典型街景合成，情境參數） ---------- */

export interface Spot {
  id: string;
  pos: [number, number, number];
  kind: string;
  desc: string;
  chpv: CHPV;
  variant: 0 | 1;
}

export const SPOTS: Spot[] = [
  // 中央安全島：遮蔭潛力高、降溫效果佳
  { id: "m1", pos: [-18, 0.2, 0], kind: "中央安全島", desc: "林蔭大道中央的安全島，空間充足、日照強，種下大樹遮蔭與降溫效果最好的位置之一。", chpv: { c: 9, h: 8, p: 4, v: 3 }, variant: 0 },
  { id: "m2", pos: [-6, 0.2, 0], kind: "中央安全島", desc: "安全島中段，鄰近斑馬線，等紅燈的行人最能直接感受到樹蔭。", chpv: { c: 8, h: 8, p: 6, v: 4 }, variant: 1 },
  { id: "m3", pos: [6, 0.2, 0], kind: "中央安全島", desc: "安全島東段，目前完全沒有遮蔭，夏天路面溫度極高。", chpv: { c: 9, h: 9, p: 4, v: 3 }, variant: 0 },
  // 北側人行道空樹穴
  { id: "n1", pos: [-24, 0.06, -7.5], kind: "空樹穴", desc: "老樹移除後留下的空樹穴，管線位置已確認過，補植最直接。", chpv: { c: 6, h: 6, p: 5, v: 4 }, variant: 1 },
  { id: "n2", pos: [-12, 0.06, -7.5], kind: "空樹穴", desc: "騎樓旁的空樹穴，補植後可銜接既有樹蔭形成連續綠廊。", chpv: { c: 7, h: 6, p: 6, v: 4 }, variant: 0 },
  { id: "n3", pos: [0, 0.06, -7.5], kind: "空樹穴", desc: "公車站牌旁的空樹穴，等車民眾夏天曝曬嚴重。", chpv: { c: 6, h: 7, p: 8, v: 6 }, variant: 1 },
  { id: "n4", pos: [12, 0.06, -7.5], kind: "空樹穴", desc: "辦公大樓前的空樹穴，使用人多但停留時間短。", chpv: { c: 6, h: 5, p: 6, v: 3 }, variant: 0 },
  // 南側人行道
  { id: "s1", pos: [-18, 0.06, 7.5], kind: "空樹穴", desc: "南側人行道西段的空樹穴，這一整側幾乎沒有樹。", chpv: { c: 7, h: 7, p: 5, v: 5 }, variant: 1 },
  { id: "s2", pos: [-2, 0.06, 7.5], kind: "水泥地可打開", desc: "人行道拓寬後留下的水泥面，評估後可打開種樹，成本較高但遮蔭潛力大。", chpv: { c: 8, h: 7, p: 6, v: 5 }, variant: 0 },
  { id: "s3", pos: [14, 0.06, 7.5], kind: "空樹穴", desc: "靠近巷口的空樹穴，居民進出頻繁。", chpv: { c: 6, h: 6, p: 7, v: 5 }, variant: 1 },
  // 特殊場所
  { id: "x1", pos: [-27, 0.06, -11.5], kind: "學校圍牆邊", desc: "學校圍牆外的走道，學童上下學必經，遮蔭對兒童特別重要。", chpv: { c: 7, h: 6, p: 8, v: 9 }, variant: 0 },
  { id: "x2", pos: [3, 0.06, 11.5], kind: "市場周邊", desc: "傳統市場外圍，長輩採買人潮多、夏天悶熱，樹蔭需求高。", chpv: { c: 6, h: 7, p: 9, v: 8 }, variant: 1 },
  { id: "x3", pos: [21, 0.06, 10], kind: "巷口角落", desc: "巷口的退縮角落，空間不大但可種小喬木，服務巷內居民。", chpv: { c: 5, h: 5, p: 6, v: 6 }, variant: 1 },
  { id: "x4", pos: [25, 0.06, -11], kind: "騎樓前", desc: "騎樓前的開放空間，需與店家協調，但建成後行人全天候受益。", chpv: { c: 5, h: 5, p: 7, v: 4 }, variant: 0 },
];

/* ---------- 既有樹木（對照用） ---------- */

const EXISTING_TREES: { pos: [number, number, number]; variant: 0 | 1; scale: number }[] = [
  { pos: [-12, 0.2, 0], variant: 0, scale: 1.15 },
  { pos: [0, 0.2, 0], variant: 1, scale: 1.1 },
  { pos: [12, 0.2, 0], variant: 0, scale: 1.2 },
  { pos: [-24, 0.06, 7.5], variant: 1, scale: 1.05 },
];

/* ---------- 樹木模型 ---------- */

const TREE_URLS = ["/models/tree_default.glb", "/models/tree_cone.glb"] as const;

function Tree({ position, variant, scale = 1, grow = false }: { position: [number, number, number]; variant: number; scale?: number; grow?: boolean }) {
  const a = useGLTF(TREE_URLS[0]);
  const b = useGLTF(TREE_URLS[1]);
  const ref = useRef<THREE.Group>(null);

  useFrame((_, rawDelta) => {
    if (!grow) return;
    const delta = Math.min(rawDelta, 0.05);
    const g = ref.current;
    if (g && g.scale.x < scale) {
      g.scale.setScalar(Math.min(scale, g.scale.x + delta * 2.2 * scale));
    }
  });

  return (
    <Clone
      ref={ref}
      object={(variant === 0 ? a : b).scene}
      position={position}
      scale={grow ? 0.01 : scale}
      castShadow
      receiveShadow
    />
  );
}

/* ---------- 候選位置標記 ---------- */

function SpotMarker({ spot }: { spot: Spot }) {
  const planted = usePlantStore((s) => spot.id in s.planted);
  const selected = usePlantStore((s) => s.selected === spot.id);
  const phase = usePlantStore((s) => s.phase);
  const select = usePlantStore((s) => s.select);
  const ringRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshBasicMaterial>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const pulse = 1 + Math.sin(t * 2.5) * 0.08;
    ringRef.current?.scale.setScalar(selected ? 1.15 : pulse);
    if (matRef.current) matRef.current.opacity = selected ? 0.9 : 0.45 + Math.sin(t * 2.5) * 0.15;
  });

  if (planted) return <Tree position={spot.pos} variant={spot.variant} grow />;

  const color = selected ? "#8fc98a" : "#e8b04a";

  return (
    <group position={spot.pos}>
      <mesh
        position-y={0.05}
        onClick={(e) => {
          e.stopPropagation();
          if (phase === "playing") select(selected ? null : spot.id);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          if (phase === "playing") document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "auto";
        }}
      >
        <circleGeometry args={[1.1, 24]} />
        <meshBasicMaterial color={color} transparent opacity={0.25} />
      </mesh>
      <mesh ref={ringRef} position-y={0.06} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[1.1, 1.45, 32]} />
        <meshBasicMaterial ref={matRef} color={color} transparent opacity={0.5} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

/* ---------- 騎樓建築排 ---------- */

const SHOP_COLORS = ["#d9cfbd", "#c4b69e", "#b3a48c", "#cfc4ae", "#c9b8a8", "#b8a894"];

function ArcadeRow({ z, flip }: { z: number; flip: boolean }) {
  const shops = useMemo(() => {
    const rng = (seed: number) => {
      let a = seed;
      return () => {
        a |= 0;
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    };
    const rand = rng(flip ? 4101 : 4102);
    return [-30, -22.5, -15, -7.5, 0, 7.5, 15, 22.5, 30].map((x) => ({
      x,
      h: 6 + rand() * 6,
      color: SHOP_COLORS[Math.floor(rand() * SHOP_COLORS.length)] ?? "#c4b69e",
    }));
  }, [flip]);

  const dir = flip ? -1 : 1;

  return (
    <group>
      {shops.map((s) => (
        <group key={s.x} position={[s.x, 0, z]}>
          {/* 主建築 */}
          <mesh position={[0, s.h / 2, dir * 2.5]} castShadow receiveShadow>
            <boxGeometry args={[7, s.h, 5]} />
            <meshStandardMaterial color={s.color} flatShading />
          </mesh>
          {/* 騎樓天花板（懸挑） */}
          <mesh position={[0, 3.2, dir * -1.5]} castShadow>
            <boxGeometry args={[7, 0.25, 3]} />
            <meshStandardMaterial color="#a89a82" />
          </mesh>
          {/* 騎樓柱 */}
          {[-3, 0, 3].map((cx) => (
            <mesh key={cx} position={[cx, 1.6, dir * -2.8]} castShadow>
              <boxGeometry args={[0.35, 3.2, 0.35]} />
              <meshStandardMaterial color="#8a7a66" />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

/* ---------- 場景 ---------- */

export function Scene() {
  return (
    <>
      {/* 地面 */}
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[90, 90]} />
        <meshStandardMaterial color="#8a9478" />
      </mesh>

      {/* 林蔭大道（東西向） */}
      <mesh rotation-x={-Math.PI / 2} position-y={0.01} receiveShadow>
        <planeGeometry args={[90, 10]} />
        <meshStandardMaterial color="#4a4a48" />
      </mesh>
      {/* 中央安全島 */}
      <mesh rotation-x={-Math.PI / 2} position-y={0.1} receiveShadow>
        <planeGeometry args={[80, 3]} />
        <meshStandardMaterial color="#9a927e" />
      </mesh>
      {/* 車道線 */}
      {[-3.2, 3.2].map((z) =>
        Array.from({ length: 15 }, (_, i) => (
          <mesh key={`${z}-${i}`} rotation-x={-Math.PI / 2} position={[-42 + i * 6, 0.02, z]}>
            <planeGeometry args={[2.5, 0.18]} />
            <meshBasicMaterial color="#d8d4c8" />
          </mesh>
        )),
      )}

      {/* 巷弄（南北向，東側） */}
      <mesh rotation-x={-Math.PI / 2} position={[24, 0.01, 0]} receiveShadow>
        <planeGeometry args={[5, 90]} />
        <meshStandardMaterial color="#525250" />
      </mesh>

      {/* 人行道 */}
      {[-7.5, 7.5].map((z) => (
        <mesh key={z} rotation-x={-Math.PI / 2} position={[0, 0.03, z]} receiveShadow>
          <planeGeometry args={[90, 5]} />
          <meshStandardMaterial color="#b8b0a0" />
        </mesh>
      ))}

      {/* 騎樓建築（南北兩排） */}
      <ArcadeRow z={-14} flip={false} />
      <ArcadeRow z={14} flip={true} />

      {/* 學校（西北角：低矮校舍 + 圍牆） */}
      <mesh position={[-30, 2, -22]} castShadow receiveShadow>
        <boxGeometry args={[14, 4, 8]} />
        <meshStandardMaterial color="#d8c8a8" flatShading />
      </mesh>
      <mesh position={[-27, 0.9, -13.5]} castShadow>
        <boxGeometry args={[12, 1.8, 0.3]} />
        <meshStandardMaterial color="#b0a284" />
      </mesh>

      {/* 市場（南側：遮雨棚） */}
      {[0, 3.5, 7].map((x, i) => (
        <mesh key={x} position={[x, 2.6, 14]} rotation-z={0.08} castShadow>
          <boxGeometry args={[3, 0.15, 4]} />
          <meshStandardMaterial color={["#c96f4a", "#4a7c9a", "#c9a44a"][i % 3] ?? "#c96f4a"} />
        </mesh>
      ))}

      {/* 既有樹木 */}
      {EXISTING_TREES.map((t, i) => (
        <Tree key={i} position={t.pos} variant={t.variant} scale={t.scale} />
      ))}

      {/* 候選種樹位置 */}
      {SPOTS.map((spot) => (
        <SpotMarker key={spot.id} spot={spot} />
      ))}
    </>
  );
}
