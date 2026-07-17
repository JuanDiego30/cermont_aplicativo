const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE = 'http://localhost:3000';
const OUT = path.resolve(__dirname, '../test-results/audit-errors');

class ErrorInvestigator {
  async run() {
    fs.mkdirSync(OUT, { recursive: true });
    const browser = await chromium.launch({ headless: true });
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    const allErrors = [];

    page.on('console', msg => {
      if (msg.type() === 'error') allErrors.push({ type: 'console', text: msg.text(), url: page.url() });
    });
    page.on('pageerror', err => {
      allErrors.push({ type: 'pageerror', text: err.message, url: page.url() });
    });

    // Login
    await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
    await page.locator('#email').fill('gerencia@cermont.co');
    await page.locator('#password').fill('Cermont2026!Dev01');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(2000);

    // Go to a specific page and investigate what "Carga rápida del módulo" is
    await page.goto(`${BASE}/work-requests`, { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(3000);

    // Capture all API requests and responses
    const apiCalls = [];
    page.on('response', resp => {
      if (resp.url().includes('/api/')) {
        apiCalls.push({ url: resp.url().substring(0, 100), status: resp.status(), ok: resp.ok() });
      }
    });

    await page.goto(`${BASE}/work-requests`, { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(3000);

    console.log('=== API CALLS DURING PAGE LOAD ===');
    for (const call of apiCalls) {
      console.log(`  ${call.ok ? '✅' : '🔴'} ${call.status} ${call.url}`);
    }

    // Investigate the error element
    const errorAnalysis = await page.evaluate(() => {
      // Find the "Carga rápida" element
      const allText = document.body.textContent || '';
      const errorElements = [];
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT, null, false);
      let node;
      while (node = walker.nextNode()) {
        if (node.textContent?.includes('Carga rápida')) {
          const tag = node.tagName;
          const classes = node.className || '';
          const parentTag = node.parentElement?.tagName || '';
          const parentClasses = node.parentElement?.className || '';
          const grandparentTag = node.parentElement?.parentElement?.tagName || '';
          errorElements.push({ tag, classes: classes.substring(0, 100), parentTag, parentClasses: parentClasses.substring(0, 100) });
        }
      }
      
      // Find error boundaries / error UI components
      const errorBoundaries = [];
      const errorDivs = document.querySelectorAll('[class*="error"], [role="alert"], [class*="Error"]');
      errorDivs.forEach(el => {
        errorBoundaries.push({
          tag: el.tagName,
          classes: el.className?.substring(0, 100),
          text: (el.textContent || '').substring(0, 100),
          parentTag: el.parentElement?.tagName,
        });
      });

      // Check React errors
      const reactRoot = document.getElementById('__next') || document.getElementById('root');
      const hasErrorOverlay = !!document.querySelector('nextjs-portal, [data-nextjs-error]');

      return {
        bodyTextSnippet: allText.substring(0, 2000),
        errorElements: errorElements.slice(0, 20),
        errorBoundaries: errorBoundaries.slice(0, 10),
        hasErrorOverlay,
        reactRootSize: reactRoot?.childElementCount || 0,
        // Get the main content area
        mainContent: document.querySelector('main')?.innerHTML?.substring(0, 2000) || 'no main',
      };
    });

    console.log('\n=== ERROR ANALYSIS ===');
    console.log(`Error overlay: ${errorAnalysis.hasErrorOverlay}`);
    console.log(`React root children: ${errorAnalysis.reactRootSize}`);
    console.log(`\nError elements (Carga rápida):`);
    for (const el of errorAnalysis.errorElements) {
      console.log(`  <${el.tag} class="${el.classes}"> inside <${el.parentTag}>`);
    }
    
    console.log(`\nError boundaries detected:`);
    for (const eb of errorAnalysis.errorBoundaries) {
      console.log(`  <${eb.tag} class="${eb.classes}"> text="${eb.text.substring(0, 80)}"`);
    }

    console.log(`\n=== MAIN CONTENT (first 1500 chars) ===`);
    console.log(errorAnalysis.mainContent?.substring(0, 1500));

    // Take screenshot
    await page.screenshot({ path: `${OUT}/error-investigation.png`, fullPage: true });

    // Now check the network tab for failed API calls
    console.log('\n=== NETWORK FAILURES ===');
    const failedCalls = apiCalls.filter(c => !c.ok);
    for (const fc of failedCalls) {
      console.log(`  🔴 ${fc.status} ${fc.url}`);
    }

    // Check console errors
    console.log('\n=== CONSOLE ERRORS ===');
    for (const err of allErrors) {
      console.log(`  ${err.type}: ${err.text.substring(0, 200)}`);
    }

    await browser.close();
  }
}

new ErrorInvestigator().run().catch(console.error);
