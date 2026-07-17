const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE = 'http://localhost:3000';
const API = 'http://localhost:4000/api';
const OUT = path.resolve(__dirname, '../test-results/created-data');
let bearerToken = '';

async function run() {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const createdIds = {};

  // Capture Bearer token from first API call
  page.on('request', req => {
    if (req.url().includes('/api/backend/') && req.headers()['authorization']) {
      bearerToken = req.headers()['authorization'].replace('Bearer ', '');
    }
  });

  console.log('=== LOGIN ===');
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
  await page.locator('#email').fill('gerencia@cermont.co');
  await page.locator('#password').fill('Cermont2026!Dev01');
  await page.locator('button[type="submit"]').click();
  await page.waitForTimeout(3000);

  // Navigate to generate API calls and capture token
  await page.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  console.log(`Bearer token captured: ${bearerToken ? 'YES (' + bearerToken.substring(0, 30) + '...)' : 'NO'}`);

  // Now use the token for direct API calls
  const headers = { 
    'Authorization': `Bearer ${bearerToken}`,
    'Content-Type': 'application/json',
  };

  async function api(method, endpoint, data) {
    const url = endpoint.startsWith('http') ? endpoint : `${API}${endpoint}`;
    const resp = await page.request.fetch(url, { method, headers, data });
    const body = await resp.json().catch(() => ({}));
    return { status: resp.status(), body };
  }

  // 1. Create Client
  console.log('\n=== 1. CREATE CLIENT ===');
  const client = await api('POST', '/clients', {
    legalName: 'Cliente Test QA Automatizado',
    nit: '800.800.800-8',
    contactName: 'QA Automation',
    email: 'qa-auto@test.com',
    phone: '3112223344',
    address: 'Calle Automatización #123',
    city: 'Arauca',
    industry: 'Hidrocarburos',
  });
  console.log(`  POST /clients → ${client.status}`);
  console.log(`  Response: ${JSON.stringify(client.body).substring(0, 300)}`);
  
  const clientId = client.body.data?._id || client.body.data?.id || '';
  if (clientId) createdIds.client = clientId;

  // 2. Get all clients to verify
  console.log('\n=== 2. LIST CLIENTS ===');
  const clients = await api('GET', '/clients?page=1&limit=20');
  console.log(`  GET /clients → ${clients.status}`);
  console.log(`  Clients: ${JSON.stringify(clients.body).substring(0, 300)}`);

  // 3. Create Work Request
  console.log('\n=== 3. CREATE WORK REQUEST ===');
  const wr = await api('POST', '/work-requests', {
    clientName: 'Cliente Test QA Automatizado',
    requesterName: 'QA Automation',
    requesterEmail: 'qa-auto@test.com',
    requesterPhone: '3112223344',
    serviceSite: 'Arauca - Sitio de Prueba QA',
    shortDescription: 'Mantenimiento preventivo equipos - QA Test',
    description: 'Solicitud de mantenimiento preventivo para equipos de campo. Generado automáticamente por suite de testing.',
    priority: 'medium',
    requiresSiteVisit: true,
  });
  console.log(`  POST /work-requests → ${wr.status}`);
  console.log(`  Response: ${JSON.stringify(wr.body).substring(0, 400)}`);

  const wrId = wr.body.data?._id || wr.body.data?.id || '';
  if (wrId) createdIds.workRequest = wrId;

  // 4. Verify in UI
  console.log('\n=== 4. UI VERIFICATION ===');
  await page.goto(`${BASE}/work-requests`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(5000);
  
  const bodyText = await page.locator('body').textContent() || '';
  console.log(`  "No hay solicitudes": ${bodyText.includes('No hay solicitudes')}`);
  console.log(`  "QA Test": ${bodyText.includes('QA Test')}`);
  console.log(`  "Mantenimiento": ${bodyText.includes('Mantenimiento')}`);
  console.log(`  "800.800.800": ${bodyText.includes('800.800.800')}`);
  await page.screenshot({ path: `${OUT}/work-requests.png`, fullPage: true });

  // 5. Try the FORM submission one more time, properly
  console.log('\n=== 5. UI FORM SUBMISSION TEST ===');
  await page.goto(`${BASE}/work-requests/new`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  // Fill form properly
  await page.locator('#clientName').fill('Cliente Test QA Automatizado');
  await page.locator('#requesterName').fill('QA Automation Form');
  await page.locator('#requesterEmail').fill('qa-form@test.com');
  await page.locator('#requesterPhone').fill('3112223344');
  await page.locator('#serviceSite').fill('Sitio Form QA');
  await page.locator('#shortDescription').fill('Prueba formulario QA');
  const textarea = page.locator('textarea').first();
  if (await textarea.count() > 0) {
    await textarea.fill('Descripción del formulario de prueba QA.');
  }

  await page.screenshot({ path: `${OUT}/form-filled.png`, fullPage: true });

  // More robust button click
  const btn = page.locator('button[type="submit"]').first();
  console.log(`  Submit button: ${await btn.textContent()} visible=${await btn.isVisible()} enabled=${await btn.isEnabled()}`);
  
  // Track API calls
  const apiCalls = [];
  page.on('response', resp => {
    if (resp.url().includes('/api/backend/')) {
      apiCalls.push({ url: resp.url().substring(0, 70), method: resp.request().method(), status: resp.status() });
    }
  });
  page.on('console', msg => {
    if (msg.type() === 'error') apiCalls.push({ error: msg.text().substring(0, 150) });
  });

  // Click and wait
  await btn.click();
  await page.waitForTimeout(5000);
  
  console.log(`  URL after: ${page.url()}`);
  console.log(`\n  API calls triggered:`);
  for (const c of apiCalls) {
    if (c.error) console.log(`    CONSOLE ERROR: ${c.error}`);
    else console.log(`    ${c.method} ${c.url} → ${c.status}`);
  }
  
  // Check for validation errors  
  const alerts = await page.locator('[role="alert"]').all();
  for (const a of alerts) {
    const text = (await a.textContent() || '').trim();
    if (text) console.log(`  Alert: ${text.substring(0, 100)}`);
  }

  await page.screenshot({ path: `${OUT}/form-submit-result.png`, fullPage: true });

  console.log('\n=== RESULTS ===');
  console.log(`  Created IDs: ${JSON.stringify(createdIds)}`);
  await browser.close();
}

run().catch(console.error);
