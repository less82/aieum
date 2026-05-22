# -*- coding: utf-8 -*-
"""
네이버 뉴스 저출산 데이터 기반 워드클라우드 생성기
작성일: 2026-05-21
설명: 수집한 '저출산' 뉴스 기사들의 제목과 본문에서 핵심 단어를 추출하고 빈도수를 집계하여 
      한글 깨짐 없이 예쁜 워드클라우드 이미지를 생성합니다.

      * Python 3.14 환경에서 kiwipiepy 모델 파일 로딩 실패 문제로 인해,
        자체 구현한 한국어 조사 제거 파서(Fallback Parser)를 사용합니다.
      * 결과물: data/wordcloud_lowbirth.png
"""

import os
import glob
import re
from collections import Counter
import pandas as pd
from wordcloud import WordCloud

# ==========================================
# [설정 항목]
# ==========================================
DATA_DIR = "./data"
OUTPUT_IMAGE_NAME = "wordcloud_lowbirth.png"

# Windows 기본 맑은 고딕 한글 폰트 (한글 깨짐 방지)
FONT_PATH = "C:/Windows/Fonts/malgun.ttf"

# 워드클라우드에 나타나도 의미 없는 단어 목록 (불용어)
# 1차 분석 결과를 바탕으로 동사/형용사 어간 및 무의미 단어를 대폭 추가합니다.
STOPWORDS = {
    # 검색 키워드 및 뉴스 수집 관련
    "저출산", "뉴스", "기사", "기자", "네이버", "아웃링크", "제외",
    "본문", "수집", "오류", "접속", "실패", "태그", "찾을",
    "사진", "출처", "배포", "금지", "무단", "전재", "저작권자",
    # 언론사명
    "연합뉴스", "뉴스1", "헤럴드", "머니투데이", "경향신문",
    "조선일보", "동아일보", "한겨레", "중앙일보", "세계일보",
    # 동사/형용사 어간 (조사 제거 후 남는 형태)
    "있다", "있는", "있어", "있고", "한다", "한다", "하는", "하여",
    "위한", "대한", "의한", "통한", "따른", "향한", "지난", "오는",
    "것으", "이를", "이에", "이가", "이와", "이는", "이도",
    "됩니", "합니", "입니", "됩니다", "합니다", "입니다",
    "됐다", "했다", "됩니다", "한다", "된다", "없다", "없는",
    "보다", "처럼", "같은", "같이", "라고", "이라", "으로",
    # 시간/수량/일반 지시 표현
    "이번", "오늘", "때문", "관련", "대해", "위해", "통해", "의해",
    "경우", "이상", "이후", "이전", "최근", "올해", "내년", "하루",
    "정도", "사실", "부분", "일부", "지금", "최대", "최소", "어제",
    "내일", "그동안", "그것", "저것", "이것", "우리", "위", "아래",
    "그리고", "그러나", "하지만", "따라서", "그래서", "또한", "또는",
    "이미", "아직", "바로", "함께", "더욱", "매우", "계속", "다시",
    "이후", "앞으", "뒤에", "등이", "등을", "등의", "등에",
}


# ==========================================
# [함수 정의]
# ==========================================

def get_latest_csv(directory):
    """가장 최근 생성된 저출산 뉴스 CSV 파일 경로를 반환합니다."""
    pattern = os.path.join(directory, "naver_news_lowbirth_*.csv")
    files = glob.glob(pattern)
    if not files:
        return None
    return max(files, key=os.path.getctime)


def clean_text(text):
    """
    텍스트에서 URL, 이메일, 특수기호, 불필요한 고정 문구를 제거합니다.
    순수한 한글·영어·숫자 텍스트만 남깁니다.
    """
    if not isinstance(text, str):
        return ""
    # 수집 과정에서 삽입된 안내 문구 제거
    for phrase in [
        "[외부 언론사 링크 - 본문 수집 제외]",
        "[외부 언론사 기사 - 본문 수집 제외]",
        "[페이지 접속 실패]",
        "[본문 태그(#dic_area)를 찾을 수 없음]",
        "[본문 수집 오류",
    ]:
        text = text.replace(phrase, " ")
    # URL 제거
    text = re.sub(r'https?://\S+|www\.\S+', ' ', text)
    # 이메일 제거
    text = re.sub(r'\S+@\S+\.\S+', ' ', text)
    # 한글·영어·숫자·공백 외 모두 제거
    text = re.sub(r'[^가-힣a-zA-Z0-9\s]', ' ', text)
    # 연속 공백 정리
    return " ".join(text.split())


