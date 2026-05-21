import type { ButtonHTMLAttributes, ReactNode } from "react";

// ── 기본 CTA 버튼 ──
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "outline";
  full?: boolean;
}

export function Button({ variant = "primary", full, className = "", children, ...rest }: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-base font-semibold transition active:scale-[0.98] disabled:opacity-40 disabled:active:scale-100";
  const styles = {
    primary: "bg-brand-500 text-white shadow-lg shadow-brand-500/30 hover:bg-brand-600",
    outline: "border border-brand-300 text-brand-600 bg-white hover:bg-brand-50",
    ghost: "text-ink-500 hover:bg-gray-100",
  }[variant];
  return (
    <button className={`${base} ${styles} ${full ? "w-full" : ""} ${className}`} {...rest}>
      {children}
    </button>
  );
}

// ── 진행률 바 ──
export function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max ? Math.round((value / max) * 100) : 0;
  return (
    <div className="w-full">
      <div className="h-2 w-full rounded-full bg-gray-100">
        <div
          className="h-2 rounded-full bg-gradient-to-r from-brand-400 to-brand-600 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ── 궁합 원형 게이지 (SVG) ──
export function CompatibilityRing({ score, size = 128 }: { score: number; size?: number }) {
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#ffe0e6" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={r} stroke="url(#grad)" strokeWidth={stroke} fill="none"
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
        <defs>
          <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ff97aa" />
            <stop offset="100%" stopColor="#ed3a5c" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-extrabold text-brand-600">{score}%</span>
        <span className="text-xs text-ink-500">궁합</span>
      </div>
    </div>
  );
}

// ── 태그 칩 ──
export function Tag({ children, active, onClick }: { children: ReactNode; active?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
        active ? "bg-brand-500 text-white" : "bg-brand-50 text-brand-600 hover:bg-brand-100"
      }`}
    >
      {children}
    </button>
  );
}

// ── 아바타 (이모지) ──
export function Avatar({ emoji, size = 56 }: { emoji: string; size?: number }) {
  return (
    <div
      className="flex items-center justify-center rounded-2xl bg-gradient-to-br from-brand-100 to-ai-400/20"
      style={{ width: size, height: size, fontSize: size * 0.5 }}
    >
      {emoji}
    </div>
  );
}
