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
        
        // 충분한 대기 시간 부여
        await wait(5000);
        
        // 전체 HTML 구조 확인
        const bodyHTML = await page.evaluate(() => {
            return document.body.innerHTML;
        });
        console.log('전체 페이지 HTML:', bodyHTML);
        
        // 모든 클래스 목록 확인
        const allClasses = await page.evaluate(() => {
            const elements = document.getElementsByTagName('*');
            const classes = new Set();
            for (let element of elements) {
                const classList = element.classList;
                if (classList.length > 0) {
                    classList.forEach(cls => classes.add(cls));
                }
            }
            return Array.from(classes);
        });
        console.log('페이지의 모든 클래스 목록:', allClasses);
        
        // 선수 목록을 포함할 것으로 예상되는 컨테이너 확인
        const containerHTML = await page.evaluate(() => {
            const container = document.querySelector('#content') || 
                            document.querySelector('.player-list') ||
                            document.querySelector('.roster');
            return container ? container.innerHTML : 'container not found';
        });
        console.log('컨테이너 HTML:', containerHTML);
        
        await browser.close();
        
    } catch (error) {
        console.error('크롤링 중 오류 발생:', error);
    }
}

crawlPlayerInfo();