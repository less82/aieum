import type { Course } from "../types";
import { courseTotal, formatWon } from "../data/seed";

/**
 * 선택한 코스의 상세 내역 (경유지별 메뉴 + 1인 가격 + 총 선결제 금액).
 * 매칭 화면(코스 선택)과 대화창(코스 예약 시트)에서 공용으로 사용.
 */
export function CourseDetail({ course, accent = "blush" }: { course: Course; accent?: "blush" | "lav" }) {
  const total = courseTotal(course);
  const tone = accent === "lav"
    ? { ring: "ring-lav-200", chip: "bg-lav-500", line: "border-lav-100", total: "text-lav-600", totalBg: "bg-lav-100/60" }
    : { ring: "ring-blush-200", chip: "bg-blush-500", line: "border-blush-100", total: "text-blush-600", totalBg: "bg-blush-50" };

  return (
    <div className={`rounded-2xl bg-white/90 p-4 ring-1 ${tone.ring}`}>
      <div className="flex items-center justify-between">
        <div className="display text-lg font-bold text-ink">{course.emoji} {course.title}</div>
        <span className="text-xs font-medium text-ink-soft">{course.estTime}</span>
      </div>

      <div className="mt-3 space-y-2">
        {course.stops.map((s, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <span className={`flex h-5 w-5 flex-none items-center justify-center rounded-full text-[11px] font-bold text-white ${tone.chip}`}>{i + 1}</span>
            <span className="font-semibold text-ink">{s.name}</span>
            {s.menu && <span className="text-ink-faint">· {s.menu}</span>}
            <span className="ml-auto flex-none font-semibold text-ink-soft">{formatWon(s.price ?? 0)}</span>
          </div>
        ))}
      </div>

      <div className={`mt-3 flex items-center justify-between rounded-xl ${tone.totalBg} px-3 py-2.5`}>
        <span className="text-sm font-semibold text-ink">총 선결제</span>
        <span className={`display text-xl font-bold ${tone.total}`}>{formatWon(total)}</span>
      </div>
    </div>
  );
}
