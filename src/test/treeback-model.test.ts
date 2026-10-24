import { describe, expect, it } from "vitest";
import {
  DEFAULT_WEIGHTS,
  DISTRICTS,
  GOAL,
  band,
  csvFor,
  rank,
  redistribute,
  score,
} from "@/lib/treeback/model";

const close = (a: number, b: number) => Math.abs(a - b) < 1e-9;

describe("TreeBack model", () => {
  it("reproduces the source baseline for the 12 districts", () => {
    expect(DISTRICTS).toHaveLength(12);
    const rows = rank();
    expect(rows[0]!.name).toBe("大同區");
    expect(rows[1]!.name).toBe("萬華區");
    expect(close(rows[0]!.TES, 45.75)).toBe(true);
    expect(close(rows[1]!.TES, 47.85104166666666)).toBe(true);

    for (const r of rows) expect(close(r.PPI + r.TES, 100)).toBe(true);
  });

  it("keeps weights whole, nonnegative and summing to 100 while dragging", () => {
    let w = { ...DEFAULT_WEIGHTS };
    for (const key of ["H", "P", "V"] as const) {
      for (let value = 0; value <= 100; value++) {
        w = redistribute(w, key, value);
        expect(w.H + w.P + w.V).toBe(100);
        expect(w[key]).toBe(value);
        for (const v of Object.values(w)) {
          expect(Number.isInteger(v) && v >= 0 && v <= 100).toBe(true);
        }
      }
    }
  });

  it("splits evenly when the other two weights are zero", () => {
    expect(redistribute({ H: 100, P: 0, V: 0 }, "H", 60)).toEqual({
      H: 60,
      P: 20,
      V: 20,
    });
    expect(redistribute({ H: 100, P: 0, V: 0 }, "H", 99)).toEqual({
      H: 99,
      P: 1,
      V: 0,
    });
  });

  it("clamps and rounds slider values", () => {
    expect(redistribute(DEFAULT_WEIGHTS, "H", 40.6).H).toBe(41);
    expect(redistribute(DEFAULT_WEIGHTS, "H", -10).H).toBe(0);
    expect(redistribute(DEFAULT_WEIGHTS, "H", 110).H).toBe(100);
  });

  it("gives a zero gap and TES 100 at or above the assumed canopy goal", () => {
    for (const C of [GOAL, GOAL + 10, 100]) {
      const r = score({ C, H: 0.9, P: 0.8, V: 0.7 });
      expect(close(r.G, 0)).toBe(true);
      expect(close(r.TES, 100)).toBe(true);
    }
  });

  it("never mutates the shared district data", () => {
    const before = JSON.stringify(DISTRICTS);
    rank({ H: 10, P: 20, V: 70 });
    redistribute(DEFAULT_WEIGHTS, "V", 90);
    expect(JSON.stringify(DISTRICTS)).toBe(before);
    expect(DEFAULT_WEIGHTS).toEqual({ H: 40, P: 35, V: 25 });
  });

  it("exports 12 rows plus a header with the disclosure", () => {
    const result = csvFor({ H: 60, P: 25, V: 15 });
    expect(result.split("\r\n")).toHaveLength(13);
    expect(result).toContain("情境假設，非實測／非官方評分");
    expect(result).toContain('"60","25","15"');
  });

  it("bands boundary values without changing the score", () => {
    expect(band(40)).toBe("high");
    expect(band(39.999)).toBe("mid");
    expect(band(20)).toBe("mid");
    expect(band(19.999)).toBe("low");
  });
});

import { proposalScore } from "@/lib/treeback/model";
describe("proposal formula", () => {
  it("uses 30% target and 0.4/0.3/0.3 SVI", () => {
    const r = proposalScore({ C: 15, H: 1, P: 0, V: 0 });
    expect(r.gap).toBeCloseTo(50);
    expect(r.SVI).toBeCloseTo(40);
    expect(r.raw).toBeCloseTo(30);
  });
});

import geo from "@/lib/treeback/taipei-geo.json";
describe("official data", () => {
  it("has real boundaries and protected-tree counts for all 12 districts", () => {
    expect(Object.keys(geo.paths)).toHaveLength(12);
    const total = Object.values(geo.treeCounts as Record<string, number>).reduce((a, b) => a + b, 0);
    expect(total).toBe(3874);
  });
});
