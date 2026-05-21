import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { AIThinkingLoader } from "../components/AIThinkingLoader";
import { Button, ProgressBar, Avatar } from "../components/ui";
import { SEED_USERS, COURSES } from "../data/seed";
import { summarizeReview } from "../lib/mockApi";
import { useDemo } from "../store";

const REVIEW_TAGS = ["#대화가_잘통해요", "#분위기맛집", "#또만나고싶어요", "#편안했어요", "#재미있어요", "#매너굿"];

const STATE_LABEL: Record<string, string> = {
  scheduled: "예정",
  ongoing: "진행 중",
  completed: "완료",
};

export function DateIng() {
  const navigate = useNavigate();
  const session = useDemo((s) => s.session);
  const checkIn = useDemo((s) => s.checkIn);
  const setReview = useDemo((s) => s.setReview);
  const reviewSummary = useDemo((s) => s.reviewSummary);

  const [rating, setRating] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [summarizing, setSummarizing] = useState(false);

  if (!session) {
    return (
      <AppShell title="데이트">
        <div className="flex flex-col items-center gap-4 px-8 py-24 text-center">
          <span className="text-5xl">📭</span>
          <p className="text-ink-500">아직 진행 중인 데이트가 없어요.<br />마음에 드는 상대와 매칭해보세요!</p>
          <Button onClick={() => navigate("/matching")}>매칭하러 가기</Button>
        </div>
      </AppShell>
    );
  }

  const partner = SEED_USERS.find((u) => u.id === session.candidateId)!;
  const course = COURSES.find((c) => c.id === session.courseId)!;
  const total = course.steps.length;
  const done = session.stepIndex;
  const completed = session.state === "completed";

  const submitReview = async () => {
    setSummarizing(true);
    const summary = await summarizeReview(tags, rating);
    setReview(summary);
    setSummarizing(false);
  };

  return (
    <AppShell title="데이트 진행">
      <div className="space-y-5 p-5">
        {/* 헤더 카드 */}
        <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-br from-brand-500 to-ai-500 p-4 text-white">
          <Avatar emoji={partner.photo} size={52} />
          <div className="flex-1">
            <div className="font-bold">{partner.nickname}님과의 데이트</div>
            <div className="text-sm text-white/80">{course.emoji} {course.title}</div>
          </div>
          <span className="rounded-full bg-white/25 px-3 py-1 text-xs font-semibold">{STATE_LABEL[session.state]}</span>
        </div>

        {/* 진행률 */}
        <div className="space-y-2 rounded-2xl border border-gray-100 p-4">
          <div className="flex justify-between text-sm">
            <span className="font-bold text-ink-900">코스 진행률</span>
            <span className="text-brand-600">{done}/{total} 단계</span>
          </div>
          <ProgressBar value={done} max={total} />

          {/* 단계 타임라인 */}
          <ol className="mt-3 space-y-2">
            {course.steps.map((s, i) => {
              const isDone = i < done;
              const isNext = i === done && !completed;
              return (
                <li key={i} className="flex items-center gap-3 text-sm">
                  <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                    isDone ? "bg-brand-500 text-white" : isNext ? "bg-brand-100 text-brand-600 ring-2 ring-brand-300" : "bg-gray-100 text-gray-400"
                  }`}>
                    {isDone ? "✓" : i + 1}
                  </span>
                  <span className={isDone ? "text-ink-400 line-through" : isNext ? "font-semibold text-ink-900" : "text-ink-500"}>{s}</span>
                </li>
              );
            })}
          </ol>
        </div>

        {/* 체크인 (안심 확인) 또는 후기 */}
        {!completed ? (
          <div className="space-y-3 rounded-2xl border border-gray-100 p-4">
            <div className="text-sm font-bold text-ink-900">📍 다음 장소에서 만남을 인증하세요</div>
            <p className="text-sm text-ink-500">‘{course.steps[done]}’에 도착하면 체크인으로 안전을 확인해요.</p>
            <div className="flex gap-2">
              <Button full variant="outline" onClick={() => checkIn("qr")}>📷 QR 체크인</Button>
              <Button full onClick={() => checkIn("gps")}>📡 GPS 자동 확인</Button>
            </div>
            <p className="text-center text-xs text-ink-500">데모: 버튼을 누르면 도착이 시뮬레이션됩니다.</p>
          </div>
        ) : reviewSummary ? (
          <div className="space-y-3 rounded-2xl bg-brand-50 p-5 text-center animate-float-up">
            <div className="text-4xl">💝</div>
            <div className="text-lg font-bold text-ink-900">데이트 완료!</div>
            <div className="rounded-2xl bg-white p-3 text-sm text-ink-700">
              <span className="mb-1 block text-xs font-bold text-ai-600">🤖 AI 후기 요약</span>
              {reviewSummary}
            </div>
            <Button full onClick={() => navigate("/profile")}>내 리포트 보기 →</Button>
          </div>
        ) : summarizing ? (
          <AIThinkingLoader message="후기를 요약하는 중…" />
        ) : (
          <div className="space-y-4 rounded-2xl border border-gray-100 p-4">
            <div className="text-sm font-bold text-ink-900">오늘 데이트는 어떠셨어요?</div>
            <div className="flex justify-center gap-1 text-3xl">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} onClick={() => setRating(n)} className={n <= rating ? "" : "opacity-30"}>⭐</button>
              ))}
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {REVIEW_TAGS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTags((p) => (p.includes(t) ? p.filter((x) => x !== t) : [...p, t]))}
                  className={`rounded-full px-3 py-1.5 text-sm transition ${
                    tags.includes(t) ? "bg-brand-500 text-white" : "bg-gray-100 text-ink-500"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <Button full onClick={submitReview} disabled={rating === 0}>후기 등록하기</Button>
          </div>
        )}
      </div>
    </AppShell>
  );
}
