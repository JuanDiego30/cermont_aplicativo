const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE = 'http://localhost:3000';
const OUT = path.resolve(__dirname, '../test-results/final-flow');
const CREDS = { email: 'gerencia@cermont.co', pass: 'Cermont2026!Dev01' };

let browser, page;

async function login() {
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
  await page.locator('#email').fill(CREDS.email);
  await page.locator('#password').fill(CREDS.pass);
  await page.locator('button[type="submit"]').click();
  await page.waitForTimeout(2000);
  return !page.url().includes('/login');
}

async function fillCustomerForm() {
  console.log('\n=== CREATE CUSTOMER ===');
  await page.goto(`${BASE}/customers/new`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  // Find all visible text inputs and fill by their label
  const inputs = await page.locator('input:visible, textarea:visible').all();
  for (const inp of inputs) {
    const id = await inp.getAttribute('id') || '';
    const ph = await inp.getAttribute('placeholder') || '';
    const type = await inp.getAttribute('type') || '';
    const labelEl = id ? page.locator(`label[for="${id}"]`) : null;
    const labelText = labelEl && (await labelEl.count()) > 0 ? (await labelEl.textContent() || '') : '';
    
    // Fill based on field type/name
    if (labelText.includes('Nombre del cliente') || ph.includes('SierraCol')) await inp.fill('Cliente Prueba Final QA');
    else if (labelText.includes('NIT') || ph.includes('900123456')) await inp.fill('999.888.777-6');
    else if (labelText.includes('Contacto') || id.includes('contact')) await inp.fill('QA Tester');
    else if (type === 'email' || labelText.includes('Correo')) await inp.fill('qa@test.com');
    else if (labelText.includes('Teléfono') || id.includes('phone')) await inp.fill('3001234567');
    else if (labelText.includes('Ciudad') || id.includes('city')) await inp.fill('Arauca');
    else if (labelText.includes('Industria') || ph.includes('Hidrocarburos')) await inp.fill('Hidrocarburos');
    else if (labelText.includes('Dirección') || id.includes('address')) await inp.fill('Calle 123 #45-67');
  }
  
  const saveBtn = page.locator('button:has-text("Crear cliente")');
  await page.screenshot({ path: `${OUT}/01-customer-filled.png`, fullPage: true });
  
  console.log('  Clicking save...');
  try {
    const [resp] = await Promise.all([
      page.waitForResponse(r => r.url().includes('/api/backend/client') && [200, 201].includes(r.status()), { timeout: 15000 }),
      saveBtn.click(),
    ]);
    console.log(`  API response: ${resp.status()}`);
  } catch(e) {
    console.log(`  API wait: ${e.message}`);
  }
  await page.waitForTimeout(3000);
  
  const customerId = page.url().split('/').pop();
  console.log(`  URL: ${page.url()}`);
  await page.screenshot({ path: `${OUT}/01-customer-created.png`, fullPage: true });
  return customerId;
}

async function fillWorkRequest() {
  console.log('\n=== CREATE WORK REQUEST ===');
  await page.goto(`${BASE}/work-requests/new`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  
  // Fill all required fields
  await page.locator('#clientName').fill('Cliente Prueba Final QA');
  await page.locator('#requesterName').fill('QA Tester Automático');
  await page.locator('#requesterEmail').fill('qa@test.com');
  await page.locator('#requesterPhone').fill('3001234567');
  await page.locator('#serviceSite').fill('Arauca - Campo B - Pozo 12');
  await page.locator('#shortDescription').fill('Mantenimiento preventivo - Prueba Final QA');
  
  // Description is a textarea
  const descField = page.locator('textarea').first();
  if (await descField.count() > 0) {
    await descField.fill('Descripción detallada de la solicitud de mantenimiento preventivo. Verificación del flujo completo de 14 pasos. Fecha: ' + new Date().toISOString());
  }
  
  // Check requires visit
  await page.locator('#requiresSiteVisit').check();
  
  await page.screenshot({ path: `${OUT}/02-wr-filled.png`, fullPage: true });
  
  // Use Playwright's actual click (not dispatchEvent)
  const createBtn = page.locator('button:has-text("Crear solicitud")');
  console.log(`  Button visible: ${await createBtn.isVisible()}`);
  console.log(`  Button enabled: ${await createBtn.isEnabled()}`);
  
  // Wait for the API call
  const apiPromise = page.waitForResponse(
    r => r.url().includes('/api/backend/work-requests') && r.status() === 201,
    { timeout: 15000 }
  ).catch(e => { console.log(`  API wait error: ${e.message}`); return null; });
  
  await createBtn.click();
  await page.waitForTimeout(5000);
  
  const apiResp = await apiPromise;
  if (apiResp) {
    console.log(`  ✅ API: ${apiResp.status()} ${apiResp.url().substring(0, 60)}`);
    const body = await apiResp.json().catch(() => ({}));
    console.log(`  Response: ${JSON.stringify(body).substring(0, 200)}`);
  } else {
    console.log(`  ❌ No API response captured`);
  }
  
  console.log(`  URL: ${page.url()}`);
  await page.screenshot({ path: `${OUT}/02-wr-result.png`, fullPage: true });
  
  // Check for errors
  const errorText = await page.locator('[role="alert"], [class*="error"]').first().textContent().catch(() => '');
  if (errorText) console.log(`  Error: ${errorText.substring(0, 100)}`);
  
  return page.url();
}

async function checkCreatedData() {
  console.log('\n=== CHECK CREATED DATA ===');
  
  const pages = ['/customers', '/work-requests'];
  for (const p of pages) {
    await page.goto(`${BASE}${p}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);
    const body = await page.locator('body').textContent() || '';
    const hasNew = body.includes('QA') || body.includes('Prueba Final') || body.includes('999.888.777');
    console.log(`  ${p}: ${hasNew ? '✅ New data visible' : '❌ New data NOT visible'}`);
    await page.screenshot({ path: `${OUT}/03-${p.replace(/\//g, '_')}.png`, fullPage: true });
  }
  
  // Check via API directly
  try {
    const resp = await page.request.get(`${BASE}/api/backend/work-requests`);
    if (resp.status() === 200) {
      const data = await resp.json();
      console.log(`  API work-requests: ${JSON.stringify(data).substring(0, 300)}`);
    }
  } catch(e) {
    console.log(`  API direct check error: ${e.message}`);
  }
}

async function checkApiErrors() {
  console.log('\n=== API ERROR CHECK ===');
  const endpoints = [
    '/api/backend/dashboard/summary',
    '/api/backend/work-requests',
    '/api/backend/service-cases',
    '/api/backend/customers',
    '/api/backend/proposals',
    '/api/backend/purchase-orders',
    '/api/backend/orders',
    '/api/backend/evidences',
    '/api/backend/reports',
    '/api/backend/audit',
    '/api/backend/system-config',
  ];
  
  for (const ep of endpoints) {
    try {
      const resp = await page.request.get(`${BASE}${ep}`);
      const status = resp.status();
      if (status >= 400) {
        console.log(`  🔴 ${ep} → ${status}`);
      } else {
        const body = await resp.json().catch(() => ({}));
        console.log(`  ✅ ${ep} → ${status} ${JSON.stringify(body).substring(0, 120)}`);
      }
    } catch(e) {
      console.log(`  🔴 ${ep} → ERROR: ${e.message}`);
    }
  }
}

async function run() {
  fs.mkdirSync(OUT, { recursive: true });
  console.log(`[START] ${new Date().toISOString()}`);
  
  browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  page = await ctx.newPage();
  
  console.log('\n=== LOGIN ===');
  if (!await login()) { console.log('❌ Login failed'); await browser.close(); return; }
  console.log('✅ Login OK');
  
  // Track all API requests
  const apiCalls = [];
  page.on('response', resp => {
    if (resp.url().includes('/api/backend/')) {
      apiCalls.push({
        url: resp.url().replace(BASE, '').substring(0, 80),
        method: resp.request().method(),
        status: resp.status(),
      });
    }
  });
  
  // Step 1: Create customer
  await fillCustomerForm();
  
  // Step 2: Create work request
  await fillWorkRequest();
  
  // Step 3: Check results
  await checkCreatedData();
  
  // Step 4: Check other API endpoints
  await checkApiErrors();
  
  // Print API summary
  console.log('\n=== ALL API CALLS ===');
  const unique = [...new Set(apiCalls.map(c => `${c.method} ${c.url} → ${c.status}`))];
  for (const u of unique) console.log(`  ${u}`);
  
  await browser.close();
  console.log(`\n[DONE] ${new Date().toISOString()}`);
  console.log(`  Screenshots: ${OUT}/`);
}

run().catch(e => { console.error(e); process.exit(1); });
