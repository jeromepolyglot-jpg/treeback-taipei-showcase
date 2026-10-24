import { create } from "zustand";

export type Phase = "menu" | "playing" | "over";

export const CITY_GOAL = 3000;

/** C/H/P/V 四個面向的貢獻度（0–10，情境參數，非實測） */
export interface CHPV {
  c: number; // 樹冠 Canopy
  h: number; // 降溫 Heat
  p: number; // 人群 People
  v: number; // 弱勢 Vulnerability
}

/** 總體城市環境變化指數的權重（情境設定） */
export const INDEX_WEIGHTS: CHPV = { c: 0.3, h: 0.3, p: 0.2, v: 0.2 };

export function envIndex(t: CHPV): number {
  return t.c * INDEX_WEIGHTS.c + t.h * INDEX_WEIGHTS.h + t.p * INDEX_WEIGHTS.p + t.v * INDEX_WEIGHTS.v;
}

const BEST_KEY = "plant3d-best";

function loadBest(): number {
  if (typeof window === "undefined") return 0;
  return Number(localStorage.getItem(BEST_KEY) ?? 0);
}

interface PlantStore {
  phase: Phase;
  /** 已種樹數（排行榜沿用） */
  score: number;
  best: number;
  /** spotId -> tree variant (0 | 1) */
  planted: Record<string, number>;
  /** 已種位置的 C/H/P/V 合計 */
  totals: CHPV;
  /** 目前觀察中的位置 */
  selected: string | null;
  start: () => void;
  select: (id: string | null) => void;
  plant: (id: string, variant: number, chpv: CHPV) => void;
  finish: () => void;
}

export const usePlantStore = create<PlantStore>((set) => ({
  phase: "menu",
  score: 0,
  best: loadBest(),
  planted: {},
  totals: { c: 0, h: 0, p: 0, v: 0 },
  selected: null,
  start: () =>
    set({ phase: "playing", score: 0, planted: {}, totals: { c: 0, h: 0, p: 0, v: 0 }, selected: null }),
  select: (id) => set({ selected: id }),
  plant: (id, variant, chpv) =>
    set((s) =>
      s.phase === "playing" && !(id in s.planted)
        ? {
            score: s.score + 1,
            planted: { ...s.planted, [id]: variant },
            totals: { c: s.totals.c + chpv.c, h: s.totals.h + chpv.h, p: s.totals.p + chpv.p, v: s.totals.v + chpv.v },
            selected: null,
          }
        : s,
    ),
  finish: () =>
    set((s) => {
      const best = Math.max(s.best, s.score);
      if (typeof window !== "undefined") localStorage.setItem(BEST_KEY, String(best));
      return { phase: "over", best };
    }),
}));
