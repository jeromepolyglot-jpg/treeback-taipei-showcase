import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { LogIn, RefreshCw, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { usePlayer } from "./player-auth";
import { PlayerAuthDialog } from "./player-auth-dialog";
import { rankEntries, medalFor, type LeaderboardEntry } from "./leaderboard-model";
import { ROLES } from "./oasis-model";

type PlantScore = { user_id: string; display_name: string; trees: number; created_at: string };

export function LeaderboardPage() {
  const { user } = usePlayer();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [plantScores, setPlantScores] = useState<PlantScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [authOpen, setAuthOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from("oasis_leaderboard").select("*").limit(100);
    if (error) { toast.error("排行榜讀取失敗，請稍後重試"); setLoading(false); return; }
    setEntries(rankEntries((data ?? []) as LeaderboardEntry[]));
    const { data: plantRows } = await supabase
      .from("plant3d_scores")
      .select("*")
      .order("trees", { ascending: false })
      .limit(20);
    setPlantScores((plantRows ?? []) as PlantScore[]);
    setLoading(false);
  }, []);
  useEffect(() => { void load(); }, [load]);

  const removeMine = async () => {
    if (!user) return;
    const { error } = await supabase.from("oasis_leaderboard").delete().eq("user_id", user.id);
    if (error) { toast.error("移除失敗，請重試"); return; }
    setEntries((l) => l.filter((e) => e.user_id !== user.id));
    toast.success("已移除你的成績");
  };

  const mine = user ? entries.find((e) => e.user_id === user.id) : undefined;

  return (
    <>
      <div className="section-top">
        <div>
          <p className="eyebrow">P2 · OASIS LEADERBOARD</p>
          <h1 className="page-title">綠洲守護者排行榜</h1>
          <p className="muted">成績由玩家從遊戲證書自願發佈，數值是<b>虛構遊戲參數</b>，不代表真實種樹或環境效益。</p>
        </div>
        <button className="outline-btn" onClick={load}><RefreshCw size={16} /> 重新整理</button>
      </div>

      <div className="tbx-card">
        {loading ? <p className="muted">讀取中…</p> : entries.length === 0 ? (
          <p className="muted">還沒有人發佈成績。到城市綠洲遊戲玩一局，在證書上按「發佈到排行榜」就能上榜。</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left" }}>
                <th>名次</th><th>玩家</th><th>角色</th><th>種樹</th><th>TES 改善</th><th>月數</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e, i) => (
                <tr key={e.user_id} style={{ borderTop: "1px solid rgba(29,74,56,.12)", fontWeight: e.user_id === user?.id ? 700 : 400 }}>
                  <td style={{ padding: "10px 8px" }}>{medalFor(i)}</td>
                  <td>{e.display_name}{e.user_id === user?.id && "（你）"}</td>
                  <td>{ROLES[e.role].name}</td>
                  <td>{e.trees} 棵</td>
                  <td>+{e.improvement}</td>
                  <td>{e.month}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="tbx-card" style={{ marginTop: 16 }}>
        <h2>見縫插樹 3D 排行</h2>
        <p className="muted">來自 3D 種樹小遊戲的單回合成績，同樣是<b>遊戲參數</b>。</p>
        {plantScores.length === 0 ? (
          <p className="muted">還沒有人發佈。到<a href="/plant3d">見縫插樹 3D</a>玩一局，結算時就能發佈成績。</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left" }}>
                <th>名次</th><th>玩家</th><th>種回樹木</th>
              </tr>
            </thead>
            <tbody>
              {plantScores.map((p, i) => (
                <tr key={`${p.user_id}-${p.created_at}`} style={{ borderTop: "1px solid rgba(29,74,56,.12)", fontWeight: p.user_id === user?.id ? 700 : 400 }}>
                  <td style={{ padding: "10px 8px" }}>{medalFor(i)}</td>
                  <td>{p.display_name}{p.user_id === user?.id && "（你）"}</td>
                  <td>{p.trees} 棵</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="tbx-card" style={{ marginTop: 16 }}>
        <h2>我的成績</h2>
        {!user ? (
          <>
            <p className="muted">登入後可從城市綠洲遊戲的證書發佈成績，或移除自己的成績。</p>
            <button className="tbx-primary" onClick={() => setAuthOpen(true)}><LogIn size={16} /> 登入</button>
          </>
        ) : mine ? (
          <>
            <p>你已發佈：{ROLES[mine.role].name} · {mine.trees} 棵 · TES +{mine.improvement} · 第 {mine.month} 個月</p>
            <button className="outline-btn" onClick={removeMine}><Trash2 size={16} /> 移除我的成績</button>
          </>
        ) : (
          <p className="muted">你還沒發佈成績。到<a href="/oasis">城市綠洲遊戲</a>玩一局，在證書上按「發佈到排行榜」。</p>
        )}
      </div>
      <PlayerAuthDialog open={authOpen} onOpenChange={setAuthOpen} title="登入後發佈成績" description="成績從遊戲證書發佈，排行榜公開展示你的暱稱與遊戲數值。" />
    </>
  );
}
