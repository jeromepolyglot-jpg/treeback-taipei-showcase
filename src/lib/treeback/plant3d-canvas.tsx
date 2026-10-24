import { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, Lightformer, OrbitControls } from "@react-three/drei";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Scene, SPOTS } from "./plant3d-scene";
import { CITY_GOAL, envIndex, usePlantStore, type CHPV } from "./plant3d-store";
import { usePlayer } from "./player-auth";
import { PlayerAuthDialog } from "./player-auth-dialog";

const INK = "#1d4a38";
const PAPER = "#f5f1e8";

const CHPV_LABELS: { key: keyof CHPV; label: string; color: string }[] = [
  { key: "c", label: "樹冠遮蔭 C", color: "#8fc98a" },
  { key: "h", label: "降溫效益 H", color: "#6ab4d8" },
  { key: "p", label: "人群受益 P", color: "#e8b04a" },
  { key: "v", label: "弱勢照顧 V", color: "#d88a9a" },
];

function ChpvBars({ chpv, compact }: { chpv: CHPV; compact?: boolean }) {
  return (
    <div style={{ display: "grid", gap: compact ? 4 : 8 }}>
      {CHPV_LABELS.map(({ key, label, color }) => (
        <div key={key}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: compact ? 11 : 12, opacity: 0.85 }}>
            <span>{label}</span>
            <span>{chpv[key]}</span>
          </div>
          <div style={{ height: compact ? 5 : 7, background: "rgba(245,241,232,0.18)", borderRadius: 999, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${(chpv[key] / 10) * 100}%`, background: color, borderRadius: 999 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function HUD() {
  const score = usePlantStore((s) => s.score);
  const totals = usePlantStore((s) => s.totals);
  const phase = usePlantStore((s) => s.phase);
  const finish = usePlantStore((s) => s.finish);

  if (phase !== "playing") return null;

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 10 }}>
      <div style={{ position: "absolute", top: 16, left: 16, color: PAPER, fontFamily: "monospace" }}>
        <div style={{ fontSize: 12, opacity: 0.75 }}>已種回</div>
        <div style={{ fontSize: 32, fontWeight: 700 }}>{score} 棵</div>
        <div style={{ fontSize: 12, opacity: 0.75, marginTop: 8 }}>城市環境變化指數</div>
        <div style={{ fontSize: 28, fontWeight: 700, color: "#8fc98a" }}>+{envIndex(totals).toFixed(1)}</div>
      </div>
      <div style={{ position: "absolute", top: 16, right: 16, pointerEvents: "auto" }}>
        <button
          onClick={finish}
          style={{
            padding: "10px 22px",
            borderRadius: 10,
            border: "1px solid rgba(245,241,232,0.5)",
            background: "rgba(29,74,56,0.6)",
            color: PAPER,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          完成評估
        </button>
      </div>
      <div style={{ position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)", width: "min(520px, 86%)", color: PAPER, fontFamily: "monospace", textAlign: "center" }}>
        <div style={{ fontSize: 12, opacity: 0.75 }}>
          點擊發光標記觀察候選位置，評估 C／H／P／V 貢獻後決定是否種樹 · 數值為情境參數，非實測資料
        </div>
      </div>
    </div>
  );
}

function SpotPanel() {
  const selected = usePlantStore((s) => s.selected);
  const phase = usePlantStore((s) => s.phase);
  const plant = usePlantStore((s) => s.plant);
  const select = usePlantStore((s) => s.select);

  if (phase !== "playing" || !selected) return null;
  const spot = SPOTS.find((s) => s.id === selected);
  if (!spot) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: 70,
        right: 16,
        width: "min(300px, 82vw)",
        zIndex: 15,
        pointerEvents: "auto",
        background: "rgba(29,74,56,0.88)",
        color: PAPER,
        borderRadius: 14,
        padding: "16px 18px",
        backdropFilter: "blur(4px)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <strong style={{ fontSize: 17 }}>{spot.kind}</strong>
        <button
          onClick={() => select(null)}
          aria-label="關閉"
          style={{ background: "none", border: "none", color: PAPER, cursor: "pointer", fontSize: 16, opacity: 0.7 }}
        >
          ✕
        </button>
      </div>
      <p style={{ fontSize: 13, lineHeight: 1.7, opacity: 0.9, margin: "0 0 12px" }}>{spot.desc}</p>
      <ChpvBars chpv={spot.chpv} />
      <p style={{ fontSize: 12, opacity: 0.7, margin: "10px 0" }}>
        此位置的環境指數貢獻：+{envIndex(spot.chpv).toFixed(1)}
      </p>
      <button
        onClick={() => plant(spot.id, spot.variant, spot.chpv)}
        style={{
          width: "100%",
          padding: "11px 0",
          borderRadius: 10,
          border: "none",
          background: "#8fc98a",
          color: INK,
          fontWeight: 700,
          fontSize: 15,
          cursor: "pointer",
        }}
      >
        在此種樹
      </button>
    </div>
  );
}

function MenuScreen() {
  const phase = usePlantStore((s) => s.phase);
  const start = usePlantStore((s) => s.start);
  if (phase !== "menu") return null;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 20,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(29,74,56,0.45)",
        color: PAPER,
        textAlign: "center",
        padding: 24,
      }}
    >
      <h1 style={{ fontSize: "clamp(30px, 6vw, 52px)", fontWeight: 800, margin: "0 0 12px" }}>見縫插樹 3D · 大安區</h1>
      <p style={{ maxWidth: 560, lineHeight: 1.8, opacity: 0.9, margin: "0 0 8px" }}>
        這是一條合成的大安區典型街景：林蔭大道、騎樓、學校與市場。
        拖曳旋轉視角，點擊發光標記觀察每個候選位置，評估它的樹冠遮蔭（C）、降溫效益（H）、
        人群受益（P）與弱勢照顧（V），再決定把樹種在哪裡。
      </p>
      <p style={{ fontSize: 13, opacity: 0.7, margin: "0 0 24px" }}>
        不限時間 · 街景為典型合成、C／H／P／V 與環境指數皆為情境參數，非實測資料
      </p>
      <button
        onClick={start}
        style={{
          pointerEvents: "auto",
          padding: "14px 40px",
          fontSize: 20,
          fontWeight: 700,
          background: PAPER,
          color: INK,
          border: "none",
          borderRadius: 12,
          cursor: "pointer",
        }}
      >
        開始觀察街區
      </button>
    </div>
  );
}

function OverScreen() {
  const phase = usePlantStore((s) => s.phase);
  const score = usePlantStore((s) => s.score);
  const totals = usePlantStore((s) => s.totals);
  const best = usePlantStore((s) => s.best);
  const start = usePlantStore((s) => s.start);
  const { user } = usePlayer();
  const [name, setName] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  if (phase !== "over") return null;

  const publish = async () => {
    const display = name.trim();
    if (!display) { toast.error("請輸入暱稱"); return; }
    setPublishing(true);
    const { error } = await supabase.rpc("publish_plant3d_score", { _display_name: display, _trees: score });
    setPublishing(false);
    if (error) { toast.error("發佈失敗，請稍後重試"); return; }
    setPublished(true);
    toast.success("已發佈到排行榜");
  };
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 20,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(29,74,56,0.55)",
        color: PAPER,
        textAlign: "center",
        padding: 24,
        overflowY: "auto",
      }}
    >
      <h2 style={{ fontSize: 36, fontWeight: 800, margin: "0 0 8px" }}>評估完成！</h2>
      <p style={{ fontSize: 22, margin: "0 0 4px" }}>
        你種回了 <strong>{score}</strong> 棵樹，城市環境變化指數 <strong style={{ color: "#8fc98a" }}>+{envIndex(totals).toFixed(1)}</strong>
      </p>
      <p style={{ opacity: 0.8, margin: "0 0 16px" }}>
        {score >= best && score > 0 ? "新紀錄！" : `最佳紀錄：${best} 棵`} · 現實中台北一年還有約 {CITY_GOAL.toLocaleString()} 棵的缺口
      </p>
      <div style={{ width: "min(300px, 80vw)", marginBottom: 20, textAlign: "left" }}>
        <ChpvBars chpv={totals} compact />
        <p style={{ fontSize: 11, opacity: 0.65, marginTop: 6 }}>以上為遊戲情境參數的合計，非實測或官方數據。</p>
      </div>
      {score > 0 && !published && (
        <div style={{ marginBottom: 20, pointerEvents: "auto" }}>
          {user ? (
            <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="輸入暱稱"
                maxLength={20}
                style={{ padding: "10px 14px", borderRadius: 10, border: "none", fontSize: 15 }}
              />
              <button
                onClick={publish}
                disabled={publishing}
                style={{ padding: "10px 20px", borderRadius: 10, border: "none", background: "#8fc98a", color: INK, fontWeight: 700, cursor: "pointer" }}
              >
                {publishing ? "發佈中…" : "發佈到排行榜"}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setAuthOpen(true)}
              style={{ padding: "10px 20px", borderRadius: 10, border: "1px solid rgba(245,241,232,0.5)", background: "transparent", color: PAPER, cursor: "pointer" }}
            >
              登入後發佈成績到排行榜
            </button>
          )}
        </div>
      )}
      {published && <p style={{ color: "#8fc98a", margin: "0 0 16px" }}>已發佈！到排行榜頁查看名次。</p>}
      <button
        onClick={() => { setPublished(false); setName(""); start(); }}
        style={{
          pointerEvents: "auto",
          padding: "12px 36px",
          fontSize: 18,
          fontWeight: 700,
          background: PAPER,
          color: INK,
          border: "none",
          borderRadius: 12,
          cursor: "pointer",
        }}
      >
        再評估一次
      </button>
      <PlayerAuthDialog open={authOpen} onOpenChange={setAuthOpen} title="登入後發佈成績" description="排行榜公開展示你的暱稱與種樹數（遊戲參數）。" />
    </div>
  );
}

export function Plant3DCanvas() {
  return (
    <div style={{ position: "fixed", inset: 0, background: INK }}>
      <Canvas shadows camera={{ position: [0, 24, 36], fov: 50 }} dpr={[1, 2]}>
        <color attach="background" args={["#a8c4b8"]} />
        <fog attach="fog" args={["#a8c4b8", 70, 140]} />
        <hemisphereLight args={["#cfe8dd", "#4a5a48", 0.7]} />
        <directionalLight
          position={[20, 30, 15]}
          intensity={1.3}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-camera-left={-45}
          shadow-camera-right={45}
          shadow-camera-top={45}
          shadow-camera-bottom={-45}
        />
        <Environment>
          <Lightformer intensity={1.5} position={[0, 8, 0]} scale={[12, 12, 1]} />
          <Lightformer intensity={0.8} color="#bcd8c8" position={[-6, 2, -2]} rotation-y={Math.PI / 2} scale={[20, 1, 1]} />
        </Environment>
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
        <OrbitControls
          enablePan={false}
          minDistance={14}
          maxDistance={60}
          minPolarAngle={0.25}
          maxPolarAngle={Math.PI / 2.2}
          target={[0, 0, 0]}
        />
      </Canvas>
      <HUD />
      <SpotPanel />
      <MenuScreen />
      <OverScreen />
    </div>
  );
}
