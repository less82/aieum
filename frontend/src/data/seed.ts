import type { SeedUser, Course, SurveyQuestion, Dim, TraitVector } from "../types";

// ── 성향 파악 설문 (8문항, 차원당 2문항) ── 스펙 SCR-ONB-001
export const SURVEY_QUESTIONS: SurveyQuestion[] = [
  {
    id: "q1",
    dim: "EI",
    title: "주말 저녁, 더 끌리는 쪽은?",
    options: [
      { label: "사람들과 왁자지껄 모임 🎉", value: 1 },
      { label: "가까운 사람과 조용히 🕯️", value: 0 },
    ],
  },
  {
    id: "q2",
    dim: "EI",
    title: "처음 만난 자리에서 나는?",
    options: [
      { label: "먼저 말 거는 편 🙋", value: 1 },
      { label: "상대가 다가와 주길 기다림 🙂", value: 0 },
    ],
  },
  {
    id: "q3",
    dim: "JP",
    title: "여행을 갈 때 나는?",
    options: [
      { label: "분 단위로 계획 세우기 🗂️", value: 1 },
      { label: "발길 닿는 대로 🧭", value: 0 },
    ],
  },
  {
    id: "q4",
    dim: "JP",
    title: "데이트 약속은?",
    options: [
      { label: "미리 코스까지 정해두기 📌", value: 1 },
      { label: "그날 기분 따라 정하기 🎲", value: 0 },
    ],
  },
  {
    id: "q5",
    dim: "active",
    title: "이상적인 데이트는?",
    options: [
      { label: "액티비티·나들이 🚴", value: 1 },
      { label: "카페에서 도란도란 ☕", value: 0 },
    ],
  },
  {
    id: "q6",
    dim: "active",
    title: "휴일에 더 하고 싶은 건?",
    options: [
      { label: "밖에서 몸 움직이기 🏞️", value: 1 },
      { label: "집에서 푹 쉬기 🛋️", value: 0 },
    ],
  },
  {
    id: "q7",
    dim: "values",
    title: "연애에서 더 중요한 건?",
    options: [
      { label: "진지하게 결혼까지 바라봄 💍", value: 1 },
      { label: "지금 이 순간의 설렘 ✨", value: 0 },
    ],
  },
  {
    id: "q8",
    dim: "values",
    title: "관계에서 나는?",
    options: [
      { label: "신뢰와 안정이 최우선 🤝", value: 1 },
      { label: "새로움과 자유가 좋아 🕊️", value: 0 },
    ],
  },
];

// ── 시드 상대 풀 (스펙 §9) ──
export const SEED_USERS: SeedUser[] = [
  {
    id: "u-jiyun", nickname: "지윤", age: 29, region: "성수", photo: "🎨",
    bio: "주말엔 전시 보러 다녀요. 진득한 대화를 좋아해요.",
    interests: ["전시", "카페", "와인"],
    trait: { EI: 0.7, JP: 0.8, active: 0.6, values: 0.9 },
  },
  {
    id: "u-hyunwoo", nickname: "현우", age: 31, region: "성수", photo: "🍝",
    bio: "맛집 탐방이 취미입니다. 같이 먹으러 다녀요!",
    interests: ["맛집", "러닝", "영화"],
    trait: { EI: 0.8, JP: 0.75, active: 0.7, values: 0.85 },
  },
  {
    id: "u-seoyeon", nickname: "서연", age: 27, region: "홍대", photo: "📚",
    bio: "카페에서 책 읽는 시간이 제일 좋아요.",
    interests: ["독서", "카페", "음악"],
    trait: { EI: 0.3, JP: 0.4, active: 0.3, values: 0.6 },
  },
  {
    id: "u-dohyun", nickname: "도현", age: 30, region: "홍대", photo: "🧗",
    bio: "러닝과 클라이밍! 활동적인 데이트 좋아해요.",
    interests: ["클라이밍", "러닝", "여행"],
    trait: { EI: 0.6, JP: 0.3, active: 0.9, values: 0.5 },
  },
  {
    id: "u-minji", nickname: "민지", age: 28, region: "성수", photo: "🎬",
    bio: "조용하고 아늑한 분위기를 좋아합니다.",
    interests: ["영화", "베이킹", "미술관"],
    trait: { EI: 0.2, JP: 0.85, active: 0.2, values: 0.4 },
  },
  {
    id: "u-junho", nickname: "준호", age: 32, region: "성수", photo: "📷",
    bio: "즉흥 여행과 사진 찍기를 사랑하는 사람.",
    interests: ["여행", "사진", "페스티벌"],
    trait: { EI: 0.9, JP: 0.2, active: 0.8, values: 0.7 },
  },
];

