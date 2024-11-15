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
        
        await page.goto('https://statiz.sporki.com/team/?m=seasonBacknumber&t_code=7002&year=2024', {
            waitUntil: 'networkidle0',
            timeout: 30000
        });

        // 페이지 로딩을 위한 대기
        await wait(2000);
        
        // .item.away 요소가 로드될 때까지 대기
        await page.waitForSelector('.item.away', { timeout: 10000 });
        
        const playerData = [];
        const players = await page.$$('.item.away');
        console.log(`발견된 선수 수: ${players.length}`);
        
        for (let i = 0; i < players.length; i++) {
            try {
                const player = players[i];
                
                if (!player) {
                    console.log(`${i}번째 선수 요소를 찾을 수 없습니다.`);
                    continue;
                }

                // 등번호 가져오기
                let number;
                try {
                    number = await player.$eval('.name.t7002 .number', el => el.textContent.trim());
                    console.log(`등번호 찾음: ${number}`);
                } catch (error) {
                    console.log(`등번호를 찾을 수 없습니다. 선수 ${i + 1}`);
                    number = 'N/A';
                }

                // 선수 링크 찾기
                let playerLink;
                try {
                    playerLink = await player.$('> a');
                    console.log(`선수 링크 찾음: ${await (await playerLink.getProperty('href')).jsonValue()}`);
                } catch (error) {
                    console.log(`선수 ${i + 1}(${number})의 링크를 찾을 수 없습니다:`, error);
                    continue;
                }

                const [newPage] = await Promise.all([
                    new Promise(resolve => browser.once('targetcreated', target => resolve(target.page()))),
                    playerLink.click()
                ]);

                await newPage.waitForSelector('.p_info', { timeout: 10000 });
                await wait(1000);
                
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
                    console.log(`선수 정보 추가됨: ${basicInfo.name}`);
                }

                await newPage.close();
                await wait(1500);
                
            } catch (error) {
                console.error('선수 정보 수집 중 오류 발생:', error);
                continue;
            }
        }

        fs.writeFileSync('hanwha_players_info.json', JSON.stringify(playerData, null, 2), 'utf-8');
        console.log(`총 ${playerData.length}명의 선수 정보가 성공적으로 저장되었습니다.`);
        await browser.close();
        
    } catch (error) {
        console.error('크롤링 중 오류 발생:', error);
    }
}

crawlPlayerInfo();