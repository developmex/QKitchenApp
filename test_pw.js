const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const DIR = '/home/juanman/evidencias';

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 412, height: 915 } });

  // Step 1: Login page
  await page.goto('http://127.0.0.1:8081', { waitUntil: 'networkidle', timeout: 15000 });
  await page.screenshot({ path: path.join(DIR, 'pw-01-login.png'), fullPage: true });
  console.log('1. Login page');

  // Step 2: Type credentials character by character
  const emailInput = page.locator('input').first();
  await emailInput.click();
  await emailInput.pressSequentially('admin@test.com', { delay: 20 });
  
  const passInput = page.locator('input').nth(1);
  await passInput.click();
  await passInput.pressSequentially('password', { delay: 20 });
  
  await page.screenshot({ path: path.join(DIR, 'pw-02-filled.png'), fullPage: true });
  console.log('2. Form filled via keyboard');

  // Step 3: Click Entrar  
  await page.click('text=Entrar');
  await page.waitForTimeout(3000);
  
  // Step 4: Check result
  const title = await page.title();
  const hasDashboard = await page.locator('text=Buenos').count();
  
  if (hasDashboard > 0) {
    await page.screenshot({ path: path.join(DIR, 'pw-03-dashboard.png'), fullPage: true });
    console.log('3. SUCCESS - Dashboard loaded. Title:', title);
    
    // Orders tab
    const ordersBtn = page.locator('text=Órdenes');
    if (await ordersBtn.count() > 0) {
      await ordersBtn.first().click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: path.join(DIR, 'pw-04-orders.png'), fullPage: true });
      console.log('4. Orders tab');
    }
    
    // Settings tab
    const settingsBtn = page.locator('text=Ajustes');
    if (await settingsBtn.count() > 0) {
      await settingsBtn.first().click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(DIR, 'pw-05-settings.png'), fullPage: true });
      console.log('5. Settings tab');
    }
  } else {
    await page.screenshot({ path: path.join(DIR, 'pw-03-failed.png'), fullPage: true });
    // Check for error message
    const errorText = await page.locator('[style*=color]').first().textContent().catch(() => 'no error');
    console.log('3. FAILED - error:', errorText);
    console.log('   Page title:', title);
  }

  await browser.close();
  console.log('\nScreenshots in', DIR, ':');
  fs.readdirSync(DIR).filter(f=>f.startsWith('pw-')).forEach(f=>console.log(' ',f));
})();
