# 이음(Aieum) MVP — M0 기반(Foundation) 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Aieum MVP의 실행 가능한 기반을 구축한다 — 모노레포, FastAPI 백엔드(헬스/설정/Supabase 연결), Postgres 스키마 8테이블, 시드 데이터, Next.js PWA 셸(4개 라우트 + 목 세션), 디자인 2변형 비교 환경.

**Architecture:** 모노레포(`/backend` FastAPI + `/frontend` Next.js + `/supabase` 스키마·시드). 프론트는 FastAPI 한 곳과만 통신하고, FastAPI가 service-role로 Supabase Postgres에 접근한다(단일 백엔드 경계). 세션은 목(휴대폰 인증 모킹).

**Tech Stack:** Python 3.12 / FastAPI / uvicorn / supabase-py / pytest · httpx · Node 20 / Next.js 15 (App Router, TS) / Tailwind / PWA · Supabase CLI(로컬 Postgres, Docker) · getdesign CLI(디자인 변형)

**참고 스펙:** `docs/superpowers/specs/2026-05-21-aieum-mvp-design.md` (§4 아키텍처, §6 데이터 모델, §9 시드, §14 디자인)

---

## File Structure (이 마일스톤에서 생성/수정)

```
aieum/
├── .gitignore                      # 신규: node/python/env 무시
├── README.md                       # 신규: 실행법
├── backend/
│   ├── pyproject.toml              # 신규: 의존성·도구 설정
│   ├── .env.example                # 신규: 백엔드 환경변수 템플릿
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                 # 신규: FastAPI 앱 + 헬스 라우트
│   │   ├── settings.py             # 신규: pydantic-settings 설정
│   │   ├── db.py                   # 신규: Supabase 클라이언트 provider
│   │   └── repositories/
│   │       ├── __init__.py
│   │       └── users.py            # 신규: 유저 조회/삽입
│   ├── scripts/
│   │   └── seed.py                 # 신규: 시드 적재 스크립트
│   └── tests/
│       ├── __init__.py
│       ├── test_health.py          # 신규
│       ├── test_users_repo.py      # 신규
│       └── test_seed.py            # 신규
├── supabase/
│   ├── migrations/
│   │   └── 0001_init.sql           # 신규: 8개 테이블 스키마
│   └── seed_data/
│       ├── users.json              # 신규: 시드 상대 풀
│       ├── courses.json            # 신규: 큐레이션 5코스
│       └── ai_scripts.json         # 신규: 사전작성 근거·리포트·코스
└── frontend/
    ├── package.json                # 신규(create-next-app)
    ├── next.config.mjs             # 수정: PWA 설정
    ├── .env.local.example          # 신규
    ├── app/
    │   ├── layout.tsx              # 수정: 세션 provider 래핑
    │   ├── page.tsx                # 수정: 홈(데모 진입)
    │   ├── onboarding/page.tsx     # 신규: 스텁
    │   ├── matching/page.tsx       # 신규: 스텁
    │   ├── date/page.tsx           # 신규: 스텁
    │   ├── profile/page.tsx        # 신규: 스텁
    │   └── compare/page.tsx        # 신규: 디자인 2변형 비교
    ├── lib/
    │   ├── api.ts                  # 신규: FastAPI 클라이언트
    │   └── session.tsx             # 신규: 목 세션 context
    └── components/
        └── ApiStatus.tsx           # 신규: 백엔드 헬스 표시(연결 검증용)
```

---

## Task 0: 모노레포 초기화 & git

**Files:**
- Create: `.gitignore`, `README.md`
- Init: git 저장소(현재 비-git 폴더)

- [ ] **Step 1: git 초기화 및 기본 브랜치 생성**

```bash
cd aieum
git init
git checkout -b main
```

- [ ] **Step 2: `.gitignore` 작성**

