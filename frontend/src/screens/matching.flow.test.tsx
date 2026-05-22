// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Matching } from "./Matching";
import { useDemo } from "../store";

// mockApi를 즉시 resolve 되도록 모킹 (지연 연출 제거하고 흐름만 검증)
vi.mock("../lib/mockApi", () => {
  const candidate = {
    id: "u-test", nickname: "지윤", age: 29, region: "성수",
    bio: "전시 좋아요", photo: "🎨", interests: ["전시", "카페"],
    trait: { EI: 0.7, JP: 0.8, active: 0.6, values: 0.9 },
    distanceKm: 1.4, loc: { x: 72, y: 26 },
    score: 92, reason: "잘 맞아요 92%", topMatch: "values", topDiff: "EI",
  };
  const courseA = { id: "ca", title: "감성 카페 코스", emoji: "🎨", region: "성수", estTime: "3시간", estCost: "4만원", vibe: "calm", stops: [{ name: "카페", x: 30, y: 56 }] };
  const courseB = { id: "cb", title: "액티브 코스", emoji: "🧗", region: "성수", estTime: "3시간", estCost: "5만원", vibe: "active", stops: [{ name: "클라이밍", x: 28, y: 48 }] };
  return {
    rankCandidates: vi.fn(async () => [candidate]),
    recommendCourses: vi.fn(async () => [courseA, courseB]),
    generateIcebreakers: vi.fn(async () => ["멘트1", "멘트2"]),
    sendDateRequest: vi.fn(async () => ({ accepted: true })),
  };
});

afterEach(() => {
  cleanup();
  useDemo.getState().reset();
});

describe("매칭 플로우 (단일 공개 → 지도/코스 → 코스 선택 → 성공/실패)", () => {
  it("A코스 선택(상대와 동일)하면 매칭 성공 → 대화 시작", async () => {
    useDemo.getState().setOnboarding(
      { EI: 0.5, JP: 0.5, active: 0.5, values: 0.5 },
      { keywords: ["#계획형"], summary: "요약" }
    );
    render(
      <MemoryRouter initialEntries={["/matching"]}>
        <Matching />
      </MemoryRouter>
    );

    // 조건 설정 → 매칭 시작
    fireEvent.click(screen.getByText("이번 주말"));
    fireEvent.click(screen.getByText(/AI 매칭 시작하기/));

    // 단 한 명 공개
    expect(await screen.findByText(/오늘의 단 한 사람/)).toBeTruthy();
    expect(screen.getByText("지윤")).toBeTruthy();
    expect(screen.getByText(/1.4km 거리/)).toBeTruthy();

    // 코스 A/B 미리보기 로드 + 코스 선택 CTA (기본 A코스, 선택 시 상세 패널에도 노출돼 2회 등장)
    expect((await screen.findAllByText("🎨 감성 카페 코스")).length).toBeGreaterThan(0);
    expect(screen.getByText("🧗 액티브 코스")).toBeTruthy();
    const cta = await screen.findByText(/A코스로 데이트 신청/);

    // A코스 신청 → 상대도 A → 매칭 성공
    fireEvent.click(cta);
    expect(await screen.findByText("매칭 성공!")).toBeTruthy();

    // 데이트 준비하기 → 선택한 코스 예약(크레딧 1 차감 + 세션 생성)
    fireEvent.click(screen.getByText(/데이트 준비하기/));
    const st = useDemo.getState();
    expect(st.session?.courseId).toBe("ca");
    expect(st.session?.state).toBe("scheduled");
    expect(st.credits).toBe(2);
  });

  it("B코스 선택(상대와 불일치)하면 매칭 실패 → 다시 신청 가능", async () => {
    useDemo.getState().setOnboarding(
      { EI: 0.5, JP: 0.5, active: 0.5, values: 0.5 },
      { keywords: ["#계획형"], summary: "요약" }
    );
    render(
      <MemoryRouter initialEntries={["/matching"]}>
        <Matching />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText("이번 주말"));
    fireEvent.click(screen.getByText(/AI 매칭 시작하기/));

    // B코스 선택 후 신청
    fireEvent.click(await screen.findByText("🧗 액티브 코스"));
    fireEvent.click(await screen.findByText(/B코스로 데이트 신청/));

    // 매칭 실패 → 다시 신청 버튼 노출
    expect(await screen.findByText("매칭이 어긋났어요")).toBeTruthy();
    expect(screen.getByText(/다른 코스로 다시 신청/)).toBeTruthy();
  });
});
