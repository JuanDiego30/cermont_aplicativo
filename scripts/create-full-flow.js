const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE = 'http://localhost:3000';
const API = 'http://localhost:4000/api';
const OUT = path.resolve(__dirname, '../test-results/full-flow');
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
  
  const headers = { 
    'Authorization': `Bearer ${bearerToken}`,
    'Content-Type': 'application/json',
  };

  const created = {};
  let step = 0;

  async function api(method, endpoint, data) {
    const url = endpoint.startsWith('http') ? endpoint : `${API}${endpoint}`;
    const resp = await page.request.fetch(url, { method, headers, data });
    const body = await resp.json().catch(() => ({}));
    return { status: resp.status(), body };
  }

  // STEP 0: Get user ID
  console.log(`\n=== STEP 0: Get Current User ===`);
  const me = await api('GET', '/auth/me');
  const userId = me.body.data?._id || me.body.data?.id || me.body._id || '';
  console.log(`  User ID: ${userId}`);

  // STEP 1: Work Request
  console.log(`\n=== STEP 1/14: Create Work Request ===`);
  const wr = await api('POST', '/work-requests', {
    clientName: 'Cliente Exitoso QA',
    requesterName: 'QA Success',
    requesterEmail: 'qa-success@test.com',
    requesterPhone: '3123456789',
    serviceSite: 'Campo Éxito - Pozo QA-1',
    shortDescription: 'Mantenimiento preventivo - QA Exitoso Full Flow',
    description: 'Solicitud de mantenimiento preventivo generada exitosamente por API para prueba de flujo completo 14 pasos.',
    serviceType: 'mantenimiento_instrumentacion',
    sourceChannel: 'internal',
    urgency: 'medium',
    requiresSiteVisit: true,
  });
  const wrId = wr.body.data?.workRequest?._id || wr.body.data?._id || wr.body._id || '';
  console.log(`  WR: ${wr.status} id=${wrId}`);
  created.wr = wrId;

  // STEP 2: Site Visit
  if (wrId) {
    console.log(`\n=== STEP 2/14: Create Site Visit ===`);
    const sv = await api('POST', '/site-visits', {
      workRequestId: wrId,
      scheduledDate: new Date(Date.now() + 86400000).toISOString(),
      technicianId: userId,
      location: 'Campo Éxito - Pozo QA-1',
      notes: 'Visita técnica programada para inspección inicial.',
    });
    console.log(`  SV: ${sv.status}`);
    const svId = sv.body.data?._id || sv.body._id || '';
    created.sv = svId;
  }

  // Convert WR to service case first
  if (wrId) {
    console.log(`\n=== STEP: Qualify WR → Create Service Case ===`);
    // First qualify the work request
    const qualify = await api('POST', `/work-requests/${wrId}/qualify`, {
      requiresSiteVisit: true,
      notes: 'Solicitud calificada - requiere visita técnica',
    });
    console.log(`  Qualify: ${qualify.status} ${JSON.stringify(qualify.body).substring(0, 200)}`);

    // Check service cases
    const scList = await api('GET', '/service-cases?limit=10');
    console.log(`  SC list: ${scList.status} ${JSON.stringify(scList.body).substring(0, 200)}`);

    const scId = scList.body.data?.[0]?._id || '';
    if (scId) {
      created.sc = scId;

      // STEP 3: Proposal
      console.log(`\n=== STEP 3/14: Create Proposal ===`);
      const prop = await api('POST', '/proposals', {
        serviceCaseId: scId,
        clientName: 'Cliente Exitoso QA',
        items: [
          { description: 'Mantenimiento preventivo instrumentación', quantity: 1, unitPrice: 8500000 },
          { description: 'Calibración de sensores', quantity: 5, unitPrice: 450000 },
        ],
        totalAmount: 10750000,
        validUntil: new Date(Date.now() + 30 * 86400000).toISOString(),
        notes: 'Propuesta generada automáticamente para prueba de flujo.',
      });
      console.log(`  PROP: ${prop.status} ${JSON.stringify(prop.body).substring(0, 200)}`);
      
      // Approve proposal
      const propId = prop.body.data?._id || prop.body._id || '';
      if (propId) {
        const approveProp = await api('POST', `/proposals/${propId}/approve`, {
          notes: 'Propuesta aprobada automáticamente - QA test',
        });
        console.log(`  Approve Prop: ${approveProp.status} ${JSON.stringify(approveProp.body).substring(0, 200)}`);
        created.prop = propId;

        // STEP 4: Purchase Order
        console.log(`\n=== STEP 4/14: Create Purchase Order ===`);
        const po = await api('POST', '/purchase-orders', {
          proposalId: propId,
          serviceCaseId: scId,
          clientName: 'Cliente Exitoso QA',
          totalAmount: 10750000,
          poNumber: 'PO-QA-2026-0001',
          issueDate: new Date().toISOString(),
          expectedDeliveryDate: new Date(Date.now() + 15 * 86400000).toISOString(),
          status: 'approved',
        });
        console.log(`  PO: ${po.status} ${JSON.stringify(po.body).substring(0, 200)}`);
        const poId = po.body.data?._id || po.body._id || '';
        created.po = poId;

        // STEP 5: Planning
        console.log(`\n=== STEP 5/14: Create Planning ===`);
        const plan = await api('POST', '/planning', {
          serviceCaseId: scId,
          title: 'Plan de trabajo - Mantenimiento Preventivo QA',
          description: 'Planificación detallada para mantenimiento preventivo de instrumentación.',
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 7 * 86400000).toISOString(),
          assignedTeam: [userId],
          resources: [{ name: 'Kit de calibración', quantity: 1 }],
        });
        console.log(`  Plan: ${plan.status} ${JSON.stringify(plan.body).substring(0, 200)}`);
        const planId = plan.body.data?._id || plan.body._id || '';
        created.plan = planId;

        // STEP 6: Order
        console.log(`\n=== STEP 6/14: Create Work Order ===`);
        const ord = await api('POST', '/orders', {
          serviceCaseId: scId,
          title: 'OT-001 - Mantenimiento Preventivo QA',
          description: 'Orden de trabajo para mantenimiento preventivo de instrumentación.',
          clientName: 'Cliente Exitoso QA',
          location: 'Campo Éxito - Pozo QA-1',
          assignedTo: userId,
          priority: 'high',
          scheduledStart: new Date().toISOString(),
          scheduledEnd: new Date(Date.now() + 7 * 86400000).toISOString(),
        });
        console.log(`  Order: ${ord.status} ${JSON.stringify(ord.body).substring(0, 200)}`);
        const orderId = ord.body.data?._id || ord.body._id || '';
        created.order = orderId;

        // STEP 7: Evidence
        if (orderId) {
          console.log(`\n=== STEP 7/14: Upload Evidence ===`);
          const ev = await api('POST', '/evidences', {
            orderId: orderId,
            type: 'photo',
            description: 'Foto de evidencia - mantenimiento preventivo',
            capturedAt: new Date().toISOString(),
          });
          console.log(`  Evidence: ${ev.status} ${JSON.stringify(ev.body).substring(0, 200)}`);
        }
      }
    }
  }

  // FINAL REPORT
  console.log(`\n========== CREATED DATA SUMMARY ==========`);
  for (const [k, v] of Object.entries(created)) {
    console.log(`  ${k}: ${v}`);
  }
  
  // UI VERIFICATION
  console.log(`\n========== UI VERIFICATION ==========`);
  const uiPages = [
    '/work-requests', '/service-cases', '/site-visits',
    '/proposals', '/purchase-orders', '/orders',
    '/planning', '/evidences', '/dashboard',
    '/customers', '/billing', '/payments',
  ];
  
  for (const p of uiPages) {
    await page.goto(`${BASE}${p}`, { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(5000);
    const body = await page.locator('body').textContent() || '';
    const hasRecords = !body.includes('No hay') && !body.includes('sin datos');
    console.log(`  ${hasRecords ? '📊' : '📭'} ${p}: ${body.includes('Exitoso') ? 'HAS DATA' : 'empty'}`);
    await page.screenshot({ path: `${OUT}/ui_${p.replace(/\//g, '_')}.png`, fullPage: true });
  }

  await browser.close();
  console.log(`\n[DONE] Full flow test complete.`);
}

run().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
