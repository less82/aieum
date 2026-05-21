import type { Dim, TraitVector } from "../types";

// 차원별 가중치 (스펙 §7.1: 가치관·활동성향 高, E/I·J/P 中). 합 = 1.0
export const DIM_WEIGHTS: Record<Dim, number> = {
  values: 0.35,
  active: 0.3,
  EI: 0.2,
  JP: 0.15,
};

export const DIM_LABEL: Record<Dim, string> = {
  EI: "외향성",
  JP: "계획성",
  active: "데이트 취향",
  values: "연애 가치관",
};

// 일치하는 차원에 대한 자연어 조각 (high/low 무관, 비슷함을 강조)
const MATCH_PHRASE: Record<Dim, string> = {
  values: "연애를 바라보는 가치관이 잘 맞아요",
  active: "데이트할 때 원하는 분위기가 비슷해요",
  EI: "사람을 대하는 에너지의 결이 닮았어요",
  JP: "계획을 세우는 스타일이 잘 통해요",
};

const DIFF_PHRASE: Record<Dim, string> = {
  values: "연애관은 살짝 다르지만 대화로 채워갈 수 있어요",
  active: "활동 취향은 조금 달라 서로의 세계를 넓혀줄 수 있어요",
  EI: "성향의 온도차가 있어 오히려 균형이 돼요",
  JP: "계획 스타일의 차이는 여행에서 재미가 될 거예요",
};

const DIMS: Dim[] = ["EI", "JP", "active", "values"];

export interface ScoreResult {
  score: number; // 0~100
  topMatch: Dim;
  topDiff: Dim;
  reason: string;
}

/** 두 trait 벡터의 차원별 유사도(1 - |차이|) */
export function dimSimilarity(a: TraitVector, b: TraitVector, dim: Dim): number {
  return 1 - Math.abs(a[dim] - b[dim]);
}

/** 결정적 궁합 점수 + 근거. 동일 입력 → 동일 출력. */
export function computeCompatibility(self: TraitVector, other: TraitVector): ScoreResult {
  let weighted = 0;
  let topMatch: Dim = DIMS[0];
  let topDiff: Dim = DIMS[0];
  let bestSim = -1;
  let worstSim = 2;

  for (const dim of DIMS) {
    const sim = dimSimilarity(self, other, dim);
    weighted += DIM_WEIGHTS[dim] * sim;
    if (sim > bestSim) {
      bestSim = sim;
      topMatch = dim;
    }
    if (sim < worstSim) {
      worstSim = sim;
      topDiff = dim;
    }
  }

  const score = Math.round(weighted * 100);
  const reason = `두 분은 ${MATCH_PHRASE[topMatch]}. ${DIFF_PHRASE[topDiff]}. 종합 궁합은 ${score}%예요.`;

  return { score, topMatch, topDiff, reason };
}

/** 설문 답변(차원별 누적/개수)으로 trait 벡터 산출 */
export function buildTraitVector(sums: Record<Dim, number>, counts: Record<Dim, number>): TraitVector {
  const tv = {} as TraitVector;
  for (const dim of DIMS) {
    tv[dim] = counts[dim] ? sums[dim] / counts[dim] : 0.5;
  }
  return tv;
}