// ── 큐레이션 데이트 코스 (성수 1지역 5코스) ──
export const COURSES: Course[] = [
  {
    id: "c-cafe-gallery", title: "감성 카페 + 갤러리", emoji: "🎨", region: "성수",
    estTime: "3시간", estCost: "4만원", vibe: "calm",
    steps: ["대림창고 카페", "성수 연방 갤러리", "한강 산책"],
  },
  {
    id: "c-food-rooftop", title: "맛집 + 루프탑 바", emoji: "🍷", region: "성수",
    estTime: "4시간", estCost: "7만원", vibe: "calm",
    steps: ["성수 수제버거", "디저트 카페", "루프탑 칵테일 바"],
  },
  {
    id: "c-active", title: "액티브 데이트", emoji: "🧗", region: "성수",
    estTime: "3시간", estCost: "5만원", vibe: "active",
    steps: ["실내 클라이밍", "단백질 브런치", "성수 편집샵 구경"],
  },
  {
    id: "c-class-dinner", title: "공방 클래스 + 디너", emoji: "🧵", region: "성수",
    estTime: "4시간", estCost: "8만원", vibe: "calm",
    steps: ["가죽 공방 원데이클래스", "이탈리안 디너"],
  },
  {
    id: "c-walk", title: "조용한 산책 코스", emoji: "🌳", region: "성수",
    estTime: "2시간", estCost: "3만원", vibe: "active",
    steps: ["서울숲 산책", "북카페", "테이크아웃 커피"],
  },
];

// ── AI 성향 리포트(자기 자신) 키워드/요약 생성 (스크립트형) ──
export function buildSelfReport(t: TraitVector): { keywords: string[]; summary: string } {
  const keywords = [
    t.EI >= 0.5 ? "#외향적" : "#내향적",
    t.JP >= 0.5 ? "#계획형" : "#즉흥형",
    t.active >= 0.5 ? "#액티브" : "#차분한",
    t.values >= 0.5 ? "#진지한연애" : "#자유로운연애",
  ];
  const style = t.JP >= 0.5 ? "계획을 세워 안정적으로" : "흐름에 몸을 맡기며 자연스럽게";
  const tone = t.values >= 0.5 ? "신뢰와 깊이를 중시하는" : "설렘과 새로움을 즐기는";
  const summary = `당신은 ${style} 관계를 쌓아가는, ${tone} 연애 스타일이에요. 비슷한 결을 가진 상대와 특히 잘 맞습니다.`;
  return { keywords, summary };
}

// ── 아이스브레이킹 가이드(대화창) 생성 (스크립트형) ──
export function buildIcebreakers(myInterests: string[], other: SeedUser, topMatchLabel: string): string[] {
  const shared = other.interests.find((i) => myInterests.includes(i)) ?? other.interests[0];
  return [
    `“${other.nickname}님 프로필에서 ‘${shared}’ 보고 반가웠어요! 요즘도 자주 즐기세요?”`,
    `두 분은 ${topMatchLabel}가 잘 맞아요. 가볍게 취향 이야기로 시작해보세요.`,
    `“이번 주말 ${other.region} 쪽에서 가보고 싶은 곳 있어요?” 로 자연스럽게 약속 잡기 👍`,
  ];
}

// 데이트 가능 날짜 칩 (스펙 SCR-MAT-001)
export const DATE_CHIPS = ["오늘 저녁", "내일", "이번 주말", "다음 주말", "평일 저녁"];

export const DIMS: Dim[] = ["EI", "JP", "active", "values"];
