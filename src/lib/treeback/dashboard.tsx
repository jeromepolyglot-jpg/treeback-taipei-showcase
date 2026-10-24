import { useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  DEFAULT_WEIGHTS,
  GOAL,
  band,
  csvFor,
  rank,
  redistribute,
  type Weights,
  type WeightKey,
} from "@/lib/treeback/model";

const KEYS: WeightKey[] = ["H", "P", "V"];

const LABELS: Record<WeightKey, [string, string, string]> = {
  H: ["熱暴露", "HEAT EXPOSURE", "夏季熱風險的情境代理值"],
  P: ["人口暴露", "POPULATION", "生活圈人口密度的情境代理值"],
  V: ["熱脆弱度", "VULNERABILITY", "長者與兒少需求的情境代理值"],
};

const PRESETS: { id: string; label: string; weights: Weights }[] = [
  { id: "default", label: "基準 40 / 35 / 25", weights: DEFAULT_WEIGHTS },
  { id: "heat", label: "熱風險優先", weights: { H: 60, P: 25, V: 15 } },
  { id: "people", label: "人口優先", weights: { H: 25, P: 60, V: 15 } },
  { id: "vulnerable", label: "脆弱度優先", weights: { H: 25, P: 25, V: 50 } },
];

const f = (n: number) => n.toFixed(1);
const signed = (n: number) =>
  `${n > 0.00001 ? "+" : ""}${Math.abs(n) < 0.00001 ? "0.0" : f(n)}`;
const glyph = (n: number) => (n > 0 ? "↑" : n < 0 ? "↓" : "—");

