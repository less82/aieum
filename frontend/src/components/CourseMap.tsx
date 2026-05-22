import type { Course, MapPoint } from "../types";
import { ME_LOC } from "../data/seed";

interface Props {
  distanceKm: number;
  courseA: Course;
  courseB: Course;
  selected: "A" | "B" | null;
  onSelect?: (which: "A" | "B") => void;
}

function routePath(course: Course): string {
  const pts: MapPoint[] = [ME_LOC, ...course.stops];
  return pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
}

const STROKE = { A: "#ec5a83", B: "#7d5fe0" } as const;

export function CourseMap({ distanceKm, courseA, courseB, selected, onSelect }: Props) {
  const routes: { key: "A" | "B"; course: Course }[] = [
    { key: "A", course: courseA },
    { key: "B", course: courseB },
  ];

  return (
    <div className="relative overflow-hidden rounded-[28px] ring-1 ring-blush-100 shadow-[0_18px_40px_-20px_rgba(214,66,109,0.4)]">
      <div className="absolute right-3 top-3 z-10 flex items-center gap-1.5 rounded-full bg-white/85 px-3 py-1.5 text-xs font-bold text-blush-600 ring-1 ring-blush-100 backdrop-blur">
        <span>◎</span> 상대와 약 {distanceKm}km
      </div>

      <svg viewBox="0 0 100 80" className="block w-full" role="img" aria-label="데이트 코스 지도">
        <defs>
          <linearGradient id="map-bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fef3f8" />
            <stop offset="100%" stopColor="#f1ebfb" />
          </linearGradient>
          <linearGradient id="routeA" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffa6c1" />
            <stop offset="100%" stopColor="#ec5a83" />
          </linearGradient>
          <linearGradient id="routeB" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#c4b3f2" />
            <stop offset="100%" stopColor="#7d5fe0" />
          </linearGradient>
          <filter id="glowA" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="0" stdDeviation="1.4" floodColor="#ec5a83" floodOpacity="0.6" />
          </filter>
          <filter id="glowB" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="0" stdDeviation="1.4" floodColor="#7d5fe0" floodOpacity="0.6" />
          </filter>
        </defs>

        <rect x="0" y="0" width="100" height="80" fill="url(#map-bg)" />

        {/* 그리드 */}
        <g stroke="#4a3d59" strokeOpacity="0.05" strokeWidth="0.3">
          {[16, 32, 48, 64].map((y) => <line key={`h${y}`} x1="0" y1={y} x2="100" y2={y} />)}
          {[20, 40, 60, 80].map((x) => <line key={`v${x}`} x1={x} y1="0" x2={x} y2="80" />)}
        </g>

        {/* 블록 */}
        {[
          [10, 10, 16, 10], [30, 8, 14, 9], [56, 10, 18, 8], [78, 14, 14, 10],
          [12, 26, 12, 12], [70, 36, 16, 10], [22, 60, 16, 9], [50, 62, 20, 8],
        ].map(([x, y, w, h], i) => (
          <rect key={i} x={x} y={y} width={w} height={h} rx="2" fill="#ffffff" opacity="0.6" />
        ))}

        {/* 한강 */}
        <path d="M 0 74 Q 30 70 55 73 T 100 72 L 100 80 L 0 80 Z" fill="#bfe0f2" opacity="0.6" />
        <text x="6" y="79" fontSize="2.6" fill="#86b4d4">한강</text>

        {/* 코스 경로 */}
        {routes.map(({ key, course }) => {
          const active = selected === null || selected === key;
          const last = course.stops[course.stops.length - 1];
          return (
            <g
              key={key}
              opacity={active ? 1 : 0.28}
              style={{ cursor: onSelect ? "pointer" : undefined, transition: "opacity .25s" }}
              onClick={() => onSelect?.(key)}
            >
              <path
                d={routePath(course)}
                fill="none"
                stroke={`url(#route${key})`}
                strokeWidth={selected === key ? 2.8 : 2}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={active ? undefined : "2.4 2"}
                filter={selected === key ? `url(#glow${key})` : undefined}
                style={{ transition: "stroke-width .25s" }}
              />
              {course.stops.map((s, i) => {
                const isLast = i === course.stops.length - 1;
                return (
                  <g key={i}>
                    <circle cx={s.x} cy={s.y} r={isLast ? 3.2 : 2.6} fill="#ffffff" stroke={STROKE[key]} strokeWidth="1.2" />
                    <text x={s.x} y={s.y + 1.1} fontSize="3" fill={STROKE[key]} textAnchor="middle" fontWeight="700">
                      {isLast ? "♥" : i + 1}
                    </text>
                  </g>
                );
              })}
              <text x={last.x} y={last.y - 4.6} fontSize="2.8" fill={STROKE[key]} textAnchor="middle" fontWeight="700">
                {key}코스
              </text>
            </g>
          );
        })}

        {/* 내 위치 */}
        <g>
          <circle cx={ME_LOC.x} cy={ME_LOC.y} r="4.6" fill="#fff" stroke="#fb6f96" strokeWidth="1.6" />
          <text x={ME_LOC.x} y={ME_LOC.y + 1.3} fontSize="3.4" textAnchor="middle">🙂</text>
          <text x={ME_LOC.x} y={ME_LOC.y + 8.6} fontSize="3" fill="#4a3d59" textAnchor="middle" fontWeight="700">내 위치</text>
        </g>
      </svg>
    </div>
  );
}
