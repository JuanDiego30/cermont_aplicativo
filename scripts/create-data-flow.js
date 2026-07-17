const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE = 'http://localhost:3000';
const OUT = path.resolve(__dirname, '../test-results/data-flow');
const CREDS = { email: 'gerencia@cermont.co', pass: 'Cermont2026!Dev01' };

async function run() {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'es-CO' });
  const page = await ctx.newPage();
  let step = 0;
  const flow = [];

  function log(s) { console.log(`  ${s}`); flow.push(s); }

  // Login
  log('=== LOGIN ===');
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
  await page.locator('#email').fill(CREDS.email);
  await page.locator('#password').fill(CREDS.pass);
  await page.locator('button[type="submit"]').click();
  await page.waitForTimeout(3000);
  log(`URL: ${page.url()}`);

  // STEP 1: Create client (needed for work requests)
  step++;
  log(`\n=== STEP ${step}: Create Client ===`);
  await page.goto(`${BASE}/customers`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  // Check for "Nuevo cliente" button
  const newClientBtn = page.locator('button, a').getByText('Nuevo cliente').first();
  if (await newClientBtn.count() > 0) {
    log(`  Found "Nuevo cliente" button`);
    await page.screenshot({ path: `${OUT}/step${step}_clients.png`, fullPage: true });
    
    await newClientBtn.click();
    await page.waitForTimeout(2000);
    log(`  URL after click: ${page.url()}`);
    await page.screenshot({ path: `${OUT}/step${step}_clients_form.png`, fullPage: true });
    
    // Check for form fields
    const inputs = await page.locator('input:visible, select:visible, textarea:visible').all();
    log(`  Form fields: ${inputs.length}`);
    for (const inp of inputs) {
      const id = await inp.getAttribute('id') || '';
      const ph = await inp.getAttribute('placeholder') || '';
      log(`    id="${id}" ph="${ph}"`);
    }
    
    // Try filling
    const fillMap = {
      'legalName': 'Chevron Colombia S.A.S.',
      'nit': '890.123.456-7',
      'contactName': 'Carlos Méndez',
      'city': 'Arauca',
      'email': 'cmendez@chevron.com',
      'phone': '3109876543',
    };
    for (const [id, val] of Object.entries(fillMap)) {
      const el = page.locator(`#${id}`).first();
      if (await el.count() > 0) {
        await el.fill(val);
        log(`    ✅ ${id}: ${val}`);
      }
    }
    
    // Submit
    const saveBtn = page.locator('button[type="submit"], button:has-text("Guardar"), button:has-text("Crear")').first();
    if (await saveBtn.count() > 0) {
      log(`  Saving client...`);
      await page.screenshot({ path: `${OUT}/step${step}_filled.png`, fullPage: true });
      await saveBtn.click();
      await page.waitForTimeout(3000);
      log(`  URL after save: ${page.url()}`);
      const respText = await page.locator('body').textContent();
      log(`  Body snippet: ${respText?.substring(0, 200)}`);
      await page.screenshot({ path: `${OUT}/step${step}_result.png`, fullPage: true });
    }
  } else {
    log(`  "Nuevo cliente" button NOT FOUND`);
    // Check what buttons are there
    const btns = await page.locator('button').all();
    for (const b of btns) {
      const t = (await b.textContent() || '').trim();
      if (t) log(`  Button: "${t}"`);
    }
  }

  // STEP 2: Create Work Request  
  step++;
  log(`\n=== STEP ${step}: Create Work Request ===`);
  await page.goto(`${BASE}/work-requests/new`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: `${OUT}/step${step}_form.png`, fullPage: true });
  
  const wrFields = [
    { id: 'clientName', val: 'Chevron Colombia S.A.S.' },
    { id: 'requesterName', val: 'Carlos Méndez' },
    { id: 'requesterEmail', val: 'cmendez@chevron.com' },
    { id: 'requesterPhone', val: '3109876543' },
    { id: 'serviceSite', val: 'Campo Petrolero Arauca - Pozo 7' },
    { id: 'shortDescription', val: 'Mantenimiento preventivo equipos de perforación' },
    { id: 'description', val: 'Solicitud de mantenimiento preventivo para equipos de perforación en campo Arauca. Incluye revisión de sistemas eléctricos y mecánicos.' },
  ];
  
  for (const f of wrFields) {
    const el = page.locator(`#${f.id}`).first();
    if (await el.count() > 0) {
      await el.fill(f.val);
      log(`  ✅ ${f.id}`);
    } else {
      log(`  ⚠️  ${f.id} not found`);
    }
  }

  // Check requiresSiteVisit
  const visitCb = page.locator('#requiresSiteVisit').first();
  if (await visitCb.count() > 0) await visitCb.check();

  // Submit
  const createBtn = page.locator('button:has-text("Crear solicitud")').first();
  if (await createBtn.count() > 0) {
    log(`  Submitting work request...`);
    await page.screenshot({ path: `${OUT}/step${step}_filled.png`, fullPage: true });
    await createBtn.click();
    await page.waitForTimeout(5000);
    log(`  URL after: ${page.url()}`);
    await page.screenshot({ path: `${OUT}/step${step}_result.png`, fullPage: true });
    
    // Check if it worked
    const body = await page.locator('body').textContent() || '';
    const success = body.includes('success') || body.includes('creada') || !page.url().includes('/new');
    log(`  Success: ${success}`);
  } else {
    log(`  "Crear solicitud" button NOT FOUND`);
  }

  // STEP 3: Check what was created  
  step++;
  log(`\n=== STEP ${step}: Audit Created Data ===`);
  
  const pages = ['/work-requests', '/service-cases', '/customers', '/proposals', '/orders'];
  for (const p of pages) {
    await page.goto(`${BASE}${p}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    const body = await page.locator('body').textContent() || '';
    const hasData = body.includes('Chevron') || body.includes('Mantenimiento') || body.includes('WR-') || body.includes('SC-');
    log(`  ${p}: ${hasData ? '✅ HAS DATA' : '📭 empty'}`);
    await page.screenshot({ path: `${OUT}/step${step}_${p.replace(/\//g, '_')}.png`, fullPage: true });
  }

  // FINAL: Summary 
  console.log(`\n═══════════════════════════════════════`);
  console.log(`  FLOW TEST SUMMARY`);
  console.log(`═══════════════════════════════════════`);
  for (const l of flow) console.log(l);
  
  await browser.close();
  console.log(`\n[DONE] Screenshots: ${OUT}`);
}

run().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
