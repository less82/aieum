import type { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const TABS = [
  { to: "/", label: "홈", icon: "🏠" },
  { to: "/matching", label: "매칭", icon: "💘" },
  { to: "/date", label: "데이트", icon: "📍" },
  { to: "/profile", label: "MY", icon: "👤" },
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
      {title && (
        <header className="sticky top-0 z-10 flex items-center gap-2 border-b border-gray-100 bg-white/90 px-4 py-3.5 backdrop-blur">
          {back && (
            <button onClick={() => navigate(-1)} className="text-xl text-ink-500" aria-label="뒤로">
              ‹
            </button>
          )}
          <h1 className="text-lg font-bold text-ink-900">{title}</h1>
        </header>
      )}

      <main className={`no-scrollbar flex-1 overflow-y-auto ${nav ? "pb-20" : ""}`}>{children}</main>

      {nav && (
        <nav className="absolute bottom-0 left-0 right-0 flex border-t border-gray-100 bg-white">
          {TABS.map((t) => {
            const active = t.to === "/" ? pathname === "/" : pathname.startsWith(t.to);
            return (
              <Link
                key={t.to}
                to={t.to}
                className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs font-medium ${
                  active ? "text-brand-600" : "text-gray-400"
                }`}
              >
                <span className="text-lg">{t.icon}</span>
                {t.label}
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}
