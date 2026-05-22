// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Chat } from "./Chat";
import { useDemo } from "../store";
import type { Candidate, Course } from "../types";

const candidate: Candidate = {
  id: "u-test", nickname: "지윤", age: 29, region: "성수", bio: "전시 좋아요",
  photo: "🎨", interests: ["전시"], trait: { EI: 0.7, JP: 0.8, active: 0.6, values: 0.9 },
  distanceKm: 1.4, loc: { x: 72, y: 26 }, score: 92, reason: "잘 맞아요", topMatch: "values", topDiff: "EI",
};
const courseA: Course = {
  id: "ca", title: "감성 카페 코스", emoji: "🎨", region: "성수", estTime: "3시간", estCost: "15,000원", vibe: "calm",
  stops: [{ name: "대림창고 카페", menu: "아메리카노", price: 5000, x: 30, y: 56 }],
};

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  vi.useRealTimers();
  cleanup();
  useDemo.getState().reset();
});

describe("대화창 (매칭 후 대화)", () => {
  it("상대 정보 · 예약된 코스 배너 · 데이트 진행 버튼이 보인다", () => {
    useDemo.setState({ match: candidate, course: courseA });

    render(
      <MemoryRouter>
        <Chat />
      </MemoryRouter>
    );

    expect(screen.getByText("지윤")).toBeTruthy();
    expect(screen.getByText(/데이트 진행/)).toBeTruthy();
    expect(screen.getByText(/예약된 코스/)).toBeTruthy();
  });

  it("매칭 상대가 없으면 빈 상태", () => {
    render(
      <MemoryRouter>
        <Chat />
      </MemoryRouter>
    );
    expect(screen.getByText(/대화할 상대가 없어요/)).toBeTruthy();
  });
});
