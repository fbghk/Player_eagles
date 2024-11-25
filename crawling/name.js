const { Builder, By } = require('selenium-webdriver');
const fs = require('fs');  // fs 모듈 추가 (파일 작업을 위해)

(async function scrapeKBO() {
    // Chrome 브라우저를 자동으로 열기
    let driver = await new Builder().forBrowser('chrome').build();

    try {
        // KBO 선수 검색 페이지 열기
        await driver.get('https://www.koreabaseball.com/Player/Search.aspx');

        // 페이지 로딩 대기
        await driver.sleep(2000);

        // 팀 선택 (한화로 설정)
        const teamSelect = await driver.findElement(By.id("cphContents_cphContents_cphContents_ddlTeam"));
        await teamSelect.findElement(By.css("option[value='HH']")).click();

        // 데이터 로딩 대기
        await driver.sleep(2000);

        // 테이블 데이터 추출
        const tableRows = await driver.findElements(By.css("div.inquiry table.tEx tbody tr"));

        let playerData = [];  // 선수 정보를 저장할 배열

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
                playerData.push(data);  // 배열에 데이터 추가
            }
        }

        // JSON 파일로 저장
        fs.writeFileSync('players.json', JSON.stringify(playerData, null, 2), 'utf8');
        console.log('데이터가 players.json 파일에 저장되었습니다.');

    } finally {
        // 브라우저 닫기
        await driver.quit();
    }
})();
