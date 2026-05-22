# -*- coding: utf-8 -*-
"""
네이버 뉴스 검색 크롤러 (키워드 기반 월별 수집)
작성일: 2026-05-21
설명: "저출산" 키워드를 검색하여 최근 6개월 동안의 뉴스 기사를 월별로 최대 100개씩 수집합니다.
      수집된 데이터(수집월, 제목, 언론사, 게시일, 링크, 본문)는 CSV 및 Excel 파일로 저장됩니다.
      초보자 교육용으로 각 단계마다 상세한 한글 주석이 추가되어 있습니다.
"""

import os
import time
import random
import datetime
import requests
from bs4 import BeautifulSoup
import pandas as pd

# ==========================================
# [설정 항목]
# ==========================================
# 네이버 서버에서 차단되는 것을 방지하기 위해 일반 웹 브라우저처럼 보이도록 User-Agent 설정
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

# 검색 키워드 정의
SEARCH_KEYWORD = "저출산"

# 월별로 수집할 뉴스 기사의 최대 개수
# 사용자가 지정한 "각 월마다 100개씩" 조건 설정
MAX_ARTICLES_PER_MONTH = 100

# 테스트 모드 여부 (True: 테스트 10개, False: 실제 6개월 전체 수집)
TEST_MODE = False




# ==========================================
# [함수 정의]
# ==========================================

def get_monthly_ranges(num_months=6):
    """
    오늘 날짜를 기준으로 최근 6개월의 월별 시작일과 종료일 목록을 반환합니다.
    예: 오늘이 2026-05-21 인 경우,
    1. 2026-05-01 ~ 2026-05-21
    2. 2026-04-01 ~ 2026-04-30
    3. 2026-03-01 ~ 2026-03-31
    4. 2026-02-01 ~ 2026-02-28
    5. 2026-01-01 ~ 2026-01-31
    6. 2025-12-01 ~ 2025-12-31
    형태로 6개의 달력 기준 기간을 반환합니다.
    """
    ranges = []
    today = datetime.date.today()
    current_year = today.year
    current_month = today.month
    
    for _ in range(num_months):
        # 해당 월의 시작일 (1일)
        start_date = datetime.date(current_year, current_month, 1)
        
        # 해당 월의 마지막 날 계산 (다음 달 1일에서 하루를 뺌)
        if current_month == 12:
            next_month = datetime.date(current_year + 1, 1, 1)
        else:
            next_month = datetime.date(current_year, current_month + 1, 1)
        end_date = next_month - datetime.timedelta(days=1)
        
        # 만약 계산된 범위에 오늘이 포함되어 있다면, 종료일을 오늘로 제한
        if start_date <= today <= end_date:
            end_date = today
            
        ranges.append((start_date, end_date))
        
        # 이전 달로 이동
        current_month -= 1
        if current_month == 0:
            current_month = 12
            current_year -= 1
            
    return ranges


def get_article_content(article_url):
    """
    네이버 뉴스 상세 페이지(URL)에 접속하여 본문과 등록 날짜를 추출합니다.
    네이버 뉴스 플랫폼(n.news.naver.com 등) 주소만 정상 수집을 보장합니다.
    """
    if "n.news.naver.com" not in article_url and "news.naver.com" not in article_url:
        # 외부 언론사 사이트는 태그 구조가 다양하여 본문 수집 대상에서 제외합니다.
        return "[외부 언론사 링크 - 본문 수집 제외]", None
        
    try:
        # 네이버 서버 부하 감소 및 차단 방지를 위해 무작위 대기 (0.3초 ~ 1.0초)
        time.sleep(random.uniform(0.3, 1.0))
        
        # 기사 상세 페이지 요청
        response = requests.get(article_url, headers=HEADERS, timeout=10)
        if response.status_code != 200:
            return "[페이지 접속 실패]", None
            
        soup = BeautifulSoup(response.text, "html.parser")
        
        # 1. 뉴스 기사 본문 영역 파싱
        # 네이버 뉴스의 본문은 주로 #dic_area 아이디를 가진 태그 내부에 존재합니다.
        content_div = soup.select_one("#dic_area")
        content_text = ""
        
        if content_div:
            content_text = content_div.get_text().strip()
            # 불필요한 연속 공백 및 줄바꿈 정리
            content_text = " ".join(content_text.split())
        else:
            content_text = "[본문 태그(#dic_area)를 찾을 수 없음]"
            
        # 2. 기사 실제 등록 날짜 파싱 (상세 페이지 내 attribute에서 정확한 일시 수집)
        date_span = soup.select_one("span.media_end_head_info_datestamp_time")
        exact_date = None
        if date_span and date_span.has_attr("data-date-time"):
            exact_date = date_span["data-date-time"] # 예: 2026-05-21 09:30:00
            
        return content_text, exact_date
        
    except Exception as e:
        return f"[본문 수집 오류: {str(e)}]", None


