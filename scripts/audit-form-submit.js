const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE = 'http://localhost:3000';
const OUT = path.resolve(__dirname, '../test-results/form-debug');

async function run() {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const apiCalls = [];

  page.on('response', resp => {
    if (resp.url().includes('/api/')) {
      apiCalls.push({
        url: resp.url().replace(BASE, '').replace('http://localhost:4000', ''),
        method: resp.request().method(),
        status: resp.status(),
        time: Date.now(),
      });
    }
  });

  page.on('console', msg => {
    if (msg.type() === 'error') {
      apiCalls.push({ type: 'console_error', text: msg.text().substring(0, 200), time: Date.now() });
    }
  });

  // Login
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
  await page.locator('#email').fill('gerencia@cermont.co');
  await page.locator('#password').fill('Cermont2026!Dev01');
  await page.locator('button[type="submit"]').click();
  await page.waitForTimeout(2000);

  // =========== CUSTOMER CREATE ===========
  console.log('\n=== CUSTOMER CREATE ===');
  apiCalls.length = 0;
  await page.goto(`${BASE}/customers/new`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  const custFields = [
    { id: '_r_0_-name', val: 'Ecopetrol S.A.' },
    { id: '_r_0_-nit', val: '899.999.001-1' },
    { id: '_r_0_-contactName', val: 'María Rodríguez' },
    { id: '_r_0_-email', val: 'mrodriguez@ecopetrol.com.co' },
    { id: '_r_0_-phone', val: '3157894561' },
    { id: '_r_0_-address', val: 'Cra 13 #36-24, Bogotá' },
    { id: '_r_0_-city', val: 'Bogotá' },
    { id: '_r_0_-industry', val: 'Hidrocarburos' },
  ];

  for (const f of custFields) {
    const el = page.locator(`#${f.id}`).first();
    if (await el.count() > 0) {
      await el.fill(f.val);
      console.log(`  ✅ ${f.id}: ${f.val}`);
    }
  }

  await page.screenshot({ path: `${OUT}/customer-filled.png`, fullPage: true });
  
  // Log DOM state of buttons
  const btns = await page.locator('button:visible').all();
  console.log(`\n  Buttons:`);
  for (const b of btns) {
    const t = (await b.textContent() || '').trim();
    if (t) {
      const disabled = await b.isDisabled().catch(() => false);
      console.log(`    "${t}" disabled=${disabled}`);
    }
  }

  // Click Guardar
  const saveBtn = page.locator('button:has-text("Guardar"), button:has-text("Crear")').first();
  if (await saveBtn.count() > 0) {
    console.log(`\n  Clicking "${await saveBtn.textContent()}"...`);
    
    // Wait for navigation or API response
    await Promise.all([
      page.waitForResponse(r => r.url().includes('/api/backend/customers') && r.status() < 300, { timeout: 15000 }).catch(() => null),
      saveBtn.click(),
    ]);
    await page.waitForTimeout(3000);
    
    console.log(`  URL after: ${page.url()}`);
    await page.screenshot({ path: `${OUT}/customer-after-submit.png`, fullPage: true });
    
    // Check for toast/success message
    const body = await page.locator('body').textContent() || '';
    if (body.includes('cliente') && (body.includes('creado') || body.includes('guardado') || body.includes('éxito'))) {
      console.log('  ✅ Customer created successfully');
    } else {
      console.log('  ⚠️  No success message detected');
    }
  }

  console.log(`\n  API calls during customer create:`);
  for (const c of apiCalls.slice(-10)) {
    if (!c.type) console.log(`    ${c.method} ${c.url} → ${c.status}`);
    else console.log(`    CONSOLE ERROR: ${c.text.substring(0, 100)}`);
  }

  // =========== WORK REQUEST CREATE ===========
  console.log('\n=== WORK REQUEST CREATE ===');
  apiCalls.length = 0;
  await page.goto(`${BASE}/work-requests/new`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  const wrFields = [
    { name: 'Cliente', selector: 'input[placeholder*="cliente"]', val: 'Ecopetrol S.A.' },
    { name: 'Nombre cliente', id: 'clientName', val: 'Ecopetrol S.A.' },
    { name: 'Solicitante', id: 'requesterName', val: 'María Rodríguez' },
    { name: 'Correo', id: 'requesterEmail', val: 'mrodriguez@ecopetrol.com.co' },
    { name: 'Teléfono', id: 'requesterPhone', val: '3157894561' },
    { name: 'Sitio servicio', id: 'serviceSite', val: 'Refinería Barrancabermeja - Unidad FCC' },
    { name: 'Resumen', id: 'shortDescription', val: 'Mantenimiento correctivo bomba centrífuga' },
    { name: 'Descripción', id: 'description', val: 'Se requiere mantenimiento correctivo urgente para bomba centrífuga en unidad FCC. Fuga detectada en sello mecánico.' },
  ];

  for (const f of wrFields) {
    let el;
    if (f.selector) el = page.locator(f.selector).first();
    else el = page.locator(`#${f.id}`).first();
    
    if (await el.count() > 0) {
      const currentVal = await el.inputValue().catch(() => '');
      await el.fill(f.val);
      console.log(`  ✅ ${f.name}: "${f.val}"`);
    } else {
      console.log(`  ⚠️  ${f.name}: selector not found`);
    }
  }

  const createBtn = page.locator('button:has-text("Crear solicitud")').first();
  if (await createBtn.count() > 0) {
    console.log(`\n  Clicking "${await createBtn.textContent()}"...`);
    await page.screenshot({ path: `${OUT}/workrequest-filled.png`, fullPage: true });
    
    await Promise.all([
      page.waitForResponse(r => r.url().includes('/api/backend/work-requests') && [200, 201].includes(r.status()), { timeout: 15000 }).catch(() => null),
      createBtn.click(),
    ]);
    await page.waitForTimeout(5000);
    
    console.log(`  URL after: ${page.url()}`);
    await page.screenshot({ path: `${OUT}/workrequest-after.png`, fullPage: true });
  }

  console.log(`\n  API calls during work request create:`);
  for (const c of apiCalls) {
    if (!c.type) console.log(`    ${c.method} ${c.url} → ${c.status}`);
    else console.log(`    CONSOLE ERROR: ${c.text.substring(0, 100)}`);
  }

  // Check results
  console.log('\n=== POST-CREATE VERIFICATION ===');
  await page.goto(`${BASE}/customers`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  const custBody = await page.locator('body').textContent() || '';
  console.log(`  /customers contains "Ecopetrol": ${custBody.includes('Ecopetrol')}`);
  
  await page.goto(`${BASE}/work-requests`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  const wrBody = await page.locator('body').textContent() || '';
  console.log(`  /work-requests contains "bomba": ${wrBody.includes('bomba')}`);
  console.log(`  /work-requests contains "Ecopetrol": ${wrBody.includes('Ecopetrol')}`);
  
  await page.screenshot({ path: `${OUT}/final-state.png`, fullPage: true });

  await browser.close();
  console.log('\n[DONE]');
}

run().catch(e => { console.error('ERROR:', e.message, e.stack); process.exit(1); });
