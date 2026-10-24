import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Eraser, LogIn, RefreshCw, ShieldCheck, ShieldQuestion, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { usePlayer } from "./player-auth";
import { PlayerAuthDialog } from "./player-auth-dialog";
import { rankEntries, medalFor, type LeaderboardEntry } from "./leaderboard-model";
import { formatReportTime, type ReportRow } from "./report-model";
import { ROLES } from "./oasis-model";

type Stats = {
  reports: number;
  subscriptions: number;
  alerts: number;
  leaderboard: number;
  wishes: number;
};

type SubRow = { id: string; tree_id: string; tree_label: string; created_at: string };

type ActivityRow = {
  user_id: string;
  email: string;
  signed_up_at: string;
  reports: number;
  subscriptions: number;
  alerts: number;
  plant3d_scores: number;
  oasis_played: boolean;
  feedback: number;
};

type FeedbackRow = { id: string; message: string; page: string; created_at: string };

async function countOf(table: "tree_reports" | "tree_subscriptions" | "tree_alerts" | "oasis_leaderboard"): Promise<number> {
  const { count, error } = await supabase.from(table).select("*", { count: "exact", head: true });
  if (error) throw error;
  return count ?? 0;
}

export function AdminPage() {
  const { user, loading: authLoading } = usePlayer();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [claiming, setClaiming] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [subs, setSubs] = useState<SubRow[]>([]);
  const [board, setBoard] = useState<LeaderboardEntry[]>([]);
  const [activity, setActivity] = useState<ActivityRow[]>([]);
  const [feedback, setFeedback] = useState<FeedbackRow[]>([]);
  const [loading, setLoading] = useState(false);

  const checkAdmin = useCallback(async () => {
    if (!user) { setIsAdmin(null); return; }
    const { data, error } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
    if (error) { setIsAdmin(false); return; }
    setIsAdmin(Boolean(data));
  }, [user]);
  useEffect(() => { void checkAdmin(); }, [checkAdmin]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [reports, subscriptions, alerts, leaderboard] = await Promise.all([
        countOf("tree_reports"),
        countOf("tree_subscriptions"),
        countOf("tree_alerts"),
        countOf("oasis_leaderboard"),
      ]);
      const { data: wishRows } = await supabase.from("tree_reports").select("wishes");
      const wishes = (wishRows ?? []).reduce((sum, r) => sum + (r.wishes ?? 0), 0);
      setStats({ reports, subscriptions, alerts, leaderboard, wishes });

      const { data: reportRows } = await supabase
        .from("tree_reports")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);
      setReports((reportRows ?? []) as ReportRow[]);

      const { data: subRows } = await supabase
        .from("tree_subscriptions")
        .select("id, tree_id, tree_label, created_at")
        .order("created_at", { ascending: false })
        .limit(10);
      setSubs((subRows ?? []) as SubRow[]);

      const { data: boardRows } = await supabase.from("oasis_leaderboard").select("*").limit(100);
      setBoard(rankEntries((boardRows ?? []) as LeaderboardEntry[]).slice(0, 10));

      const { data: activityRows, error: actErr } = await supabase.rpc("admin_user_activity");
      if (!actErr) setActivity((activityRows ?? []) as ActivityRow[]);

      const { data: fbRows } = await supabase
        .from("user_feedback")
        .select("id, message, page, created_at")
        .order("created_at", { ascending: false })
        .limit(50);
      setFeedback((fbRows ?? []) as FeedbackRow[]);
    } catch {
      toast.error("後台資料讀取失敗，請稍後重試");
    }
    setLoading(false);
  }, []);
  useEffect(() => { if (isAdmin) void load(); }, [isAdmin, load]);

  const claimAdmin = async () => {
    if (!user) return;
    setClaiming(true);
    const { error } = await supabase.from("user_roles").insert({ user_id: user.id, role: "admin" });
    setClaiming(false);
    if (error) {
      toast.error("無法取得管理員身分：系統已有管理員，請請現有管理員協助");
      return;
    }
    toast.success("你已成為第一位管理員");
    void checkAdmin();
  };

  const deleteReport = async (id: string) => {
    if (!window.confirm("確定刪除這筆通報？此操作無法復原。")) return;
    const { error } = await supabase.from("tree_reports").delete().eq("id", id);
    if (error) { toast.error("刪除失敗，請重試"); return; }
    toast.success("已刪除通報");
    void load();
  };

  const resetSimData = async () => {
    if (!window.confirm("確定清除所有模擬數據？真實使用者的資料不受影響，此操作無法復原。")) return;
    const { data, error } = await supabase.rpc("admin_reset_sim_data");
    if (error) { toast.error("清除失敗，請重試"); return; }
    const r = data as { reports: number; subscriptions: number; alerts: number; leaderboard: number };
    toast.success(`已清除模擬數據：通報 ${r.reports}、訂閱 ${r.subscriptions}、預警 ${r.alerts}、排行榜 ${r.leaderboard}`);
    void load();
  };

  return (
    <>
      <div className="section-top">
        <div>
          <p className="eyebrow">ADMIN CONSOLE</p>
          <h1 className="page-title">後台管理</h1>
          <p className="muted">站務數據總覽，僅管理員可見。目前顯示的是<b>模擬數據</b>，用於展示與測試。</p>
        </div>
        {isAdmin && (
          <button className="outline-btn" onClick={load} disabled={loading}>
            <RefreshCw size={16} /> 重新整理
          </button>
        )}
      </div>

      {authLoading ? (
        <div className="tbx-card"><p className="muted">讀取中…</p></div>
      ) : !user ? (
        <div className="tbx-card">
          <p className="muted">後台管理僅限管理員。請先登入。</p>
          <button className="tbx-primary" onClick={() => setAuthOpen(true)}><LogIn size={16} /> 登入</button>
        </div>
      ) : isAdmin === null ? (
        <div className="tbx-card"><p className="muted">確認權限中…</p></div>
      ) : !isAdmin ? (
        <div className="tbx-card">
          <p className="muted"><ShieldQuestion size={16} /> 你的帳號沒有管理員權限。</p>
          <p className="muted">如果系統還沒有任何管理員，第一位登入者可以取得管理員身分：</p>
          <button className="tbx-primary" onClick={claimAdmin} disabled={claiming}>
            <ShieldCheck size={16} /> {claiming ? "設定中…" : "成為第一位管理員"}
          </button>
        </div>
      ) : (
        <>
          <div className="tbx-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
              <h2 style={{ margin: 0 }}>數據總覽</h2>
              <button className="outline-btn" onClick={resetSimData}>
                <Eraser size={16} /> 一鍵清除模擬數據
              </button>
            </div>
            {loading && !stats ? <p className="muted">讀取中…</p> : stats && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
                {[
                  { label: "見縫插樹通報", value: stats.reports },
                  { label: "累計集氣", value: stats.wishes },
                  { label: "大樹守護訂閱", value: stats.subscriptions },
                  { label: "模擬預警", value: stats.alerts },
                  { label: "排行榜成績", value: stats.leaderboard },
                ].map((s) => (
                  <div key={s.label} style={{ border: "1px solid rgba(29,74,56,.15)", borderRadius: 10, padding: "12px 14px" }}>
                    <p style={{ fontSize: 26, fontWeight: 700, margin: 0 }}>{s.value}</p>
                    <p className="muted" style={{ margin: 0 }}>{s.label}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="tbx-card" style={{ marginTop: 16 }}>
            <h2>最新通報（前 10 筆）</h2>
            {reports.length === 0 ? <p className="muted">尚無通報。</p> : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ textAlign: "left" }}>
                    <th>時間</th><th>行政區</th><th>分類</th><th>內容</th><th>集氣</th><th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((r) => (
                    <tr key={r.id} style={{ borderTop: "1px solid rgba(29,74,56,.12)" }}>
                      <td style={{ padding: "8px" }}>{formatReportTime(r.created_at)}</td>
                      <td>{r.district}</td>
                      <td>{r.kind}</td>
                      <td>{r.note.slice(0, 24)}{r.note.length > 24 ? "…" : ""}</td>
                      <td>{r.wishes}</td>
                      <td>
                        <button className="outline-btn" onClick={() => deleteReport(r.id)} title="刪除這筆通報">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="tbx-card" style={{ marginTop: 16 }}>
            <h2>最新守護訂閱（前 10 筆）</h2>
            {subs.length === 0 ? <p className="muted">尚無訂閱。</p> : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ textAlign: "left" }}>
                    <th>時間</th><th>樹木編號</th><th>樹木</th>
                  </tr>
                </thead>
                <tbody>
                  {subs.map((s) => (
                    <tr key={s.id} style={{ borderTop: "1px solid rgba(29,74,56,.12)" }}>
                      <td style={{ padding: "8px" }}>{formatReportTime(s.created_at)}</td>
                      <td>{s.tree_id}</td>
                      <td>{s.tree_label}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="tbx-card" style={{ marginTop: 16 }}>
            <h2>排行榜前 10 名</h2>
            {board.length === 0 ? <p className="muted">尚無成績。</p> : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ textAlign: "left" }}>
                    <th>名次</th><th>玩家</th><th>角色</th><th>種樹</th><th>TES 改善</th>
                  </tr>
                </thead>
                <tbody>
                  {board.map((e, i) => (
                    <tr key={e.user_id} style={{ borderTop: "1px solid rgba(29,74,56,.12)" }}>
                      <td style={{ padding: "8px" }}>{medalFor(i)}</td>
                      <td>{e.display_name}</td>
                      <td>{ROLES[e.role].name}</td>
                      <td>{e.trees} 棵</td>
                      <td>+{e.improvement}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="tbx-card" style={{ marginTop: 16 }}>
            <h2>用戶活動總覽（{activity.length} 位註冊用戶）</h2>
            {activity.length === 0 ? <p className="muted">尚無註冊用戶。</p> : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ textAlign: "left" }}>
                      <th>用戶</th><th>註冊時間</th><th>通報</th><th>守護訂閱</th><th>預警</th><th>3D 成績</th><th>綠洲進度</th><th>回饋</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activity.map((a) => (
                      <tr key={a.user_id} style={{ borderTop: "1px solid rgba(29,74,56,.12)" }}>
                        <td style={{ padding: "8px" }}>{a.email}</td>
                        <td>{formatReportTime(a.signed_up_at)}</td>
                        <td>{a.reports}</td>
                        <td>{a.subscriptions}</td>
                        <td>{a.alerts}</td>
                        <td>{a.plant3d_scores}</td>
                        <td>{a.oasis_played ? "有" : "—"}</td>
                        <td>{a.feedback}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="tbx-card" style={{ marginTop: 16 }}>
            <h2>用戶回饋（最新 50 則）</h2>
            {feedback.length === 0 ? <p className="muted">尚無回饋。用戶可從頁尾「意見回饋」送出。</p> : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ textAlign: "left" }}>
                    <th>時間</th><th>來自頁面</th><th>內容</th>
                  </tr>
                </thead>
                <tbody>
                  {feedback.map((f) => (
                    <tr key={f.id} style={{ borderTop: "1px solid rgba(29,74,56,.12)" }}>
                      <td style={{ padding: "8px", whiteSpace: "nowrap" }}>{formatReportTime(f.created_at)}</td>
                      <td>{f.page || "—"}</td>
                      <td>{f.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
      <PlayerAuthDialog open={authOpen} onOpenChange={setAuthOpen} title="登入後台" description="後台管理僅限管理員帳號。" />
    </>
  );
}
