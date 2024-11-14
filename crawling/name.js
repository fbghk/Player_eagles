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

        // 페이지가 완전히 로드될 때까지 대기
        await wait(2000);
        
        const playerData = [];
        
        // 선수 목록을 가져오기 전에 컨테이너가 로드되었는지 확인
        await page.waitForSelector('.backnumber_list', { timeout: 10000 });
        
        // 모든 선수 정보 수집
        const players = await page.$$('.backnumber_list .item.away');
        console.log(`발견된 선수 수: ${players.length}`);
        
        for (let i = 0; i < players.length; i++) {
            try {
                const player = players[i];
                
                // 선수 요소가 여전히 유효한지 확인
                if (!player) {
                    console.log(`${i}번째 선수 요소를 찾을 수 없습니다.`);
                    continue;
                }

                // 디버깅을 위한 HTML 구조 출력
                const playerHTML = await page.evaluate(el => el.outerHTML, player);
                console.log(`선수 ${i + 1}의 HTML 구조:`, playerHTML);
                
                // 등번호 가져오기 (에러 처리 추가)
                let number;
                try {
                    number = await player.$eval('.number', el => el.textContent.trim());
                    console.log(`등번호 찾음: ${number}`);
                } catch (error) {
                    console.log(`등번호를 찾을 수 없습니다. 선수 ${i + 1}`);
                    number = 'N/A';
                }

                // 선수 링크 찾기 (에러 처리 추가)
                let playerLink;
                try {
                    playerLink = await player.$('a.name');  // name 클래스를 가진 a 태그를 찾습니다
                    if (!playerLink) {
                        playerLink = await player.$('a');  // 일반 a 태그도 시도
                    }
                    console.log(`선수 링크 찾음: ${await (await playerLink.getProperty('href')).jsonValue()}`);
                } catch (error) {
                    console.log(`선수 ${i + 1}(${number})의 링크를 찾을 수 없습니다:`, error);
                    continue;
                }

                // 새 페이지에서 열리는 것을 대기
                const [newPage] = await Promise.all([
                    new Promise(resolve => browser.once('targetcreated', target => resolve(target.page()))),
                    playerLink.click()
                ]);

                await newPage.waitForSelector('.p_info', { timeout: 10000 });
                await wait(1000);  // 추가 대기 시간
                
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
                    console.log(`선수 정보 추가됨: ${basicInfo.name}`);
                }

                // 새 페이지 닫기
                await newPage.close();
                await wait(1500);
                
            } catch (error) {
                console.error('선수 정보 수집 중 오류 발생:', error);
                continue;
            }
        }

        // JSON 파일로 저장
        fs.writeFileSync('hanwha_players_info.json', JSON.stringify(playerData, null, 2), 'utf-8');
        console.log(`총 ${playerData.length}명의 선수 정보가 성공적으로 저장되었습니다.`);
        await browser.close();
        
    } catch (error) {
        console.error('크롤링 중 오류 발생:', error);
    }
}

crawlPlayerInfo();