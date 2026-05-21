# 이음(Aieum) — 발표용 프론트엔드 데모

성향 기반 AI 데이트 매칭 앱 **이음**의 발표/시연용 프론트엔드입니다.
**백엔드 없이** 동작하며, 모든 데이터는 클라이언트 시드로 미리 들어 있고
AI 추론은 **"생각하는 척" 1~2초 로딩 연출**(`AIThinkingLoader`)로 시뮬레이션합니다.

## 스택
React 19 · Vite 8 · TypeScript · Tailwind CSS v4 · React Router 7 · Zustand 5 · Vitest

## 실행
```bash
cd frontend
npm install
npm run dev      # http://localhost:5173 (점유 시 5174)
```
데스크톱 브라우저에서도 가운데 **모바일 폰 프레임**으로 보입니다(발표용).

## 빌드 / 테스트
```bash
npm run build    # 타입체크 + 프로덕션 빌드
npx vitest run   # 점수화 단위테스트 + 화면 렌더 스모크 (15개)
```

## 시연 동선 (Hero Flow)
1. **홈** → "데모 시작하기"
2. **온보딩** → 휴대폰 인증(모킹) → 성향 설문 8문항 → AI가 성향 리포트 생성(연출)
3. **매칭** → 날짜 선택 → AI 궁합 분석(연출) → 추천 상대 목록(궁합순)
4. **상세** → 궁합 % 링 + AI 분석 근거 → "매칭 신청"(크레딧 1 차감)
5. **매칭 성공** → "대화 시작하고 코스 정하기"
6. **대화창** → AI 아이스브레이킹 멘트 + AI 데이트 코스 **A/B 선택**
7. **데이트 ING** → QR/GPS 체크인(시뮬) → 단계별 진행률 → 별점·태그 후기 → AI 후기 요약
8. **마이페이지** → AI 성향 리포트(키워드·성향 막대) + 크레딧 지갑(모킹 충전)

## 구조
```
src/
├── data/seed.ts        # 설문·시드 상대·코스·아이스브레이커·리포트 생성
├── lib/
│   ├── scoring.ts      # 결정적 궁합 점수화 (+scoring.test.ts)
│   └── mockApi.ts      # 지연 연출이 들어간 목 API ("AI 생각하는 척")
├── store.ts            # Zustand 데모 상태
├── components/         # AppShell · AIThinkingLoader · ui(버튼·링·진행바)
└── screens/            # Home · Onboarding · Matching · DateIng · Profile
```

## 참고
- 설계 스펙: `../docs/superpowers/specs/2026-05-21-aieum-mvp-design.md`
- 백엔드(FastAPI+Supabase+OpenAI)는 의도적으로 보류 — 발표 후 실동작이 필요하면 `mockApi.ts`를 실제 API 호출로 교체하면 됩니다.