`.gitignore`:
```gitignore
# Python
backend/.venv/
__pycache__/
*.pyc
backend/.env
# Node
frontend/node_modules/
frontend/.next/
frontend/.env.local
# Supabase
supabase/.branches/
supabase/.temp/
# OS
.DS_Store
```

- [ ] **Step 3: `README.md` 작성**

`README.md`:
```markdown
# Aieum (이음) MVP — 데모 프로토타입

성향 기반 AI 데이트 매칭 앱의 투자/데모용 MVP.

## 구성
- `backend/` — FastAPI (도메인 로직·AI·매칭)
- `frontend/` — Next.js PWA (모바일 우선 UI)
- `supabase/` — Postgres 스키마·시드

## 로컬 실행
1. `supabase start` (Docker 필요) — 로컬 Postgres 기동
2. `cd backend && uvicorn app.main:app --reload`
3. `cd frontend && pnpm dev`

설계: `docs/superpowers/specs/2026-05-21-aieum-mvp-design.md`
```

- [ ] **Step 4: 커밋**

```bash
git add .gitignore README.md docs/
git commit -m "chore: init monorepo skeleton and docs"
```

---

## Task 1: 백엔드 스캐폴드 + 헬스 엔드포인트 (TDD)

**Files:**
- Create: `backend/pyproject.toml`, `backend/.env.example`, `backend/app/__init__.py`, `backend/app/main.py`
- Test: `backend/tests/__init__.py`, `backend/tests/test_health.py`

- [ ] **Step 1: 의존성 정의 `backend/pyproject.toml`**

```toml
[project]
name = "aieum-backend"
version = "0.1.0"
requires-python = ">=3.12"
dependencies = [
    "fastapi>=0.115",
    "uvicorn[standard]>=0.30",
    "pydantic-settings>=2.4",
    "supabase>=2.7",
    "openai>=1.40",
]

[project.optional-dependencies]
dev = ["pytest>=8.3", "httpx>=0.27"]

[tool.pytest.ini_options]
pythonpath = ["."]
testpaths = ["tests"]
```

- [ ] **Step 2: 환경변수 템플릿 `backend/.env.example`**

```dotenv
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_SERVICE_ROLE_KEY=replace-with-local-service-role-key
OPENAI_API_KEY=
AI_MODE=scripted
AI_THINK_MS=1500
```

- [ ] **Step 3: 가상환경 설치**

```bash
cd backend
python -m venv .venv
.venv/Scripts/python -m pip install -e ".[dev]"   # Windows
```
Expected: 설치 성공, `pytest` 사용 가능.

- [ ] **Step 4: 실패하는 테스트 작성 `backend/tests/test_health.py`**

```python
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_returns_ok():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json() == {"status": "ok"}
```

`backend/tests/__init__.py`: 빈 파일.

- [ ] **Step 5: 테스트 실패 확인**

Run: `cd backend && .venv/Scripts/python -m pytest tests/test_health.py -v`
Expected: FAIL — `ModuleNotFoundError: No module named 'app.main'`

- [ ] **Step 6: 최소 구현 `backend/app/main.py`**

`backend/app/__init__.py`: 빈 파일.
`backend/app/main.py`:
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Aieum API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
```

- [ ] **Step 7: 테스트 통과 확인**

Run: `cd backend && .venv/Scripts/python -m pytest tests/test_health.py -v`
Expected: PASS

- [ ] **Step 8: 커밋**

```bash
git add backend/pyproject.toml backend/.env.example backend/app backend/tests
git commit -m "feat(backend): scaffold FastAPI app with health endpoint"
```

---

## Task 2: 설정 & Supabase 클라이언트 provider

**Files:**
- Create: `backend/app/settings.py`, `backend/app/db.py`

- [ ] **Step 1: 설정 `backend/app/settings.py`**

```python
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    supabase_url: str = "http://127.0.0.1:54321"
    supabase_service_role_key: str = ""
    openai_api_key: str = ""
    ai_mode: str = "scripted"      # "scripted" | "live"
    ai_think_ms: int = 1500

