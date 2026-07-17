const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE = 'http://localhost:3000';
const API = 'http://localhost:4000/api';
const OUT = path.resolve(__dirname, '../test-results/audit-v3');

const ROUTES = [
  { path: '/dashboard', name: 'Dashboard', group: 'Principal' },
  { path: '/service-cases', name: 'Casos de Servicio', group: 'Principal' },
  { path: '/customers', name: 'Clientes', group: 'Comercial' },
  { path: '/work-requests', name: 'Solicitudes', group: 'Comercial' },
  { path: '/site-visits', name: 'Visitas', group: 'Comercial' },
  { path: '/proposals', name: 'Propuestas', group: 'Comercial' },
  { path: '/purchase-orders', name: 'PO Aprobada', group: 'Comercial' },
  { path: '/orders', name: 'Órdenes', group: 'Campo' },
  { path: '/planning', name: 'Planeación', group: 'Campo' },
  { path: '/execution', name: 'Ejecución', group: 'Campo' },
  { path: '/evidences', name: 'Evidencias', group: 'Campo' },
  { path: '/dispatch', name: 'Despacho', group: 'Campo' },
  { path: '/sla', name: 'SLA', group: 'Campo' },
  { path: '/reports', name: 'Informes', group: 'Cierre Técnico' },
  { path: '/reports/analytics', name: 'Analítica', group: 'Cierre Técnico' },
  { path: '/delivery-records', name: 'Actas', group: 'Cierre Técnico' },
  { path: '/billing', name: 'Cierre Admin', group: 'Cierre Admin' },
  { path: '/billing/ses', name: 'SES / Ariba', group: 'Cierre Admin' },
  { path: '/billing/invoices', name: 'Facturas', group: 'Cierre Admin' },
  { path: '/payments', name: 'Pagos', group: 'Cierre Admin' },
  { path: '/costs', name: 'Costos', group: 'Cierre Admin' },
  { path: '/documents', name: 'Documentos', group: 'Transversales' },
  { path: '/templates', name: 'Plantillas', group: 'Transversales' },
  { path: '/resources', name: 'Recursos', group: 'Transversales' },
  { path: '/inventory', name: 'Inventario', group: 'Transversales' },
  { path: '/fleet', name: 'Flota', group: 'Transversales' },
  { path: '/assets', name: 'Activos', group: 'Transversales' },
  { path: '/admin/personnel', name: 'Personal', group: 'Admin' },
  { path: '/admin/backups', name: 'Respaldos', group: 'Admin' },
  { path: '/admin/custom-fields', name: 'Campos Pers.', group: 'Admin' },
  { path: '/admin/audit', name: 'Auditoría', group: 'Admin' },
  { path: '/admin/settings', name: 'Configuración', group: 'Admin' },
  { path: '/admin/erp-connectors', name: 'ERP Connectors', group: 'Admin' },
];

class AuditV3 {
  constructor() {
    this.browser = null;
    this.context = null;
    this.page = null;
    this.authToken = null;
    this.findings = { bugs: [], opportunities: [], anomalies: [] };
    this.pageResults = [];
    this.apiResults = [];
    this.consoleErrors = [];
  }

  async init() {
    fs.mkdirSync(OUT, { recursive: true });
    this.browser = await chromium.launch({ headless: true });
    console.log(`[INIT] v3 audit at ${new Date().toISOString()}`);
  }

  addBug(severity, section, title, desc, impact, detail) {
    this.findings.bugs.push({ severity, section, title, description: desc, impact, detail, ts: new Date().toISOString() });
  }

  addOpp(area, priority, title, desc) {
    this.findings.opportunities.push({ area, priority, title, description: desc });
  }

  addAnomaly(section, title, desc) {
    this.findings.anomalies.push({ section, title, description: desc });
  }

