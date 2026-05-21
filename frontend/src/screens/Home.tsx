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
    <div className="phone-shell">
      <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-brand-500 via-brand-400 to-ai-500 px-8 text-center text-white">
        {/* 배경 장식 */}
        <div className="pointer-events-none absolute -left-16 -top-10 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-16 -right-10 h-64 w-64 rounded-full bg-white/10 blur-2xl" />

        <img src="/app_logo.png" alt="이음" className="mb-7 h-28 w-28 rounded-3xl shadow-2xl" />
        <h1 className="text-4xl font-extrabold tracking-tight">이음</h1>
        <p className="mt-3 text-lg font-medium text-white/90">AI가 찾아주는 완벽한 인연</p>
        <p className="mt-2 text-sm text-white/70">
          외모·조건이 아닌 <b className="text-white">성격 궁합</b>으로 만나는
          <br />
          진지한 데이트 매칭
        </p>

        <div className="mt-10 w-full max-w-xs space-y-3">
          <Button full onClick={startDemo} className="!bg-white !text-brand-600 !shadow-xl">
            ✨ 데모 시작하기
          </Button>
          {hasProfile && (
            <Button full variant="ghost" onClick={() => navigate("/matching")} className="!text-white hover:!bg-white/15">
              이어서 매칭 보기 →
            </Button>
          )}
        </div>

        <p className="absolute bottom-6 text-xs text-white/50">발표용 데모 · 데이터는 시연용 시드입니다</p>
      </div>
    </div>
  );
}