settings = Settings()
```

- [ ] **Step 2: Supabase 클라이언트 provider `backend/app/db.py`**

```python
from functools import lru_cache
from supabase import create_client, Client
from app.settings import settings

@lru_cache(maxsize=1)
def get_supabase() -> Client:
    return create_client(settings.supabase_url, settings.supabase_service_role_key)
```

- [ ] **Step 3: import 스모크 확인**

Run: `cd backend && .venv/Scripts/python -c "from app.db import get_supabase; from app.settings import settings; print(settings.ai_mode)"`
Expected: `scripted` 출력(에러 없음).

- [ ] **Step 4: 커밋**

```bash
git add backend/app/settings.py backend/app/db.py
git commit -m "feat(backend): add settings and supabase client provider"
```

---

## Task 3: 데이터베이스 스키마 마이그레이션 (8개 테이블)

**Files:**
- Create: `supabase/migrations/0001_init.sql`

- [ ] **Step 1: Supabase 로컬 초기화 (최초 1회)**

```bash
cd aieum
supabase init          # supabase/ 구성 생성 (이미 있으면 건너뜀)
supabase start         # Docker로 로컬 Postgres + 스튜디오 기동
```
Expected: `API URL`, `service_role key` 출력 → `backend/.env`에 반영.

- [ ] **Step 2: 마이그레이션 작성 `supabase/migrations/0001_init.sql`**

```sql
create table users (
  id uuid primary key default gen_random_uuid(),
  nickname text not null,
  age int not null,
  region text not null,
  photo_url text,
  bio text,
  is_seed boolean not null default false,
  created_at timestamptz not null default now()
);

create table survey_responses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  answers jsonb not null,
  trait_vector jsonb not null,
  created_at timestamptz not null default now()
);

create table date_courses (
  id uuid primary key default gen_random_uuid(),
  region text not null,
  title text not null,
  steps jsonb not null,
  est_time text,
  est_cost text,
  is_curated boolean not null default true
);

create table matches (
  id uuid primary key default gen_random_uuid(),
  user_a uuid not null references users(id),
  user_b uuid not null references users(id),
  course_id uuid references date_courses(id),
  status text not null default 'pending',   -- pending | success
  created_at timestamptz not null default now()
);

create table date_sessions (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references matches(id) on delete cascade,
  state text not null default 'scheduled',   -- scheduled | ongoing | completed
  checkins jsonb not null default '[]'::jsonb,
  progress int not null default 0
);

create table reviews (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references date_sessions(id) on delete cascade,
  user_id uuid not null references users(id),
  rating int,
  tags text[] not null default '{}',
  ai_summary text
);

create table credits (
  user_id uuid primary key references users(id) on delete cascade,
  balance int not null default 3,
  ledger jsonb not null default '[]'::jsonb
);

create table ai_scripts (
  id uuid primary key default gen_random_uuid(),
  key text not null,                          -- 페어/유저 식별 (예: "pair:<a>:<b>")
  kind text not null,                         -- reason | report | course
  payload jsonb not null,
  unique (key, kind)
);
```

- [ ] **Step 3: 마이그레이션 적용 확인**

```bash
supabase db reset       # 마이그레이션 재적용 + (있으면) seed.sql
```
Expected: 8개 테이블 생성 성공 로그. Studio(`http://127.0.0.1:54323`)에서 테이블 확인.

- [ ] **Step 4: 커밋**

```bash
git add supabase/migrations/0001_init.sql supabase/config.toml
git commit -m "feat(db): add initial schema with 8 core tables"
```

---

## Task 4: 유저 리포지토리 + 테스트 (TDD, 클라이언트 목)

**Files:**
- Create: `backend/app/repositories/__init__.py`, `backend/app/repositories/users.py`
- Test: `backend/tests/test_users_repo.py`

