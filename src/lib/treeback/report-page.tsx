import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { LogIn } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { usePlayer } from "./player-auth";
import { PlayerAuthDialog } from "./player-auth-dialog";
import {
  REPORT_KINDS, REPORT_DISTRICTS, REPORT_NOTE_MAX,
  isValidReportInput, photoPathFor, canManageReport, formatReportTime,
  type ReportRow,
} from "./report-model";

type Report = ReportRow & { photoUrl: string | null };

async function withPhotoUrls(rows: ReportRow[]): Promise<Report[]> {
  const paths = rows.map((r) => r.photo_path).filter((p): p is string => p !== null);
  const signed = new Map<string, string>();
  if (paths.length > 0) {
    const { data } = await supabase.storage.from("report-photos").createSignedUrls(paths, 3600);
    for (const item of data ?? []) {
      if (item.path && item.signedUrl) signed.set(item.path, item.signedUrl);
    }
  }
  return rows.map((r) => ({ ...r, photoUrl: r.photo_path ? (signed.get(r.photo_path) ?? null) : null }));
}

function compressPhoto(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const s = Math.min(1, 1280 / img.width);
      const c = document.createElement("canvas");
      c.width = img.width * s; c.height = img.height * s;
      c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
      c.toBlob((b) => (b ? resolve(b) : reject(new Error("compress failed"))), "image/jpeg", 0.75);
    };
    img.onerror = () => reject(new Error("image load failed"));
    img.src = URL.createObjectURL(file);
  });
}

