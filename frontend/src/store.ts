import { create } from "zustand";
import type { Candidate, Course, DateSession, TraitVector, CheckinKind } from "./types";

interface SelfReport {
  keywords: string[];
  summary: string;
}

interface DemoState {
  // 온보딩 결과
  selfTrait: TraitVector | null;
  selfReport: SelfReport | null;
  myInterests: string[];

  // 매칭
  datePref: string | null;
  dateWish: string | null; // 데이트 코스에 추가하고 싶은 것 (자유 입력)
  budget: string | null; // 1인 데이트 예산
  match: Candidate | null;
  courses: [Course, Course] | null; // AI 추천 A/B
  coursePick: "A" | "B" | null; // 매칭 단계에서 내가 고른 코스
  course: Course | null; // 예약 확정 코스

  // 데이트 진행
  session: DateSession | null;
  reviewSummary: string | null;

  // BM
  credits: number;

  // actions
  setOnboarding: (trait: TraitVector, report: SelfReport) => void;
  setDateSetup: (pref: string, wish: string, budget: string) => void;
  setMatch: (candidate: Candidate) => void;
  setCourses: (courses: [Course, Course]) => void;
  setCoursePick: (which: "A" | "B") => void;
  reserve: (course: Course, cost: number) => void; // 코스 예약 (크레딧 차감 + 세션 생성)
  checkIn: (kind: CheckinKind) => void;
  completeDate: () => void;
  setReview: (summary: string) => void;
  addCredits: (n: number) => void;
  reset: () => void;
}

const DEFAULT_INTERESTS = ["카페", "전시", "여행"];

export const useDemo = create<DemoState>((set) => ({
  selfTrait: null,
  selfReport: null,
  myInterests: DEFAULT_INTERESTS,
  datePref: null,
  dateWish: null,
  budget: null,
  match: null,
  courses: null,
  coursePick: null,
  course: null,
  session: null,
  reviewSummary: null,
  credits: 3,

  setOnboarding: (trait, report) => set({ selfTrait: trait, selfReport: report }),
  setDateSetup: (pref, wish, budget) => set({ datePref: pref, dateWish: wish || null, budget: budget || null }),
  setMatch: (candidate) => set({ match: candidate }),
  setCourses: (courses) => set({ courses }),
  setCoursePick: (which) => set({ coursePick: which }),
  reserve: (course, cost) =>
    set((s) => ({
      credits: Math.max(0, s.credits - cost),
      course,
      session: {
        candidateId: s.match?.id ?? "",
        courseId: course.id,
        state: "scheduled",
        stepIndex: 0,
        checkins: [],
      },
    })),
  checkIn: (kind) =>
    set((s) => {
      if (!s.session || !s.course) return s;
      const nextStep = Math.min(s.session.stepIndex + 1, s.course.stops.length);
      const completed = nextStep >= s.course.stops.length;
      return {
        session: {
          ...s.session,
          state: completed ? "completed" : "ongoing",
          stepIndex: nextStep,
          checkins: [...s.session.checkins, { step: s.session.stepIndex, kind }],
        },
      };
    }),
  completeDate: () => set((s) => (s.session ? { session: { ...s.session, state: "completed" } } : s)),
  setReview: (summary) => set({ reviewSummary: summary }),
  addCredits: (n) => set((s) => ({ credits: s.credits + n })),
  reset: () =>
    set({
      selfTrait: null,
      selfReport: null,
      datePref: null,
      dateWish: null,
      budget: null,
      match: null,
      courses: null,
      coursePick: null,
      course: null,
      session: null,
      reviewSummary: null,
      credits: 3,
    }),
}));
