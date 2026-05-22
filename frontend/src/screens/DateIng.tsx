import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { AIThinkingLoader } from "../components/AIThinkingLoader";
import { Button, ProgressBar, Avatar } from "../components/ui";
import { SEED_USERS, COURSES, formatWon } from "../data/seed";
import { summarizeReview } from "../lib/mockApi";
import { useDemo } from "../store";

const REVIEW_TAGS = ["#대화가_잘통해요", "#분위기맛집", "#또만나고싶어요", "#편안했어요", "#재미있어요", "#매너굿"];
const STATE_LABEL: Record<string, string> = { scheduled: "예정", ongoing: "진행 중", completed: "완료" };

export function DateIng() {
  const navigate = useNavigate();
  const session = useDemo((s) => s.session);
  const checkIn = useDemo((s) => s.checkIn);
  const setReview = useDemo((s) => s.setReview);
  const reviewSummary = useDemo((s) => s.reviewSummary);

  const [rating, setRating] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [summarizing, setSummarizing] = useState(false);
  const [openStop, setOpenStop] = useState<number | null>(null);

  if (!session) {
    return (
      <AppShell title="데이트">
        <div className="flex flex-col items-center gap-4 px-8 py-24 text-center">
          <span className="text-5xl">✦</span>
          <p className="text-ink-soft">진행 중인 데이트가 없어요.<br />마음에 드는 상대와 코스를 예약해보세요!</p>
          <Button onClick={() => navigate("/matching")}>매칭하러 가기</Button>
        </div>
      </AppShell>
    );
  }

  const partner = SEED_USERS.find((u) => u.id === session.candidateId)!;
  const course = COURSES.find((c) => c.id === session.courseId)!;
  const total = course.stops.length;
  const done = session.stepIndex;
  const completed = session.state === "completed";

  const submitReview = async () => {
    setSummarizing(true);
    const summary = await summarizeReview(tags, rating, note);
    setReview(summary);
    setSummarizing(false);
  };

  return (
    <AppShell title="데이트 진행">
      <div className="stagger space-y-5 p-5">
        <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-br from-blush-200/80 to-lav-100 p-4 ring-1 ring-blush-100">
          <Avatar emoji={partner.photo} size={52} />
          <div className="flex-1">
            <div className="font-semibold text-ink">{partner.nickname}님과의 데이트</div>
            <div className="text-sm text-blush-600">{course.emoji} {course.title}</div>
          </div>
          <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-blush-600 ring-1 ring-blush-100">{STATE_LABEL[session.state]}</span>
        </div>

        <Button full variant="outline" onClick={() => navigate("/chat")}>💬 {partner.nickname}님과 대화창 열기</Button>

        <div className="card space-y-2 rounded-2xl p-4">
          <div className="flex justify-between text-sm">
            <span className="font-semibold text-ink">코스 진행률</span>
            <span className="text-blush-600">{done}/{total} 단계</span>
          </div>
          <ProgressBar value={done} max={total} />
          <p className="text-xs text-ink-faint">장소를 누르면 사진과 정보를 볼 수 있어요.</p>
          <ol className="mt-1 space-y-1.5">
            {course.stops.map((s, i) => {
              const isDone = i < done;
              const isNext = i === done && !completed;
              const open = openStop === i;
              return (
                <li key={i} className="rounded-2xl ring-1 ring-blush-100">
                  <button
                    onClick={() => setOpenStop(open ? null : i)}
                    className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm"
                  >
                    <span className={`flex h-6 w-6 flex-none items-center justify-center rounded-full text-xs ${
                      isDone ? "bg-blush-500 text-white" : isNext ? "bg-blush-100 text-blush-600 ring-2 ring-blush-300" : "bg-blush-50 text-ink-faint"
                    }`}>
                      {isDone ? "✓" : i + 1}
                    </span>
                    <span className={`flex-1 ${isDone ? "text-ink-faint line-through" : isNext ? "font-semibold text-ink" : "text-ink-soft"}`}>{s.name}</span>
                    <span className="flex-none rounded-full bg-blush-50 px-2.5 py-1 text-xs font-semibold text-blush-600">{s.price ? formatWon(s.price) : "무료"}</span>
                    <span className={`flex-none text-ink-faint transition-transform ${open ? "rotate-90" : ""}`}>›</span>
                  </button>
                  {open && (
                    <div className="animate-pop space-y-2 px-3 pb-3">
                      {s.img ? (
                        <img src={s.img} alt={s.name} className="h-36 w-full rounded-xl object-cover ring-1 ring-blush-100" />
                      ) : (
                        <div className="flex h-36 w-full items-center justify-center rounded-xl bg-gradient-to-br from-blush-100 to-lav-100 text-5xl ring-1 ring-blush-100">{s.emoji ?? "📍"}</div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-ink-soft">{s.desc ?? s.menu}</span>
                        {s.menu && <span className="text-xs font-semibold text-blush-600">{s.menu} · {formatWon(s.price ?? 0)}</span>}
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        </div>

        {!completed ? (
          <div className="card space-y-3 rounded-2xl p-4">
            <div className="text-sm font-semibold text-ink">◍ 다음 장소에서 만남을 인증하세요</div>
            <p className="text-sm text-ink-soft">‘{course.stops[done].name}’에 도착하면 체크인으로 안전을 확인해요.</p>
            <div className="flex gap-2">
              <Button full variant="outline" onClick={() => checkIn("qr")}>▣ QR 체크인</Button>
              <Button full onClick={() => checkIn("gps")}>◎ GPS 자동 확인</Button>
            </div>
            <p className="text-center text-xs text-ink-faint">데모: 버튼을 누르면 도착이 시뮬레이션됩니다.</p>
          </div>
        ) : reviewSummary ? (
          <div className="card space-y-3 rounded-2xl p-5 text-center animate-float-up">
            <div className="text-4xl">💝</div>
            <div className="display text-2xl font-bold text-ink">데이트 완료!</div>
            <div className="rounded-2xl bg-lav-100/70 p-3 text-sm text-ink ring-1 ring-lav-200">
              <span className="mb-1 block text-xs font-bold text-lav-600">✦ AI 후기 요약</span>
              {reviewSummary}
            </div>
            <Button full onClick={() => navigate("/profile")}>내 리포트 보기 →</Button>
          </div>
        ) : summarizing ? (
          <AIThinkingLoader message="후기를 요약하는 중…" />
        ) : (
          <div className="card space-y-4 rounded-2xl p-4">
            <div className="text-sm font-semibold text-ink">오늘 데이트는 어떠셨어요?</div>
            <div className="flex justify-center gap-1 text-3xl">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} onClick={() => setRating(n)} className={n <= rating ? "" : "opacity-30 grayscale"}>⭐</button>
              ))}
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {REVIEW_TAGS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTags((p) => (p.includes(t) ? p.filter((x) => x !== t) : [...p, t]))}
                  className={`rounded-full px-3 py-1.5 text-sm transition ${
                    tags.includes(t) ? "bg-blush-500 text-white" : "bg-blush-50 text-ink-soft ring-1 ring-blush-100"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="오늘 데이트는 어땠는지 자유롭게 적어주세요 (선택)"
              className="w-full resize-none rounded-2xl border border-blush-200 bg-white px-4 py-3 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-blush-400"
            />
            <Button full onClick={submitReview} disabled={rating === 0}>후기 등록하기</Button>
          </div>
        )}
      </div>
    </AppShell>
  );
}