- [ ] **Step 1: 실패하는 테스트 작성 `backend/tests/test_users_repo.py`**

Supabase 호출을 목으로 검증(연결 없이 단위 테스트).
```python
from unittest.mock import MagicMock
from app.repositories.users import UsersRepository

def _fake_client(rows):
    client = MagicMock()
    (client.table.return_value
        .select.return_value
        .eq.return_value
        .execute.return_value) = MagicMock(data=rows)
    return client

def test_get_returns_user_when_found():
    client = _fake_client([{"id": "u1", "nickname": "데모"}])
    repo = UsersRepository(client)
    user = repo.get("u1")
    assert user == {"id": "u1", "nickname": "데모"}
    client.table.assert_called_with("users")

def test_get_returns_none_when_missing():
    client = _fake_client([])
    repo = UsersRepository(client)
    assert repo.get("nope") is None
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `cd backend && .venv/Scripts/python -m pytest tests/test_users_repo.py -v`
Expected: FAIL — `ModuleNotFoundError: No module named 'app.repositories.users'`

- [ ] **Step 3: 최소 구현 `backend/app/repositories/users.py`**

`backend/app/repositories/__init__.py`: 빈 파일.
```python
from supabase import Client

class UsersRepository:
    def __init__(self, client: Client):
        self._client = client

    def get(self, user_id: str) -> dict | None:
        res = self._client.table("users").select("*").eq("id", user_id).execute()
        rows = res.data or []
        return rows[0] if rows else None
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `cd backend && .venv/Scripts/python -m pytest tests/test_users_repo.py -v`
Expected: PASS (2 passed)

- [ ] **Step 5: 커밋**

```bash
git add backend/app/repositories backend/tests/test_users_repo.py
git commit -m "feat(backend): add UsersRepository with unit tests"
```

---

## Task 5: 시드 스크립트 + 검증 테스트

**Files:**
- Create: `supabase/seed_data/users.json`, `supabase/seed_data/courses.json`, `supabase/seed_data/ai_scripts.json`, `backend/scripts/seed.py`
- Test: `backend/tests/test_seed.py`

- [ ] **Step 1: 시드 데이터 작성 (발표 동선 고정, 스펙 §9)**

`supabase/seed_data/users.json` — 시드 상대 풀 6명(궁합 다양화용 trait_vector 포함):
```json
[
  {"nickname": "지윤", "age": 29, "region": "성수", "bio": "주말엔 전시 보러 다녀요", "is_seed": true,
   "trait_vector": {"EI": 0.7, "JP": 0.8, "active": 0.6, "values": 0.9}},
  {"nickname": "현우", "age": 31, "region": "성수", "bio": "맛집 탐방 좋아합니다", "is_seed": true,
   "trait_vector": {"EI": 0.8, "JP": 0.75, "active": 0.7, "values": 0.85}},
  {"nickname": "서연", "age": 27, "region": "홍대", "bio": "카페에서 책 읽는 시간", "is_seed": true,
   "trait_vector": {"EI": 0.3, "JP": 0.4, "active": 0.3, "values": 0.6}},
  {"nickname": "도현", "age": 30, "region": "홍대", "bio": "러닝과 클라이밍", "is_seed": true,
   "trait_vector": {"EI": 0.6, "JP": 0.3, "active": 0.9, "values": 0.5}},
  {"nickname": "민지", "age": 28, "region": "성수", "bio": "조용한 분위기 선호", "is_seed": true,
   "trait_vector": {"EI": 0.2, "JP": 0.85, "active": 0.2, "values": 0.4}},
  {"nickname": "준호", "age": 32, "region": "성수", "bio": "즉흥 여행 좋아함", "is_seed": true,
   "trait_vector": {"EI": 0.9, "JP": 0.2, "active": 0.8, "values": 0.7}}
]
```

