const { Builder, By } = require('selenium-webdriver');
const fs = require('fs');  // fs 모듈 추가 (파일 작업을 위해)

class KBOPlayerScraper {
    constructor() {
        this.driver = null;
        this.url = 'https://www.koreabaseball.com/Player/Search.aspx';
        this.teamValue = 'HH';  // 한화 팀
        this.maxPages = 5;  // 최대 5페이지 크롤링
    }

    // 웹 드라이버 초기화
    async initDriver() {
        this.driver = await new Builder().forBrowser('chrome').build();
    }

    // 페이지 로드
    async loadPage() {
        await this.driver.get(this.url);
        await this.driver.sleep(2000); // 페이지 로딩 대기
    }

    // 팀 선택
    async selectTeam() {
        const teamSelect = await this.driver.findElement(By.id("cphContents_cphContents_cphContents_ddlTeam"));
        await teamSelect.findElement(By.css(`option[value='${this.teamValue}']`)).click();
        await this.driver.sleep(2000);  // 데이터 로딩 대기
    }

    // 테이블에서 선수 정보 추출
    async extractPlayerData() {
        const tableRows = await this.driver.findElements(By.css("div.inquiry table.tEx tbody tr"));
        let playerData = [];

        for (let row of tableRows) {
            const cells = await row.findElements(By.tagName("td"));
            if (cells.length > 0) {
                const data = {
                    "등번호": await cells[0].getText(),
                    "선수명": await cells[1].getText(),
                    "팀명": await cells[2].getText(),
                    "포지션": await cells[3].getText(),
                    "생년월일": await cells[4].getText(),
                    "체격": await cells[5].getText(),
                    "출신교": await cells[6].getText()
                };
                playerData.push(data);
            }
        }
        return playerData;
    }

    // 페이지 네비게이션 (페이지 번호 클릭)
    async goToPage(pageNumber) {
        const pageButton = await this.driver.findElement(By.id(`cphContents_cphContents_cphContents_ucPager_btnNo${pageNumber}`));
        await pageButton.click();
        await this.driver.sleep(2000);  // 페이지 로딩 대기
    }

    // 데이터를 JSON 파일로 저장
    async saveToFile(playerData) {
        fs.writeFileSync('players.json', JSON.stringify(playerData, null, 2), 'utf8');
        console.log('데이터가 players.json 파일에 저장되었습니다.');
    }

    // 전체 작업 실행
    async scrape() {
        let allPlayerData = [];  // 모든 페이지의 선수 데이터를 저장할 배열

        try {
            await this.initDriver();
            await this.loadPage();
            await this.selectTeam();

            // 1페이지부터 5페이지까지 크롤링
            for (let page = 1; page <= this.maxPages; page++) {
                console.log(`페이지 ${page} 크롤링 중...`);
                
                // 현재 페이지에서 선수 데이터 추출
                const playerData = await this.extractPlayerData();
                allPlayerData = allPlayerData.concat(playerData);  // 데이터 합치기

                // 다음 페이지로 이동
                if (page < this.maxPages) {
                    await this.goToPage(page + 1);
                }
            }

            // 모든 데이터를 파일에 저장
            await this.saveToFile(allPlayerData);

        } finally {
            await this.driver.quit();
        }
    }
}

// 실행
const scraper = new KBOPlayerScraper();
scraper.scrape();
