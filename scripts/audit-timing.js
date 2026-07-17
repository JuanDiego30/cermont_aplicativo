const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE = 'http://localhost:3000';
const OUT = path.resolve(__dirname, '../test-results/audit-timing');

async function run() {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const networkLog = [];

  page.on('response', resp => {
    if (resp.url().includes('/api/')) {
      networkLog.push({
        url: resp.url().replace('http://localhost:3000', '').replace('http://localhost:4000', ''),
        status: resp.status(),
        time: Date.now(),
      });
    }
  });
  page.on('console', msg => {
    if (msg.type() === 'error') networkLog.push({ type: 'console_error', text: msg.text().substring(0, 150), time: Date.now() });
  });

  // Login
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
  await page.locator('#email').fill('gerencia@cermont.co');
  await page.locator('#password').fill('Cermont2026!Dev01');
  await page.locator('button[type="submit"]').click();
  await page.waitForTimeout(2000);

  // Test each page with timing
  const testPages = [
    '/dashboard', '/work-requests', '/work-requests/new',
    '/service-cases', '/customers', '/proposals',
    '/orders', '/planning', '/execution', '/evidences',
    '/dispatch', '/billing', '/payments', '/costs',
    '/inventory', '/fleet', '/assets', '/documents',
    '/admin/personnel', '/admin/audit', '/admin/settings',
  ];

  for (const route of testPages) {
    const beforeCalls = networkLog.length;
    const startTime = Date.now();
    
    // Navigate and wait various amounts
    networkLog.length = 0; // reset for this page
    await page.goto(`${BASE}${route}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    
    // Check state after 1s, 3s, 5s, 10s
    for (const waitSec of [1, 3, 5]) {
      await page.waitForTimeout(waitSec * 1000);
      
      const analysis = await page.evaluate(() => {
        const body = document.body.textContent || '';
        const hasLoading = /cargando|loading/i.test(body);
        const hasError = /Carga rápida|error|algo salió/i.test(body);
        const hasData = body.includes('📊') || body.includes('✅') || body.includes('$');
        const h1 = document.querySelector('h1')?.textContent?.trim() || '';
        const main = document.querySelector('main');
        const tables = document.querySelectorAll('table').length;
        const listItems = document.querySelectorAll('li, [class*="row"], [class*="item"], tr').length;
        return { hasLoading, hasError, hasData, h1: h1.substring(0, 50), tables, listItems, mainLength: main?.textContent?.length || 0 };
      });
      
      const apiCalls = networkLog.filter(l => !l.type).length;
      const errors = networkLog.filter(l => l.type === 'console_error').length;
      
      console.log(`  ${route.padEnd(28)} t=${String(waitSec).padStart(2)}s loading=${analysis.hasLoading} error=${analysis.hasError} data=${analysis.hasData} apis=${apiCalls} errs=${errors} h1="${analysis.h1}"`);
      
      // Take screenshot at each interval
      await page.screenshot({ path: `${OUT}/${route.replace(/\//g, '_')}_t${waitSec}s.png`, fullPage: true });
    }
    
    console.log(`  ${'-'.repeat(70)}`);
  }

  console.log(`\n=== NETWORK LOG SUMMARY ===`);
  const uniqueApis = [...new Set(networkLog.filter(l => !l.type).map(l => l.url))];
  for (const api of uniqueApis.sort()) {
    console.log(`  ${api}`);
  }

  console.log(`\n=== ALL CONSOLE ERRORS ===`);
  for (const entry of networkLog.filter(l => l.type === 'console_error')) {
    console.log(`  ${entry.text}`);
  }

  await browser.close();
}

run().catch(console.error);
