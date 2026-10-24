export type Weights = { H: number; P: number; V: number };
export type WeightKey = "H" | "P" | "V";

export type DistrictInput = {
  name?: string;
  C: number;
  H: number;
  P: number;
  V: number;
  pilot?: boolean;
};

export type District = DistrictInput & { name: string };

export type Scores = { G: number; S: number; PPI: number; TES: number };
export type Scored<T extends DistrictInput> = T & Scores;
export type Ranked = Scored<District> & { rank: number };

export const DEFAULT_WEIGHTS: Weights = Object.freeze({ H: 40, P: 35, V: 25 });
export const GOAL = 24;

export const DISTRICTS: District[] = [
  { name: "大同區", C: 10, H: 0.92, P: 0.82, V: 0.82, pilot: true },
  { name: "萬華區", C: 11, H: 0.95, P: 0.88, V: 0.95, pilot: true },
  { name: "中正區", C: 12, H: 0.86, P: 0.79, V: 0.7 },
  { name: "中山區", C: 13, H: 0.82, P: 0.81, V: 0.68 },
  { name: "松山區", C: 15, H: 0.72, P: 0.86, V: 0.7 },
  { name: "大安區", C: 17, H: 0.7, P: 0.92, V: 0.65 },
  { name: "信義區", C: 18, H: 0.68, P: 0.76, V: 0.58 },
  { name: "南港區", C: 18, H: 0.72, P: 0.55, V: 0.62 },
  { name: "士林區", C: 19, H: 0.61, P: 0.43, V: 0.78 },
  { name: "內湖區", C: 20, H: 0.63, P: 0.45, V: 0.52 },
  { name: "北投區", C: 21, H: 0.59, P: 0.38, V: 0.81 },
  { name: "文山區", C: 22, H: 0.57, P: 0.48, V: 0.68 },
];

export function redistribute(
  weights: Weights,
  key: WeightKey,
  nextValue: number,
): Weights {
  const value = Math.max(0, Math.min(100, Math.round(nextValue)));
  const others = (["H", "P", "V"] as WeightKey[]).filter(
    (k) => k !== key,
  ) as [WeightKey, WeightKey];
  const rest = 100 - value;
  const previous = weights[others[0]] + weights[others[1]];
  const proportion = previous > 0 ? weights[others[0]] / previous : 0.5;
  const first = Math.round(rest * proportion);
  const next: Weights = { ...weights };
  next[key] = value;
  next[others[0]] = first;
  next[others[1]] = rest - first;
  return next;
}

export function score<T extends DistrictInput>(
  district: T,
  weights: Weights = DEFAULT_WEIGHTS,
): Scored<T> {
  const G = Math.max(0, Math.min(1, 1 - district.C / GOAL));
  const S = (weights.H * district.H + weights.P * district.P + weights.V * district.V) / 100;
  const PPI = 100 * G * (0.5 + 0.5 * S);
  return { ...district, G, S, PPI, TES: 100 - PPI } as Scored<T>;
}

export function rank(weights: Weights = DEFAULT_WEIGHTS): Ranked[] {
  return DISTRICTS.map((d) => score(d, weights))
    .sort((a, b) => a.TES - b.TES || a.name.localeCompare(b.name, "zh-TW"))
    .map((d, i) => ({ ...d, rank: i + 1 }));
}

export function band(ppi: number): "high" | "mid" | "low" {
  return ppi >= 40 ? "high" : ppi >= 20 ? "mid" : "low";
}

export function csvFor(weights: Weights): string {
  const baseline = rank();
  const head = [
    "情境名次",
    "行政區",
    "假設樹冠率_pct",
    "目標_pct",
    "H_假設",
    "P_假設",
    "V_假設",
    "H權重_pct",
    "P權重_pct",
    "V權重_pct",
    "G",
    "S",
    "PPI",
    "TES",
    "TES基準",
    "TES差值",
    "名次改善",
    "資料狀態",
  ];
  const rows = rank(weights).map((d) => {
    const b = baseline.find((r) => r.name === d.name) ?? d;
    return [
      d.rank,
      d.name,
      d.C,
      GOAL,
      d.H,
      d.P,
      d.V,
      weights.H,
      weights.P,
      weights.V,
      d.G.toFixed(6),
      d.S.toFixed(6),
      d.PPI.toFixed(6),
      d.TES.toFixed(6),
      b.TES.toFixed(6),
      (d.TES - b.TES).toFixed(6),
      b.rank - d.rank,
      "情境假設，非實測／非官方評分",
    ];
  });
  return (
    "\uFEFF" +
    [head, ...rows]
      .map((row) => row.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(","))
      .join("\r\n")
  );
}

/** 方案書版 TES：目標 30%、SVI = 0.4H + 0.3P + 0.3V（H/P/V 視為 0–1 分位）。 */
export const PROPOSAL_GOAL = 30;
export function proposalScore(d: DistrictInput) {
  const gap = Math.max(0, (PROPOSAL_GOAL - d.C) / PROPOSAL_GOAL) * 100;
  const SVI = (0.4 * d.H + 0.3 * d.P + 0.3 * d.V) * 100;
  const raw = (gap * (100 - SVI)) / 100; // 原式 gap×(100−SVI) 除以 100 縮回 0–100
  return { gap, SVI, raw };
}

