from selenium import webdriver
from selenium.webdriver.common.by import By
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

# 페이지 로딩 대기 (필요에 따라 조정)
time.sleep(2)

# 선수 목록 크롤링
players = driver.find_elements(By.CSS_SELECTOR, ".playerSearchList > li")
for player in players:
    # 선수 이름 가져오기
    name = player.find_element(By.CSS_SELECTOR, ".playerName").text
    print("선수 이름:", name)

# 브라우저 종료
driver.quit()
