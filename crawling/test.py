from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select  # Select 추가
import time

# Selenium Manager가 ChromeDriver를 자동으로 관리
driver = webdriver.Chrome()

# 크롤링할 페이지로 이동
url = "https://www.koreabaseball.com/Player/Search.aspx"
driver.get(url)
time.sleep(2)  # 페이지 로딩 대기

# 팀 선택 예시
team_select = Select(driver.find_element(By.ID, "cphContents_cphContents_cphContents_ddlTeam"))
team_select.select_by_value("HH")
time.sleep(2)

# 원하는 데이터 추출 코드 작성
table = driver.find_element(By.CSS_SELECTOR, "div.inquiry table.tEx tbody")
for row in table.find_elements(By.TAG_NAME, "tr"):
    cells = row.find_elements(By.TAG_NAME, "td")
    if len(cells) > 0:
        print({
            "등번호": cells[0].text,
            "선수명": cells[1].text,
            "팀명": cells[2].text,
            "포지션": cells[3].text,
            "생년월일": cells[4].text,
            "체격": cells[5].text,
            "출신교": cells[6].text
        })

driver.quit()
