const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE = 'http://localhost:3000';
const API = 'http://localhost:4000/api';
const OUT = path.resolve(__dirname, '../test-results/api-success');
let bearerToken = '';

async function run() {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  
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
  await page.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  console.log(`Token: ${bearerToken.substring(0, 30)}...`);

  const headers = { 
    'Authorization': `Bearer ${bearerToken}`,
    'Content-Type': 'application/json',
  };

  async function api(method, endpoint, data) {
    const url = endpoint.startsWith('http') ? endpoint : `${API}${endpoint}`;
    const resp = await page.request.fetch(url, { method, headers, data });
    const body = await resp.json().catch(() => ({}));
    return { status: resp.status(), body, ok: resp.ok() };
  }

  // Create client with correct field names
  console.log('\n=== CREATE CLIENT ===');
  const client = await api('POST', '/clients', {
    name: 'Cliente Exitoso QA',
    nit: '777.666.555-4',
    contactName: 'QA Success',
    email: 'qa-success@test.com',
    phone: '3123456789',
    address: 'Calle Éxito #100',
    city: 'Arauca',
    industry: 'Hidrocarburos',
  });
  console.log(`  ${client.ok ? '✅' : '❌'} ${client.status}: ${JSON.stringify(client.body).substring(0, 200)}`);

  // Create work request with ALL required fields
  console.log('\n=== CREATE WORK REQUEST ===');
  const wr = await api('POST', '/work-requests', {
    clientName: 'Cliente Exitoso QA',
    requesterName: 'QA Success',
    requesterEmail: 'qa-success@test.com',
    requesterPhone: '3123456789',
    serviceSite: 'Campo Éxito - Pozo QA-1',
    shortDescription: 'Mantenimiento preventivo - QA Exitoso',
    description: 'Solicitud de mantenimiento preventivo generada exitosamente por API.',
    serviceType: 'mantenimiento_preventivo',
    sourceChannel: 'internal',
    urgency: 'medium',
    requiresSiteVisit: true,
  });
  console.log(`  ${wr.ok ? '✅' : '❌'} ${wr.status}: ${JSON.stringify(wr.body).substring(0, 400)}`);

  const wrId = wr.body.data?._id || wr.body.data?.id || '';
  if (wrId) {
    console.log(`\n=== VERIFY IN UI ===`);
    await page.goto(`${BASE}/work-requests`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);
    const body = await page.locator('body').textContent() || '';
    console.log(`  "No hay solicitudes": ${body.includes('No hay solicitudes')}`);
    console.log(`  "QA Exitoso": ${body.includes('QA Exitoso')}`);
    console.log(`  "Mantenimiento preventivo": ${body.includes('Mantenimiento preventivo')}`);
    console.log(`  "777.666.555": ${body.includes('777.666.555')}`);
    await page.screenshot({ path: `${OUT}/work-requests-with-data.png`, fullPage: true });
    
    // Test creating a service case from the work request
    console.log(`\n=== CREATE SERVICE CASE ===`);
    const sc = await api('POST', '/service-cases', {
      workRequestId: wrId,
      assignedTo: '6a57f2146b24b3ba013bedea',
      priority: 'medium',
    });
    console.log(`  ${sc.ok ? '✅' : '❌'} ${sc.status}: ${JSON.stringify(sc.body).substring(0, 400)}`);

    // Try creating a proposal
    console.log(`\n=== CREATE PROPOSAL ===`);
    const prop = await api('POST', '/proposals', {
      serviceCaseId: sc.body.data?._id || sc.body._id || '',
      clientName: 'Cliente Exitoso QA',
      totalAmount: 15000000,
      items: [{ description: 'Mantenimiento preventivo', quantity: 1, unitPrice: 15000000 }],
    });
    console.log(`  ${prop.ok ? '✅' : '❌'} ${prop.status}: ${JSON.stringify(prop.body).substring(0, 400)}`);
  }

  console.log(`\n=== TEST SCREENSHOTS ===`);
  const pages = ['/work-requests', '/service-cases', '/customers', '/proposals', '/dashboard'];
  for (const p of pages) {
    await page.goto(`${BASE}${p}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);
    await page.screenshot({ path: `${OUT}/ui_${p.replace(/\//g, '_')}.png`, fullPage: true });
    console.log(`  Screenshot: ${p}`);
  }

  await browser.close();
  console.log('\n[DONE]');
}

run().catch(console.error);
