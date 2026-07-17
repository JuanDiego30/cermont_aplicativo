const { chromium } = require('playwright');
const path = require('path');

const BASE = 'http://localhost:3000';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  const authDetails = [];

  page.on('request', req => {
    if (req.url().includes('/api/')) {
      const headers = req.headers();
      authDetails.push({
        url: req.url().replace(BASE, '').substring(0, 60),
        method: req.method(),
        hasAuthHeader: !!headers['authorization'],
        authHeaderPrefix: headers['authorization']?.substring(0, 30) || '',
        hasCookie: !!headers['cookie'],
        cookiePrefix: (headers['cookie'] || '').substring(0, 80),
      });
    }
  });

  // Login
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
  await page.locator('#email').fill('gerencia@cermont.co');
  await page.locator('#password').fill('Cermont2026!Dev01');
  await page.locator('button[type="submit"]').click();
  await page.waitForTimeout(3000);

  // Navigate to dashboard to trigger API calls
  await page.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  console.log('=== AUTH HEADERS IN BROWSER REQUESTS ===');
  for (const d of authDetails) {
    console.log(`\n  ${d.method} ${d.url}`);
    console.log(`    Auth: ${d.hasAuthHeader} | ${d.authHeaderPrefix}`);
    console.log(`    Cookie: ${d.hasCookie} | ${d.cookiePrefix}`);
  }

  // Check localStorage for the actual token
  const lsSnapshot = await page.evaluate(() => {
    const out = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const val = localStorage.getItem(key) || '';
        out[key] = val.substring(0, 200);
      }
    }
    return out;
  });
  console.log('\n=== LOCALSTORAGE ===');
  for (const [k, v] of Object.entries(lsSnapshot)) {
    console.log(`  ${k}: ${v}`);
  }

  // Check all cookies
  const cookies = await ctx.cookies();
  console.log('\n=== ALL COOKIES ===');
  for (const c of cookies) {
    console.log(`  ${c.name}=${c.value.substring(0, 80)} (domain:${c.domain}, path:${c.path})`);
  }

  await browser.close();
}

run().catch(console.error);
