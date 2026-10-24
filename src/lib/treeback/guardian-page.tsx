import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { LogIn } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { usePlayer } from "./player-auth";
import { PlayerAuthDialog } from "./player-auth-dialog";

type Row = [string, string, string | null, string, number | null, number | null, number | null, string];
type Alert = { id: string; tree_id: string; message: string; read: boolean; created_at: string };
const DISTRICTS = ["全部", "大同區", "萬華區", "中正區", "中山區", "松山區", "大安區", "信義區", "南港區", "士林區", "內湖區", "北投區", "文山區"];
const SRC = "https://data.taipei/dataset/detail?id=d9d1140b-c2c3-405f-8dd1-7b87b00f6f53";

export function GuardianPage() {
  const { user } = usePlayer();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [dist, setDist] = useState("大同區");
  const [q, setQ] = useState("");
  const [subs, setSubs] = useState<string[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [authOpen, setAuthOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/data/protected-trees.json").then((r) => r.json()).then((d) => setRows(d.rows)).catch(() => setFailed(true));
  }, []);

  const loadMine = useCallback(async () => {
    if (!user) { setSubs([]); setAlerts([]); return; }
    const [{ data: s, error: se }, { data: a, error: ae }] = await Promise.all([
      supabase.from("tree_subscriptions").select("tree_id").eq("user_id", user.id),
      supabase.from("tree_alerts").select("id, tree_id, message, read, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50),
    ]);
    if (se || ae) { toast.error("訂閱資料讀取失敗，請稍後重試"); return; }
    setSubs((s ?? []).map((r) => r.tree_id));
    setAlerts(a ?? []);
  }, [user]);
  useEffect(() => { void loadMine(); }, [loadMine]);

  const list = useMemo(() => {
    if (!rows) return [];
    const k = q.trim();
    return rows.filter((r) => (dist === "全部" || r[2] === dist) && (!k || r[1].includes(k) || r[3].includes(k) || r[0] === k));
  }, [rows, dist, q]);

  const toggle = async (r: Row) => {
    if (!user) { setAuthOpen(true); return; }
    if (busy) return;
    setBusy(true);
    try {
      if (subs.includes(r[0])) {
        const { error } = await supabase.from("tree_subscriptions").delete().eq("user_id", user.id).eq("tree_id", r[0]);
        if (error) throw error;
        setSubs((s) => s.filter((x) => x !== r[0]));
        toast.success("已取消訂閱");
      } else {
        const { error } = await supabase.from("tree_subscriptions").insert({ user_id: user.id, tree_id: r[0], tree_label: `${r[1]}（${r[3]}）` });
        if (error) throw error;
        setSubs((s) => [...s, r[0]]);
        toast.success(`已訂閱 ${r[1]}`);
      }
    } catch { toast.error("操作失敗，請稍後重試"); }
    finally { setBusy(false); }
  };

  const simulate = async () => {
    if (!user) { setAuthOpen(true); return; }
    const mine = rows?.filter((r) => subs.includes(r[0])) ?? [];
    const t = mine[Math.floor(Math.random() * mine.length)];
    if (!t) { toast.error("請先訂閱至少一棵樹"); return; }
    const message = `${t[1]}（編號 ${t[0]}）：【模擬】鄰近工程提出移植申請`;
    const { data, error } = await supabase.from("tree_alerts").insert({ user_id: user.id, tree_id: t[0], message }).select("id, tree_id, message, read, created_at").single();
    if (error || !data) { toast.error("預警建立失敗，請重試"); return; }
    setAlerts((a) => [data, ...a]);
    toast.warning(message);
  };
  const markRead = async (a: Alert) => {
    if (a.read) return;
    setAlerts((l) => l.map((x) => (x.id === a.id ? { ...x, read: true } : x)));
    await supabase.from("tree_alerts").update({ read: true }).eq("id", a.id);
  };

  return (
    <>
      <div className="section-top">
        <div>
          <p className="eyebrow">P1 · TREE GUARDIAN</p>
          <h1 className="page-title">大樹守護與預警</h1>
          <p className="muted">
            樹木清單是官方真實資料；訂閱會存進你的帳號，換裝置也看得到。工程預警目前沒有可用的公開資料來源，通知都是<b>模擬</b>，也不會發 LINE。
          </p>
        </div>
        {user ? (
          <button className="tbx-primary" onClick={simulate}>模擬一則工程通報</button>
        ) : (
          <button className="tbx-primary" onClick={() => setAuthOpen(true)}><LogIn size={16} /> 登入後訂閱樹木</button>
        )}
      </div>

      <div className="tbx-row" style={{ marginBottom: 16 }}>
        <label className="tbx-inline">行政區
          <select value={dist} onChange={(e) => setDist(e.target.value)}>{DISTRICTS.map((d) => <option key={d}>{d}</option>)}</select>
        </label>
        <label className="tbx-inline">搜尋樹種／地址／編號
          <input value={q} maxLength={40} onChange={(e) => setQ(e.target.value)} placeholder="例如：榕、迪化街" />
        </label>
      </div>

      <div className="tbx-two">
        <div>
          {failed && <p>資料載入失敗，請重新整理。</p>}
          {!rows && !failed && <p className="muted">載入官方資料中…</p>}
          {rows && <p className="muted">共 {list.length} 棵{list.length > 60 && "，顯示前 60 棵"}</p>}
          <div className="tbx-grid">
            {list.slice(0, 60).map((r) => (
              <article key={r[0]} className="tbx-card">
                <p className="eyebrow">受保護樹木 · 編號 {r[0]}</p>
                <h2>{r[1]}</h2>
                <p>{r[3]}</p>
                <small className="muted">
                  {r[4] != null && `胸徑 ${r[4]} m · `}管理：{r[7]}
                  {r[5] != null && (
                    <> · <a href={`https://www.openstreetmap.org/?mlat=${r[5]}&mlon=${r[6]}#map=19/${r[5]}/${r[6]}`} target="_blank" rel="noopener noreferrer">地圖 ↗</a></>
                  )}
                </small>
                <button className={subs.includes(r[0]) ? "tbx-primary" : "outline-btn"} onClick={() => toggle(r)}>
                  {subs.includes(r[0]) ? "✓ 已訂閱" : "訂閱這棵樹"}
                </button>
              </article>
            ))}
          </div>
        </div>
        <aside className="tbx-card">
          <h2>預警收件匣（模擬）</h2>
          <p className="muted">{user ? `已訂閱 ${subs.length} 棵，通知會保存在你的帳號。` : "登入後才能訂閱並保存通知。"}</p>
          {user && alerts.length === 0 && <p className="muted">訂閱後按「模擬一則工程通報」看看效果。</p>}
          {alerts.map((a) => (
            <p key={a.id} style={{ opacity: a.read ? 0.55 : 1 }}>
              ⚠️ {a.message}<br />
              <small className="muted">{new Date(a.created_at).toLocaleString("zh-TW", { hour12: false })}</small>
              {!a.read && <> <button className="text-button" onClick={() => markRead(a)}>標為已讀</button></>}
            </p>
          ))}
          <p className="tbx-src">
            樹木資料來源：<a href={SRC} target="_blank" rel="noopener noreferrer">臺北市政府文化局「臺北市受保護樹木」↗</a>，
            data.taipei 2026-03-23 版，3,874 筆，政府資料開放授權條款第 1 版。收錄期間至 2023-04-11，可能已有異動，請以
            <a href="https://eculture.gov.taipei/trees/zh-tw" target="_blank" rel="noopener noreferrer">受保護樹木資訊平臺 ↗</a>為準。
          </p>
        </aside>
      </div>
      <PlayerAuthDialog open={authOpen} onOpenChange={setAuthOpen} title="登入後訂閱樹木" description="訂閱與預警通知會保存在你的帳號，只有你能看到。" />
    </>
  );
}
