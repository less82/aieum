import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { AIThinkingLoader } from "../components/AIThinkingLoader";
import { Button, CompatibilityRing, Tag, Avatar } from "../components/ui";
import { DATE_CHIPS } from "../data/seed";
import { DIM_LABEL } from "../lib/scoring";
import { rankCandidates, recommendCourses, generateIcebreakers } from "../lib/mockApi";
import { useDemo } from "../store";
import type { Candidate, Course } from "../types";

type Step = "setup" | "ranking" | "list" | "detail" | "matched" | "connect";

export function Matching() {
  const navigate = useNavigate();
  const selfTrait = useDemo((s) => s.selfTrait);
  const myInterests = useDemo((s) => s.myInterests);
  const datePref = useDemo((s) => s.datePref);
  const setDatePref = useDemo((s) => s.setDatePref);
  const confirmMatch = useDemo((s) => s.confirmMatch);
  const spendCredit = useDemo((s) => s.spendCredit);

  const [step, setStep] = useState<Step>("setup");
  const [chip, setChip] = useState<string | null>(datePref);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selected, setSelected] = useState<Candidate | null>(null);

  const [icebreakers, setIcebreakers] = useState<string[] | null>(null);
  const [courses, setCourses] = useState<[Course, Course] | null>(null);

  // selfTrait 없으면 온보딩으로 유도
  if (!selfTrait) {
    return (
      <AppShell title="매칭">
        <div className="flex flex-col items-center gap-4 px-8 py-24 text-center">
          <span className="text-5xl">📝</span>
          <p className="text-ink-500">먼저 성향 설문을 완료해야<br />AI가 궁합을 분석할 수 있어요.</p>
          <Button onClick={() => navigate("/onboarding")}>설문하러 가기</Button>
        </div>
      </AppShell>
    );
  }

  const startMatching = async () => {
    if (chip) setDatePref(chip);
    setStep("ranking");
    const ranked = await rankCandidates(selfTrait);
    setCandidates(ranked);
    setStep("list");
  };

  const requestMatch = () => {
    spendCredit();
    setStep("matched");
  };

  // connect 단계 진입 시 아이스브레이커 + 코스 동시 생성
  useEffect(() => {
    if (step !== "connect" || !selected) return;
    setIcebreakers(null);
    setCourses(null);
    generateIcebreakers(myInterests, selected).then(setIcebreakers);
    recommendCourses(selfTrait, selected).then(setCourses);
  }, [step, selected, myInterests, selfTrait]);

  const pickCourse = (course: Course) => {
    if (!selected) return;
    confirmMatch(selected, course);
    navigate("/date");
  };

  // ── 1) 조건 설정 ──
  if (step === "setup") {
    return (
      <AppShell title="매칭">
        <div className="space-y-7 p-6">
          <div>
            <h2 className="text-xl font-bold text-ink-900">언제 데이트하고 싶으세요?</h2>
            <p className="mt-1 text-sm text-ink-500">가능한 날짜를 고르면 AI가 그 일정에 맞는 상대를 찾아줘요.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {DATE_CHIPS.map((c) => (
              <Tag key={c} active={chip === c} onClick={() => setChip(c)}>
                {c}
              </Tag>
            ))}
          </div>
          <div className="rounded-2xl bg-brand-50 p-4 text-sm text-brand-700">
            📍 데모 지역: <b>성수</b> · 검증된 안심 프로필만 추천돼요.
          </div>
          <Button full onClick={startMatching} disabled={!chip}>
            💘 AI 매칭 시작하기
          </Button>
        </div>
      </AppShell>
    );
  }

  // ── 2) 랭킹 로딩 ──
  if (step === "ranking") {
    return (
      <AppShell title="매칭 중">
        <AIThinkingLoader message="성향 데이터를 분석해 궁합을 계산 중…" />
      </AppShell>
    );
  }

  // ── 3) 후보 리스트 ──
  if (step === "list") {
    return (
      <AppShell title="추천 상대">
        <div className="space-y-3 p-4">
          <p className="px-2 text-sm text-ink-500">궁합이 높은 순으로 추천했어요.</p>
          {candidates.map((c) => (
            <button
              key={c.id}
              onClick={() => { setSelected(c); setStep("detail"); }}
              className="flex w-full items-center gap-3 rounded-2xl border border-gray-100 bg-white p-3 text-left shadow-sm transition hover:border-brand-300 active:scale-[0.99]"
            >
              <Avatar emoji={c.photo} />
              <div className="min-w-0 flex-1">
                <div className="font-bold text-ink-900">{c.nickname} <span className="text-sm font-normal text-ink-500">{c.age} · {c.region}</span></div>
                <div className="truncate text-sm text-ink-500">{c.bio}</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-extrabold text-brand-600">{c.score}%</div>
                <div className="text-[10px] text-ink-500">궁합</div>
              </div>
            </button>
          ))}
        </div>
      </AppShell>
    );
  }

  // ── 4) 후보 상세 (궁합 + 근거) ──
  if (step === "detail" && selected) {
    return (
      <AppShell title="궁합 분석" back>
        <div className="space-y-5 p-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <Avatar emoji={selected.photo} size={88} />
            <div>
              <div className="text-2xl font-bold text-ink-900">{selected.nickname}</div>
              <div className="text-sm text-ink-500">{selected.age} · {selected.region}</div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4 rounded-3xl bg-gradient-to-b from-brand-50 to-white p-6">
            <CompatibilityRing score={selected.score} />
            <div className="rounded-2xl bg-white p-4 text-center text-sm leading-relaxed text-ink-700 shadow-sm">
              <span className="mb-1 block text-xs font-bold text-ai-600">🤖 AI 분석 근거</span>
              {selected.reason}
            </div>
            <div className="flex gap-2 text-xs">
              <span className="rounded-full bg-brand-100 px-3 py-1 text-brand-700">✅ {DIM_LABEL[selected.topMatch]} 일치</span>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-ink-500">🔄 {DIM_LABEL[selected.topDiff]} 보완</span>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 p-4">
            <div className="mb-2 text-sm font-bold text-ink-900">관심사</div>
            <div className="flex flex-wrap gap-2">
              {selected.interests.map((i) => (
                <span key={i} className="rounded-full bg-ai-500/10 px-3 py-1 text-sm text-ai-600">#{i}</span>
              ))}
            </div>
            <p className="mt-3 text-sm text-ink-500">{selected.bio}</p>
          </div>

          <Button full onClick={requestMatch}>💘 매칭 신청하기 (크레딧 1개)</Button>
        </div>
      </AppShell>
    );
  }

  // ── 5) 매칭 성공 ──
  if (step === "matched" && selected) {
    return (
      <AppShell title="매칭 성공" nav={false}>
        <div className="flex h-full flex-col items-center justify-center gap-5 px-8 text-center animate-float-up">
          <div className="text-6xl">🎉</div>
          <div className="flex items-center gap-3">
            <Avatar emoji="🙂" size={64} />
            <span className="text-2xl">💞</span>
            <Avatar emoji={selected.photo} size={64} />
          </div>
          <h2 className="text-2xl font-extrabold text-ink-900">매칭 성공!</h2>
          <p className="text-ink-500">
            <b className="text-brand-600">{selected.nickname}</b>님도 당신에게 호감을 보였어요.<br />
            이제 대화를 시작하고 데이트 코스를 함께 정해봐요.
          </p>
          <Button full onClick={() => setStep("connect")} className="mt-4 max-w-xs">
            💬 대화 시작하고 코스 정하기
          </Button>
        </div>
      </AppShell>
    );
  }

  // ── 6) 대화창(아이스브레이킹) + 코스 A/B ──
  if (step === "connect" && selected) {
    return (
      <AppShell title={`${selected.nickname}님과의 시작`} back>
        <div className="space-y-6 p-5">
          {/* 아이스브레이킹 가이드 */}
          <section>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-ai-600">💬 AI 아이스브레이킹 가이드</h3>
            {!icebreakers ? (
              <AIThinkingLoader message="첫 대화 멘트를 만드는 중…" />
            ) : (
              <div className="space-y-2">
                {icebreakers.map((t, i) => (
                  <div key={i} className="rounded-2xl rounded-tl-sm bg-ai-500/10 p-3 text-sm text-ink-700 animate-float-up" style={{ animationDelay: `${i * 0.1}s` }}>
                    {t}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* 코스 A/B */}
          <section>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-brand-600">🗺️ AI 추천 데이트 코스 — 마음에 드는 쪽을 골라요</h3>
            {!courses ? (
              <AIThinkingLoader message="두 분 취향에 맞는 코스를 짜는 중…" />
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {courses.map((c, i) => (
                  <button
                    key={c.id}
                    onClick={() => pickCourse(c)}
                    className="rounded-2xl border border-gray-100 bg-white p-4 text-left shadow-sm transition hover:border-brand-400 active:scale-[0.99] animate-float-up"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    <div className="mb-1 flex items-center justify-between">
                      <span className="font-bold text-ink-900">{c.emoji} {String.fromCharCode(65 + i)}안 · {c.title}</span>
                      <span className="text-xs text-ink-500">{c.estTime} · {c.estCost}</span>
                    </div>
                    <div className="text-sm text-ink-500">{c.steps.join(" → ")}</div>
                  </button>
                ))}
              </div>
            )}
            <p className="mt-3 text-center text-xs text-ink-500">코스를 고르면 매칭이 확정되고 데이트가 시작돼요.</p>
          </section>
        </div>
      </AppShell>
    );
  }

  return null;
}
