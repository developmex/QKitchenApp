const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const DIR='/home/juanman/evidencias';

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 412, height: 915 } });

  // Track network requests
  const requests = [];
  page.on('request', r => requests.push(r.url().substring(0, 80)));
  page.on('response', r => {
    if (r.url().includes('login') || r.url().includes('dish'))
      console.log('RESPONSE', r.status(), r.url().substring(0,60));
  });

  await page.goto('http://127.0.0.1:8081', { waitUntil: 'domcontentloaded', timeout: 10000 });
  console.log('1. Login page loaded');

  // Fill form
  const emailInput = page.locator('input').first();
  await emailInput.click();
  await emailInput.pressSequentially('cliente@test.com', { delay: 10 });
  const passInput = page.locator('input').nth(1);
  await passInput.click();
  await passInput.pressSequentially('password', { delay: 10 });
  
  // Click and wait
  await page.click('text=Entrar');
  await page.waitForTimeout(4000);

  const title = await page.title();
  const body = await page.evaluate(() => document.body.innerText);
  await page.screenshot({ path: path.join(DIR, 'evidencia-cliente-web.png'), fullPage: true });
  
  console.log('2. Title after login:', title);
  console.log('3. Body preview:', body.substring(0, 300));
  console.log('4. Network requests:', requests.filter(r => r.includes('QKitchenApi')).join('\n   '));
  
  await browser.close();
  console.log('5. Screenshot saved:', DIR+'/evidencia-cliente-web.png');
})();
