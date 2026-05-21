import { describe, it, expect } from "vitest";
import { computeCompatibility, buildTraitVector, DIM_WEIGHTS } from "./scoring";
import type { TraitVector } from "../types";

const identical: TraitVector = { EI: 0.8, JP: 0.8, active: 0.6, values: 0.9 };

describe("computeCompatibility", () => {
  it("동일 벡터는 100%", () => {
    expect(computeCompatibility(identical, identical).score).toBe(100);
  });

  it("정반대 벡터는 0%", () => {
    const opposite: TraitVector = { EI: 0, JP: 0, active: 0, values: 0 };
    const allOne: TraitVector = { EI: 1, JP: 1, active: 1, values: 1 };
    expect(computeCompatibility(opposite, allOne).score).toBe(0);
  });

  it("결정적: 같은 입력은 같은 점수", () => {
    const a: TraitVector = { EI: 0.3, JP: 0.7, active: 0.5, values: 0.2 };
    const b: TraitVector = { EI: 0.6, JP: 0.4, active: 0.9, values: 0.8 };
    expect(computeCompatibility(a, b).score).toBe(computeCompatibility(a, b).score);
  });

  it("가중치 합은 1", () => {
    const sum = Object.values(DIM_WEIGHTS).reduce((s, w) => s + w, 0);
    expect(sum).toBeCloseTo(1.0);
  });

  it("topMatch는 가장 비슷한 차원", () => {
    const self: TraitVector = { EI: 0.5, JP: 0.5, active: 0.5, values: 0.5 };
    const other: TraitVector = { EI: 0.5, JP: 0.0, active: 0.0, values: 0.0 };
    // EI만 동일 → topMatch = EI
    expect(computeCompatibility(self, other).topMatch).toBe("EI");
  });

  it("근거 문구에 점수가 포함된다", () => {
    const r = computeCompatibility(identical, identical);
    expect(r.reason).toContain("100%");
  });
});

describe("buildTraitVector", () => {
  it("차원별 평균을 계산", () => {
    const tv = buildTraitVector(
      { EI: 2, JP: 1, active: 0, values: 1 },
      { EI: 2, JP: 2, active: 2, values: 1 }
    );
    expect(tv.EI).toBe(1);
    expect(tv.JP).toBe(0.5);
    expect(tv.active).toBe(0);
    expect(tv.values).toBe(1);
  });

  it("응답 없는 차원은 0.5 기본값", () => {
    const tv = buildTraitVector({ EI: 0, JP: 0, active: 0, values: 0 }, { EI: 0, JP: 0, active: 0, values: 0 });
    expect(tv.EI).toBe(0.5);
  });
});
