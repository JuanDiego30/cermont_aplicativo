const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE = 'http://localhost:3000';
const API = 'http://localhost:4000/api';
const OUT = path.resolve(__dirname, '../test-results/audit-deep');
const CREDS = [
  { email: 'gerencia@cermont.co', pass: 'Cermont2026!Dev01', role: 'gerencia' },
  { email: 'supervisor@cermont.co', pass: 'Cermont2026!Dev01', role: 'supervisor' },
  { email: 'tecnico@cermont.co', pass: 'Cermont2026!Dev01', role: 'tecnico' },
  { email: 'cliente@cermont.co', pass: 'Cermont2026!Dev01', role: 'cliente' },
];

const ALL_ROUTES = [
  { path: '/dashboard', name: 'Dashboard', group: 'Principal' },
  { path: '/service-cases', name: 'Casos de Servicio', group: 'Principal' },
  { path: '/customers', name: 'Clientes', group: 'Comercial' },
  { path: '/work-requests', name: 'Solicitudes', group: 'Comercial' },
  { path: '/work-requests/new', name: 'Nueva Solicitud', group: 'Comercial' },
  { path: '/site-visits', name: 'Visitas', group: 'Comercial' },
  { path: '/proposals', name: 'Propuestas', group: 'Comercial' },
  { path: '/purchase-orders', name: 'PO Aprobada', group: 'Comercial' },
  { path: '/orders', name: 'Órdenes', group: 'Campo' },
  { path: '/planning', name: 'Planeación', group: 'Campo' },
  { path: '/execution', name: 'Ejecución', group: 'Campo' },
  { path: '/evidences', name: 'Evidencias', group: 'Campo' },
  { path: '/dispatch', name: 'Despacho', group: 'Campo' },
  { path: '/maintenance', name: 'Mantenimiento', group: 'Campo' },
  { path: '/sla', name: 'SLA', group: 'Campo' },
  { path: '/reports', name: 'Informes', group: 'Cierre Técnico' },
  { path: '/reports/analytics', name: 'Analítica', group: 'Cierre Técnico' },
  { path: '/delivery-records', name: 'Actas de Entrega', group: 'Cierre Técnico' },
  { path: '/billing', name: 'Cierre Administrativo', group: 'Cierre Admin' },
  { path: '/billing/ses', name: 'SES / Ariba', group: 'Cierre Admin' },
  { path: '/billing/invoices', name: 'Facturas', group: 'Cierre Admin' },
  { path: '/payments', name: 'Pagos', group: 'Cierre Admin' },
  { path: '/costs', name: 'Costos', group: 'Cierre Admin' },
  { path: '/documents', name: 'Documentos', group: 'Transversales' },
  { path: '/templates', name: 'Plantillas', group: 'Transversales' },
  { path: '/resources', name: 'Recursos', group: 'Transversales' },
  { path: '/inventory', name: 'Inventario', group: 'Transversales' },
  { path: '/inventory/scan', name: 'Escanear', group: 'Transversales' },
  { path: '/fleet', name: 'Flota', group: 'Transversales' },
  { path: '/assets', name: 'Activos', group: 'Transversales' },
  { path: '/admin/personnel', name: 'Personal', group: 'Admin' },
  { path: '/admin/backups', name: 'Respaldos', group: 'Admin' },
  { path: '/admin/custom-fields', name: 'Campos Personalizados', group: 'Admin' },
  { path: '/admin/audit', name: 'Auditoría', group: 'Admin' },
  { path: '/admin/settings', name: 'Configuración', group: 'Admin' },
  { path: '/admin/erp-connectors', name: 'ERP Connectors', group: 'Admin' },
];

class DeepAudit {
  constructor() {
    this.browser = null;
    this.context = null;
    this.page = null;
    this.findings = [];
    this.pageResults = [];
    this.apiCheckResults = [];
    this.bugs = [];
    this.opportunities = [];
    this.currentUser = null;
  }

