// "AI가 생각하는 척" 로딩 연출 (스펙 §7.3 scripted 모드)
export function AIThinkingLoader({ message = "AI가 두 분의 인연을 살펴보는 중…" }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-16">
      <div className="relative h-20 w-20">
        <div className="absolute inset-0 animate-spin rounded-full" style={{ animationDuration: "2.6s" }}>
          <span className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 rounded-full bg-blush-400 shadow-[0_0_8px_2px_rgba(255,133,168,0.6)]" />
          <span className="absolute left-1/2 bottom-0 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-lav-500 shadow-[0_0_8px_2px_rgba(155,128,234,0.5)]" />
        </div>
        <div className="absolute inset-3 animate-ping rounded-full bg-blush-300/40" style={{ animationDuration: "1.8s" }} />
        <div className="absolute inset-2.5 flex items-center justify-center rounded-full bg-gradient-to-br from-blush-300 via-blush-500 to-lav-400 shadow-[0_10px_26px_-6px_rgba(236,90,131,0.5)]">
          <span className="text-2xl">✦</span>
        </div>
      </div>
      <p className="display text-lg font-medium text-blush-600">{message}</p>
    </div>
  );
}
