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

        // 페이지 로딩 대기
        await page.waitForSelector('.item.away', { timeout: 10000 });
        
        const playerData = [];
        
        // 모든 선수 정보 수집
        while (true) {
            const players = await page.$$('.item.away');
            if (players.length === 0) break;
            
            for (const player of players) {
                try {
                    // 요소가 보이고 클릭 가능할 때까지 대기
                    await page.waitForSelector('.number', { visible: true, timeout: 5000 });
                    
                    // 등번호와 이름 가져오기
                    const number = await player.$eval('.number', el => el.textContent.trim())
                        .catch(() => 'N/A');
                    
                    // 선수 링크 찾기 및 클릭
                    const playerLink = await player.$('a');
                    if (!playerLink) {
                        console.log(`선수 링크를 찾을 수 없습니다. 등번호: ${number}`);
                        continue;
                    }

                    // 새 페이지에서 열리는 것을 대기
                    const [newPage] = await Promise.all([
                        new Promise(resolve => browser.once('targetcreated', target => resolve(target.page()))),
                        playerLink.click()
                    ]);

                    await newPage.waitForSelector('.p_info', { timeout: 10000 });
                    
                    // 선수 기본 정보 수집
                    const basicInfo = await newPage.evaluate(() => {
                        try {
                            const pInfo = document.querySelector('.p_info');
                            if (!pInfo) return null;
                            
                            const name = pInfo.querySelector('.name')?.textContent.trim().split(' (')[0] || 'N/A';
                            const conInfo = Array.from(pInfo.querySelectorAll('.con span'))
                                .map(span => span.textContent.trim());
                            
                            const detailInfo = Array.from(document.querySelectorAll('.man_info li'))
                                .map(li => {
                                    const parts = li.textContent.trim().split(': ');
                                    return parts[1] || 'N/A';
                                });

                            return {
                                name,
                                team: conInfo[0] || 'N/A',
                                position: conInfo[1] || 'N/A',
                                throwHit: conInfo[2] || 'N/A',
                                birth: detailInfo[0] || 'N/A',
                                school: detailInfo[1] || 'N/A',
                                draft: detailInfo[2] || 'N/A',
                                activeYears: detailInfo[3] || 'N/A'
                            };
                        } catch (error) {
                            console.error('데이터 추출 중 오류:', error);
                            return null;
                        }
                    });

                    if (basicInfo) {
                        playerData.push({
                            number,
                            ...basicInfo
                        });
                    }

                    // 새 페이지 닫기
                    await newPage.close();
                    await wait(1500); // 안정성을 위한 대기 시간
                    
                } catch (error) {
                    console.error('선수 정보 수집 중 오류 발생:', error);
                    continue;
                }
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