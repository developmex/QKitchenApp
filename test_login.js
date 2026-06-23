const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 412, height: 915 } });
  const dir = '/tmp/qkitchen-evidence';
  require('fs').mkdirSync(dir, { recursive: true });

  // Step 1: Login page
  await page.goto('http://localhost:8081', { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(dir, '01-login-page.png'), fullPage: true });
  console.log('1. Login page captured');

  // Step 2: Fill form
  await page.fill('input[type="email"], input[placeholder*="email"]', 'admin@test.com');
  await page.fill('input[type="password"]', 'password');
  await page.screenshot({ path: path.join(dir, '02-login-filled.png'), fullPage: true });
  console.log('2. Form filled');

  // Step 3: Click Entrar
  await page.click('text=Entrar');
  
  // Step 4: Wait for dashboard
  try {
    await page.waitForSelector('text=Buenos', { timeout: 10000 });
    await page.screenshot({ path: path.join(dir, '03-dashboard.png'), fullPage: true });
    console.log('3. LOGIN SUCCESS - Dashboard visible');
  } catch(e) {
    await page.screenshot({ path: path.join(dir, '03-login-failed.png'), fullPage: true });
    console.log('3. LOGIN FAILED - error:', e.message);
  }

  // Step 5: Go to Orders tab
  const ordersBtn = await page.$('text=Órdenes');
  if (ordersBtn) {
    await ordersBtn.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(dir, '04-orders.png'), fullPage: true });
    console.log('4. Orders tab');
  }

  // Step 6: Go to Settings
  const settingsBtn = await page.$('text=Ajustes');
  if (settingsBtn) {
    await settingsBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(dir, '05-settings.png'), fullPage: true });
    console.log('5. Settings tab');
  }

  await browser.close();
  console.log('\nScreenshots saved to', dir);
  console.log(require('fs').readdirSync(dir).map(f => '  ' + f).join('\n'));
})();
