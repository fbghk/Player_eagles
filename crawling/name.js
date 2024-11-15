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
            waitUntil: 'networkidle0',
            timeout: 30000
        });

        await wait(2000); // 페이지 로딩 대기
        
        const playerData = [];
        
        // item away 요소들 가져오기
        const players = await page.$$('.item.away');
        console.log(`총 ${players.length}명의 선수를 찾았습니다.`);
        
        for (const player of players) {
            try {
                // 등번호 가져오기
                const number = await player.$eval('.name.t7002 .number', el => el.textContent.trim());
                console.log(`등번호 ${number} 처리 중...`);
                
                // 선수 링크 클릭
                const playerLink = await player.$('a');
                const [newPage] = await Promise.all([
                    new Promise(resolve => browser.once('targetcreated', target => resolve(target.page()))),
                    playerLink.click()
                ]);

                await newPage.waitForSelector('.p_info', { timeout: 10000 });
                await wait(1000);
                
                // 선수 상세 정보 수집
                const playerInfo = await newPage.evaluate(() => {
                    // 기본 정보
                    const pInfo = document.querySelector('.p_info');
                    const name = pInfo.querySelector('.name').textContent.trim().split(' (')[0];
                    const conSpans = pInfo.querySelectorAll('.con span');
                    const team = conSpans[0].textContent.trim();
                    const position = conSpans[1].textContent.trim();
                    const throwHit = conSpans[2].textContent.trim();
                    
                    // 상세 정보
                    const manInfo = document.querySelector('.man_info');
                    const details = Array.from(manInfo.querySelectorAll('li')).map(li => {
                        return li.textContent.split(' : ')[1].trim();
                    });
                    
                    return {
                        name,
                        team,
                        position,
                        throwHit,
                        birth: details[0],
                        school: details[1],
                        draft: details[2],
                        activeYears: details[3]
                    };
                });

                // 수집된 데이터를 배열에 추가
                playerData.push({
                    number,
                    ...playerInfo
                });

                console.log(`${playerInfo.name} 선수 정보 추가 완료`);
                
                // 새 페이지 닫기
                await newPage.close();
                await wait(1500);
                
            } catch (error) {
                console.error('선수 정보 수집 중 오류 발생:', error);
                continue;
            }
        }

        // 결과를 JSON 파일로 저장
        fs.writeFileSync('hanwha_players_info.json', JSON.stringify(playerData, null, 2), 'utf-8');
        console.log(`총 ${playerData.length}명의 선수 정보가 성공적으로 저장되었습니다.`);
        
        await browser.close();
        
    } catch (error) {
        console.error('크롤링 중 오류 발생:', error);
    }
}

crawlPlayerInfo();