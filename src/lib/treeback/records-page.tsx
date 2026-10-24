import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { LogIn, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { usePlayer } from "./player-auth";
import { PlayerAuthDialog } from "./player-auth-dialog";

type Summary = { week_start: string; summary: string; created_at: string };

export function RecordsPage() {
  const { user, loading: authLoading } = usePlayer();
  const [list, setList] = useState<Summary[]>([]);
  const [loading, setLoading] = useState(true);
  const [authOpen, setAuthOpen] = useState(false);

  const load = useCallback(async () => {
    if (!user) { setList([]); setLoading(false); return; }
    setLoading(true);
    const { data, error } = await supabase
      .from("oasis_weekly_summaries")
      .select("week_start, summary, created_at")
      .order("week_start", { ascending: false })
      .limit(24);
    if (error) { toast.error("遊戲紀錄讀取失敗，請稍後重試"); setLoading(false); return; }
    setList(data ?? []);
    setLoading(false);
  }, [user]);
  useEffect(() => { void load(); }, [load]);

  return (
    <>
      <div className="section-top">
        <div>
          <p className="eyebrow">P2 · WEEKLY AI RECAP</p>
          <h1 className="page-title">我的遊戲紀錄</h1>
          <p className="muted">每週由 AI 整理你的城市綠洲進度。內容是 AI 根據<b>虛構遊戲參數</b>產生的回顧，不是真實環境成果。</p>
        </div>
      </div>

      <div className="tbx-card">
        {authLoading || loading ? <p className="muted">讀取中…</p> : !user ? (
          <>
            <p className="muted">登入後，系統每週一會自動用 AI 整理你的遊戲進度，只有你能看到。</p>
            <button className="tbx-primary" onClick={() => setAuthOpen(true)}><LogIn size={16} /> 登入查看紀錄</button>
          </>
        ) : list.length === 0 ? (
          <p className="muted">還沒有每週回顧。到<a href="/oasis">城市綠洲遊戲</a>玩一局，下週一 AI 就會為你整理第一篇。</p>
        ) : (
          list.map((s) => (
            <article key={s.week_start} style={{ borderTop: "1px solid rgba(29,74,56,.12)", padding: "14px 0" }}>
              <p className="eyebrow"><Sparkles size={13} /> {s.week_start} 這一週 · AI 整理</p>
              <p>{s.summary}</p>
            </article>
          ))
        )}
      </div>
      <PlayerAuthDialog open={authOpen} onOpenChange={setAuthOpen} title="登入查看遊戲紀錄" description="每週 AI 回顧只保存在你的帳號，只有你能看到。" />
    </>
  );
}
