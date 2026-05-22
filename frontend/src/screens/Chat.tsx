import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Avatar } from "../components/ui";
import { courseTotal, formatWon } from "../data/seed";
import { useDemo } from "../store";

const GREETING = "안녕하세요! 매칭돼서 반가워요 ☺️ 프로필 보니 취향이 잘 맞을 것 같아요.";
const PARTNER_LINES = [
  "저도 성수 자주 가요! 분위기 좋은 곳 많더라고요.",
  "예약해주신 코스 너무 좋아요 :) 그날 정말 기대돼요!",
  "편한 신발로 갈게요. 끝나고 근처 더 둘러봐도 좋겠어요 ☺️",
  "그럼 그날 만나요! 미리 연락 주시면 시간 맞춰 나갈게요 💕",
];
const SUGGESTIONS = ["안녕하세요, 반가워요 😊", "그날 몇 시에 만날까요?", "예약한 코스 기대돼요!"];

interface Msg { from: "them" | "me"; text: string; }

export function Chat() {
  const navigate = useNavigate();
  const match = useDemo((s) => s.match);
  const course = useDemo((s) => s.course); // 예약 확정된 코스

  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [typing, setTyping] = useState(false);
  const [replyIdx, setReplyIdx] = useState(0);
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!match) return;
    setTyping(true);
    const t = setTimeout(() => {
      setTyping(false);
      setMsgs([{ from: "them", text: GREETING }]);
    }, 900);
    return () => clearTimeout(t);
  }, [match]);

  useEffect(() => {
    scrollRef.current?.scrollTo?.({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, typing]);

  if (!match) {
    return (
      <div className="phone-shell items-center justify-center gap-4 px-8 text-center">
        <span className="text-5xl">💬</span>
        <p className="text-ink-soft">아직 대화할 상대가 없어요.<br />먼저 매칭을 해보세요.</p>
        <Button onClick={() => navigate("/matching")}>매칭하러 가기</Button>
      </div>
    );
  }

  const partnerReply = () => {
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      const line = PARTNER_LINES[Math.min(replyIdx, PARTNER_LINES.length - 1)];
      setMsgs((m) => [...m, { from: "them", text: line }]);
      setReplyIdx((i) => i + 1);
    }, 1000);
  };

  const send = (text: string) => {
    const t = text.trim();
    if (!t) return;
    setMsgs((m) => [...m, { from: "me", text: t }]);
    setDraft("");
    partnerReply();
  };

  return (
    <div className="phone-shell no-scrollbar">
      <div className="relative z-10 flex items-center justify-between px-5 pt-2.5 pb-1 text-[11px] font-semibold text-ink">
        <span>9:41</span>
        <span className="flex items-center gap-1.5 text-blush-500">♥ 이음</span>
      </div>

      <header className="relative z-10 flex items-center gap-3 border-b border-blush-100 bg-white/60 px-4 py-3 backdrop-blur">
        <button onClick={() => navigate(-1)} className="text-2xl leading-none text-ink-soft hover:text-ink" aria-label="뒤로">‹</button>
        <Avatar emoji={match.photo} img={match.img} size={40} />
        <div className="flex-1">
          <div className="font-semibold text-ink">{match.nickname}</div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-500">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" /> 대화 중
          </div>
        </div>
        <button
          onClick={() => navigate("/date")}
          className="rounded-full bg-gradient-to-br from-blush-100 to-lav-100 px-3.5 py-2 text-xs font-bold text-blush-600 ring-1 ring-blush-200"
        >
          📅 데이트 진행
        </button>
      </header>

      {course && (
        <div className="relative z-10 flex items-center justify-center gap-1.5 bg-blush-50/80 px-4 py-1.5 text-[11px] text-blush-600">
          💝 예약된 코스 <b className="font-semibold">{course.emoji} {course.title}</b> · 총 {formatWon(courseTotal(course))} 선결제
        </div>
      )}

      <div ref={scrollRef} className="no-scrollbar relative z-10 flex-1 space-y-3 overflow-y-auto px-4 py-5">
        <p className="mx-auto w-fit rounded-full bg-white/70 px-3 py-1 text-[11px] text-ink-faint ring-1 ring-blush-100">매칭 성공! 데이트 전 가볍게 대화를 나눠보세요 ♥</p>
        {msgs.map((m, i) =>
          m.from === "them" ? (
            <div key={i} className="flex items-end gap-2 animate-pop">
              <Avatar emoji={match.photo} img={match.img} size={28} ring={false} />
              <div className="max-w-[75%] rounded-2xl rounded-bl-sm card px-3.5 py-2.5 text-sm text-ink">{m.text}</div>
            </div>
          ) : (
            <div key={i} className="flex justify-end animate-pop">
              <div className="max-w-[75%] rounded-2xl rounded-br-sm bg-gradient-to-br from-blush-400 to-blush-600 px-3.5 py-2.5 text-sm text-white shadow-[0_8px_18px_-10px_rgba(236,90,131,0.8)]">{m.text}</div>
            </div>
          )
        )}
        {typing && (
          <div className="flex items-end gap-2">
            <Avatar emoji={match.photo} img={match.img} size={28} ring={false} />
            <div className="rounded-2xl rounded-bl-sm card px-4 py-3">
              <span className="flex gap-1">
                {[0, 1, 2].map((d) => (
                  <span key={d} className="h-1.5 w-1.5 animate-bounce rounded-full bg-blush-400" style={{ animationDelay: `${d * 0.15}s` }} />
                ))}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="relative z-10 border-t border-blush-100 bg-white/70 backdrop-blur-xl">
        <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pt-3">
          {SUGGESTIONS.map((s) => (
            <button key={s} onClick={() => send(s)} className="whitespace-nowrap rounded-full bg-blush-50 px-3.5 py-1.5 text-xs text-blush-600 ring-1 ring-blush-100 hover:bg-blush-100">
              {s}
            </button>
          ))}
        </div>
        <form className="flex items-center gap-2 px-4 py-3" onSubmit={(e) => { e.preventDefault(); send(draft); }}>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="메시지 보내기…"
            className="flex-1 rounded-full border border-blush-200 bg-white px-4 py-2.5 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-blush-400"
          />
          <button type="submit" className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blush-400 to-blush-600 text-white shadow-[0_8px_18px_-8px_rgba(236,90,131,0.8)]" aria-label="보내기">↑</button>
        </form>
      </div>
    </div>
  );
}
