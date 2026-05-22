import type { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const TABS = [
  { to: "/", label: "홈", icon: "❤" },
  { to: "/matching", label: "매칭", icon: "✦" },
  { to: "/date", label: "데이트", icon: "✶" },
  { to: "/profile", label: "MY", icon: "❀" },
];

interface Props {
  title?: string;
  back?: boolean;
  nav?: boolean;
  children: ReactNode;
}

export function AppShell({ title, back, nav = true, children }: Props) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <div className="phone-shell no-scrollbar">
      {/* 파스텔 글로우 */}
      <span className="bokeh" style={{ width: 16, height: 16, left: "12%", top: "10%" }} />
      <span className="bokeh" style={{ width: 10, height: 10, right: "16%", top: "20%", animationDelay: "1.6s" }} />

      {/* 상태바 */}
      <div className="relative z-10 flex items-center justify-between px-5 pt-2.5 pb-1 text-[11px] font-semibold text-ink">
        <span>9:41</span>
        <div className="flex items-center gap-1.5">
          <svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor" aria-hidden>
            <rect x="0" y="7" width="3" height="4" rx="0.5" />
            <rect x="4.5" y="5" width="3" height="6" rx="0.5" />
            <rect x="9" y="2.5" width="3" height="8.5" rx="0.5" />
            <rect x="13.5" y="0" width="3" height="11" rx="0.5" opacity="0.4" />
          </svg>
          <svg width="24" height="12" viewBox="0 0 24 12" fill="none" aria-hidden>
            <rect x="0.5" y="0.5" width="20" height="11" rx="3" stroke="currentColor" opacity="0.5" />
            <rect x="2" y="2" width="15" height="8" rx="1.5" fill="currentColor" />
            <rect x="21" y="3.5" width="2" height="5" rx="1" fill="currentColor" opacity="0.5" />
          </svg>
        </div>
      </div>

      {title && (
        <header className="relative z-10 flex items-center gap-2 px-4 py-3">
          {back && (
            <button onClick={() => navigate(-1)} className="text-2xl leading-none text-ink-soft hover:text-ink" aria-label="뒤로">
              ‹
            </button>
          )}
          <h1 className="display text-2xl font-bold text-ink">{title}</h1>
        </header>
      )}

      <main className={`no-scrollbar relative z-10 flex-1 overflow-y-auto ${nav ? "pb-28" : ""}`}>{children}</main>

      {nav && (
        <nav className="absolute bottom-0 left-0 right-0 z-10 flex gap-1 border-t border-blush-100 bg-white/90 px-2 pb-2 pt-2 shadow-[0_-10px_30px_-12px_rgba(214,66,109,0.3)] backdrop-blur-xl">
          {TABS.map((t) => {
            const active = t.to === "/" ? pathname === "/" : pathname.startsWith(t.to);
            return (
              <Link
                key={t.to}
                to={t.to}
                className={`flex flex-1 flex-col items-center gap-1 rounded-2xl py-2 text-xs font-semibold transition-all duration-200 ${
                  active ? "text-blush-600" : "text-ink-faint hover:text-ink-soft"
                }`}
              >
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-2xl text-xl transition-all duration-200 ${
                    active
                      ? "scale-110 bg-gradient-to-br from-blush-100 to-lav-100 text-blush-600 shadow-[0_8px_18px_-10px_rgba(236,90,131,0.7)] ring-1 ring-blush-200"
                      : ""
                  }`}
                >
                  {t.icon}
                </span>
                {t.label}
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}
