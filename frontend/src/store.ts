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
  match: Candidate | null;
  course: Course | null;

  // 데이트 진행
  session: DateSession | null;
  reviewSummary: string | null;

  // BM
  credits: number;

  // actions
  setOnboarding: (trait: TraitVector, report: SelfReport) => void;
  setDatePref: (chip: string) => void;
  confirmMatch: (candidate: Candidate, course: Course) => void;
  checkIn: (kind: CheckinKind) => void;
  completeDate: () => void;
  setReview: (summary: string) => void;
  addCredits: (n: number) => void;
  spendCredit: () => void;
  reset: () => void;
}

const DEFAULT_INTERESTS = ["카페", "전시", "여행"];

export const useDemo = create<DemoState>((set) => ({
  selfTrait: null,
  selfReport: null,
  myInterests: DEFAULT_INTERESTS,
  datePref: null,
  match: null,
  course: null,
  session: null,
  reviewSummary: null,
  credits: 3,

  setOnboarding: (trait, report) => set({ selfTrait: trait, selfReport: report }),
  setDatePref: (chip) => set({ datePref: chip }),
  confirmMatch: (candidate, course) =>
    set({
      match: candidate,
      course,
      session: {
        candidateId: candidate.id,
        courseId: course.id,
        state: "scheduled",
        stepIndex: 0,
        checkins: [],
      },
    }),
  checkIn: (kind) =>
    set((s) => {
      if (!s.session || !s.course) return s;
      const nextStep = Math.min(s.session.stepIndex + 1, s.course.steps.length);
      const completed = nextStep >= s.course.steps.length;
      return {
        session: {
          ...s.session,
          state: completed ? "completed" : "ongoing",
          stepIndex: nextStep,
          checkins: [...s.session.checkins, { step: s.session.stepIndex, kind }],
        },
      };
    }),
  completeDate: () =>
    set((s) => (s.session ? { session: { ...s.session, state: "completed" } } : s)),
  setReview: (summary) => set({ reviewSummary: summary }),
  addCredits: (n) => set((s) => ({ credits: s.credits + n })),
  spendCredit: () => set((s) => ({ credits: Math.max(0, s.credits - 1) })),
  reset: () =>
    set({
      selfTrait: null,
      selfReport: null,
      datePref: null,
      match: null,
      course: null,
      session: null,
      reviewSummary: null,
      credits: 3,
    }),
}));
