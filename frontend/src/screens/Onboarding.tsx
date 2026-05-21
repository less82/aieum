import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { AIThinkingLoader } from "../components/AIThinkingLoader";
import { Button, ProgressBar } from "../components/ui";
import { SURVEY_QUESTIONS, DIMS } from "../data/seed";
import { buildTraitVector } from "../lib/scoring";
import { generateReport } from "../lib/mockApi";
import { useDemo } from "../store";
import type { Dim } from "../types";

type Phase = "auth" | "survey" | "thinking";

export function Onboarding() {
  const navigate = useNavigate();
  const setOnboarding = useDemo((s) => s.setOnboarding);

  const [phase, setPhase] = useState<Phase>("auth");

  // 인증(모킹)
  const [phone, setPhone] = useState("");
  const [codeSent, setCodeSent] = useState(false);

  // 설문
  const [index, setIndex] = useState(0);
  const [sums] = useState<Record<Dim, number>>({ EI: 0, JP: 0, active: 0, values: 0 });
  const [counts] = useState<Record<Dim, number>>({ EI: 0, JP: 0, active: 0, values: 0 });

  const q = SURVEY_QUESTIONS[index];

  const answer = async (value: number) => {
    sums[q.dim] += value;
    counts[q.dim] += 1;

    if (index < SURVEY_QUESTIONS.length - 1) {
      setIndex(index + 1);
      return;
    }
    // 마지막 → 채점 + AI 리포트 생성 연출
    setPhase("thinking");
    const trait = buildTraitVector(sums, counts);
    const report = await generateReport(trait);
    setOnboarding(trait, report);
    navigate("/matching");
  };

  if (phase === "thinking") {
    return (
      <AppShell title="성향 분석" nav={false}>
        <AIThinkingLoader message="AI가 당신의 연애 성향을 분석하고 있어요…" />
      </AppShell>
    );
  }

  if (phase === "auth") {
    return (
      <AppShell title="회원가입" nav={false}>
        <div className="space-y-6 p-6">
          <div>
            <h2 className="text-xl font-bold text-ink-900">휴대폰 본인인증</h2>
            <p className="mt-1 text-sm text-ink-500">안전한 매칭을 위해 본인 확인이 필요해요.</p>
          </div>

          <div className="space-y-3">
            <input
              type="tel"
              inputMode="numeric"
              placeholder="010-0000-0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-2xl border border-gray-200 px-4 py-3.5 text-base outline-none focus:border-brand-400"
            />
            {!codeSent ? (
              <Button full variant="outline" onClick={() => setCodeSent(true)} disabled={phone.length < 3}>
                인증번호 받기
              </Button>
            ) : (
              <div className="space-y-2">
                <input
                  readOnly
                  value="123456"
                  className="w-full rounded-2xl border border-brand-200 bg-brand-50 px-4 py-3.5 text-base tracking-widest text-brand-600"
                />
                <p className="text-xs text-ink-500">데모: 인증번호가 자동 입력되었습니다.</p>
              </div>
            )}
          </div>

          <Button full onClick={() => setPhase("survey")} disabled={!codeSent}>
            인증 완료하고 시작하기
          </Button>
        </div>
      </AppShell>
    );
  }

  // 설문
  return (
    <AppShell title="성향 파악 설문" nav={false}>
      <div className="flex h-full flex-col p-6">
        <div className="mb-8 space-y-2">
          <div className="flex justify-between text-xs font-medium text-ink-500">
            <span>{index + 1} / {SURVEY_QUESTIONS.length}</span>
            <span>{DIMS.length}개 성향 분석 중</span>
          </div>
          <ProgressBar value={index + 1} max={SURVEY_QUESTIONS.length} />
        </div>

        <div key={q.id} className="animate-float-up">
          <h2 className="mb-8 text-2xl font-bold leading-snug text-ink-900">{q.title}</h2>
          <div className="space-y-3">
            {q.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => answer(opt.value)}
                className="w-full rounded-2xl border border-gray-200 bg-white px-5 py-5 text-left text-lg font-medium text-ink-700 transition hover:border-brand-400 hover:bg-brand-50 active:scale-[0.99]"
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <p className="mt-auto pt-8 text-center text-xs text-ink-500">
          정답은 없어요. 솔직하게 고를수록 매칭이 정확해집니다 💕
        </p>
      </div>
    </AppShell>
  );
}