export function ReportPage() {
  const { user } = usePlayer();
  const [list, setList] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [kind, setKind] = useState<string>(REPORT_KINDS[0]);
  const [district, setDistrict] = useState<string>(REPORT_DISTRICTS[0]);
  const [note, setNote] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [geo, setGeo] = useState<[number, number] | null>(null);
  const [card, setCard] = useState<Report | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("tree_reports")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) { toast.error("通報列表讀取失敗，請稍後重試"); setLoading(false); return; }
    setList(await withPhotoUrls(data ?? []));
    setLoading(false);
  }, []);
  useEffect(() => { void load(); }, [load]);

  const onPhoto = (f?: File) => {
    if (!f) return;
    setPhoto(f);
    setPreview(URL.createObjectURL(f));
  };
  const locate = () => {
    if (!navigator.geolocation) { toast.error("此裝置不支援定位"); return; }
    navigator.geolocation.getCurrentPosition(
      (p) => { setGeo([p.coords.latitude, p.coords.longitude]); toast.success("已取得位置"); },
      () => toast.error("無法取得位置，可略過"),
    );
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { setAuthOpen(true); return; }
    const trimmed = note.trim().slice(0, REPORT_NOTE_MAX);
    if (!isValidReportInput(kind, district, trimmed)) { toast.error("請確認分類、行政區與說明長度"); return; }
    setSubmitting(true);
    try {
      const { data: row, error } = await supabase
        .from("tree_reports")
        .insert({ user_id: user.id, kind, district, note: trimmed, lat: geo?.[0] ?? null, lng: geo?.[1] ?? null })
        .select()
        .single();
      if (error || !row) throw error ?? new Error("insert failed");
      if (photo) {
        const blob = await compressPhoto(photo);
        const path = photoPathFor(user.id, row.id);
        const { error: upErr } = await supabase.storage.from("report-photos").upload(path, blob, { contentType: "image/jpeg" });
        if (upErr) throw upErr;
        const { error: linkErr } = await supabase.from("tree_reports").update({ photo_path: path }).eq("id", row.id);
        if (linkErr) throw linkErr;
        row.photo_path = path;
      }
      const [withUrl] = await withPhotoUrls([row]);
      setList((l) => [withUrl!, ...l]);
      setCard(withUrl!);
      setNote(""); setPhoto(null); setPreview(null); setGeo(null);
      toast.success("通報已送出，所有人都能看到");
    } catch {
      toast.error("送出失敗，請稍後重試");
    } finally {
      setSubmitting(false);
    }
  };

  const wish = async (r: Report) => {
    setList((l) => l.map((x) => (x.id === r.id ? { ...x, wishes: x.wishes + 1 } : x)));
    const { error } = await supabase.rpc("increment_wishes", { _report_id: r.id });
    if (error) { setList((l) => l.map((x) => (x.id === r.id ? { ...x, wishes: x.wishes - 1 } : x))); toast.error("集氣失敗，請重試"); }
  };
  const remove = async (r: Report) => {
    const { error } = await supabase.from("tree_reports").delete().eq("id", r.id);
    if (error) { toast.error("刪除失敗，請重試"); return; }
    if (r.photo_path) await supabase.storage.from("report-photos").remove([r.photo_path]);
    setList((l) => l.filter((x) => x.id !== r.id));
    toast.success("已刪除通報");
  };
  const share = async (r: Report) => {
    const text = `我在 ${r.district} 許願種一棵樹！（${r.kind}）#TreeBack 見縫插樹`;
    if (navigator.share) { try { await navigator.share({ text }); } catch { /* cancelled */ } }
    else { await navigator.clipboard.writeText(text); toast.success("分享文字已複製"); }
  };

  return (
    <>
      <div className="section-top">
        <div>
          <p className="eyebrow">P0 · CROWDSOURCED SPOTTING</p>
          <h1 className="page-title">見縫插樹通報</h1>
          <p className="muted">通報會存入資料庫並公開展示；內容為市民回報，未經市府查證，也不代表可以種植。</p>
        </div>
      </div>

      <div className="tbx-two">
        <form className="tbx-card" onSubmit={submit}>
          <h2>1. 看到可以種樹的縫？</h2>
          <div className="tbx-seg" role="group" aria-label="分類">
            {REPORT_KINDS.map((k) => <button type="button" key={k} className={kind === k ? "on" : ""} onClick={() => setKind(k)}>{k}</button>)}
          </div>
          <label>行政區
            <select value={district} onChange={(e) => setDistrict(e.target.value)}>{REPORT_DISTRICTS.map((d) => <option key={d}>{d}</option>)}</select>
          </label>
          <label>說明（選填）
            <textarea maxLength={REPORT_NOTE_MAX} value={note} onChange={(e) => setNote(e.target.value)} placeholder="例如：延平北路二段騎樓前，樹穴被水泥填平" />
          </label>
          <label>現場照片（選填，請勿拍到人臉車牌）
            <input type="file" accept="image/*" capture="environment" onChange={(e) => onPhoto(e.target.files?.[0])} />
          </label>
          {preview && <img src={preview} alt="預覽" className="tbx-photo" />}
          <button type="button" className="outline-btn" onClick={locate}>📍 {geo ? `${geo[0].toFixed(4)}, ${geo[1].toFixed(4)}` : "抓取 GPS"}</button>
          <p className="muted">權屬（市有地／私有地）需人工查核，本版不自動判讀。</p>
          {user ? (
            <button type="submit" className="tbx-primary" disabled={submitting}>{submitting ? "送出中…" : "送出通報"}</button>
          ) : (
            <button type="button" className="tbx-primary" onClick={() => setAuthOpen(true)}><LogIn size={16} /> 登入後送出通報</button>
          )}
        </form>

        <div>
          {card && (
            <div className="tbx-wishcard">
              <p className="eyebrow">樹穴卡片 #{card.id.slice(0, 8)}</p>
              {card.photoUrl && <img src={card.photoUrl} alt="" />}
              <h2>這棵樹我許願的！</h2>
              <p>{card.district} · {card.kind}</p>
              {card.note && <p className="muted">{card.note}</p>}
              <button className="outline-btn" onClick={() => share(card)}>分享集氣 ↗</button>
            </div>
          )}
          <div className="tbx-card">
            <h2>樹能降多少溫？研究怎麼說</h2>
            <p className="muted">目前沒有台北街道「每種一棵樹降幾度」的可靠數據，所以這裡不做估算，只列出經同儕審查的研究結果。</p>
            <ul className="tbx-list">
              <li>歐洲 293 座城市衛星觀測：夏季樹木覆蓋處的<b>地表溫度</b>比密集建成區低，南歐平均約 0–4 K、中歐約 8–12 K。（地表溫度不等於體感氣溫）
                <br /><a href="https://doi.org/10.1038/s41467-021-26768-w" target="_blank" rel="noopener noreferrer">Schwaab et al., 2021, Nature Communications ↗</a></li>
              <li>美國麥迪遜街區實測：樹冠覆蓋超過約 40% 時，白天<b>氣溫</b>下降才明顯加速；零星幾棵效果有限。
                <br /><a href="https://doi.org/10.1073/pnas.1817561116" target="_blank" rel="noopener noreferrer">Ziter et al., 2019, PNAS ↗</a></li>
            </ul>
            <p className="muted">這些都不是台北的研究，不能直接套用到台北的街道。</p>
          </div>
        </div>
      </div>

      <section className="field-section">
        <h2>大家的通報（{list.length}）</h2>
        {loading ? <p className="muted">讀取中…</p> : list.length === 0 ? <p className="muted">還沒有通報，成為第一個許願的人。</p> : (
          <div className="tbx-grid">
            {list.map((r) => (
              <article key={r.id} className="tbx-card">
                {r.photoUrl && <img src={r.photoUrl} alt="" className="tbx-photo" />}
                <b>{r.district} · {r.kind}</b>
                {r.note && <p>{r.note}</p>}
                <small className="muted">{formatReportTime(r.created_at)}{r.lat != null && ` · ${r.lat.toFixed(4)}, ${r.lng!.toFixed(4)}`}</small>
                <div className="tbx-row">
                  <button className="outline-btn" onClick={() => wish(r)}>🌱 集氣 {r.wishes}</button>
                  <button className="outline-btn" onClick={() => setCard(r)}>看卡片</button>
                  {canManageReport(r, user?.id ?? null) && <button className="outline-btn" onClick={() => remove(r)}>刪除</button>}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
      <PlayerAuthDialog open={authOpen} onOpenChange={setAuthOpen} title="登入後送出通報" description="通報會公開展示並標示為市民回報；登入才能送出與管理自己的通報。" />
    </>
  );
}
