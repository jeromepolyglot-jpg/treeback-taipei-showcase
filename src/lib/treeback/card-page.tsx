import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Download, Share2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { usePlayer } from "./player-auth";
import { drawCard, cardShareText, CARD_W, CARD_H, type CardData, type CardKind } from "./card-model";
import { REPORT_DISTRICTS } from "./report-model";
import { ROLES, eco, type Role } from "./oasis-model";
import { progressSchema } from "./oasis-progress";

type TreeRow = [string, string, string | null, string, number | null, number | null, number | null, string];

const KIND_LABEL: Record<CardKind, string> = { wish: "許願卡", guardian: "守護卡", oasis: "綠洲證書" };

export function CardPage() {
  const { user } = usePlayer();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [kind, setKind] = useState<CardKind>("wish");
  const [trees, setTrees] = useState<TreeRow[]>([]);

  // wish card state
  const [district, setDistrict] = useState<string>(REPORT_DISTRICTS[0]);
  const [reportKind, setReportKind] = useState("空樹穴");
  const [note, setNote] = useState("");
  const [wishes, setWishes] = useState(1);

  // guardian card state
  const [treeId, setTreeId] = useState("");

  // oasis card state
  const [oasis, setOasis] = useState<{ roleName: string; month: number; trees: number; cooling: number; oxygen: number; improvement: number } | null>(null);
  const [oasisRole, setOasisRole] = useState<Role>("citizen");

  useEffect(() => {
    fetch("/data/protected-trees.json").then((r) => r.json()).then((d) => setTrees(d.rows)).catch(() => toast.error("樹木資料載入失敗"));
  }, []);

  useEffect(() => {
    if (!user) { setOasis(null); return; }
    supabase.from("oasis_progress").select("state").eq("user_id", user.id).maybeSingle().then(({ data }) => {
      const parsed = progressSchema.safeParse(data?.state);
      if (!parsed.success) { setOasis(null); return; }
      const sessions = parsed.data.sessions;
      const build = (role: Role) => {
        const g = sessions[role];
        const m = eco(g, role);
        return { roleName: ROLES[role].name, month: g.month, trees: m.trees, cooling: m.cooling, oxygen: m.oxygen, improvement: m.improvement };
      };
      setOasis(build(oasisRole));
    });
  }, [user, oasisRole]);

  const data: CardData = kind === "wish"
    ? { kind, district, reportKind, note: note.trim(), wishes }
    : kind === "guardian"
      ? (() => { const t = trees.find((r) => r[0] === treeId) ?? trees[0]; return { kind, treeName: t?.[1] ?? "受保護樹木", treeId: t?.[0] ?? "-", address: t?.[3] ?? "" }; })()
      : { kind, ...(oasis ?? { roleName: ROLES[oasisRole].name, month: 1, trees: 0, cooling: 0, oxygen: 0, improvement: 0 }) };

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) drawCard(ctx, data);
  });

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `treeback-${kind}-card.png`;
    a.click();
    toast.success("卡片已下載");
  };
  const share = async () => {
    const text = cardShareText(data);
    if (navigator.share) { try { await navigator.share({ text }); } catch { /* cancelled */ } }
    else { await navigator.clipboard.writeText(text); toast.success("分享文字已複製"); }
  };

  return (
    <>
      <div className="section-top">
        <div>
          <p className="eyebrow">P2 · SHARE YOUR PLEDGE</p>
          <h1 className="page-title">認領卡分享</h1>
          <p className="muted">產生可下載的分享卡片圖。許願卡標示市民通報、守護卡標示官方資料來源、綠洲證書標示遊戲參數，都不冒充實測。</p>
        </div>
      </div>

      <div className="tbx-two">
        <div className="tbx-card">
          <h2>1. 選擇卡片類型</h2>
          <div className="tbx-seg" role="group" aria-label="卡片類型">
            {(Object.keys(KIND_LABEL) as CardKind[]).map((k) => (
              <button type="button" key={k} className={kind === k ? "on" : ""} onClick={() => setKind(k)}>{KIND_LABEL[k]}</button>
            ))}
          </div>

          {kind === "wish" && (
            <>
              <label>行政區
                <select value={district} onChange={(e) => setDistrict(e.target.value)}>{REPORT_DISTRICTS.map((d) => <option key={d}>{d}</option>)}</select>
              </label>
              <label>類型
                <select value={reportKind} onChange={(e) => setReportKind(e.target.value)}>{["空樹穴", "水泥填平", "寬敞人行道"].map((k) => <option key={k}>{k}</option>)}</select>
              </label>
              <label>許願的話（選填）
                <textarea maxLength={60} value={note} onChange={(e) => setNote(e.target.value)} placeholder="例如：希望這裡能再有一棵樟樹" />
              </label>
              <label>集氣人數
                <input type="number" min={1} max={9999} value={wishes} onChange={(e) => setWishes(Math.max(1, Math.min(9999, Number(e.target.value) || 1)))} />
              </label>
            </>
          )}

          {kind === "guardian" && (
            <label>選擇受保護樹木
              <select value={treeId} onChange={(e) => setTreeId(e.target.value)}>
                {trees.length === 0 && <option>載入中…</option>}
                {trees.slice(0, 200).map((t) => <option key={t[0]} value={t[0]}>{t[0]} · {t[1]} · {t[3].slice(0, 18)}</option>)}
              </select>
            </label>
          )}

          {kind === "oasis" && (
            <>
              {!user && <p className="muted">登入後會自動帶入你的遊戲成果；未登入時顯示空白證書範例。</p>}
              <label>角色
                <select value={oasisRole} onChange={(e) => setOasisRole(e.target.value as Role)}>
                  {(Object.keys(ROLES) as Role[]).map((r) => <option key={r} value={r}>{ROLES[r].name}</option>)}
                </select>
              </label>
            </>
          )}

          <div className="tbx-row">
            <button className="tbx-primary" onClick={download}><Download size={16} /> 下載 PNG</button>
            <button className="outline-btn" onClick={share}><Share2 size={16} /> 分享文字</button>
          </div>
        </div>

        <div className="tbx-card" style={{ textAlign: "center" }}>
          <h2>2. 預覽</h2>
          <canvas ref={canvasRef} width={CARD_W} height={CARD_H} style={{ width: "100%", maxWidth: 420, height: "auto", borderRadius: 12, boxShadow: "0 8px 30px rgba(29,74,56,.18)" }} aria-label="卡片預覽" />
        </div>
      </div>
    </>
  );
}