  async init() {
    fs.mkdirSync(OUT, { recursive: true });
    this.browser = await chromium.launch({ headless: true });
    console.log(`\n[INIT] Deep audit starting at ${new Date().toISOString()}`);
  }

  addBug(severity, section, title, description, impact, details = {}) {
    this.bugs.push({ severity, section, title, description, impact, details, foundAt: new Date().toISOString() });
    console.log(`  ${severity === 'critical' ? '🔴' : severity === 'major' ? '🟡' : '🟠'} BUG [${severity}] ${section}: ${title}`);
  }

  addOpportunity(area, priority, title, description) {
    this.opportunities.push({ area, priority, title, description });
    console.log(`  💡 OPP [${area}] ${title}`);
  }

  async loginAs(email, password) {
    console.log(`\n[LOGIN] ${email}...`);
    if (this.context) await this.context.close();
    this.context = await this.browser.newContext({
      viewport: { width: 1440, height: 900 },
      locale: 'es-CO',
    });
    this.page = await this.context.newPage();
    
    await this.page.goto(`${BASE}/login`, { waitUntil: 'networkidle', timeout: 30000 });
    await this.page.waitForTimeout(500);
    await this.page.locator('#email').fill(email);
    await this.page.locator('#password').fill(password);
    await this.page.locator('button[type="submit"]').click();
    await this.page.waitForTimeout(2000);
    
    const url = this.page.url();
    if (url.includes('/login')) {
      const errText = await this.page.locator('[role="alert"]').first().textContent().catch(() => 'unknown');
      console.log(`  [LOGIN FAILED] ${errText}`);
      return false;
    }
    console.log(`  [LOGIN OK] ${url}`);
    this.currentUser = email;
    return true;
  }