`supabase/seed_data/courses.json` — 성수 1지역 5코스:
```json
[
  {"region": "성수", "title": "감성 카페 + 갤러리", "est_time": "3시간", "est_cost": "4만원",
   "steps": ["대림창고 카페", "성수 연방 갤러리", "한강 산책"]},
  {"region": "성수", "title": "맛집 + 루프탑 바", "est_time": "4시간", "est_cost": "7만원",
   "steps": ["성수 수제버거", "디저트 카페", "루프탑 칵테일 바"]},
  {"region": "성수", "title": "액티브 데이트", "est_time": "3시간", "est_cost": "5만원",
   "steps": ["실내 클라이밍", "단백질 브런치", "성수 편집샵 구경"]},
  {"region": "성수", "title": "공방 클래스 + 식사", "est_time": "4시간", "est_cost": "8만원",
   "steps": ["가죽 공방 원데이클래스", "이탈리안 디너"]},
  {"region": "성수", "title": "조용한 산책 코스", "est_time": "2시간", "est_cost": "3만원",
   "steps": ["서울숲 산책", "북카페", "테이크아웃 커피"]}
]
```

`supabase/seed_data/ai_scripts.json` — scripted 모드/폴백 공유(스펙 §7.3). 키는 시드 후 실제 id로 채우므로 닉네임 기반 논리키 사용:
```json
[
  {"key": "report:self", "kind": "report",
   "payload": {"keywords": ["#계획적", "#감성", "#안정추구"],
               "summary": "당신은 계획을 세워 안정적으로 관계를 쌓아가는 감성형입니다."}},
  {"key": "reason:지윤", "kind": "reason",
   "payload": {"score": 92, "text": "두 분 모두 계획적이고 가치관이 잘 맞아 92% 일치합니다."}},
  {"key": "reason:서연", "kind": "reason",
   "payload": {"score": 71, "text": "정적인 데이트를 선호하는 점이 비슷해 71% 일치합니다."}},
  {"key": "course:지윤", "kind": "course",
   "payload": {"A": "감성 카페 + 갤러리", "B": "조용한 산책 코스"}}
]
```

- [ ] **Step 2: 시드 스크립트 작성 `backend/scripts/seed.py`**

```python
import json
from pathlib import Path
from app.db import get_supabase

DATA = Path(__file__).resolve().parents[2] / "supabase" / "seed_data"

def _load(name: str) -> list[dict]:
    return json.loads((DATA / name).read_text(encoding="utf-8"))

def seed() -> dict[str, int]:
    client = get_supabase()
    users = _load("users.json")
    courses = _load("courses.json")
    scripts = _load("ai_scripts.json")

    # users: 설문 trait_vector 분리 저장
    inserted_users = 0
    for u in users:
        tv = u.pop("trait_vector")
        row = client.table("users").insert(u).execute().data[0]
        client.table("survey_responses").insert(
            {"user_id": row["id"], "answers": {}, "trait_vector": tv}
        ).execute()
        inserted_users += 1

    client.table("date_courses").insert(courses).execute()
    client.table("ai_scripts").insert(scripts).execute()

    return {"users": inserted_users, "courses": len(courses), "scripts": len(scripts)}

if __name__ == "__main__":
    print(seed())
```

- [ ] **Step 3: 시드 로딩 형식 테스트 작성 `backend/tests/test_seed.py`**

데이터 파일이 기대 스키마를 만족하는지 검증(DB 없이).
```python
import json
from pathlib import Path

DATA = Path(__file__).resolve().parents[2] / "supabase" / "seed_data"

def test_seed_users_have_required_fields():
    users = json.loads((DATA / "users.json").read_text(encoding="utf-8"))
    assert len(users) >= 6
    for u in users:
        assert {"nickname", "age", "region", "is_seed", "trait_vector"} <= set(u)
        assert set(u["trait_vector"]) == {"EI", "JP", "active", "values"}

def test_seed_courses_count_is_five():
    courses = json.loads((DATA / "courses.json").read_text(encoding="utf-8"))
    assert len(courses) == 5
    for c in courses:
        assert c["region"] == "성수"
        assert isinstance(c["steps"], list) and c["steps"]
```

