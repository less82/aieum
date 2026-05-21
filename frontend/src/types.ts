// 성향 차원: 각 0~1 (high쪽이 1)
export type Dim = "EI" | "JP" | "active" | "values";

export type TraitVector = Record<Dim, number>;

export interface SeedUser {
  id: string;
  nickname: string;
  age: number;
  region: string;
  bio: string;
  photo: string; // 이모지 아바타 (데모용)
  interests: string[];
  trait: TraitVector;
}

export interface Candidate extends SeedUser {
  score: number; // 0~100 궁합
  reason: string; // AI 근거 문구
  topMatch: Dim;
  topDiff: Dim;
}

export interface Course {
  id: string;
  title: string;
  emoji: string;
  region: string;
  estTime: string;
  estCost: string;
  steps: string[];
  vibe: "active" | "calm"; // 활동성향 매칭용
}

export interface SurveyOption {
  label: string;
  value: number; // 해당 차원 점수 기여 (0 또는 1)
}

export interface SurveyQuestion {
  id: string;
  dim: Dim;
  title: string;
  options: [SurveyOption, SurveyOption];
}

export type CheckinKind = "qr" | "gps";

export interface DateSession {
  candidateId: string;
  courseId: string;
  state: "scheduled" | "ongoing" | "completed";
  stepIndex: number; // 진행 단계
  checkins: { step: number; kind: CheckinKind }[];
}
