import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { Button, Avatar } from "../components/ui";
import { DIM_LABEL } from "../lib/scoring";
import { DIMS } from "../data/seed";
import { useDemo } from "../store";
import type { Dim } from "../types";

const POLE: Record<Dim, [string, string]> = {
  EI: ["내향", "외향"],
  JP: ["즉흥", "계획"],
  active: ["차분", "액티브"],
  values: ["자유", "진지"],
};

export function Profile() {
  const navigate = useNavigate();
  const selfTrait = useDemo((s) => s.selfTrait);
  const selfReport = useDemo((s) => s.selfReport);
  const credits = useDemo((s) => s.credits);
  const addCredits = useDemo((s) => s.addCredits);

  const [charged, setCharged] = useState(false);

  if (!selfTrait || !selfReport) {
    return (
      <AppShell title="마이페이지">
        <div className="flex flex-col items-center gap-4 px-8 py-24 text-center">
          <span className="text-5xl">❀</span>
          <p className="text-ink-soft">성향 설문을 완료하면<br />나만의 AI 리포트가 생성돼요.</p>
          <Button onClick={() => navigate("/onboarding")}>설문하러 가기</Button>
        </div>
      </AppShell>
    );
  }

  const charge = () => { addCredits(5); setCharged(true); };

  return (
    <AppShell title="마이페이지">
      <div className="stagger space-y-5 p-5">
        <div className="card flex items-center gap-4 rounded-2xl p-4">
          <Avatar emoji="🙂" size={64} />
          <div className="flex-1">
            <div className="display text-2xl font-bold text-ink">나 (데모)</div>
            <div className="text-sm text-ink-soft">성수 · 인증 완료 ✓</div>
          </div>
          <button className="text-sm text-blush-600">편집</button>
        </div>

        {/* AI 성향 리포트 */}
        <div className="card space-y-4 rounded-2xl p-5">
          <div className="flex items-center gap-2 text-sm font-bold text-lav-600">✦ AI 성향 리포트</div>
          <div className="flex flex-wrap gap-2">
            {selfReport.keywords.map((k) => (
              <span key={k} className="rounded-full bg-blush-100 px-3 py-1 text-sm font-medium text-blush-600 ring-1 ring-blush-200">{k}</span>
            ))}
          </div>
          <p className="text-sm leading-relaxed text-ink">{selfReport.summary}</p>

          <div className="space-y-3 pt-1">
            {DIMS.map((d) => {
              const v = selfTrait[d];
              const [lo, hi] = POLE[d];
              return (
                <div key={d}>
                  <div className="mb-1 flex justify-between text-xs text-ink-faint">
                    <span>{lo}</span>
                    <span className="font-semibold text-ink-soft">{DIM_LABEL[d]}</span>
                    <span>{hi}</span>
                  </div>
                  <div className="relative h-2 rounded-full bg-blush-100">
                    <div className="absolute h-2 rounded-full bg-gradient-to-r from-blush-400 to-lav-400" style={{ width: `${Math.round(v * 100)}%` }} />
                    <div className="absolute -top-0.5 h-3 w-3 -translate-x-1/2 rounded-full border-2 border-blush-400 bg-white" style={{ left: `${Math.round(v * 100)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 크레딧 지갑 */}
        <div className="card-peach rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-peach-600">보유 크레딧</div>
              <div className="display text-3xl font-bold text-peach-600">{credits} <span className="text-base">💎</span></div>
            </div>
            <Button variant="peach" onClick={charge}>충전하기</Button>
          </div>
          {charged && <p className="mt-2 text-xs text-peach-600">데모: 결제 없이 5크레딧이 충전되었습니다.</p>}
          <p className="mt-2 text-xs text-ink-soft">데이트 코스 예약 시 크레딧이 사용돼요. (첫 3크레딧 무료)</p>
        </div>

        <div className="card overflow-hidden rounded-2xl">
          {["안심 안전센터", "고객센터", "이용약관"].map((m) => (
            <div key={m} className="flex items-center justify-between border-b border-blush-100 px-4 py-3.5 text-sm text-ink last:border-0">
              {m} <span className="text-ink-faint">›</span>
            </div>
          ))}
        </div>

        <Button full variant="ghost" onClick={() => navigate("/")}>홈으로 / 데모 다시 시작</Button>
      </div>
    </AppShell>
  );
}
