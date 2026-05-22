// 성향 차원: 각 0~1 (high쪽이 1)
export type Dim = "EI" | "JP" | "active" | "values";

export type TraitVector = Record<Dim, number>;

export interface MapPoint {
  x: number; // 0~100 (지도 좌표)
  y: number; // 0~80
}

export interface SeedUser {
  id: string;
  nickname: string;
  age: number;
  region: string;
  bio: string;
  photo: string; // 이모지 아바타 (데모용)
  interests: string[];
  trait: TraitVector;
  distanceKm: number; // 나와의 거리
  loc: MapPoint; // 지도상 위치
}

export interface Candidate extends SeedUser {
  score: number; // 0~100 궁합
  reason: string; // AI 근거 문구
  topMatch: Dim;
  topDiff: Dim;
}

export interface CourseStop extends MapPoint {
  name: string;
  menu?: string; // 대표 메뉴/활동 (예: "아이스 아메리카노")
  price?: number; // 1인 비용 (원). 무료면 0
  emoji?: string; // 장소 썸네일 (데모용 이모지 "사진")
  desc?: string; // 장소 한 줄 소개
  img?: string; // 장소 사진 경로 (public)
}

export interface Course {
  id: string;
  title: string;
  emoji: string;
  region: string;
  estTime: string;
  estCost: string;
  stops: CourseStop[]; // 코스 경유지 (이름 + 지도 좌표)
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
