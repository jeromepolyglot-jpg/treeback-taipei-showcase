import { useState } from "react";
import { DISTRICTS, band, proposalScore, rank } from "./model";

import geo from "./taipei-geo.json";

const PATHS = geo.paths as Record<string, string>;
const COUNTS = geo.treeCounts as Record<string, number>;
const MAXC = Math.max(...Object.values(COUNTS));

type Layer = "tes" | "trees";

export function MapPage() {
  const ranked = rank();
  const [layer, setLayer] = useState<Layer>("trees");
  const [sel, setSel] = useState("大同區");
  const d = ranked.find((r) => r.name === sel)!;
  const p = proposalScore(d);

  const fill = (r: (typeof ranked)[number]) => {
    if (layer === "trees") return `color-mix(in oklch, #2f6b45 ${Math.round(((COUNTS[r.name] ?? 0) / MAXC) * 100)}%, #f4ecd8)`;
    const b = band(r.PPI);
    return b === "high" ? "#c4572e" : b === "mid" ? "#e3a55b" : "#9fbf7a";
  };

  return (
    <>
      <div className="section-top">
        <div>
          <p className="eyebrow">P0 · SHADE EQUITY MAP</p>
          <h1 className="page-title">樹蔭公平地圖</h1>
          <p className="muted">行政區邊界為真實資料；「受保護樹木」圖層為文化局官方資料；「情境 TES」圖層仍是展示假設，不是實測。</p>
        </div>
        <div className="tbx-seg" role="group" aria-label="圖層">
          {([["trees", "受保護樹木（官方）"], ["tes", "情境 TES（假設）"]] as const).map(([k, l]) => (
            <button key={k} className={layer === k ? "on" : ""} onClick={() => setLayer(k)}>{l}</button>
          ))}
        </div>
      </div>

      <div className="tbx-map-wrap">
        <svg viewBox={`0 0 ${geo.width} ${geo.height}`} className="tbx-map" role="img" aria-label="台北 12 行政區地圖">
          {ranked.map((r) => (
            <path key={r.name} d={PATHS[r.name]} fill={fill(r)} stroke={sel === r.name ? "#1f2a22" : "#f7f5ee"}
              strokeWidth={sel === r.name ? 3 : 1.5} onClick={() => setSel(r.name)} style={{ cursor: "pointer" }}>
              <title>{r.name}</title>
            </path>
          ))}
        </svg>
        <aside className="tbx-card">
          <p className="eyebrow">第 {d.rank} 名</p>
          <h2>{d.name}</h2>
          <dl>
            <dt>受保護樹木（官方）</dt><dd>{COUNTS[d.name] ?? 0} 棵</dd>
            <dt>假設樹冠 C</dt><dd>{d.C}%（假設）</dd>
            <dt>情境 TES</dt><dd>{d.TES.toFixed(1)}（假設）</dd>
            <dt>方案書版分數</dt><dd>{p.raw.toFixed(1)}（假設）</dd>
          </dl>
          <p className="muted">點地圖上的行政區切換。受保護樹木多寡反映老樹分布，不等於樹冠覆蓋或樹蔭充足。</p>
          <p className="tbx-src">來源：邊界 <a href="https://github.com/g0v/twgeojson" target="_blank" rel="noopener noreferrer">g0v twgeojson ↗</a>（內政部鄉鎮界，已簡化）；樹木 <a href="https://data.taipei/dataset/detail?id=d9d1140b-c2c3-405f-8dd1-7b87b00f6f53" target="_blank" rel="noopener noreferrer">臺北市受保護樹木 ↗</a>（文化局，2026-03-23 版，共 3,874 筆）。</p>
        </aside>
      </div>

      <section className="field-section">
        <h2>兩套公式差在哪裡？</h2>
        <div className="tbx-compare">
          <article>
            <b>現有版（網站採用）</b>
            <code>G = 1 − C/24<br />S = 0.40H + 0.35P + 0.25V（可調）<br />TES = 100 − 100·G·(0.5+0.5S)</code>
          </article>
          <article>
            <b>方案書版</b>
            <code>Gap = (30 − C)/30 × 100<br />SVI = 0.4H + 0.3P + 0.3V（×100）<br />TES = Gap × (100 − SVI)</code>
          </article>
        </div>
        <ul className="tbx-list">
          <li><b>樹冠目標：</b>24% vs 30%。目標越高，每區缺口都變大。</li>
          <li><b>權重：</b>40/35/25 可拖拉 vs 固定 40/30/30，方案書更重視脆弱度。</li>
          <li><b>方向相反：</b>現有版「TES 越低越優先」；方案書的式子是缺口越大、分數越高，但文字又寫「越低越優先」，兩者互相矛盾。</li>
          <li><b>脆弱度作用：</b>現有版脆弱度越高 → 越優先；方案書乘上 (100 − SVI)，脆弱度越高分數反而越小，等於降低高風險區的需求。</li>
          <li><b>範圍：</b>方案書原式最大到 10,000，需再除以 100 才落在 0–100（下表已換算）。</li>
        </ul>
        <table className="tbx-table">
          <thead><tr><th>行政區</th><th>現有版 TES</th><th>方案書 Gap</th><th>SVI</th><th>方案書分數</th></tr></thead>
          <tbody>
            {DISTRICTS.map((x) => {
              const r = ranked.find((y) => y.name === x.name)!;
              const q = proposalScore(x);
              return <tr key={x.name}><td>{x.name}</td><td>{r.TES.toFixed(1)}</td><td>{q.gap.toFixed(1)}</td><td>{q.SVI.toFixed(1)}</td><td>{q.raw.toFixed(1)}</td></tr>;
            })}
          </tbody>
        </table>
      </section>
    </>
  );
}
