const puppeteer = require('puppeteer');
const fs = require('fs');

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function crawlPlayerInfo() {
    try {
        const browser = await puppeteer.launch({
            headless: false,
            defaultViewport: null
        });
        const page = await browser.newPage();

        // 웹사이트 접속
        await page.goto('https://statiz.sporki.com/team/?m=seasonBacknumber&t_code=7002&year=2024', {
            waitUntil: 'networkidle0'
        });

        const playerData = [];

        // 모든 선수 정보 수집
        const players = await page.$$('.item.away');
        
        for (const player of players) {
            try {
                // 등번호와 이름 가져오기
                const number = await player.$eval('.number', el => el.textContent.trim());
                const playerLink = await player.$('a');
                
                // 선수 상세 페이지로 이동
                await playerLink.click();
                await wait(1000); // 페이지 로딩 대기

                // 선수 기본 정보 수집
                const basicInfo = await page.evaluate(() => {
                    const pInfo = document.querySelector('.p_info');
                    const name = pInfo.querySelector('.name').textContent.trim().split(' (')[0];
                    const conInfo = Array.from(pInfo.querySelectorAll('.con span')).map(span => span.textContent.trim());
                    
                    // 상세 정보 수집
                    const detailInfo = Array.from(document.querySelectorAll('.man_info li')).map(li => {
                        return li.textContent.trim().split(': ')[1];
                    });

                    return {
                        name,
                        team: conInfo[0],
                        position: conInfo[1],
                        throwHit: conInfo[2],
                        birth: detailInfo[0],
                        school: detailInfo[1],
                        draft: detailInfo[2],
                        activeYears: detailInfo[3]
                    };
                });

                // 데이터 구조화
                playerData.push({
                    number: number,
                    name: basicInfo.name,
                    team: basicInfo.team,
                    position: basicInfo.position,
                    throwHit: basicInfo.throwHit,
                    birth: basicInfo.birth,
                    school: basicInfo.school,
                    draft: basicInfo.draft,
                    activeYears: basicInfo.activeYears
                });

                // 뒤로 가기
                await page.goBack();
                await wait(1000); // 페이지 로딩 대기

            } catch (error) {
                console.error('선수 정보 수집 중 오류 발생:', error);
                continue;
            }
        }

        // JSON 파일로 저장
        fs.writeFileSync('hanwha_players_info.json', JSON.stringify(playerData, null, 2), 'utf-8');
        console.log('선수 정보가 성공적으로 저장되었습니다.');

        await browser.close();

    } catch (error) {
        console.error('크롤링 중 오류 발생:', error);
    }
}

crawlPlayerInfo();