- [ ] **Step 4: 테스트 실행 (파일 존재·형식 검증)**

Run: `cd backend && .venv/Scripts/python -m pytest tests/test_seed.py -v`
Expected: PASS (2 passed)

- [ ] **Step 5: 실제 시드 적재 (로컬 Supabase 기동 상태에서)**

Run: `cd backend && .venv/Scripts/python -m scripts.seed`
Expected: `{'users': 6, 'courses': 5, 'scripts': 4}` 출력. Studio에서 행 확인.

- [ ] **Step 6: 커밋**

```bash
git add supabase/seed_data backend/scripts/seed.py backend/tests/test_seed.py
git commit -m "feat(db): add seed data and seeding script with validation tests"
```

---

## Task 6: 프론트엔드 스캐폴드 (Next.js + TS + Tailwind) + 4 라우트 스텁

**Files:**
- Create: `frontend/` (create-next-app), `frontend/app/{onboarding,matching,date,profile}/page.tsx`
- Modify: `frontend/app/page.tsx`

- [ ] **Step 1: Next.js 앱 생성**

```bash
cd aieum
pnpm create next-app@latest frontend --typescript --tailwind --app --eslint --src-dir=false --import-alias "@/*" --no-turbopack
```
Expected: `frontend/`에 Next.js 15 App Router 프로젝트 생성.

- [ ] **Step 2: 개발 서버 기동 확인**

```bash
cd frontend && pnpm dev
```
Expected: `http://localhost:3000` 정상 렌더. 확인 후 종료.

- [ ] **Step 3: 4개 라우트 스텁 작성**

`frontend/app/onboarding/page.tsx`:
```tsx
export default function OnboardingPage() {
  return <main className="p-6"><h1 className="text-xl font-bold">온보딩 (설문)</h1></main>;
}
```
동일 패턴으로 `matching/page.tsx`(매칭), `date/page.tsx`(데이트 ING), `profile/page.tsx`(마이페이지) 작성 — `h1` 텍스트만 각각 "매칭", "데이트 ING", "마이페이지"로.

- [ ] **Step 4: 홈 진입 화면 `frontend/app/page.tsx`**

```tsx
import Link from "next/link";

const links = [
  { href: "/onboarding", label: "온보딩" },
  { href: "/matching", label: "매칭" },
  { href: "/date", label: "데이트 ING" },
  { href: "/profile", label: "마이페이지" },
];

export default function Home() {
  return (
    <main className="p-6 space-y-3">
      <h1 className="text-2xl font-bold">이음 (Aieum) 데모</h1>
      {links.map((l) => (
        <Link key={l.href} href={l.href} className="block underline">{l.label}</Link>
      ))}
    </main>
  );
}
```

- [ ] **Step 5: 라우트 렌더 확인**

```bash
cd frontend && pnpm dev
```
Expected: `/`에서 4개 링크 → 각 페이지 제목 정상 표시.

- [ ] **Step 6: 커밋**

```bash
git add frontend
git commit -m "feat(frontend): scaffold Next.js PWA shell with 4 route stubs"
```

---

## Task 7: PWA 설정 + 목 세션 provider

**Files:**
- Modify: `frontend/next.config.mjs`, `frontend/app/layout.tsx`
- Create: `frontend/lib/session.tsx`, `frontend/.env.local.example`

- [ ] **Step 1: PWA 의존성 설치**

```bash
cd frontend && pnpm add @ducanh2912/next-pwa
```

- [ ] **Step 2: `frontend/next.config.mjs` 수정**

```js
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({ dest: "public", disable: process.env.NODE_ENV === "development" });

/** @type {import('next').NextConfig} */
const nextConfig = {};

export default withPWA(nextConfig);
```

