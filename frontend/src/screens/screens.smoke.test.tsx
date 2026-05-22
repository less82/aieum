// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type { ReactElement } from "react";
import { Home } from "./Home";
import { Onboarding } from "./Onboarding";
import { Matching } from "./Matching";
import { DateIng } from "./DateIng";
import { Profile } from "./Profile";
import { useDemo } from "../store";

function renderAt(ui: ReactElement, path = "/") {
  return render(<MemoryRouter initialEntries={[path]}>{ui}</MemoryRouter>);
}

afterEach(() => {
  cleanup();
  useDemo.getState().reset();
});

describe("화면 렌더 스모크 (런타임 에러 없음)", () => {
  it("홈: 타이틀과 시작 버튼 렌더", () => {
    renderAt(<Home />);
    expect(screen.getByAltText("이음")).toBeTruthy();
    expect(screen.getByText(/데모 시작하기/)).toBeTruthy();
  });

  it("온보딩: 본인인증 화면 렌더", () => {
    renderAt(<Onboarding />);
    expect(screen.getByText("휴대폰 본인인증")).toBeTruthy();
  });

  it("매칭: 설문 전이면 설문 유도", () => {
    renderAt(<Matching />);
    expect(screen.getByText(/설문하러 가기/)).toBeTruthy();
  });

  it("매칭: 설문 완료 상태면 조건 설정 렌더", () => {
    useDemo.getState().setOnboarding(
      { EI: 0.5, JP: 0.5, active: 0.5, values: 0.5 },
      { keywords: ["#계획형"], summary: "요약" }
    );
    renderAt(<Matching />);
    expect(screen.getByText(/언제 데이트하고 싶으세요/)).toBeTruthy();
    expect(screen.getByText("이번 주말")).toBeTruthy();
  });

  it("데이트: 세션 없으면 빈 상태 렌더", () => {
    renderAt(<DateIng />);
    expect(screen.getByText(/진행 중인 데이트가 없어요/)).toBeTruthy();
  });

  it("마이페이지: 리포트 있으면 키워드 렌더", () => {
    useDemo.getState().setOnboarding(
      { EI: 0.8, JP: 0.2, active: 0.9, values: 0.7 },
      { keywords: ["#외향적", "#즉흥형"], summary: "테스트 요약문" }
    );
    renderAt(<Profile />);
    expect(screen.getByText("#외향적")).toBeTruthy();
    expect(screen.getByText("테스트 요약문")).toBeTruthy();
  });

  it("온보딩: 인증 흐름 클릭이 설문 첫 문항으로 진행", () => {
    renderAt(<Onboarding />);
    fireEvent.change(screen.getByPlaceholderText("010-0000-0000"), { target: { value: "01012345678" } });
    fireEvent.click(screen.getByText("인증번호 받기"));
    fireEvent.click(screen.getByText(/인증 완료하고 시작하기/));
    // 첫 설문 문항 노출
    expect(screen.getByText("주말 저녁, 더 끌리는 쪽은?")).toBeTruthy();
  });
});
