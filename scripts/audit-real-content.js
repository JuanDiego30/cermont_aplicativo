const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE = 'http://localhost:3000';
const OUT = path.resolve(__dirname, '../test-results/audit-content');

async function run() {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
  await page.locator('#email').fill('gerencia@cermont.co');
  await page.locator('#password').fill('Cermont2026!Dev01');
  await page.locator('button[type="submit"]').click();
  await page.waitForTimeout(2000);

  const pagesToInspect = ['/dashboard', '/work-requests', '/service-cases', '/customers', '/orders', '/admin/settings'];

  for (const route of pagesToInspect) {
    console.log(`\n═══════════════════════════════════════`);
    console.log(`  PAGE: ${route}`);
    console.log(`═══════════════════════════════════════`);

    await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(5000);

    // Get actual text content and structure
    const content = await page.evaluate(() => {
      // Get all h1-h6
      const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(h => ({
        tag: h.tagName,
        text: h.textContent?.trim().substring(0, 80),
        classes: h.className?.substring(0, 60),
      }));

      // Get all section headings
      const sections = Array.from(document.querySelectorAll('section, [class*="section"], [role="region"]')).map(s => ({
        tag: s.tagName,
        id: s.id?.substring(0, 30),
        heading: s.querySelector('h1, h2, h3, h4')?.textContent?.trim().substring(0, 60) || '',
        childCount: s.children.length,
      })).filter(s => s.heading).slice(0, 10);

      // Find "Carga rápida" context
      const cargaTree = [];
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT, null, false);
      while (walker.nextNode()) {
        const n = walker.currentNode;
        if (n.textContent?.includes('Carga rápida') && n.children.length < 5) {
          cargaTree.push({
            tag: n.tagName,
            text: (n.textContent || '').trim().substring(0, 100),
            classes: (n.className || '').substring(0, 80),
            parentTag: n.parentElement?.tagName,
            parentClass: (n.parentElement?.className || '').substring(0, 80),
          });
        }
      }

      // Fetch all API responses and their data
      const bodyText = document.body.textContent || '';
      
      // Check for tables/data
      const tables = Array.from(document.querySelectorAll('table')).map(t => ({
        caption: t.querySelector('caption')?.textContent?.trim() || '',
        rows: t.querySelectorAll('tr').length,
        headers: Array.from(t.querySelectorAll('th')).map(th => th.textContent?.trim()).filter(Boolean),
      }));

      // Cards / data containers
      const cards = Array.from(document.querySelectorAll('[class*="card"], [class*="Card"]')).map(c => ({
        text: (c.textContent || '').trim().substring(0, 80),
        childCount: c.children.length,
      })).slice(0, 10);

      // Check for actual data items (list items, rows, etc.)
      const items = document.querySelectorAll('li, [class*="list-item"], [class*="row"]').length;

      // Important KPIs or metrics
      const metrics = Array.from(document.querySelectorAll('[class*="kpi"], [class*="metric"], [class*="stat"]')).map(m => ({
        text: (m.textContent || '').trim().substring(0, 60),
      })).slice(0, 10);

      return {
        headings: headings.slice(0, 20),
        sections: sections.slice(0, 10),
        cargaContext: cargaTree.slice(0, 10),
        tables: tables.slice(0, 5),
        cards: cards.slice(0, 10),
        items,
        metrics: metrics.slice(0, 10),
        bodyFirstWords: bodyText.replace(/\s+/g, ' ').trim().substring(0, 500),
      };
    });

    console.log(`\n  HEADINGS (${content.headings.length}):`);
    for (const h of content.headings) {
      console.log(`    <${h.tag}> ${h.text}`);
    }

    console.log(`\n  SECTIONS (${content.sections.length}):`);
    for (const s of content.sections) {
      console.log(`    <${s.tag}> ${s.heading.substring(0, 60)} (${s.childCount} children)`);
    }

    if (content.cargaContext.length > 0) {
      console.log(`\n  "Carga rápida" context:`);
      for (const c of content.cargaContext) {
        console.log(`    <${c.tag} class="${c.classes}"> "${c.text}" inside <${c.parentTag}>`);
      }
    } else {
      console.log(`\n  "Carga rápida" NOT FOUND as standalone element`);
    }

    if (content.tables.length > 0) {
      console.log(`\n  TABLES:`);
      for (const t of content.tables) {
        console.log(`    caption="${t.caption}" rows=${t.rows} headers=[${t.headers.join(', ')}]`);
      }
    }

    if (content.metrics.length > 0) {
      console.log(`\n  METRICS/KPIs:`);
      for (const m of content.metrics) {
        console.log(`    ${m.text}`);
      }
    }

    console.log(`\n  Items count: ${content.items}`);
    console.log(`  Cards: ${content.cards.length}`);

    await page.screenshot({ path: `${OUT}/${route.replace(/\//g, '_')}.png`, fullPage: true });
  }

  await browser.close();
}

run().catch(console.error);
