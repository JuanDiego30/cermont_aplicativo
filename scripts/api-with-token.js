const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE = 'http://localhost:3000';
const API = 'http://localhost:4000/api';
const OUT = path.resolve(__dirname, '../test-results/api-token');

async function run() {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  // Login
  console.log('=== LOGIN ===');
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
  await page.locator('#email').fill('gerencia@cermont.co');
  await page.locator('#password').fill('Cermont2026!Dev01');
  await page.locator('button[type="submit"]').click();
  await page.waitForTimeout(3000);

  // Extract auth token from localStorage
  const authData = await page.evaluate(() => {
    try {
      const raw = localStorage.getItem('cermont-auth');
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      // Zustand state is usually nested
      const state = parsed.state || parsed;
      const user = state.user || {};
      const token = state.token || state.accessToken || state.sessionToken || '';
      return { user, token: token.substring(0, 100) };
    } catch(e) { return { error: e.message }; }
  });
  console.log(`Auth data: ${JSON.stringify(authData).substring(0, 300)}`);

  // Also check sessionStorage
  const sessionData = await page.evaluate(() => {
    const keys = Object.keys(sessionStorage);
    const data = {};
    for (const k of keys) {
      data[k] = sessionStorage.getItem(k)?.substring(0, 100);
    }
    return data;
  });
  console.log(`SessionStorage: ${JSON.stringify(sessionData).substring(0, 300)}`);

  // Check the auth/me response to understand the auth mechanism
  console.log('\n=== UNDERSTANDING AUTH ===');
  
  // Check what headers the page sends on auth/me
  const meResp = await page.request.get(`${BASE}/api/backend/auth/me`);
  console.log(`GET /api/backend/auth/me → ${meResp.status()}`);
  if (meResp.status() === 200) {
    const meBody = await meResp.json();
    console.log(`  User: ${JSON.stringify(meBody).substring(0, 300)}`);
  }

  // Try different auth strategies with the actual Express API (port 4000)
  console.log('\n=== TESTING EXPRESS API DIRECTLY ===');
  
  // Try with the auth cookie from the browser context
  const cookies = await ctx.cookies();
  const cookieStr = cookies.map(c => `${c.name}=${c.value}`).join('; ');
  
  // Strategy 1: Cookie auth
  console.log('\nStrategy 1: Cookie auth');
  const r1 = await page.request.get(`${API}/work-requests`, {
    headers: { 'Cookie': cookieStr },
  });
  console.log(`  GET /api/work-requests → ${r1.status()}`);

  // Strategy 2: Try with authorization header
  console.log('\nStrategy 2: Authorization header');
  // Check if there's a token in the refreshToken cookie
  const refreshCookie = cookies.find(c => c.name === 'refreshToken');
  if (refreshCookie) {
    const r2 = await page.request.get(`${API}/work-requests`, {
      headers: { 'Authorization': `Bearer ${refreshCookie.value}` },
    });
    console.log(`  GET /api/work-requests (Bearer=refreshToken) → ${r2.status()}`);
  }

  // Strategy 3: Try through Next.js proxy with auth
  console.log('\nStrategy 3: Via Next.js proxy with cookies');
  const r3 = await page.request.get(`${BASE}/api/backend/work-requests`);
  console.log(`  GET /api/backend/work-requests → ${r3.status()}`);
  if (r3.status() === 200) {
    const body = await r3.json();
    console.log(`  Data: ${JSON.stringify(body).substring(0, 400)}`);
    
    // TRY CREATING DATA
    console.log('\n=== CREATING DATA ===');
    
    // Create client
    const clientPayload = {
      legalName: 'Cliente Creado Desde API Test',
      nit: '888.777.666-5',
      contactName: 'API Automático',
      email: 'api-auto@test.com',
      phone: '3009998877',
      city: 'Arauca',
      industry: 'Hidrocarburos',
    };
    
    const createClient = await page.request.post(`${BASE}/api/backend/clients`, {
      data: clientPayload,
    });
    console.log(`POST /api/backend/clients → ${createClient.status()}`);
    if (createClient.status() === 201) {
      const clientResult = await createClient.json();
      console.log(`  Created: ${JSON.stringify(clientResult).substring(0, 200)}`);
    } else {
      const errBody = await createClient.text();
      console.log(`  Error: ${errBody.substring(0, 200)}`);
    }

    // Create work request
    const wrPayload = {
      clientName: 'Cliente Creado Desde API Test',
      requesterName: 'API Automático',
      requesterEmail: 'api-auto@test.com',
      requesterPhone: '3009998877',
      serviceSite: 'Campo API Test - POzo 99',
      shortDescription: 'Mantenimiento preventivo - API Automático',
      description: 'Descripción del mantenimiento preventivo generado automáticamente por API.',
      requiresSiteVisit: true,
    };
    
    const createWr = await page.request.post(`${BASE}/api/backend/work-requests`, {
      data: wrPayload,
    });
    console.log(`POST /api/backend/work-requests → ${createWr.status()}`);
    if (createWr.status() === 201) {
      const wrResult = await createWr.json();
      console.log(`  Created: ${JSON.stringify(wrResult).substring(0, 300)}`);
    } else {
      const errBody = await createWr.text();
      console.log(`  Error: ${errBody.substring(0, 300)}`);
    }
  } else {
    const errBody = await r3.text();
    console.log(`  Error: ${errBody.substring(0, 200)}`);
  }

  // Check the frontend rendering
  console.log('\n=== FRONTEND VERIFICATION ===');
  await page.goto(`${BASE}/work-requests`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(5000);
  const pageBody = await page.locator('body').textContent() || '';
  console.log(`  "No hay solicitudes": ${pageBody.includes('No hay solicitudes')}`);
  console.log(`  "API Test": ${pageBody.includes('API Test')}`);
  console.log(`  "Mantenimiento": ${pageBody.includes('Mantenimiento')}`);
  await page.screenshot({ path: `${OUT}/work-requests.png`, fullPage: true });
  
  await page.goto(`${BASE}/customers`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(5000);
  const custBody = await page.locator('body').textContent() || '';
  console.log(`  /customers contains "API Test": ${custBody.includes('API Test')}`);
  await page.screenshot({ path: `${OUT}/customers.png`, fullPage: true });

  await browser.close();
}

run().catch(console.error);
