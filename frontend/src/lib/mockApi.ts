import type { Candidate, Course, SeedUser, TraitVector } from "../types";
import { computeCompatibility, DIM_LABEL } from "./scoring";
import { SEED_USERS, COURSES, buildSelfReport, buildIcebreakers } from "../data/seed";

// "AI가 생각하는 척" 지연 (스펙 §7.3 scripted 모드). 발표용 1~2초.
export const AI_THINK_MS = 1500;

function think<T>(value: T, ms: number = AI_THINK_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

/** 시드 풀을 궁합순으로 랭킹 (실제 결정적 계산 + 지연 연출) */
export async function rankCandidates(self: TraitVector): Promise<Candidate[]> {
  const ranked: Candidate[] = SEED_USERS.map((u) => {
    const { score, reason, topMatch, topDiff } = computeCompatibility(self, u.trait);
    return { ...u, score, reason, topMatch, topDiff };
  }).sort((a, b) => b.score - a.score);
  return think(ranked, 1600);
}

/** AI 성향 리포트(자기 자신) */
export async function generateReport(self: TraitVector) {
  return think(buildSelfReport(self), 1300);
}

/** 두 사람에 맞춘 AI 데이트 코스 A/B 추천 (스펙 SCR-MAT-002) */
export async function recommendCourses(self: TraitVector, other: SeedUser): Promise<[Course, Course]> {
  const pairActive = (self.active + other.trait.active) / 2;
  const fit = (c: Course) => Math.abs((c.vibe === "active" ? 1 : 0) - pairActive);
  const byFit = [...COURSES].sort((a, b) => fit(a) - fit(b));
  const best = byFit[0];
  const contrast = byFit.find((c) => c.vibe !== best.vibe) ?? byFit[1];
  return think([best, contrast], 1700);
}

/** 아이스브레이킹 대화 가이드 */
export async function generateIcebreakers(myInterests: string[], other: Candidate): Promise<string[]> {
  const list = buildIcebreakers(myInterests, other, DIM_LABEL[other.topMatch]);
  return think(list, 1200);
}

/** 데이트 신청 전송 → 상대 수락 (시드 자동 수락 시뮬) */
export async function sendDateRequest(): Promise<{ accepted: true }> {
  return think({ accepted: true }, 1400);
}

/** AI 데이트 후기 요약 (태그 + 직접 입력 후기 → 한 줄 요약) */
export async function summarizeReview(tags: string[], rating: number, note = ""): Promise<string> {
  const mood = rating >= 4 ? "만족스러운" : rating >= 3 ? "무난한" : "아쉬움이 남은";
  const tagText = tags.length ? tags.map((t) => t.replace("#", "")).join(", ") : "특별한";
  const noteText = note.trim() ? ` 직접 남긴 한마디: “${note.trim()}”.` : "";
  return think(`${mood} 데이트였어요. ‘${tagText}’ 키워드가 돋보였고,${noteText} 다음 코스 추천에 반영됩니다.`, 1100);
}
