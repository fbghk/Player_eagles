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
        
        // JavaScript 콘솔 로그 보기
        page.on('console', msg => console.log('페이지 로그:', msg.text()));
        
        await page.goto('https://statiz.sporki.com/team/?m=seasonBacknumber&t_code=7002&year=2024', {
            waitUntil: 'networkidle0',
            timeout: 30000
        });
        
        // 네트워크 요청 모니터링
        await page.setRequestInterception(true);
        page.on('request', request => {
            console.log('요청 URL:', request.url());
            request.continue();
        });
        
        await wait(5000);
        
        // XPath를 사용하여 선수 요소 찾기 시도
        const playersXPath = await page.$x('//div[contains(@class, "player")]');
        console.log('XPath로 찾은 선수 수:', playersXPath.length);
        
        await browser.close();
        
    } catch (error) {
        console.error('크롤링 중 오류 발생:', error);
    }
}

crawlPlayerInfo();