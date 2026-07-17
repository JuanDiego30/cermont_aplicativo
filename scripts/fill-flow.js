const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE = 'http://localhost:3000';
const OUT = path.resolve(__dirname, '../test-results/audit-flow');
const CREDS = { email: 'gerencia@cermont.co', pass: 'Cermont2026!Dev01' };

class FlowTester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.createdIds = {};
    this.log = [];
  }

  logMsg(msg) { this.log.push(msg); console.log(`  ${msg}`); }

  async init() {
    fs.mkdirSync(OUT, { recursive: true });
    this.browser = await chromium.launch({ headless: true });
    const ctx = await this.browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'es-CO' });
    this.page = await ctx.newPage();
    
    this.page.on('console', msg => {
      if (msg.type() === 'error') this.log.push(`[CONSOLE_ERROR] ${msg.text().substring(0, 150)}`);
    });
    this.page.on('response', resp => {
      if (resp.url().includes('/api/') && resp.status() >= 400 && resp.status() !== 401) {
        this.log.push(`[API_ERROR] ${resp.status()} ${resp.url().substring(0, 100)}`);
      }
    });

    await this.login();
  }

  async login() {
    console.log(`\n[LOGIN] ${CREDS.email}`);
    await this.page.goto(`${BASE}/login`, { waitUntil: 'networkidle', timeout: 30000 });
    await this.page.waitForTimeout(500);
    await this.page.locator('#email').fill(CREDS.email);
    await this.page.locator('#password').fill(CREDS.pass);
    await this.page.locator('button[type="submit"]').click();
    await this.page.waitForTimeout(3000);
    if (this.page.url().includes('/login')) {
      console.error('[FATAL] Login failed');
      return false;
    }
    console.log(`  OK → ${this.page.url()}`);
    return true;
  }

  async fillForm(route, fields) {
    console.log(`\n[FORM] ${route}`);
    await this.page.goto(`${BASE}${route}`, { waitUntil: 'networkidle', timeout: 30000 });
    await this.page.waitForTimeout(3000);

    // Take "before" screenshot
    await this.page.screenshot({ path: `${OUT}/form_${route.replace(/\//g, '_')}_before.png`, fullPage: true });

    for (const field of fields) {
      const selector = field.selector || `#${field.id}`;
      const el = this.page.locator(selector).first();
      if (await el.count() > 0) {
        const tag = await el.evaluate(el => el.tagName.toLowerCase());
        if (tag === 'select') {
          await el.selectOption(field.value);
        } else if (el.getAttribute('type') === 'checkbox') {
          if (field.value) await el.check();
        } else {
          await el.fill(field.value);
        }
        console.log(`  ✅ ${field.label||field.id}: ${String(field.value).substring(0, 50)}`);
      } else {
        console.log(`  ⚠️  ${field.label||field.id}: field not found (${selector})`);
      }
    }

    await this.page.screenshot({ path: `${OUT}/form_${route.replace(/\//g, '_')}_filled.png`, fullPage: true });

    // Try submit
    const submitBtn = this.page.locator('button[type="submit"], button:has-text("Crear"), button:has-text("Guardar")').first();
    if (await submitBtn.count() > 0) {
      const btnText = (await submitBtn.textContent() || '').trim();
      console.log(`  Submitting: "${btnText}"`);
      
      const [resp] = await Promise.all([
        this.page.waitForResponse(r => r.url().includes('/api/') && [200, 201, 400, 409].includes(r.status()), { timeout: 15000 }).catch(() => null),
        submitBtn.click(),
      ]);
      await this.page.waitForTimeout(3000);
      
      if (resp) {
        console.log(`  Submit response: ${resp.status()}`);
        if (resp.status() >= 400) {
          const body = await resp.text().catch(() => '');
          console.log(`  Error body: ${body.substring(0, 200)}`);
        } else {
          const json = await resp.json().catch(() => ({}));
          const id = json.data?._id || json.data?.id || json._id || '';
          if (id) {
            this.createdIds[route] = id;
            console.log(`  ✅ Created ID: ${id}`);
          }
        }
      }
      
      const postUrl = this.page.url();
      console.log(`  Post-submit URL: ${postUrl}`);
      await this.page.screenshot({ path: `${OUT}/form_${route.replace(/\//g, '_')}_after.png`, fullPage: true });
      return resp;
    } else {
      console.log(`  ⚠️  No submit button found`);
      return null;
    }
  }

  async createWorkRequest() {
    return this.fillForm('/work-requests/new', [
      { id: '_r_0_', label: 'Cliente', value: 'Chevron Colombia S.A.S.' },
      { id: 'clientName', label: 'Nombre del cliente', value: 'Chevron Colombia S.A.S.' },
      { id: 'requesterName', label: 'Solicitante', value: 'Juan Pérez' },
      { id: 'requesterEmail', label: 'Correo', value: 'jperez@chevron.com' },
      { id: 'requesterPhone', label: 'Teléfono', value: '3101234567' },
      { id: 'serviceSite', label: 'Sitio de servicio', value: 'Campo Petrolero Arauca - Pozo 7' },
      { id: 'shortDescription', label: 'Resumen', value: 'Mantenimiento preventivo equipos de perforación - QA Automatizado' },
      { id: 'description', label: 'Descripcion', value: 'Prueba automatizada del flujo completo de 14 pasos. Verificar creación de solicitud y transición a caso de servicio.' },
    ]);
  }

  async createServiceCase() {
    console.log(`\n[WORKFLOW] Checking service case creation...`);
    await this.page.goto(`${BASE}/work-requests`, { waitUntil: 'networkidle', timeout: 20000 });
    await this.page.waitForTimeout(3000);
    
    // Check if there are work requests listed
    const hasRequests = await this.page.locator('table tr, [class*="card"], [class*="list-item"], [class*="row"]').count();
    console.log(`  Work request items found: ${hasRequests}`);
    await this.page.screenshot({ path: `${OUT}/work-requests-list.png`, fullPage: true });
    
    // Try creating from dashboard
    await this.page.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle', timeout: 20000 });
    await this.page.waitForTimeout(3000);
    
    // Check what's on the dashboard
    const dashContent = await this.page.evaluate(() => {
      return {
        headings: Array.from(document.querySelectorAll('h1, h2, h3, h4')).map(h => h.textContent?.trim()).filter(Boolean),
        buttons: Array.from(document.querySelectorAll('button')).map(b => b.textContent?.trim()).filter(Boolean).slice(0, 20),
        dataContainers: Array.from(document.querySelectorAll('[class*="kpi"], [class*="metric"], [class*="stat"], [class*="card"], [class*="chart"]')).length,
      };
    });
    console.log(`  Dashboard headings: ${dashContent.headings.join(', ')}`);
    console.log(`  Dashboard buttons: ${dashContent.buttons.join(', ')}`);
    console.log(`  Dashboard data containers: ${dashContent.dataContainers}`);
    await this.page.screenshot({ path: `${OUT}/dashboard.png`, fullPage: true });
  }

  async exploreAllPagesVerbose() {
    console.log(`\n[EXPLORE] Verbose content audit...`);
    
    const routes = [
      '/dashboard', '/service-cases', '/customers', '/work-requests',
      '/site-visits', '/proposals', '/purchase-orders', '/orders',
      '/planning', '/execution', '/evidences', '/dispatch',
      '/sla', '/reports', '/delivery-records', '/billing',
      '/billing/ses', '/billing/invoices', '/payments', '/costs',
      '/documents', '/templates', '/inventory', '/fleet',
      '/assets', '/admin/personnel', '/admin/audit', '/admin/settings',
    ];

    for (const route of routes) {
      await this.page.goto(`${BASE}${route}`, { waitUntil: 'networkidle', timeout: 20000 });
      await this.page.waitForTimeout(2000);
      
      const analysis = await this.page.evaluate(() => {
        const h1 = document.querySelector('h1')?.textContent?.trim() || '';
        const h2 = Array.from(document.querySelectorAll('h2')).map(h => h.textContent?.trim()).filter(Boolean);
        const buttons = Array.from(document.querySelectorAll('button')).map(b => b.textContent?.trim()).filter(Boolean).slice(0, 5);
        const body = document.body.textContent || '';
        const dataElements = document.querySelectorAll('table, [role="grid"], [class*="list"], .kpi, .metric, [class*="stat"]').length;
        const hasEmpty = /no hay|no se encontraron|sin datos|sin registros|vacío/.test(body);
        const hasError = /error|algo salió|ups/.test(body);
        return { h1, h2: h2.slice(0, 5), buttons, dataElements, hasEmpty, hasError, bodyLength: body.length };
      });

      const icon = analysis.hasError ? '🔴' : analysis.hasEmpty ? '📭' : analysis.dataElements > 2 ? '📊' : '✅';
      console.log(`  ${icon} ${route.padEnd(28)} h1="${analysis.h1.substring(0, 40)}" h2=${JSON.stringify(analysis.h2)} data=${analysis.dataElements} btns=${analysis.buttons.length}`);
      
      // Screenshot each page
      await this.page.screenshot({ path: `${OUT}/page_${route.replace(/\//g, '_')}.png`, fullPage: true });
    }
  }

  async run() {
    console.log(`\n═════════════════════════════════════════════════`);
    console.log(`  CERMONT FLOW TEST — Form Fill & Page Exploration`);
    console.log(`═════════════════════════════════════════════════\n`);
    
    await this.init();
    
    // 1. Explore all pages first
    await this.exploreAllPagesVerbose();
    
    // 2. Create work request
    // await this.createWorkRequest();
    
    // 3. Check service cases
    await this.createServiceCase();
    
    await this.browser.close();
    
    console.log(`\n[DONE] Flow test complete.`);
    console.log(`  Screenshots: ${OUT}/`);
  }
}

new FlowTester().run().catch(e => { console.error(e); process.exit(1); });
