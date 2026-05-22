import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui";
import { useDemo } from "../store";

export function Home() {
  const navigate = useNavigate();
  const reset = useDemo((s) => s.reset);
  const hasProfile = useDemo((s) => s.selfTrait !== null);

  const startDemo = () => {
    reset();
    navigate("/onboarding");
  };

  return (
    <div className="phone-shell items-center justify-center px-9 text-center">
      <span className="bokeh" style={{ width: 18, height: 18, left: "16%", top: "18%" }} />
      <span className="bokeh" style={{ width: 12, height: 12, right: "20%", top: "26%", animationDelay: "1.5s" }} />
      <span className="bokeh" style={{ width: 14, height: 14, left: "26%", bottom: "22%", animationDelay: "3s" }} />
      <span className="bokeh" style={{ width: 9, height: 9, right: "28%", bottom: "30%", animationDelay: "2.2s" }} />

      <div className="stagger relative z-10 flex flex-col items-center">
        <img src="/app_logo.png" alt="이음 로고" className="mb-7 h-24 w-24 rounded-[26%] shadow-[0_18px_44px_-12px_rgba(236,90,131,0.5)] ring-1 ring-white/70" />

        <p className="text-[11px] font-semibold uppercase tracking-[0.5em] text-lav-500">AI Matchmaking</p>
        <img src="/font.png" alt="이음" className="mt-3 w-48" />
        <p className="display mt-2 text-2xl font-medium text-blush-500">AI가 찾아주는 완벽한 인연</p>

        <div className="my-6 h-px w-14 bg-gradient-to-r from-transparent via-blush-300 to-transparent" />

        <p className="max-w-[17rem] text-sm leading-relaxed text-ink-soft">
          외모·조건이 아닌 <b className="font-semibold text-ink">성격 궁합</b>으로 만나는
          진지한 데이트. 오늘, 단 한 사람을 소개합니다.
        </p>

        <div className="mt-10 w-full max-w-xs space-y-3">
          <Button full onClick={startDemo}>✦ 데모 시작하기</Button>
          {hasProfile && (
            <Button full variant="ghost" onClick={() => navigate("/matching")} className="!text-blush-600">
              이어서 매칭 보기 →
            </Button>
          )}
        </div>
      </div>

      <p className="absolute bottom-6 z-10 text-[11px] tracking-wide text-ink-faint">발표용 데모 · 데이터는 시연용 시드입니다</p>
    </div>
  );
}
