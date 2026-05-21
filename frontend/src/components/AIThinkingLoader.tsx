// "AI가 생각하는 척" 로딩 연출 (스펙 §7.3 scripted 모드)
export function AIThinkingLoader({ message = "AI가 두 분의 성향을 분석 중…" }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-5 py-16 animate-float-up">
      <div className="relative h-16 w-16">
        <div className="absolute inset-0 animate-ping rounded-full bg-ai-400/30" />
        <div className="absolute inset-2 animate-pulse rounded-full bg-gradient-to-br from-ai-400 to-brand-500" />
        <div className="absolute inset-0 flex items-center justify-center text-2xl">🤖</div>
      </div>
      <div className="flex items-center gap-1">
        <span className="text-sm font-medium text-ai-600">{message}</span>
      </div>
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-2 w-2 animate-bounce rounded-full bg-brand-400"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}