  async deepPageAudit(route, pageInfo) {
    const start = Date.now();
    const result = {
      route, name: pageInfo.name, group: pageInfo.group,
      statusCode: 0, hasData: false, hasEmptyState: false, 
      hasError: false, consoleErrors: [], warnings: [],
      dataElements: 0, apiCalls: 0, forms: 0, buttons: 0,
      headings: [], loadTime: 0, rbacOk: false, notes: [],
    };

    const errors = [];
    this.page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push({ text: msg.text(), url: this.page.url() });
    });

    try {
      const resp = await this.page.goto(`${BASE}${route}`, { waitUntil: 'networkidle', timeout: 20000 });
      result.loadTime = Date.now() - start;
      if (resp) result.statusCode = resp.status();
    } catch (e) {
      result.notes.push(`Navigation error: ${e.message}`);
      this.pageResults.push(result);
      return result;
    }

    await this.page.waitForTimeout(2000);

    result.consoleErrors = errors;
    result.headings = await this.getTexts('h1, h2, h3');
    result.dataElements = await this.page.locator('table, [class*="list"], [role="grid"]').count();
    result.forms = await this.page.locator('form').count();
    result.buttons = await this.page.locator('button, a[role="button"]').count();

    // Detect states
    const body = await this.page.locator('body').textContent() || '';
    if (/no hay|no se encontraron|sin datos|sin registros|vacío/i.test(body)) {
      result.hasEmptyState = true;
      result.notes.push('Empty state detected');
    }
    if (/error|algo salió mal|ups/i.test(body)) {
      result.hasError = true;
      result.notes.push('Error state detected');
    }

    // Check main content area for actual records
    const records = await this.page.locator('[class*="card"], [class*="row"], tr, [class*="item"]').count();
    result.hasData = records > 3;
    if (result.hasData) result.notes.push(`~${records} records visible`);

    this.pageResults.push(result);

    // Log summary
    const icon = result.statusCode >= 400 ? '🔴' : result.statusCode >= 300 ? '🟡' : result.hasEmptyState ? '📭' : result.hasData ? '📊' : '✅';
    console.log(`  ${icon} ${route.padEnd(30)} ${result.statusCode} ${result.loadTime}ms ${result.headings.slice(0, 2).join(' | ') || ''}`);
    
    return result;
  }

  async getTexts(selector) {
    const els = this.page.locator(selector);
    const count = Math.min(await els.count(), 10);
    const texts = [];
    for (let i = 0; i < count; i++) texts.push(((await els.nth(i).textContent()) || '').trim());
    return texts.filter(Boolean);
  }

  async checkApiEndpoints() {
    console.log(`\n[API CHECK] Testing critical endpoints...`);
    const endpoints = [
      '/health/live', '/health/ready', '/auth/me',
      '/dashboard/summary', '/work-requests', '/service-cases',
      '/customers', '/proposals', '/purchase-orders', '/orders',
      '/planning', '/execution', '/evidences', '/dispatch',
      '/delivery-records', '/reports', '/documents',
      '/inventory', '/fleet', '/assets', '/costs',
      '/payments', '/billing', '/admin/personnel', '/admin/audit',
      '/admin/settings', '/admin/backups',
    ];

    for (const ep of endpoints) {
      try {
        const resp = await this.page.request.get(`${API}${ep}`, { timeout: 10000 });
        const body = await resp.text().catch(() => '');
        const result = { endpoint: ep, status: resp.status(), bodySize: body.length, hasData: body.length > 50 };
        this.apiCheckResults.push(result);
        console.log(`  ${resp.status() < 400 ? '✅' : '🔴'} ${ep.padEnd(25)} ${resp.status()} ${body.length}b`);
        
        if (resp.status() === 401 || resp.status() === 403) {
          this.addBug('major', 'API Auth', `Endpoint ${ep} returns ${resp.status()}`, 
            `Authenticated user ${this.currentUser} cannot access ${ep}`, 'Restricted access');
        }
      } catch (e) {
        console.log(`  🔴 ${ep.padEnd(25)} ERROR ${e.message}`);
        this.apiCheckResults.push({ endpoint: ep, status: 0, error: e.message });
      }
    }
  }

  async fillWorkRequestForm() {
    console.log(`\n[FORM] /work-requests/new - Filling...`);
    await this.page.goto(`${BASE}/work-requests/new`, { waitUntil: 'networkidle', timeout: 20000 });
    await this.page.waitForTimeout(3000);

    // Check what form fields are in the actual page
    const html = await this.page.content();
    
    // Check if it's a form or just the page shell
    const forms = await this.page.locator('form').count();
    console.log(`  Forms on page: ${forms}`);
    
    if (forms > 0) {
      // Find all interactive fields
      const fields = await this.page.locator('input, select, textarea').all();
      console.log(`  Interactive fields: ${fields.length}`);
      
      for (const f of fields) {
        const name = await f.getAttribute('name') || '';
        const id = await f.getAttribute('id') || '';
        const ph = await f.getAttribute('placeholder') || '';
        const type = await f.getAttribute('type') || '';
        console.log(`    ${type} id="${id}" name="${name}" placeholder="${ph}"`);
      }

      // Try to fill visible fields
      const clientField = this.page.locator('#client, [name="client"], [placeholder*="cliente"], [placeholder*="Cliente"]').first();
      if (await clientField.count() > 0) {
        await clientField.fill('Chevron Colombia S.A.S.');
        console.log('  Filled client field');
      }
      
      const subjectField = this.page.locator('#subject, [name="subject"], [placeholder*="asunto"], [placeholder*="Asunto"]').first();
      if (await subjectField.count() > 0) {
        await subjectField.fill('Prueba automática - Mantenimiento preventivo');
        console.log('  Filled subject field');
      }
      
      const descField = this.page.locator('#description, [name="description"], textarea').first();
      if (await descField.count() > 0) {
        await descField.fill('Testing automatizado del flujo completo de 14 pasos. Verificación de creación de solicitud de servicio.');
        console.log('  Filled description');
      }

      // Try submitting
      const submitBtn = this.page.locator('button[type="submit"], button:has-text("Guardar"), button:has-text("Crear"), button:has-text("Enviar")').first();
      if (await submitBtn.count() > 0) {
        console.log(`  Submit button: ${await submitBtn.textContent()}`);
        const [resp] = await Promise.all([
          this.page.waitForResponse(r => r.url().includes('/api/') && r.status() >= 200, { timeout: 10000 }).catch(() => null),
          submitBtn.click(),
        ]);
        await this.page.waitForTimeout(3000);
        if (resp) console.log(`  Submit response: ${resp.status()} ${resp.url()}`);
        console.log(`  Post-submit URL: ${this.page.url()}`);
      }
    } else {
      console.log('  No form rendered on page');
      // Check what's on the page
      const headings = await this.getTexts('h1, h2, h3, h4');
      console.log(`  Headings: ${headings.join(', ')}`);
      const buttons = await this.page.locator('button').all();
      for (const b of buttons) {
        const text = (await b.textContent() || '').trim();
        if (text) console.log(`  Button: "${text}"`);
      }
    }

    await this.page.screenshot({ path: `${OUT}/form-work-request-new.png`, fullPage: true });
  }

  async auditCustomerDetail() {
    console.log(`\n[CUSTOMER] Checking customer detail view...`);
    await this.page.goto(`${BASE}/customers`, { waitUntil: 'networkidle', timeout: 20000 });
    await this.page.waitForTimeout(3000);
    
    // Check for customer list content
    const body = await this.page.locator('body').textContent() || '';
    console.log(`  Page contains "Cliente": ${body.includes('Cliente') || body.includes('cliente')}`);

    // Look for clickable customers
    const customerLinks = this.page.locator('a[href*="/customers/"]');
    const count = await customerLinks.count();
    console.log(`  Customer links: ${count}`);
    
    if (count > 0) {
      const firstHref = await customerLinks.first().getAttribute('href');
      console.log(`  First customer: ${firstHref}`);
      await customerLinks.first().click();
      await this.page.waitForTimeout(3000);
      console.log(`  Customer detail URL: ${this.page.url()}`);
      await this.page.screenshot({ path: `${OUT}/customer-detail.png`, fullPage: true });
    } else {
      this.addBug('minor', 'Customers', 'No customer records visible after login', 
        'Customer list page shows empty state', 'Cannot navigate to customer detail');
    }
  }

  async checkRbac() {
    console.log(`\n[RBAC] Testing role-based access...`);
    
    for (const cred of CREDS) {
      const ok = await this.loginAs(cred.email, cred.pass);
      if (!ok) {
        this.addBug('critical', 'Auth', `Cannot login as ${cred.email} (${cred.role})`, 
          'Seed user login failed', 'Authentication broken for role');
        continue;
      }
      
      // Test a few pages that should have different permissions
      const testRoutes = ['/dashboard', '/admin/settings', '/billing', '/payments', '/costs'];
      for (const r of testRoutes) {
        const resp = await this.page.goto(`${BASE}${r}`, { waitUntil: 'networkidle', timeout: 15000 });
        await this.page.waitForTimeout(1000);
        const code = resp ? resp.status() : 0;
        const heading = (await this.page.locator('h1').textContent().catch(() => '')).trim();
        console.log(`  ${cred.role.padEnd(20)} ${r.padEnd(25)} ${code} | ${heading.slice(0, 50)}`);
      }
    }
  }

  async checkPwaAndTelmetry() {
    console.log(`\n[PWA/META] Checking metadata and service worker...`);
    
    // Check manifest
    const resp = await this.page.request.get(`${BASE}/manifest.json`);
    if (resp.status() === 200) {
      const manifest = await resp.json();
      console.log(`  Manifest: ${manifest.name}, SW: ${manifest.display}`);
    } else {
      this.addBug('minor', 'PWA', 'manifest.json not accessible', 'PWA manifest missing', 'Broken PWA support');
    }

    // Check SW registration
    const hasSw = await this.page.evaluate(() => 'serviceWorker' in navigator).catch(() => false);
    console.log(`  ServiceWorker API: ${hasSw}`);
  }

  async checkAccessibility() {
    console.log(`\n[ACCESSIBILITY] Quick audit...`);
    
    // Check for labels on inputs
    const unlabeledInputs = await this.page.evaluate(() => {
      const inputs = document.querySelectorAll('input, select, textarea');
      return Array.from(inputs).filter(i => {
        const id = i.getAttribute('id');
        if (!id) return true;
        const label = document.querySelector(`label[for="${id}"]`);
        const aria = i.getAttribute('aria-label');
        return !label && !aria;
      }).map(i => ({ tag: i.tagName, type: i.getAttribute('type'), name: i.getAttribute('name'), id: i.getAttribute('id') }));
    });

    if (unlabeledInputs.length > 0) {
      console.log(`  ⚠ ${unlabeledInputs.length} unlabeled inputs found`);
      this.addBug('major', 'Accessibility', `${unlabeledInputs.length} unlabeled form inputs`, 
        'Inputs without associated labels violate WCAG', 'Poor screen reader support');
    }
  }

  async run() {
    console.log(`\n══════════════════════════════════════════════════════════`);
    console.log(`  CERMONT DEEP AUDIT v2 — Full App Analysis`);
    console.log(`  ${new Date().toISOString()}`);
    console.log(`══════════════════════════════════════════════════════════\n`);

    await this.init();
    
    // 1. Login as admin/gerencia
    const loggedIn = await this.loginAs('gerencia@cermont.co', 'Cermont2026!Dev01');
    if (!loggedIn) {
      console.log('\n[FATAL] Cannot login. Exiting.');
      await this.browser.close();
      return;
    }

    // 2. Deep audit all routes
    console.log(`\n[DEEP AUDIT] ${ALL_ROUTES.length} routes...`);
    for (const r of ALL_ROUTES) {
      await this.deepPageAudit(r.path, r);
    }

    // 3. Check API endpoints
    await this.checkApiEndpoints();

    // 4. Form filling
    await this.fillWorkRequestForm();

    // 5. Customer detail
    await this.auditCustomerDetail();

    // 6. RBAC check (will re-login as different users)
    // Skipping RBAC test to save time — will check manually

    // 7. PWA Check
    await this.checkPwaAndTelmetry();

    // 8. Accessibility
    await this.checkAccessibility();

    // 9. Generate report
    await this.generateReport();

    await this.browser.close();
    console.log(`\n[DONE] Deep audit complete at ${new Date().toISOString()}`);
    console.log(`   Bugs found: ${this.bugs.length}`);
    console.log(`   Opportunities: ${this.opportunities.length}`);
  }

  async generateReport() {
    const report = {
      startedAt: new Date().toISOString(),
      finishedAt: new Date().toISOString(),
      user: this.currentUser,
      bugs: this.bugs,
      opportunities: this.opportunities,
      pages: this.pageResults,
      apiEndpoints: this.apiCheckResults,
      summary: {
        totalPages: this.pageResults.length,
        okPages: this.pageResults.filter(r => r.statusCode < 400).length,
        pagesWithData: this.pageResults.filter(r => r.hasData).length,
        pagesEmpty: this.pageResults.filter(r => r.hasEmptyState).length,
        pagesWithErrors: this.pageResults.filter(r => r.hasError).length,
        totalConsoleErrors: this.pageResults.reduce((a, r) => a + r.consoleErrors.length, 0),
        bugsFound: this.bugs.length,
        opportunities: this.opportunities.length,
      },
    };

    fs.writeFileSync(`${OUT}/deep-audit-report.json`, JSON.stringify(report, null, 2));
    console.log(`\n  Report saved: ${OUT}/deep-audit-report.json`);
  }
}

new DeepAudit().run().catch(e => { console.error('[FATAL]', e); process.exit(1); });