def crawl_news_by_month(start_date, end_date, max_articles):
    """
    지정된 날짜 범위(start_date ~ end_date) 내에서 키워드와 매칭되는 
    네이버 뉴스 검색 결과를 페이지별로 탐색하며 기사를 수집합니다.
    """
    articles_data = []
    
    # 네이버 뉴스 검색 URL 파라미터 날짜 포맷팅 (YYYY.MM.DD 및 YYYYMMDD)
    start_str = start_date.strftime("%Y.%m.%d")
    end_str = end_date.strftime("%Y.%m.%d")
    start_nodash = start_date.strftime("%Y%m%d")
    end_nodash = end_date.strftime("%Y%m%d")
    
    # 수집 대상 월 이름 (예: "2026-05")
    month_name = start_date.strftime("%Y-%m")
    
    print(f"\n[안내] [{month_name}] 기간 수집 시작 ({start_str} ~ {end_str})")
    
    # 네이버 뉴스 검색의 start parameter는 1부터 시작하며 페이지당 10개씩 증가합니다.
    # 1페이지 -> start=1, 2페이지 -> start=11, 3페이지 -> start=21 ...
    start_index = 1
    page = 1
    
    # 수집된 기사 중복 체크용 셋(Set)
    collected_urls = set()
    
    while len(articles_data) < max_articles:
        # 네이버 뉴스 검색 주소
        search_url = "https://search.naver.com/search.naver"
        
        # 한글 쿼리 깨짐 방지를 위해 requests.get의 params 기능을 활용합니다.
        # sort=1 (최신순), ds와 de로 날짜 설정, nso 파라미터로 해당 기간 필터링 고정
        params = {
            "where": "news",
            "query": SEARCH_KEYWORD,
            "sm": "tab_opt",
            "sort": "1",
            "ds": start_str,
            "de": end_str,
            "nso": f"so:dd,p:from{start_nodash}to{end_nodash},a:all",
            "start": start_index
        }
        
        try:
            # 네이버 서버 부하 조절을 위한 대기 (0.5초 ~ 1.2초)
            time.sleep(random.uniform(0.5, 1.2))
            
            response = requests.get(search_url, headers=HEADERS, params=params, timeout=10)
            if response.status_code != 200:
                print(f"    [오류] 검색 목록 페이지 접속 실패 (HTTP {response.status_code})")
                break
                
            soup = BeautifulSoup(response.text, "html.parser")
            
            # 개편된 네이버 검색 결과의 프로필 영역(각 뉴스 카드의 기준점)을 모두 찾습니다.
            profiles = soup.select('div[data-sds-comp="Profile"]')
            
            # 더 이상 검색 결과 기사가 없는 경우 루프 탈출
            if not profiles:
                print(f"    [안내] 더 이상 검색 결과 기사가 없습니다.")
                break
                
            page_has_new_article = False
            
            for profile in profiles:
                # 월별 목표 수집 개수를 채우면 즉시 중단
                if len(articles_data) >= max_articles:
                    break
                
                # 프로필 요소의 부모를 뉴스 카드 전체 범위로 식별합니다.
                news_card = profile.parent
                if not news_card:
                    continue
                
                # 1. 기사 제목 및 원본 링크 파싱
                # 뉴스 카드 안에서 큰 폰트로 출력되는 헤드라인 영역을 찾습니다.
                title = "제목 없음"
                link = None
                title_span = news_card.select_one("span.sds-comps-text-type-headline1")
                if title_span:
                    title = title_span.get_text().strip()
                    a_tag = title_span.find_parent("a")
                    if a_tag and a_tag.has_attr("href"):
                        link = a_tag["href"].strip()
                else:
                    # 헤드라인 선택자가 매칭되지 않는 경우, <mark>(하이라이트) 태그가 포함된 a 태그를 검색합니다.
                    mark_tag = news_card.select_one("mark")
                    if mark_tag:
                        a_tag = mark_tag.find_parent("a")
                        if a_tag and a_tag.has_attr("href"):
                            title = a_tag.get_text().strip()
                            link = a_tag["href"].strip()
                
                # 링크가 없는 유효하지 않은 카드인 경우 건너뜁니다.
                if not link:
                    continue
                
                # 중복 뉴스 수집 스킵
                if link in collected_urls:
                    continue
                
                collected_urls.add(link)
                page_has_new_article = True
                
                # 2. 언론사 정보 파싱
                press = "알 수 없음"
                press_area = profile.select_one(".sds-comps-profile-info-title")
                if press_area:
                    press = press_area.get_text().strip()
                
                # 3. 목록 페이지의 게시일 파싱
                list_date = "날짜 미상"
                subtexts_area = profile.select_one(".sds-comps-profile-info-subtexts")
                if subtexts_area:
                    subtexts = subtexts_area.find_all("span", class_="sds-comps-profile-info-subtext")
                    for st in subtexts:
                        txt = st.get_text().strip()
                        if "네이버뉴스" not in txt and txt:
                            list_date = txt
                            break
                
                # 4. 네이버 뉴스 링크 전용 주소 검색 (본문 파싱 목적)
                naver_news_link = None
                if subtexts_area:
                    naver_link_tag = subtexts_area.select_one('a[href*="news.naver.com"]')
                    if naver_link_tag:
                        naver_news_link = naver_link_tag["href"].strip()
                
                # 네이버 뉴스 공식 상세 페이지에 접속하여 기사 본문과 정확한 작성일자 가져오기
                if naver_news_link:
                    print(f"    - [{len(articles_data) + 1}/{max_articles}] 본문 수집 중: {title[:22]}...")
                    content, exact_date = get_article_content(naver_news_link)
                    date_to_save = exact_date if exact_date else list_date
                else:
                    # 네이버 뉴스 링크가 제공되지 않는 외부 언론사 아웃링크 기사인 경우
                    content = "[외부 언론사 기사 - 본문 수집 제외]"
                    date_to_save = list_date
                    
                articles_data.append({
                    "수집월": month_name,
                    "제목": title,
                    "작성일": date_to_save,
                    "언론사": press,
                    "링크": link,
                    "본문": content
                })
                
            # 이 페이지에서 새롭게 수집된 기사가 전혀 없으면 루프 탈출 (마지막 페이지 초과 방지)
            if not page_has_new_article:
                print(f"    [안내] 이번 페이지에서 새로 추가된 기사가 없습니다.")
                break
                
            # 다음 페이지로 인덱스 이동 (네이버 검색은 페이지당 10개씩 노출되므로 10을 더함)
            start_index += 10
            page += 1
            
            # 테스트 모드인 경우 1페이지만 긁고 강제 종료
            if TEST_MODE:
                print("    [테스트 모드] 1페이지 수집 후 조기 종료합니다.")
                break
                
        except Exception as e:
            print(f"    [오류] 검색 크롤링 중 오류 발생: {str(e)}")
            break
            
    print(f"[완료] [{month_name}] 수집 완료 (수집된 기사: {len(articles_data)}개)")
    return articles_data