export function Dashboard() {
  const [weights, setWeights] = useState<Weights>({ ...DEFAULT_WEIGHTS });
  const [selected, setSelected] = useState("大同區");
  const [metric, setMetric] = useState<"TES" | "PPI">("TES");
  const [pilotOnly, setPilotOnly] = useState(false);
  const [toast, setToast] = useState("");
  const toastTimer = useRef<number | undefined>(undefined);

  const baseline = useMemo(() => rank(), []);
  const baseByName = useMemo(
    () => new Map(baseline.map((d) => [d.name, d])),
    [baseline],
  );
  const results = useMemo(() => rank(weights), [weights]);

  const average = results.reduce((s, d) => s + d.TES, 0) / results.length;
  const averageBase =
    baseline.reduce((s, d) => s + d.TES, 0) / baseline.length;
  const highCount = results.filter((d) => d.PPI >= 40).length;

  const detail = (results.find((d) => d.name === selected) ?? results[0])!;
  const detailBase = baseByName.get(detail.name) ?? detail;
  const detailChange = detailBase.rank - detail.rank;

  const showToast = (text: string) => {
    setToast(text);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(""), 3000);
  };

  const downloadCsv = () => {
    const blob = new Blob([csvFor(weights)], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `TreeBack_情境_H${weights.H}_P${weights.P}_V${weights.V}.csv`;
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast("已匯出目前情境。CSV 保留假設輸入與權重。");
  };

  return (
    <>
      <div className="section-top">
        <div>
          <p className="eyebrow">01 / WEIGHT EXPLORER</p>
          <h2>你的選擇，如何改變優先序？</h2>
        </div>
        <button className="outline-btn" id="export-csv" onClick={downloadCsv}>
          <span aria-hidden="true">↓</span> 匯出此情境 CSV
        </button>
      </div>

      <div className="lab-layout">
        <aside className="control-panel">
          <div className="panel-title">
            <h3>調整需求權重</h3>
            <span className="small-tag">總和 100%</span>
          </div>
          <p className="muted small">
            拖曳一項，其他兩項按原比例重新分配。三項權重皆為情境設定。
          </p>
          <div className="weight-controls">
            {KEYS.map((k) => (
              <div className="weight-control" key={k}>
                <div className="weight-label">
                  <label htmlFor={`weight-${k}`}>
                    <span className={`factor-letter factor-${k}`}>{k}</span>{" "}
                    {LABELS[k][0]}
                  </label>
                  <span className="weight-number" id={`number-${k}`}>
                    {weights[k]}
                    <small>%</small>
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  id={`weight-${k}`}
                  value={weights[k]}
                  aria-describedby="weight-rule"
                  aria-valuetext={`${weights[k]}%`}
                  style={{
                    background: `linear-gradient(to right, var(--ink) ${weights[k]}%, #e7ebe2 ${weights[k]}%)`,
                  }}

                  onChange={(e) =>
                    setWeights(redistribute(weights, k, Number(e.target.value)))
                  }
                />
                <p>{LABELS[k][2]}</p>
              </div>
            ))}
          </div>
          <p id="weight-rule" className="rule-note">
            整數取捨後仍維持 100%；當其他兩項皆為 0%，剩餘權重均分。
          </p>
          <div className="preset-label">快速情境</div>
          <div className="presets">
            {PRESETS.map((preset) => {
              const active = KEYS.every((k) => preset.weights[k] === weights[k]);
              return (
                <button
                  key={preset.id}
                  data-preset={preset.id}
                  className={`preset-btn${active ? " active" : ""}`}
                  aria-pressed={active}
                  onClick={() => setWeights({ ...preset.weights })}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
          <div className="goal-note">
            <span>固定樹冠目標（假設）</span>
            <strong>
              {GOAL}
              <small>%</small>
            </strong>
          </div>
          <button
            className="reset-btn"
            id="reset-weights"
            onClick={() => {
              setWeights({ ...DEFAULT_WEIGHTS });
              showToast("已恢復基準 40 / 35 / 25。");
            }}
          >
            ↺ 回到基準權重
          </button>
          <div className="formula-card">
            <span className="eyebrow">MODEL / TreeBack 地方化提案</span>
            <code>
              G = clip(1 − C / 24%, 0, 1)
              <br />S = wH·H + wP·P + wV·V
              <br />PPI = 100·G·(0.5 + 0.5·S)
              <br />TES = 100 − PPI
            </code>
            <p>
              權重 w 以比例代入。
              <br />TES 越低，補植需求越高。
              <br />高 TES 不代表現況達標或無熱風險。
            </p>
          </div>
        </aside>

        <div className="results-panel">
          <div className="summary-strip" aria-live="polite" aria-atomic="true">
            <div>
              <span>12 區 TES 簡單平均</span>
              <strong>
                {f(average)}
                <small>/ 100</small>
              </strong>
              <em>
                {signed(average - averageBase)} 較基準{" "}
                <span>· 非人口加權</span>
              </em>
            </div>
            <div>
              <span>高優先區（展示門檻）</span>
              <strong>
                {highCount}
                <small>/ 12</small>
              </strong>
              <em>依 PPI ≥ 40 分計數</em>
            </div>
            <div>
              <span>目前情境權重 H / P / V</span>
              <strong className="weight-summary">
                {weights.H}
                <b>/</b>
                {weights.P}
                <b>/</b>
                {weights.V}
              </strong>
              <em>總和 100% · 目標固定 24%</em>
            </div>
          </div>

          <div className="ranking-card">
            <div className="chart-heading">
              <div>
                <h3>12 區情境比較</h3>
                <p className="muted small">
                  {metric === "TES"
                    ? "TES 越低，需求越高；色帶代表需求程度。"
                    : "PPI 越高，需求越高；與 TES 互補至 100 分。"}
                </p>
              </div>
              <div className="segmented" aria-label="圖表分數切換">
                <button
                  data-metric="TES"
                  aria-pressed={metric === "TES"}
                  className={metric === "TES" ? "active" : ""}
                  onClick={() => setMetric("TES")}
                >
                  TES
                </button>
                <button
                  data-metric="PPI"
                  aria-pressed={metric === "PPI"}
                  className={metric === "PPI" ? "active" : ""}
                  onClick={() => setMetric("PPI")}
                >
                  PPI
                </button>
              </div>
            </div>
            <div className="chart-legend">
              <span>
                <i className="legend-square" /> 目前情境
              </span>
              <span>
                <i className="legend-baseline" /> 基準權重
              </span>
              <span className="legend-direction">依 TES 由低至高排序</span>
            </div>
            <div className="chart-scale">
              <span />
              <div>
                <span>0</span>
                <span>25</span>
                <span>50</span>
                <span>75</span>
                <span>100</span>
              </div>
              <span>較基準</span>
            </div>
            <div className="district-bars">
              {results.map((d) => {
                const b = baseByName.get(d.name) ?? d;
                const delta = d[metric] - b[metric];
                return (
                  <button
                    key={d.name}
                    className={`bar-row${selected === d.name ? " selected" : ""}`}
                    aria-pressed={selected === d.name}
                    aria-label={`${d.name} ${metric} ${f(d[metric])}，較基準${signed(delta)}`}
                    onClick={() => setSelected(d.name)}
                  >
                    <span className="bar-name">
                      <small>{String(d.rank).padStart(2, "0")}</small>
                      <b>{d.name}</b>
                      {d.pilot ? (
                        <i title="48 小時先導盤點區">先導</i>
                      ) : null}
                    </span>
                    <span className="bar-track">
                      <span
                        className={`bar-fill ${band(d.PPI)}`}
                        style={{ width: `${d[metric]}%` }}
                      />
                      <span
                        className="baseline-marker"
                        style={{ left: `${b[metric]}%` }}
                        title={`基準 ${f(b[metric])}`}
                      />
                      <span
                        className="bar-number"
                        style={{
                          left: `min(${d[metric]}% + 10px, calc(100% - 30px))`,
                        }}
                      >
                        {f(d[metric])}
                      </span>
                    </span>
                    <span
                      className={`delta-value${
                        Math.abs(delta) > 0.00001 ? " changed" : ""
                      }`}
                    >
                      {signed(delta)}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="chart-footnote">
              點選行政區查看計算拆解。色帶為展示用：PPI ≥40 高、20–&lt;40
              中、&lt;20 低。
            </p>
          </div>

          <section
            className="detail-card"
            aria-label="行政區計算拆解"
            aria-live="polite"
            aria-atomic="true"
          >
            <div className="detail-top">
              <div>
                <span className="eyebrow">SELECTED DISTRICT / 計算拆解</span>
                <h3>
                  {detail.name}
                  {detail.pilot ? (
                    <span className="small-tag">先導盤點區</span>
                  ) : null}
                </h3>
              </div>
              <span className="detail-score">
                {f(detail.TES)}
                <small>TES</small>
              </span>
            </div>
            <div className="detail-factors">
              <div>
                <span>假設樹冠率 C</span>
                <strong>{detail.C}%</strong>
                <small>
                  目標 24% · 缺口 G {detail.G.toFixed(3)}
                </small>
              </div>
              <div>
                <span>加權需求 S</span>
                <strong>{detail.S.toFixed(3)}</strong>
                <small>
                  H {((weights.H / 100) * detail.H).toFixed(3)} + P{" "}
                  {((weights.P / 100) * detail.P).toFixed(3)} + V{" "}
                  {((weights.V / 100) * detail.V).toFixed(3)}
                </small>
              </div>
              <div>
                <span>較基準 TES / 需求名次</span>
                <strong>{signed(detail.TES - detailBase.TES)}</strong>
                <small>
                  {glyph(detailChange)} {Math.abs(detailChange)} 名 · 基準{" "}
                  {detailBase.rank} → 目前 {detail.rank}
                </small>
              </div>
            </div>
            <p className="detail-equation">
              100 − 100 × {detail.G.toFixed(3)} × (0.5 + 0.5 ×{" "}
              {detail.S.toFixed(3)}) ≈ <b>{f(detail.TES)}</b>
            </p>
          </section>
        </div>
      </div>

      <section className="comparison-section">
        <div className="section-top">
          <div>
            <p className="eyebrow">02 / SCENARIO DATA</p>
            <h2>看見數字背後的假設</h2>
          </div>
          <label className="pilot-filter">
            <input
              type="checkbox"
              id="pilot-only"
              checked={pilotOnly}
              onChange={(e) => setPilotOnly(e.target.checked)}
            />
            只看大同與萬華
          </label>
        </div>
        <div className="table-wrap">
          <table>
            <caption className="sr-only">
              12 行政區假設輸入與目前情境分數，依需求優先名次排序
            </caption>
            <thead>
              <tr>
                <th scope="col">需求名次</th>
                <th scope="col">行政區</th>
                <th scope="col">C 假設</th>
                <th scope="col">H</th>
                <th scope="col">P</th>
                <th scope="col">V</th>
                <th scope="col">G 缺口</th>
                <th scope="col">S 需求</th>
                <th scope="col">TES</th>
                <th scope="col">PPI</th>
                <th scope="col">TES 差值</th>
                <th scope="col">需求名次變化</th>
              </tr>
            </thead>
            <tbody>
              {results
                .filter((d) => !pilotOnly || d.pilot)
                .map((d) => {
                  const b = baseByName.get(d.name) ?? d;
                  const change = b.rank - d.rank;
                  return (
                    <tr key={d.name} className={d.pilot ? "pilot-row" : undefined}>
                      <td>{String(d.rank).padStart(2, "0")}</td>
                      <td>
                        <button
                          className="table-district"
                          aria-pressed={selected === d.name}
                          onClick={() => setSelected(d.name)}
                        >
                          {d.name}
                        </button>
                        {d.pilot ? (
                          <span className="table-pilot">先導</span>
                        ) : null}
                      </td>
                      <td>{d.C}%</td>
                      <td>{d.H.toFixed(2)}</td>
                      <td>{d.P.toFixed(2)}</td>
                      <td>{d.V.toFixed(2)}</td>
                      <td>{d.G.toFixed(3)}</td>
                      <td>{d.S.toFixed(3)}</td>
                      <td>
                        <b>{f(d.TES)}</b>
                      </td>
                      <td>{f(d.PPI)}</td>
                      <td
                        className={
                          Math.abs(d.TES - b.TES) > 0.00001 ? "changed" : undefined
                        }
                      >
                        {signed(d.TES - b.TES)}
                      </td>
                      <td>
                        {glyph(change)} {Math.abs(change)}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
        <p className="muted small">
          排名 1 表示本情境需求最高，不是實測最差行政區。數值以完整精度計算，再四捨五入顯示。
        </p>
      </section>

      <aside className="pilot-cta">
        <div>
          <span className="eyebrow">FROM SCORE TO ACTION</span>
          <h3>大同 × 萬華：先盤點，再談種植。</h3>
          <p>
            60 個街段單側抽樣單位，12
            個候選點有限現勘；不把區級分數當作街道證據。
          </p>
        </div>
        <Link to="/fieldwork" className="dark-btn">
          查看 48h 行動方案 ↗
        </Link>
      </aside>

      <div
        id="toast"
        role="status"
        aria-live="polite"
        className={toast ? "visible" : ""}
      >
        {toast}
      </div>
    </>
  );
}
