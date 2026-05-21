# 이음 (Aieum)

> AI가 찾아주는 완벽한 인연 — 외모·조건이 아닌 **성격 궁합** 기반 데이트 매칭 앱

2030 세대를 위한 진지한 데이트 매칭 서비스 **이음**의 MVP 프로토타입입니다.
성향 설문으로 궁합을 분석하고, AI가 데이트 코스를 추천하며, QR/GPS 체크인으로
안심 데이트를 돕습니다.

## 핵심 차별점
1. 성향 설문 → **궁합 % + AI 분석 근거** (스펙이 아닌 성격 매칭)
2. **AI 데이트 코스 A/B 추천** → 같은 코스 선택 시 매칭 성공
3. **신뢰·안심** — 본인인증 + QR/GPS 데이트 체크인
4. **관계 빌드업** — 아이스브레이킹 가이드, 단계별 정보 공개

## 현재 구현 (발표용 데모)
**React + Vite 프론트엔드만** 구현된 시연용 데모입니다. 백엔드 없이 동작하며,
데이터는 클라이언트 시드로 들어 있고 AI는 **"생각하는 척" 1~2초 로딩 연출**로
시뮬레이션합니다. (궁합 점수만 실제 결정적 계산)

```bash
cd frontend
npm install
npm run dev      # http://localhost:5173
```

자세한 실행법·시연 동선은 [`frontend/README.md`](frontend/README.md) 참고.

## 기술 스택
- **프론트엔드:** React 19 · Vite 8 · TypeScript · Tailwind CSS v4 · React Router 7 · Zustand 5
- **테스트:** Vitest (궁합 점수화 단위테스트 + 화면 렌더 스모크)
- **백엔드(보류):** 설계상 FastAPI + Supabase + OpenAI — 실동작 필요 시 `frontend/src/lib/mockApi.ts`를 실제 API 호출로 교체

## 문서
- [설계 스펙](docs/superpowers/specs/2026-05-21-aieum-mvp-design.md)
- [M0 구현 계획](docs/superpowers/plans/2026-05-21-aieum-mvp-m0-foundation.md)

## 디렉터리
```
aieum/
├── frontend/   # React + Vite 데모 앱
└── docs/       # 설계 스펙 · 구현 계획
```