- [ ] **Step 3: 목 세션 context `frontend/lib/session.tsx`**

```tsx
"use client";
import { createContext, useContext, ReactNode } from "react";

export type DemoUser = { id: string; nickname: string };
const DEMO_USER: DemoUser = { id: "self", nickname: "나(데모)" };

const SessionContext = createContext<DemoUser>(DEMO_USER);
export const useSession = () => useContext(SessionContext);

export function SessionProvider({ children }: { children: ReactNode }) {
  return <SessionContext.Provider value={DEMO_USER}>{children}</SessionContext.Provider>;
}
```

- [ ] **Step 4: `frontend/app/layout.tsx`에서 provider 래핑**

기존 `layout.tsx`의 `<body>` 자식을 `<SessionProvider>`로 감싼다:
```tsx
import { SessionProvider } from "@/lib/session";
// ... 기존 import/metadata 유지
// <body className={...}> 내부:
//   <SessionProvider>{children}</SessionProvider>
```

- [ ] **Step 5: 환경변수 템플릿 `frontend/.env.local.example`**

```dotenv
NEXT_PUBLIC_API_BASE=http://localhost:8000
```

- [ ] **Step 6: 빌드 확인**

```bash
cd frontend && pnpm build
```
Expected: 빌드 성공(타입 에러 없음).

- [ ] **Step 7: 커밋**

```bash
git add frontend/next.config.mjs frontend/app/layout.tsx frontend/lib/session.tsx frontend/.env.local.example frontend/package.json
git commit -m "feat(frontend): add PWA config and mock session provider"
```

---

## Task 8: API 클라이언트 + 백엔드 헬스 연결 검증

**Files:**
- Create: `frontend/lib/api.ts`, `frontend/components/ApiStatus.tsx`
- Modify: `frontend/app/page.tsx`

- [ ] **Step 1: API 클라이언트 `frontend/lib/api.ts`**

```ts
const BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";

export async function getHealth(): Promise<{ status: string }> {
  const res = await fetch(`${BASE}/health`, { cache: "no-store" });
  if (!res.ok) throw new Error(`health ${res.status}`);
  return res.json();
}
```

- [ ] **Step 2: 헬스 표시 컴포넌트 `frontend/components/ApiStatus.tsx`**

```tsx
"use client";
import { useEffect, useState } from "react";
import { getHealth } from "@/lib/api";

export default function ApiStatus() {
  const [status, setStatus] = useState("확인 중…");
  useEffect(() => {
    getHealth().then((d) => setStatus(`백엔드: ${d.status}`)).catch(() => setStatus("백엔드: 연결 안 됨"));
  }, []);
  return <p className="text-sm text-gray-500">{status}</p>;
}
```

- [ ] **Step 3: 홈에 표시 추가 — `frontend/app/page.tsx`**

`<h1>` 아래에 `<ApiStatus />` 추가하고 상단에 `import ApiStatus from "@/components/ApiStatus";`.

- [ ] **Step 4: 엔드투엔드 연결 확인 (백엔드+프론트 동시 기동)**

```bash
# 터미널 A
cd backend && .venv/Scripts/python -m uvicorn app.main:app --port 8000
# 터미널 B
cd frontend && pnpm dev
```
Expected: `http://localhost:3000`에서 "백엔드: ok" 표시 → FastAPI↔Next 연결 검증 완료.

- [ ] **Step 5: 커밋**

```bash
git add frontend/lib/api.ts frontend/components/ApiStatus.tsx frontend/app/page.tsx
git commit -m "feat(frontend): wire API client and backend health indicator"
```

---

## Task 9: 디자인 2변형 설정 + 비교 페이지 (스펙 §14)

**Files:**
- Create: `frontend/app/compare/page.tsx`
- (getdesign이 추가하는 파일은 실행 후 확인)

