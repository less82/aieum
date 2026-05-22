import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { AIThinkingLoader } from "../components/AIThinkingLoader";
import { CourseMap } from "../components/CourseMap";
import { CourseDetail } from "../components/CourseDetail";
import { Button, CompatibilityRing, Tag, Avatar } from "../components/ui";
import { DATE_CHIPS, BUDGET_OPTIONS, formatWon } from "../data/seed";
import { rankCandidates, recommendCourses, sendDateRequest } from "../lib/mockApi";
import { useDemo } from "../store";
import type { Candidate, Course } from "../types";

type Step = "setup" | "ranking" | "reveal" | "matching" | "success" | "fail";

// 데모: 상대는 AI가 두 사람 모두에게 추천한 1순위(A코스)를 선택한다.
const PARTNER_PICK: "A" | "B" = "B";
const PREP_COST = 1; // 데이트 준비(코스 예약) 시 사용하는 크레딧

export function Matching() {
  const navigate = useNavigate();
  const selfTrait = useDemo((s) => s.selfTrait);
  const datePref = useDemo((s) => s.datePref);
  const setDateSetup = useDemo((s) => s.setDateSetup);
  const setMatch = useDemo((s) => s.setMatch);
  const setCourses = useDemo((s) => s.setCourses);
  const setCoursePick = useDemo((s) => s.setCoursePick);
  const reserve = useDemo((s) => s.reserve);

  const [step, setStep] = useState<Step>("setup");
  const [chip, setChip] = useState<string | null>(datePref);
  const [wish, setWish] = useState("");
  const [budgetSel, setBudgetSel] = useState("");
  const [customBudget, setCustomBudget] = useState("");
  const [match, setLocalMatch] = useState<Candidate | null>(null);
  const [courses, setLocalCourses] = useState<[Course, Course] | null>(null);
  const [route, setRoute] = useState<"A" | "B">("A");

  if (!selfTrait) {
    return (
      <AppShell title="매칭">
        <div className="flex flex-col items-center gap-4 px-8 py-24 text-center">
          <span className="text-5xl">✶</span>
          <p className="text-ink-soft">먼저 성향 설문을 완료해야<br />AI가 인연을 찾아드릴 수 있어요.</p>
          <Button onClick={() => navigate("/onboarding")}>설문하러 가기</Button>
        </div>
      </AppShell>
    );
  }

  const finalBudget = budgetSel === "직접 입력" ? (customBudget ? formatWon(Number(customBudget)) : "") : budgetSel;

  const startMatching = async () => {
    setDateSetup(chip ?? "", wish, finalBudget);
    setStep("ranking");
    const ranked = await rankCandidates(selfTrait);
    setLocalMatch(ranked[0]);
    setMatch(ranked[0]);
    setStep("reveal");
  };

  useEffect(() => {
    if (step !== "reveal" || !match) return;
    setLocalCourses(null);
    recommendCourses(selfTrait, match).then((cs) => {
      setLocalCourses(cs);
      setCourses(cs);
    });
  }, [step, match, selfTrait, setCourses]);

  const submitCourse = async () => {
    setCoursePick(route);
    setStep("matching");
    await sendDateRequest();
    setStep(route === PARTNER_PICK ? "success" : "fail");
  };

  // 데이트 준비하기: 선택한 코스를 예약(크레딧 차감 + 세션 생성)하고 데이트 진행 화면으로 이동
  const prepareDate = () => {
    const picked = courses?.[route === "A" ? 0 : 1];
    if (!picked) return;
    reserve(picked, PREP_COST);
    navigate("/date");
  };

  if (step === "setup") {
    return (
      <AppShell title="매칭">
        <div className="stagger space-y-6 p-6">
          <div>
            <h2 className="display text-2xl font-bold text-ink">언제 데이트하고 싶으세요?</h2>
            <p className="mt-1 text-sm text-ink-soft">가능한 날짜를 고르면 AI가 그날에 맞는 단 한 사람을 찾아줘요.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {DATE_CHIPS.map((c) => (
              <Tag key={c} active={chip === c} onClick={() => setChip(c)}>{c}</Tag>
            ))}
          </div>

          {/* 데이트 코스에 추가하고 싶은 것 */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-ink">데이트 코스에 추가하고 싶은 것</label>
            <textarea
              value={wish}
              onChange={(e) => setWish(e.target.value)}
              rows={2}
              placeholder="예) 조용한 카페, 전시 관람, 매운 음식은 피하고 싶어요"
              className="w-full resize-none rounded-2xl border border-blush-200 bg-white px-4 py-3 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-blush-400"
            />
          </div>

          {/* 1인 데이트 예산 */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-ink">1인 데이트 예산</label>
            <select
              value={budgetSel}
              onChange={(e) => setBudgetSel(e.target.value)}
              className="w-full appearance-none rounded-2xl border border-blush-200 bg-white px-4 py-3 text-sm text-ink outline-none focus:border-blush-400"
            >
              <option value="" disabled>예산을 선택하세요</option>
              {BUDGET_OPTIONS.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
            {budgetSel === "직접 입력" && (
              <div className="mt-2 flex items-center gap-2 rounded-2xl border border-blush-200 bg-white px-4 py-3 focus-within:border-blush-400">
                <input
                  type="number"
                  inputMode="numeric"
                  value={customBudget}
                  onChange={(e) => setCustomBudget(e.target.value)}
                  placeholder="직접 입력"
                  className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-faint"
                />
                <span className="flex-none text-sm text-ink-soft">원</span>
              </div>
            )}
          </div>

          <div className="card rounded-2xl p-4 text-sm text-ink-soft">
            ◎ 데모 지역: <b className="text-blush-600">성수</b> · 검증된 안심 프로필만 추천돼요.
          </div>
          <Button full onClick={startMatching} disabled={!chip}>✦ AI 매칭 시작하기</Button>
        </div>
      </AppShell>
    );
  }

  if (step === "ranking") {
    return (
      <AppShell title="매칭 중">
        <AIThinkingLoader message="성향을 분석해 가장 잘 맞는 한 사람을 찾는 중…" />
      </AppShell>
    );
  }

  if (step === "reveal" && match) {
    const selectedCourse = courses?.[route === "A" ? 0 : 1];
    return (
      <AppShell title="오늘의 인연" back nav={false}>
        <div className="stagger space-y-5 p-5 pb-32">
          <p className="display text-center text-lg font-medium text-blush-500">✦ AI가 찾은 오늘의 단 한 사람</p>

          <div className="card rounded-3xl p-5">
            <div className="flex items-center gap-4">
              <Avatar emoji={match.photo} img={match.img} size={72} />
              <div className="flex-1">
                <div className="display text-2xl font-bold text-ink">{match.nickname} <span className="font-sans text-sm font-normal text-ink-soft">{match.age}</span></div>
                <div className="mt-1 flex items-center gap-2 text-sm text-ink-soft">
                  <span>◍ {match.region}</span>
                  <span className="rounded-full bg-blush-100 px-2 py-0.5 text-xs font-semibold text-blush-600">{match.distanceKm}km 거리</span>
                </div>
              </div>
              <CompatibilityRing score={match.score} size={84} />
            </div>
            <div className="mt-4 rounded-2xl bg-lav-100/70 p-3 text-sm leading-relaxed text-ink ring-1 ring-lav-200">
              <span className="mb-1 block text-xs font-bold text-lav-600">✦ AI 분석 근거</span>
              {match.reason}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {match.interests.map((i) => (
                <span key={i} className="rounded-full bg-blush-50 px-3 py-1 text-sm text-blush-600 ring-1 ring-blush-100">#{i}</span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-1 flex items-center gap-2 text-sm font-bold text-blush-600">◇ 마음에 드는 데이트 코스를 선택하세요</h3>
            <p className="mb-3 text-xs text-ink-soft">서로 같은 코스를 선택하면 매칭이 성사돼요.</p>
            {!courses ? (
              <AIThinkingLoader message="두 분 동선에 맞는 코스를 그려보는 중…" />
            ) : (
              <div className="space-y-3">
                <CourseMap distanceKm={match.distanceKm} courseA={courses[0]} courseB={courses[1]} selected={route} onSelect={setRoute} />
                <div className="space-y-2">
                  {(["A", "B"] as const).map((k, i) => {
                    const c = courses[i];
                    const on = route === k;
                    return (
                      <button
                        key={k}
                        onClick={() => setRoute(k)}
                        className={`w-full rounded-2xl border p-3.5 text-left transition active:scale-[0.99] ${
                          on ? (k === "A" ? "border-blush-400 bg-blush-50" : "border-lav-300 bg-lav-100/60") : "border-blush-100 bg-white/70"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-ink">
                            <span className={`mr-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full text-xs text-white ${k === "A" ? "bg-blush-500" : "bg-lav-500"}`}>{k}</span>
                            {c.emoji} {c.title}
                          </span>
                          <span className="text-xs text-ink-soft">{c.estTime} · {c.estCost}</span>
                        </div>
                        <div className="mt-1 pl-7 text-sm text-ink-soft">{c.stops.map((s) => s.name).join(" → ")}</div>
                      </button>
                    );
                  })}
                </div>

                {/* 선택한 코스 상세 */}
                {selectedCourse && (
                  <div className="animate-pop">
                    <p className="mb-2 mt-1 text-xs font-bold text-ink-soft">선택한 {route}코스 상세</p>
                    <CourseDetail course={selectedCourse} accent={route === "A" ? "blush" : "lav"} />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {courses && (
          <div className="absolute bottom-0 left-0 right-0 z-10 border-t border-blush-100 bg-white/85 p-4 backdrop-blur-xl">
            <Button full onClick={submitCourse}>💝 {route}코스로 데이트 신청</Button>
          </div>
        )}
      </AppShell>
    );
  }

  if (step === "matching") {
    return (
      <AppShell title="매칭 확인 중" nav={false}>
        <AIThinkingLoader message="상대의 코스 선택과 맞춰보는 중…" />
      </AppShell>
    );
  }

  if (step === "success" && match) {
    return (
      <AppShell title="매칭 성공" nav={false}>
        <div className="flex h-full flex-col items-center justify-center gap-5 px-8 text-center animate-float-up">
          <div className="text-6xl">🎉</div>
          <div className="flex items-center gap-3">
            <Avatar emoji="🙂" size={60} />
            <span className="text-2xl text-blush-500">♥</span>
            <Avatar emoji={match.photo} img={match.img} size={60} />
          </div>
          <h2 className="display text-4xl font-bold text-ink">매칭 성공!</h2>
          <p className="text-ink-soft">
            두 분 모두 <b className="text-blush-600">{route}코스</b>를 선택했어요.<br />
            이제 데이트를 준비하고 진행해보세요.
          </p>
          <div className="mt-3 w-full max-w-xs space-y-1.5">
            <Button full onClick={prepareDate}>💝 데이트 준비하기</Button>
            <p className="text-center text-xs text-ink-faint">코스 예약에 {PREP_COST} 크레딧이 사용돼요</p>
          </div>
        </div>
      </AppShell>
    );
  }

  if (step === "fail" && match) {
    return (
      <AppShell title="매칭 실패" nav={false}>
        <div className="flex h-full flex-col items-center justify-center gap-5 px-8 text-center animate-float-up">
          <div className="text-6xl">🥲</div>
          <h2 className="display text-3xl font-bold text-ink">매칭이 어긋났어요</h2>
          <p className="text-ink-soft">
            <b className="text-blush-600">{match.nickname}</b>님은 <b className="text-lav-600">{PARTNER_PICK}코스</b>를 선택했어요.<br />
            서로 다른 코스를 골라 이번엔 인연이 닿지 않았어요.
          </p>
          <div className="mt-3 w-full max-w-xs space-y-3">
            <Button full onClick={() => setStep("reveal")}>다른 코스로 다시 신청</Button>
            <Button full variant="ghost" onClick={() => navigate("/")} className="!text-blush-600">처음으로</Button>
          </div>
        </div>
      </AppShell>
    );
  }

  return null;
}