  async login() {
    console.log(`\n[LOGIN] gerencia@cermont.co`);
    this.context = await this.browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'es-CO' });
    this.page = await this.context.newPage();
    
    this.page.on('console', msg => {
      if (msg.type() === 'error') this.consoleErrors.push({ text: msg.text(), url: this.page.url() });
    });
    this.page.on('response', resp => {
      if (resp.url().includes('/api/auth/login') && resp.status() === 200) {
        this.authToken = resp.headers()['set-cookie'] || '';
      }
    });

    await this.page.goto(`${BASE}/login`, { waitUntil: 'networkidle', timeout: 30000 });
    await this.page.waitForTimeout(500);
    await this.page.locator('#email').fill('gerencia@cermont.co');
    await this.page.locator('#password').fill('Cermont2026!Dev01');
    await this.page.locator('button[type="submit"]').click();
    await this.page.waitForTimeout(3000);

    const url = this.page.url();
    if (url.includes('/login')) {
      console.log('[LOGIN FAILED]');
      const err = await this.page.locator('[role="alert"]').first().textContent().catch(() => '');
      console.log(`  Error: ${err}`);
      return false;
    }
    console.log(`[LOGIN OK] ${url}`);

    // Get cookies
    const cookies = await this.context.cookies();
    const tokenCookie = cookies.find(c => c.name.includes('token') || c.name.includes('auth') || c.name.includes('jwt'));
    if (tokenCookie) {
      this.authToken = `${tokenCookie.name}=${tokenCookie.value}`;
      console.log(`  Auth cookie: ${tokenCookie.name}`);
    } else {
      console.log(`  Cookies: ${cookies.map(c => c.name).join(', ')}`);
      // Try localStorage
      const ls = await this.page.evaluate(() => {
        const keys = Object.keys(localStorage);
        return keys.map(k => ({ key: k, value: localStorage.getItem(k)?.substring(0, 50) }));
      }).catch(() => []);
      console.log(`  localStorage keys: ${ls.map(l => `${l.key}: ${l.value}`).join(', ')}`);
      
      const ss = await this.page.evaluate(() => {
        const keys = Object.keys(sessionStorage);
        return keys.map(k => ({ key: k, value: sessionStorage.getItem(k)?.substring(0, 50) }));
      }).catch(() => []);
      console.log(`  sessionStorage keys: ${ss.map(s => `${s.key}: ${s.value}`).join(', ')}`);
    }
    return true;
  }

  async auditPage(route, info) {
    const start = Date.now();
    const result = {
      route: route, name: info.name, group: info.group,
      statusCode: 0, loadTime: 0, hasPageTitle: false, pageTitle: '',
      hasContent: false, contentHeadings: [], sidebarHeadingsOnly: false,
      hasLoading: false, hasError: false, hasEmpty: false,
      hasApi401: false, renderedFields: 0, renderStrategy: 'unknown',
      consoleErrors: [], networkErrors: [], notes: [],
      takeScreenshot: true,
    };

    const pageErrors = [];

    // Listen for API errors during page load
    this.page.on('response', resp => {
      if (resp.url().includes('/api/') && resp.status() === 401) {
        pageErrors.push({ url: resp.url(), status: 401 });
        result.hasApi401 = true;
      }
    });

    try {
      const resp = await this.page.goto(`${BASE}${route}`, { waitUntil: 'networkidle', timeout: 20000, referer: `${BASE}/dashboard` });
      result.loadTime = Date.now() - start;
      if (resp) result.statusCode = resp.status();
    } catch (e) {
      result.notes.push(`Navigation error: ${e.message}`);
      this.pageResults.push(result);
      return result;
    }

    await this.page.waitForTimeout(2000);

    result.pageTitle = await this.page.title();
    result.hasPageTitle = result.pageTitle.length > 0;

    const body = await this.page.locator('body').textContent() || '';

    // Check what rendered
    const allHeadings = await this.getTexts('h1, h2, h3, h4');
    result.contentHeadings = allHeadings;

    // Detect if only sidebar rendered (Principal, Comercial, Campo, etc = sidebar)
    const sidebarWords = ['Principal', 'Comercial', 'Campo', 'Cierre Técnico', 'Cierre Admin', 'Transversales', 'Admin', 'Cermont AI'];
    const nonSidebarHeadings = allHeadings.filter(h => !sidebarWords.some(w => h.includes(w)));
    result.sidebarHeadingsOnly = nonSidebarHeadings.length === 0 && allHeadings.length > 0;

    if (result.sidebarHeadingsOnly) {
      result.renderStrategy = 'sidebar-only-no-data';
      result.notes.push('Only sidebar rendered. Page content area likely empty.');
    }

    // Check for content beyond sidebar
    const mainContent = this.page.locator('main, [role="main"], article, section').first();
    if (await mainContent.count() > 0) {
      const mainText = (await mainContent.textContent() || '').trim();
      result.hasContent = mainText.length > 50;
    }

    // Detect states
    result.hasLoading = /cargando|loading|spinner|skeleton/i.test(body);
    result.hasError = /error|fallo|algo salió|ups|recargue/i.test(body);
    result.hasEmpty = /no hay|no se encontraron|sin datos|sin registros|vacío/i.test(body);

    // Count rendered form fields
    result.renderedFields = await this.page.locator('input, select, textarea').count();

    // Check for CSRF/401 patterns in API calls
    result.networkErrors = pageErrors;

    this.pageResults.push(result);

    // Log
    const icon = result.statusCode >= 400 ? '🔴' : result.sidebarHeadingsOnly ? '⚪' : result.hasEmpty ? '📭' : '✅';
    const heading = result.contentHeadings.slice(0, 3).join(' | ').substring(0, 60);
    console.log(`  ${icon} ${route.padEnd(28)} ${result.statusCode} ${String(result.loadTime).padEnd(5)}ms ${heading}`);
    if (result.hasApi401) console.log(`       ⚠ 401 API calls during render`);
    if (result.sidebarHeadingsOnly) console.log(`       ⚠ No page-specific content (sidebar only)`);

    // Take screenshot
    await this.page.screenshot({ path: `${OUT}/page_${route.replace(/\//g, '_') || 'index'}.png`, fullPage: true });

    return result;
  }

  async getTexts(sel) {
    const els = this.page.locator(sel);
    const c = Math.min(await els.count(), 15);
    const t = [];
    for (let i = 0; i < c; i++) t.push(((await els.nth(i).textContent()) || '').trim());
    return t.filter(Boolean);
  }

  async checkApiDirect(token) {
    console.log(`\n[API] Direct auth test...`);
    
    // Try multiple auth strategies
    const strategies = [
      { name: 'Cookie', headers: { 'Cookie': token } },
      { name: 'Bearer', headers: { 'Authorization': `Bearer ${token}` } },
    ];

    for (const strat of strategies) {
      try {
        const resp = await this.page.request.get(`${API}/work-requests`, { 
          headers: strat.headers, timeout: 10000 
        });
        console.log(`  ${strat.name}: /work-requests → ${resp.status()}`);
        if (resp.status() === 200) {
          const body = await resp.json();
          console.log(`    Data: ${JSON.stringify(body).substring(0, 200)}`);
        }
      } catch (e) {
        console.log(`  ${strat.name}: ERROR ${e.message}`);
      }
    }

    // Check if there's a /api/auth/me or verify endpoint
    const meResp = await this.page.goto(`${BASE}/api/auth/me`, { waitUntil: 'domcontentloaded', timeout: 10000 }).catch(() => null);
    if (meResp) console.log(`  /api/auth/me via page: ${meResp.status()}`);
  }

  async inspectWorkRequestForm() {
    console.log(`\n[FORM INSPECT] /work-requests/new`);
    await this.page.goto(`${BASE}/work-requests/new`, { waitUntil: 'networkidle', timeout: 20000 });
    await this.page.waitForTimeout(3000);
    
    // Get the full HTML of the page to understand the form
    const formHtml = await this.page.evaluate(() => {
      const form = document.querySelector('form');
      if (!form) return 'NO FORM FOUND';
      const clone = form.cloneNode(true);
      // Remove style tags for readability
      clone.querySelectorAll('style, svg, path').forEach(el => el.remove());
      return clone.outerHTML.substring(0, 5000);
    });
    
    console.log(`  Form HTML (first 1500 chars):`);
    console.log(formHtml.substring(0, 1500));

    // Check for visible fields
    const inputs = await this.page.locator('input:visible, select:visible, textarea:visible').all();
    console.log(`\n  Visible input fields: ${inputs.length}`);
    for (const inp of inputs) {
      const id = await inp.getAttribute('id') || '';
      const name = await inp.getAttribute('name') || '';
      const ph = await inp.getAttribute('placeholder') || '';
      const type = await inp.getAttribute('type') || '';
      const required = await inp.getAttribute('required') !== null;
      const label = id ? await this.page.locator(`label[for="${id}"]`).textContent().catch(() => '') : '';
      console.log(`    ${' '.slice(type.length)}${type.padEnd(10)} id="${id}" name="${name}" ph="${ph}" required=${required} label="${(label||'').trim()}"`);
    }

    // Check for submit buttons
    const buttons = await this.page.locator('button:visible').all();
    console.log(`\n  Visible buttons:`);
    for (const btn of buttons) {
      const text = (await btn.textContent() || '').trim();
      if (text) console.log(`    "${text}"`);

    await this.page.screenshot({ path: `${OUT}/form_workrequest_detail.png`, fullPage: true });
    }
  }

  async checkAppShellBehavior() {
    console.log(`\n[SHELL] Checking app shell rendering...`);
    
    // Navigate to dashboard
    await this.page.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle', timeout: 20000 });
    await this.page.waitForTimeout(2000);
    
    // Check what's actually rendered
    const shellAnalysis = await this.page.evaluate(() => {
      const main = document.querySelector('main');
      const article = document.querySelector('article');
      const sidebar = document.querySelector('[class*="sidebar"], [class*="Sidebar"], nav');
      const content = document.querySelector('[class*="content"], [class*="main"], #__next');
      
      return {
        mainExists: !!main,
        mainChildren: main ? main.children.length : 0,
        mainTextLength: main ? main.textContent?.length || 0 : 0,
        articleExists: !!article,
        sidebarExists: !!sidebar,
        contentExists: !!content,
        bodyChildren: document.body.children.length,
        // Check if app shell is rendered
        hasAppShell: !!document.querySelector('#__next, [data-nextjs]'),
        // Check for auth store
        hasAuthData: window.__NEXT_DATA__ ? true : false,
      };
    });

    console.log(`  Body children: ${shellAnalysis.bodyChildren}`);
    console.log(`  Main exists: ${shellAnalysis.mainExists}, children: ${shellAnalysis.mainChildren}, text: ${shellAnalysis.mainTextLength}chars`);
    console.log(`  Sidebar: ${shellAnalysis.sidebarExists}`);
    console.log(`  App shell: ${shellAnalysis.hasAppShell}`);
    
    // Try to get API response status from proxy
    const proxyResp = await this.page.goto(`${BASE}/api/work-requests`, { waitUntil: 'domcontentloaded', timeout: 10000 }).catch(() => null);
    if (proxyResp) {
      console.log(`  /api/work-requests via Next.js proxy: ${proxyResp.status()}`);
      if (proxyResp.status() === 200) {
        const data = await proxyResp.json();
        console.log(`    Response: ${JSON.stringify(data).substring(0, 300)}`);
      }
    }
  }

  async analyzePageContentIssues() {
    console.log(`\n[ANALYSIS] Page content rendering analysis...`);
    
    // Compare route headings
    const pageWithContent = this.pageResults.filter(r => !r.sidebarHeadingsOnly);
    const sidebarOnly = this.pageResults.filter(r => r.sidebarHeadingsOnly);
    
    console.log(`  Pages with actual content: ${pageWithContent.length}/${this.pageResults.length}`);
    console.log(`  Sidebar-only (no data): ${sidebarOnly.length}`);
    
    if (sidebarOnly.length > 5) {
      this.addBug('critical', 'Rendering', `${sidebarOnly.length} pages show only sidebar (no content)`,
        'After login, all pages render the app shell but fail to load page-specific content. API calls from within pages return 401.',
        'This suggests the auth token/ cookie is not being forwarded to API calls made by the Next.js pages. Either: (1) the proxy is not forwarding cookies, (2) the auth store has the wrong token format, or (3) the in-page fetch is not including credentials.');
      
      this.addBug('critical', 'Auth', 'Auth cookie not propagated to in-page API calls',
        'After successful login (cookie set), subsequent page navigations trigger 401 on API calls. The auth cookie is not sent with XHR/fetch requests from the SPA.',
        'Pages render sidebar but no data because all API requests fail authentication.');
    }
  }

  async run() {
    console.log(`\n═════════════════════════════════════════════════`);
    console.log(`  CERMONT AUDIT v3 — SPA Rendering & Auth Focus`);
    console.log(`═════════════════════════════════════════════════\n`);
    await this.init();
    
    if (!await this.login()) { await this.browser.close(); return; }
    
    // Test all pages
    for (const r of ROUTES) {
      await this.auditPage(r.path, r);
    }
    
    // Deep inspection of form
    await this.inspectWorkRequestForm();
    
    // App shell analysis
    await this.checkAppShellBehavior();
    
    // Analyze findings
    await this.analyzePageContentIssues();
    
    // API direct test
    if (this.authToken) {
      await this.checkApiDirect(this.authToken);
    }
    
    // Generate report
    await this.generateReport();
    
    await this.browser.close();
    console.log(`\n[DONE] v3 audit complete.`);
  }

  async generateReport() {
    // Summary stats
    const sidebarOnly = this.pageResults.filter(r => r.sidebarHeadingsOnly).length;
    const withApi401 = this.pageResults.filter(r => r.hasApi401).length;
    const withContent = this.pageResults.filter(r => !r.sidebarHeadingsOnly).length;

    const report = {
      metadata: { app: 'Cermont S.A.S.', version: '?', testedAt: new Date().toISOString(), user: 'gerencia@cermont.co' },
      summary: {
        pagesTested: this.pageResults.length,
        pagesWithContent: withContent,
        sidebarOnlyPages: sidebarOnly,
        pagesWith401ApiCalls: withApi401,
        pagesWithErrors: this.pageResults.filter(r => r.hasError).length,
        pagesWithEmpty: this.pageResults.filter(r => r.hasEmpty).length,
        consoleErrors: this.consoleErrors.length,
        bugsFound: this.findings.bugs.length,
        opportunitiesFound: this.findings.opportunities.length,
        anomaliesFound: this.findings.anomalies.length,
      },
      criticalBugs: this.findings.bugs.filter(b => b.severity === 'critical'),
      majorBugs: this.findings.bugs.filter(b => b.severity === 'major'),
      minorBugs: this.findings.bugs.filter(b => b.severity === 'minor'),
      opportunities: this.findings.opportunities,
      anomalies: this.findings.anomalies,
      pages: this.pageResults,
      consoleErrors: this.consoleErrors,
      apiResults: this.apiResults,
    };

    fs.writeFileSync(`${OUT}/audit-v3-report.json`, JSON.stringify(report, null, 2));
    console.log(`\n  Report: ${OUT}/audit-v3-report.json`);
    console.log(`\n═════════════════════════════════════════════════`);
    console.log(`  SUMMARY`);
    console.log(`  Pages: ${this.pageResults.length} (${withContent} with content, ${sidebarOnly} sidebar-only)`);
    console.log(`  401 API calls in pages: ${withApi401}/${this.pageResults.length}`);
    console.log(`  Console errors: ${this.consoleErrors.length}`);
    console.log(`  Bugs found: ${this.findings.bugs.length}`);
    console.log(`═════════════════════════════════════════════════`);
  }
}

new AuditV3().run().catch(e => { console.error(e); process.exit(1); });
