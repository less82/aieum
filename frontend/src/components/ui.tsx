import type { ButtonHTMLAttributes, ReactNode } from "react";

// ── CTA 버튼 ──
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "peach" | "ghost" | "outline";
  full?: boolean;
}

export function Button({ variant = "primary", full, className = "", children, ...rest }: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-[15px] font-semibold tracking-tight transition-all duration-200 active:scale-[0.97] disabled:opacity-40 disabled:active:scale-100";
  const styles = {
    primary:
      "bg-gradient-to-br from-blush-400 to-blush-600 text-white shadow-[0_12px_26px_-10px_rgba(236,90,131,0.7)] hover:-translate-y-0.5",
    peach:
      "bg-gradient-to-br from-peach-300 to-peach-500 text-[#7a4419] shadow-[0_12px_26px_-10px_rgba(247,164,95,0.7)] hover:-translate-y-0.5",
    outline: "border border-blush-300 text-blush-600 bg-white/70 backdrop-blur hover:bg-blush-50",
    ghost: "text-ink-soft hover:bg-blush-100/60",
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
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-blush-100">
      <div
        className="h-full rounded-full bg-gradient-to-r from-blush-400 to-blush-600 transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

// ── 궁합 원형 게이지 ──
export function CompatibilityRing({ score, size = 128 }: { score: number; size?: number }) {
  const stroke = 9;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#ffe4ec" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={r} stroke="url(#ring-grad)" strokeWidth={stroke} fill="none"
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.1s cubic-bezier(0.22,1,0.36,1)" }}
        />
        <defs>
          <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffa6c1" />
            <stop offset="55%" stopColor="#fb6f96" />
            <stop offset="100%" stopColor="#9b80ea" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute flex flex-col items-center leading-none">
        <span className="display font-bold text-blush-600" style={{ fontSize: size * 0.3 }}>
          {score}
          <span style={{ fontSize: size * 0.14 }}>%</span>
        </span>
        <span className="mt-1 text-[10px] font-medium tracking-[0.22em] text-ink-faint">궁합</span>
      </div>
    </div>
  );
}

// ── 태그 칩 ──
export function Tag({ children, active, onClick }: { children: ReactNode; active?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
        active
          ? "bg-gradient-to-br from-blush-400 to-blush-600 text-white shadow-[0_8px_18px_-8px_rgba(236,90,131,0.7)]"
          : "bg-white/80 text-ink-soft ring-1 ring-blush-100 hover:ring-blush-300 hover:text-blush-600"
      }`}
    >
      {children}
    </button>
  );
}

// ── 아바타 ──
export function Avatar({ emoji, size = 56, ring = true }: { emoji: string; size?: number; ring?: boolean }) {
  return (
    <div
      className={`flex items-center justify-center rounded-[30%] bg-gradient-to-br from-blush-100 to-lav-100 ${ring ? "ring-1 ring-blush-200" : ""}`}
      style={{ width: size, height: size, fontSize: size * 0.5 }}
    >
      {emoji}
    </div>
  );
}
