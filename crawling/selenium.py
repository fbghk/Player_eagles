from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
import time

# ChromeDriver 경로 설정
chrome_driver_path = "/path/to/chromedriver"

# Chrome 옵션 설정
options = Options()
options.add_argument("--headless")  # 브라우저를 백그라운드에서 실행
service = Service(chrome_driver_path)

# Selenium WebDriver 초기화
driver = webdriver.Chrome(service=service, options=options)

# KBO 선수 검색 페이지 열기
url = "https://www.koreabaseball.com/Player/Search.aspx"
driver.get(url)
time.sleep(2)  # 페이지 로딩 대기

# 팀 선택을 위한 <select> 요소 찾기
team_select = Select(driver.find_element(By.ID, "cphContents_cphContents_cphContents_ddlTeam"))

# 한화 팀 선택
team_select.select_by_value("HH")
time.sleep(2)  # 선택 후 로딩 대기

# 선수 정보가 있는 <table> 요소 찾기
table = driver.find_element(By.CSS_SELECTOR, "div.inquiry table.tEx tbody")

# 선수 정보 추출
player_data = []
rows = table.find_elements(By.TAG_NAME, "tr")
for row in rows:
    cells = row.find_elements(By.TAG_NAME, "td")
    if len(cells) > 0:
        # 셀의 텍스트 추출
        number = cells[0].text  # 등번호
        name = cells[1].text    # 선수명
        team = cells[2].text    # 팀명
        position = cells[3].text  # 포지션
        birthdate = cells[4].text  # 생년월일
        physique = cells[5].text   # 체격
        school = cells[6].text     # 출신교
        
        # 선수 정보를 딕셔너리 형태로 저장
        player_data.append({
            "등번호": number,
            "선수명": name,
            "팀명": team,
            "포지션": position,
            "생년월일": birthdate,
            "체격": physique,
            "출신교": school
        })

# 크롤링한 선수 정보 출력
for player in player_data:
    print(player)

# 브라우저 종료
driver.quit()