# ==========================================
# [메인 실행부]
# ==========================================
def main():
    print("==================================================")
    print("      [시작] 네이버 뉴스 키워드 크롤러 작동을 시작합니다")
    print("==================================================")
    
    # 1. 수집 대상 월별 날짜 범위 목록 생성 (최근 6개월)
    months_ranges = get_monthly_ranges(num_months=6)
    
    # 테스트 모드 문구 출력
    if TEST_MODE:
        print("[경고] 현재 테스트 모드(TEST_MODE = True)가 활성화되어 있습니다.")
        print("   최근 1개월의 검색결과 중 1페이지(최대 10개 기사)만 시범 수집합니다.")
        print("   전체 수집을 진행하려면 코드의 TEST_MODE를 False로 변경해 주세요.\n")
        # 테스트 모드일 때는 첫 번째 달(최신 월)만 지정하여 최대 10개만 수집
        months_ranges = [months_ranges[0]]
        max_articles_to_collect = 10
    else:
        max_articles_to_collect = MAX_ARTICLES_PER_MONTH
        print(f"[정보] 수집 키워드: '{SEARCH_KEYWORD}'")
        print(f"[정보] 수집 범위: {months_ranges[-1][0]} ~ {months_ranges[0][1]} (최근 6개월)")
        print(f"[정보] 월별 수집 목표 개수: {MAX_ARTICLES_PER_MONTH}개 (총 최대 {len(months_ranges) * MAX_ARTICLES_PER_MONTH}개)")
    print("==================================================")
    
    all_collected_articles = []
    
    # 2. 각 월별 범위 순회하며 크롤링 실행
    for start_date, end_date in months_ranges:
        monthly_articles = crawl_news_by_month(start_date, end_date, max_articles_to_collect)
        all_collected_articles.extend(monthly_articles)
        
    # 3. 수집 데이터 프레임 변환 및 파일 저장
    if all_collected_articles:
        df = pd.DataFrame(all_collected_articles)
        
        # 결과 파일을 담을 저장 폴더 생성 (없을 경우)
        output_dir = "./data"
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
            
        # 파일 저장 이름 (키워드 및 현재시각 타임스탬프 결합)
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        csv_filename = f"{output_dir}/naver_news_lowbirth_{timestamp}.csv"
        xlsx_filename = f"{output_dir}/naver_news_lowbirth_{timestamp}.xlsx"
        
        # CSV 및 Excel 파일로 저장 (UTF-8-SIG는 엑셀 한글 깨짐 방지용 인코딩 기법입니다.)
        df.to_csv(csv_filename, index=False, encoding="utf-8-sig")
        df.to_excel(xlsx_filename, index=False)
        
        print("\n==================================================")
        print("          [성공] 크롤링 및 데이터 저장이 완료되었습니다!")
        print("==================================================")
        print(f"[결과] 총 수집 기사 수: {len(df)}개")
        print(f"[저장] CSV 파일 저장 위치: {os.path.abspath(csv_filename)}")
        print(f"[저장] Excel 파일 저장 위치: {os.path.abspath(xlsx_filename)}")
        print("==================================================")
    else:
        print("\n[오류] 수집된 기사가 존재하지 않습니다. 검색어 및 날짜 조건을 다시 확인해 주세요.")

if __name__ == "__main__":
    main()
