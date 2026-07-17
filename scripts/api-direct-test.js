const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE = 'http://localhost:3000';
const OUT = path.resolve(__dirname, '../test-results/api-test');

async function run() {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const results = [];

  function log(s) { console.log(s); results.push(s); }

  // Login
  log('=== LOGIN ===');
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
  await page.locator('#email').fill('gerencia@cermont.co');
  await page.locator('#password').fill('Cermont2026!Dev01');
  await page.locator('button[type="submit"]').click();
  await page.waitForTimeout(2000);

  // Get cookies and localStorage token for API auth
  const cookies = await ctx.cookies();
  const tokenCookie = cookies.find(c => c.name.includes('token') || c.name === 'refreshToken');
  log(`  Auth cookies: ${cookies.map(c => c.name).join(', ')}`);
  
  const lsData = await page.evaluate(() => {
    const auth = localStorage.getItem('cermont-auth');
    if (auth) return JSON.parse(auth);
    return null;
  });
  log(`  Auth state in localStorage: ${lsData ? 'found' : 'not found'}`);

  // Now use the browser's cookies to make API calls
  // The cookie jar from the browser context should be shared
  log('\n=== API DATA CREATION ===');
  
  // 1. Create a client via API directly
  log('\n1. Creating client...');
  const clientPayload = {
    name: 'Cliente API Test Automatizado',
    legalName: 'Cliente API Test SAS',
    nit: '900.900.900-9',
    contactName: 'API Tester',
    email: 'api@test.com',
    phone: '3001112233',
    city: 'Arauca',
    industry: 'Hidrocarburos',
  };
  
  const clientResp = await page.request.post(`${BASE}/api/backend/clients`, {
    data: clientPayload,
    headers: { 'Content-Type': 'application/json' },
  });
  log(`  POST /clients → ${clientResp.status()}`);
  const clientBody = await clientResp.json().catch(() => ({}));
  log(`  Response: ${JSON.stringify(clientBody).substring(0, 200)}`);
  
  // 2. Create work request
  log('\n2. Creating work request...');
  const clientId = clientBody.data?._id || clientBody._id || clientBody.data?.id || '';
  log(`  Client ID: ${clientId}`);
  
  const wrPayload = { 
    clientName: 'Cliente API Test Automatizado',
    requesterName: 'API Tester',
    requesterEmail: 'api@test.com',
    requesterPhone: '3001112233',
    serviceSite: 'Arauca - Sitio API Test',
    shortDescription: 'Mantenimiento preventivo - API Test',
    description: 'Descripción detallada del mantenimiento preventivo generado vía API.',
    requiresSiteVisit: true,
  };
  
  const wrResp = await page.request.post(`${BASE}/api/backend/work-requests`, {
    data: wrPayload,
    headers: { 'Content-Type': 'application/json' },
  });
  log(`  POST /work-requests → ${wrResp.status()}`);
  const wrBody = await wrResp.json().catch(() => ({}));
  log(`  Response: ${JSON.stringify(wrBody).substring(0, 300)}`);

  // 3. List what was created
  log('\n3. Checking created data...');
  
  const listResp = await page.request.get(`${BASE}/api/backend/work-requests`);
  log(`  GET /work-requests → ${listResp.status()}`);
  if (listResp.status() === 200) {
    const listBody = await listResp.json();
    log(`  Total: ${listBody.data?.length || listBody.total || 0}`);
    if (listBody.data?.[0]) log(`  First: ${JSON.stringify(listBody.data[0]).substring(0, 150)}`);
  }

  // 4. Check UI rendering
  log('\n4. Checking UI rendering...');
  await page.goto(`${BASE}/work-requests`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  const body = await page.locator('body').textContent() || '';
  log(`  Page says "No hay solicitudes": ${body.includes('No hay solicitudes')}`);
  log(`  Page contains "API Test": ${body.includes('API Test')}`);
  log(`  Page contains "Mantenimiento": ${body.includes('Mantenimiento')}`);
  await page.screenshot({ path: `${OUT}/work-requests.png`, fullPage: true });

  // 5. Check if the UI form actually works by looking at its network behavior
  log('\n5. Testing UI form directly...');
  await page.goto(`${BASE}/work-requests/new`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  
  const formDebug = await page.evaluate(() => {
    const form = document.querySelector('form');
    if (!form) return { error: 'No form element' };
    
    // Check what happens when we trigger submit
    const errors = [];
    const buttons = Array.from(form.querySelectorAll('button'));
    
    // Check if there's a submit handler attached
    const submitHandler = form.onSubmit ? 'native' : 'react';
    
    // Check button click handlers  
    const createBtn = buttons.find(b => b.textContent?.includes('Crear solicitud'));
    
    return {
      formAttrs: { action: form.action, method: form.method, novalidate: form.novalidate, id: form.id },
      submitHandler,
      createBtnExists: !!createBtn,
      createBtnType: createBtn?.getAttribute('type'),
      createBtnDisabled: createBtn?.disabled,
      buttonsCount: buttons.length,
      buttons: buttons.map(b => ({ text: b.textContent?.trim(), type: b.getAttribute('type'), disabled: b.disabled })),
      // Check react component data
      reactRoot: document.getElementById('__next')?.children.length || 0,
    };
  });
  
  log(`  Form debug: ${JSON.stringify(formDebug, null, 2)}`);

  await browser.close();
  log('\n=== TEST COMPLETE ===');
}

run().catch(e => { console.error(e); process.exit(1); }).then(() => process.exit(0));