def extract_nouns(text):
    """
    한국어 조사 제거 규칙 기반 명사 추출기 (Fallback Parser).
    
    동작 원리:
    1. 공백 기준으로 어절을 분리합니다.
    2. 각 어절 끝에 붙은 대표 조사를 제거하여 어근(명사)을 추출합니다.
    3. 2글자 이상이고 불용어 목록에 없는 단어만 수집합니다.
    """
    # 한글 어절 단위로 분리 (영어/숫자 포함)
    words = re.findall(r'[가-힣]{2,}|[a-zA-Z]{3,}', text)

    # 자주 쓰이는 한국어 조사 목록 (긴 것부터 먼저 매칭)
    particles = [
        "으로부터", "에서부터", "에서는", "에게서", "으로써", "으로서", "에서의",
        "으로는", "이라는", "라는", "에서", "에게", "부터", "까지", "으로",
        "로써", "로서", "보다", "처럼", "마다", "이나", "이며", "이고",
        "하고", "하며", "하여", "해서", "했다", "한다", "했고", "하는",
        "한다", "되어", "됩니다", "됩니", "합니다", "합니", "입니다", "입니",
        "이다", "이고", "이며", "이나", "이라", "에는", "에도", "에만",
        "은", "는", "이", "가", "을", "를", "에", "의", "로", "과",
        "와", "도", "만", "나", "야", "아",
    ]

    nouns = []
    for word in words:
        # 영어 단어는 소문자로 통일 후 그대로 사용
        if re.match(r'^[a-zA-Z]+$', word):
            w = word.lower()
            if w not in STOPWORDS and len(w) >= 3:
                nouns.append(w)
            continue

        # 한글 어절: 조사 제거 시도
        root = word
        for p in particles:
            if word.endswith(p) and len(word) - len(p) >= 2:
                root = word[:-len(p)]
                break

        if len(root) >= 2 and root not in STOPWORDS:
            nouns.append(root)

    return nouns


# ==========================================
# [메인 실행부]
# ==========================================
def main():
    print("=" * 50)
    print("  [시작] 뉴스 워드클라우드 생성을 시작합니다")
    print("=" * 50)

    # 1. CSV 파일 찾기
    csv_path = get_latest_csv(DATA_DIR)
    if not csv_path:
        print(f"[오류] '{DATA_DIR}' 폴더에 CSV 파일이 없습니다.")
        return
    print(f"[정보] CSV 파일: {os.path.basename(csv_path)}")

    # 2. 데이터 로드
    df = pd.read_csv(csv_path)
    print(f"[정보] 불러온 기사 수: {len(df)}개")

    # 3. 텍스트 전처리 및 합치기
    print("[정보] 텍스트 정제 중...")
    parts = []
    for _, row in df.iterrows():
        parts.append(clean_text(str(row.get("제목", ""))))
        parts.append(clean_text(str(row.get("본문", ""))))
    full_text = " ".join(parts)

    # 4. 명사(핵심 단어) 추출
    print("[정보] 핵심 단어 추출 중...")
    nouns = extract_nouns(full_text)
    print(f"[정보] 추출된 단어 수: {len(nouns):,}개")

    if not nouns:
        print("[오류] 추출된 단어가 없습니다.")
        return

    # 5. 빈도수 집계
    freq = Counter(nouns)

    print()
    print("=" * 50)
    print("       상위 20개 키워드 (빈도순)")
    print("=" * 50)
    for i, (word, count) in enumerate(freq.most_common(20), 1):
        bar = "#" * min(count // 10, 30)
        print(f"  {i:2d}위  {word:<10}  {count:4d}회  {bar}")
    print("=" * 50)

    # 6. 워드클라우드 생성
    print()
    print("[정보] 워드클라우드 이미지 렌더링 중...")

    font_path = FONT_PATH if os.path.exists(FONT_PATH) else None
    if not font_path:
        print("[경고] 맑은고딕 폰트를 찾지 못했습니다. 한글이 깨질 수 있습니다.")

    wc = WordCloud(
        font_path=font_path,
        width=1200,
        height=800,
        background_color="#0d0d1a",   # 짙은 네이비 다크 배경
        colormap="plasma",             # 보라-노랑-빨강 그라데이션 색상
        max_words=200,
        min_font_size=10,
        max_font_size=150,
        prefer_horizontal=0.7,
        random_state=42,
    )
    wc.generate_from_frequencies(freq)

    # 7. 저장
    os.makedirs(DATA_DIR, exist_ok=True)
    output_path = os.path.join(DATA_DIR, OUTPUT_IMAGE_NAME)
    wc.to_file(output_path)

    print()
    print("=" * 50)
    print("  [완료] 워드클라우드 이미지 저장 성공!")
    print("=" * 50)
    print(f"  저장 위치: {os.path.abspath(output_path)}")
    print("=" * 50)


if __name__ == "__main__":
    main()