- [ ] **Step 1: 디자인 변형 A 추가 (elevenlabs)**

```bash
cd frontend && npx getdesign@latest add elevenlabs
```
Expected: getdesign이 디자인 토큰/컴포넌트 추가. **실행 후 추가된 파일 경로를 확인**하고 변형 A로 식별(예: `components/ui/` 또는 테마 토큰). 추가 위치를 이 단계에 기록.

- [ ] **Step 2: 디자인 변형 B 추가 (clay)**

```bash
cd frontend && npx getdesign@latest add clay
```
Expected: 두 번째 변형 추가. A와 충돌 시 별도 디렉터리/네임스페이스로 분리(예: `components/variant-elevenlabs/`, `components/variant-clay/`)하여 나란히 비교 가능하게 정리.

- [ ] **Step 3: 비교 페이지 `frontend/app/compare/page.tsx`**

두 변형의 핵심 컴포넌트(버튼·카드·궁합 배지 느낌)를 같은 화면에 좌우로 렌더하여 시각 비교:
```tsx
export default function ComparePage() {
  return (
    <main className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
      <section>
        <h2 className="text-lg font-bold mb-4">변형 A — elevenlabs</h2>
        {/* getdesign(elevenlabs)로 추가된 Button/Card 샘플 배치 */}
      </section>
      <section>
        <h2 className="text-lg font-bold mb-4">변형 B — clay</h2>
        {/* getdesign(clay)로 추가된 Button/Card 샘플 배치 */}
      </section>
    </main>
  );
}
```

- [ ] **Step 4: 비교 확인 후 선택 결정 기록**

```bash
cd frontend && pnpm dev   # /compare 에서 두 변형 비교
```
Expected: `/compare`에서 두 변형이 나란히 보임. **사용자와 함께 한 가지 선택** → 선택 결과를 `docs/superpowers/specs/2026-05-21-aieum-mvp-design.md` §14에 기록(M1 이후 이 디자인 시스템을 표준으로 사용).

- [ ] **Step 5: 커밋**

```bash
git add frontend
git commit -m "feat(frontend): add elevenlabs/clay design variants and compare page"
```

---

## M0 완료 기준 (Definition of Done)

- [ ] `git log`에 Task 0~9 커밋 존재
- [ ] `cd backend && .venv/Scripts/python -m pytest -v` → 전부 PASS (health, users_repo, seed)
- [ ] `supabase start` + 시드 적재 시 users 6 / courses 5 / ai_scripts 4 행
- [ ] 백엔드+프론트 동시 기동 시 홈에서 "백엔드: ok"
- [ ] `/compare`에서 두 디자인 변형 비교 가능, 선택 1개 결정·기록

---

## 다음 마일스톤 (이 계획 이후 각각 별도 plan 문서로 작성)

- **M1 온보딩+점수화:** 설문 질문 스키마, `SurveyCard`/`ProgressBar` UI, **궁합 점수화 서비스(규칙기반·결정적, TDD 핵심)**, `survey_responses` 저장, 채점 API.
- **M2 매칭+AI 2모드:** 시드풀 궁합순 랭킹 API, 프로필 카드·`CompatibilityGraph`, `ScriptedAIProvider`/`LiveAIProvider`(`AI_MODE`)·`AIThinkingLoader`, 매칭 성공 → 대화창(아이스브레이킹) 열기 + 코스 A/B 선택(스펙 §3.5 수정 동선) → `matches`/`date_sessions` 생성.
- **M3 데이트 ING:** 대시보드, 체크인 시뮬(QR/GPS), 상태머신(scheduled→ongoing→completed) 전이 테스트, 진행률 게이지, 태그형 리뷰 + AI 요약.
- **M4 마이페이지+마감:** 프로필 편집, AI 리포트 카드, 크레딧 지갑(목 충전), 시드 해피패스 E2E, 발표 리허설.
```
