const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const SCREENSHOT_DIR = path.resolve(__dirname, '../test-results/audit-screenshots');
const REPORT_PATH = path.resolve(__dirname, '../test-results/audit-report.json');
const CONSOLE_LOG_PATH = path.resolve(__dirname, '../test-results/audit-console-errors.json');

const CREDS = {
  email: process.env.E2E_USER_EMAIL || 'gerencia@cermont.co',
  password: process.env.E2E_USER_PASSWORD || 'Cermont2026!Dev01',
};

const ROUTES = [
  '/dashboard', '/service-cases', '/customers', '/work-requests', '/work-requests/new',
  '/site-visits', '/proposals', '/purchase-orders', '/orders', '/planning',
  '/execution', '/evidences', '/dispatch', '/maintenance', '/sla',
  '/reports', '/reports/analytics', '/delivery-records', '/billing', '/billing/ses',
  '/billing/invoices', '/payments', '/costs', '/documents', '/templates',
  '/resources', '/inventory', '/inventory/scan', '/fleet', '/assets',
  '/admin/personnel', '/admin/backups', '/admin/custom-fields', '/admin/audit',
  '/admin/settings', '/admin/erp-connectors',
];

const WORKFLOW_STEPS = [
  { step: '1. Work Request', route: '/work-requests' },
  { step: '2. Site Visit', route: '/site-visits' },
  { step: '3. Proposal', route: '/proposals' },
  { step: '4. Purchase Order', route: '/purchase-orders' },
  { step: '5. Planning', route: '/planning' },
  { step: '6. Execution', route: '/execution' },
  { step: '7. Evidence', route: '/evidences' },
  { step: '8. Technical Report', route: '/reports' },
  { step: '9. Delivery Record', route: '/delivery-records' },
  { step: '10. Client Signature', route: '/service-cases' },
  { step: '11. SES/Ariba', route: '/billing/ses' },
  { step: '12. Invoice', route: '/billing/invoices' },
  { step: '13. Invoice Approval', route: '/billing' },
  { step: '14. Payment', route: '/payments' },
];

const FORM_FILL_ROUTES = [
  '/work-requests/new',
  '/site-visits?action=new',
  '/proposals/new',
  '/orders/new',
  '/planning/new',
  '/maintenance?action=new',
  '/resources?action=new',
  '/admin/personnel?action=new',
];

const LOADING_PATTERNS = [/cargando/i, /loading/i, /spinner/i, /skeleton/i, /⌛/i];
const ERROR_PATTERNS = [/error/i, /fallo/i, /algo sali/i, /intente de nuevo/i, /recargue/i];
const EMPTY_PATTERNS = [/no hay/i, /no se encontraron/i, /sin datos/i, /sin registros/i, /vacío/i];
const BOUNDARY_PATTERNS = [/algo sali/i, /error inesperado/i, /ups/i, /recargue la p/i, /404/i, /not found/i];

class AuditSuite {
  constructor() {
    this.browser = null;
    this.context = null;
    this.page = null;
    this.results = [];
    this.allConsoleErrors = [];
    this.workflowResults = [];
    this.httpStatuses = {};
  }

  async init() {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
    console.log(`[INIT] Screenshot dir: ${SCREENSHOT_DIR}`);
    this.browser = await chromium.launch({ headless: true });
    this.context = await this.browser.newContext({
      viewport: { width: 1440, height: 900 },
      locale: 'es-CO',
    });
    this.page = await this.context.newPage();
    this.setupConsoleCapture();
  }

  setupConsoleCapture() {
    this.page.on('console', (msg) => {
      const entry = {
        type: msg.type(),
        text: msg.text(),
        url: this.page.url(),
        timestamp: Date.now(),
      };
      this.allConsoleErrors.push(entry);
      if (msg.type() === 'error') {
        console.log(`  [CONSOLE:ERROR] ${this.page.url().slice(0, 60)} | ${msg.text().slice(0, 120)}`);
      }
    });
    this.page.on('pageerror', (err) => {
      this.allConsoleErrors.push({
        type: 'pageerror',
        text: err.message,
        url: this.page.url(),
        timestamp: Date.now(),
      });
      console.log(`  [PAGE_ERROR] ${err.message.slice(0, 120)}`);
    });
    this.page.on('response', (resp) => {
      if (resp.status() >= 400) {
        this.httpStatuses[resp.url()] = resp.status();
      }
    });
  }

  async login() {
    console.log(`\n[LOGIN] Authenticating as ${CREDS.email}...`);
    await this.page.goto('http://localhost:3000/login', { waitUntil: 'networkidle', timeout: 30000 });
    await this.page.waitForTimeout(1000);
    const emailInput = this.page.locator('input[type="email"], input[name="email"], input[type="text"]').first();
    const passInput = this.page.locator('input[type="password"]').first();
    const submitBtn = this.page.locator('button[type="submit"], button:has-text("Iniciar"), button:has-text("Ingresar")').first();
    
    await emailInput.fill(CREDS.email);
    await passInput.fill(CREDS.password);
    await submitBtn.click();
    await this.page.waitForTimeout(2000);
    
    const currentUrl = this.page.url();
    console.log(`[LOGIN] Post-login URL: ${currentUrl}`);
    
    if (currentUrl.includes('/login')) {
      console.log('[LOGIN] Still on login page - might need different selectors');
      const pageContent = await this.page.content();
      console.log(`[LOGIN] Page content (first 500 chars): ${pageContent.slice(0, 500)}`);
    }
    
    return currentUrl;
  }

  async auditRoute(route) {
    const result = {
      route,
      status: 'ok',
      statusCode: 200,
      consoleErrors: [],
      hasContent: false,
      hasLoadingState: false,
      hasErrorState: false,
      hasEmptyState: false,
      visibleHeadings: [],
      emptyStateText: [],
      ctaButtons: [],
      screenshotPath: '',
      notes: [],
      pageTitle: '',
      formFields: [],
      links: [],
      loadTime: 0,
    };

    console.log(`\n[AUDIT] ${route}`);
    const startTime = Date.now();

    try {
      const response = await this.page.goto(`http://localhost:3000${route}`, {
        waitUntil: 'networkidle',
        timeout: 20000,
      });
      result.loadTime = Date.now() - startTime;

      if (response) {
        result.statusCode = response.status();
        if (response.status() >= 400) {
          result.status = 'error';
          result.notes.push(`HTTP ${response.status()}`);
        } else if (response.status() >= 300) {
          result.status = 'redirect';
        }
      }
    } catch (err) {
      result.status = 'broken';
      result.notes.push(`Navigation error: ${err.message}`);
      result.screenshotPath = await this.takeScreenshot(route);
      this.results.push(result);
      return result;
    }

    await this.page.waitForTimeout(1500);

    // Capture page title
    result.pageTitle = await this.page.title();

    // Capture console errors for this route
    const routeErrors = this.allConsoleErrors.filter(e => e.url.includes(route));
    result.consoleErrors = routeErrors.map(e => `[${e.type}] ${e.text}`);

    // Get visible headings
    const headings = this.page.locator('h1, h2, h3');
    for (let i = 0; i < Math.min(await headings.count(), 15); i++) {
      const text = (await headings.nth(i).textContent() || '').trim();
      if (text) result.visibleHeadings.push(text);
    }

    // Check loading states
    for (const p of LOADING_PATTERNS) {
      if (await this.page.locator(`text=${p.source}`).count() > 0) {
        result.hasLoadingState = true;
        result.notes.push(`Loading indicator: ${p.source}`);
        break;
      }
    }

    // Check error states
    for (const p of ERROR_PATTERNS) {
      if (await this.page.locator(`text=${p.source}`).count() > 0) {
        result.hasErrorState = true;
        result.notes.push(`Error indicator: ${p.source}`);
        break;
      }
    }

    // Check empty states
    for (const p of EMPTY_PATTERNS) {
      const count = await this.page.locator(`text=${p.source}`).count();
      if (count > 0) {
        result.hasEmptyState = true;
        result.emptyStateText.push(p.source);
      }
    }

    // Get CTAs
    const buttons = this.page.locator('button, a[role="button"], a[class*="btn"]');
    for (let i = 0; i < Math.min(await buttons.count(), 8); i++) {
      const text = (await buttons.nth(i).textContent() || '').trim();
      if (text && text.length < 50) result.ctaButtons.push(text);
    }

    // Count form fields
    result.formFields = await this.page.locator('input, select, textarea').count();
    
    // Count links
    result.links = await this.page.locator('a[href]').count();

    result.hasContent = result.visibleHeadings.length > 0;

    if (!result.hasContent) {
      result.notes.push('No visible headings found');
    }

    result.screenshotPath = await this.takeScreenshot(route);

    // Check for 404 React component
    const bodyText = await this.page.locator('body').textContent();
    if (bodyText && (bodyText.includes('404') || bodyText.includes('Esta página no existe'))) {
      result.notes.push('Page shows 404 content');
    }

    this.results.push(result);
    this.printRouteResult(result);
    return result;
  }

  async takeScreenshot(route) {
    const sanitized = route.replace(/\//g, '_').replace(/^_/, '') || 'index';
    const filename = `audit_${sanitized}.png`;
    const filepath = path.join(SCREENSHOT_DIR, filename);
    try {
      await this.page.screenshot({ path: filepath, fullPage: true });
    } catch (e) {
      await this.page.screenshot({ path: filepath });
    }
    return filepath;
  }

  printRouteResult(r) {
    const icon = r.status === 'ok' ? '✅' : r.status === 'error' ? '🔴' : r.status === 'redirect' ? '🟡' : '⚫';
    console.log(`  ${icon} ${r.route} (${r.statusCode}) ${r.loadTime}ms ${r.visibleHeadings.slice(0, 2).join(' | ')}`);
    if (r.consoleErrors.length > 0) console.log(`     ⚠ ${r.consoleErrors.length} console errors`);
    if (r.hasErrorState) console.log(`     🔴 Error state detected`);
    if (r.hasEmptyState) console.log(`     📭 Empty state: ${r.emptyStateText.join(', ')}`);
  }

  async testFormFill() {
    console.log(`\n═══════════════════════════════════════`);
    console.log(`  FORM FILLING TESTS`);
    console.log(`═══════════════════════════════════════`);

    // Try filling work-requests/new
    console.log(`\n[FORM] /work-requests/new`);
    try {
      await this.page.goto('http://localhost:3000/work-requests/new', { waitUntil: 'networkidle', timeout: 15000 });
      await this.page.waitForTimeout(2000);
      
      const inputs = await this.page.locator('input, select, textarea').all();
      console.log(`  Found ${inputs.length} form fields`);
      
      for (const input of inputs) {
        const type = await input.getAttribute('type');
        const name = await input.getAttribute('name');
        const placeholder = await input.getAttribute('placeholder');
        const id = await input.getAttribute('id');
        const label = await input.getAttribute('aria-label');
        console.log(`  Field: ${type || '?'} name="${name || ''}" placeholder="${placeholder || ''}" label="${label || ''}" id="${id || ''}"`);
        
        // Try filling required fields
        if (type === 'text' || type === 'email' || !type) {
          try {
            if (placeholder && placeholder.toLowerCase().includes('cliente')) {
              await input.fill('Chevron Colombia S.A.S.');
            } else if (label && label.toLowerCase().includes('asunto')) {
              await input.fill('Testing automático Playwright');
            } else if (name && name.includes('subject')) {
              await input.fill('Testing automático Playwright');
            }
          } catch (e) {}
        }
      }
      
      // Take a screenshot of the form
      await this.page.screenshot({ path: path.join(SCREENSHOT_DIR, 'form_work-request-new.png'), fullPage: true });
      console.log(`  Form screenshot saved`);
    } catch (e) {
      console.log(`  [ERROR] Form fill failed: ${e.message}`);
    }
  }

  async auditWorkflow() {
    console.log(`\n═══════════════════════════════════════`);
    console.log(`  14-STEP WORKFLOW AUDIT`);
    console.log(`═══════════════════════════════════════`);

    for (const ws of WORKFLOW_STEPS) {
      const result = {
        step: ws.step,
        route: ws.route,
        accessible: false,
        statusCode: 0,
        notes: [],
      };

      try {
        const resp = await this.page.goto(`http://localhost:3000${ws.route}`, {
          waitUntil: 'networkidle',
          timeout: 15000,
        });
        await this.page.waitForTimeout(1000);
        if (resp) {
          result.statusCode = resp.status();
          result.accessible = resp.status() < 400;
        }
        const h = await this.page.locator('h1, h2').first().textContent();
        if (h) result.notes.push(`Heading: ${h.trim().slice(0, 60)}`);
        
        // Check if it has actual data
        const hasData = await this.page.locator('table, [class*="list"], [class*="grid"], [class*="card"]').count() > 0;
        if (hasData) result.notes.push('Has data/records view');
        else result.notes.push('No records/lists detected');
      } catch (e) {
        result.notes.push(`Error: ${e.message}`);
      }

      this.workflowResults.push(result);
      console.log(`  ${result.accessible ? '✅' : '❌'} ${ws.step.padEnd(25)} ${result.notes.join(', ')}`);
    }
  }

  async checkConsoleErrors() {
    console.log(`\n═══════════════════════════════════════`);
    console.log(`  CONSOLE ERROR ANALYSIS`);
    console.log(`═══════════════════════════════════════`);
    
    const errors = this.allConsoleErrors.filter(e => e.type === 'error' || e.type === 'pageerror');
    const warnings = this.allConsoleErrors.filter(e => e.type === 'warning');
    
    console.log(`  Total errors: ${errors.length}`);
    console.log(`  Total warnings: ${warnings.length}`);
    
    // Unique error dedup
    const uniqueErrors = [...new Set(errors.map(e => e.text))];
    for (const err of uniqueErrors.slice(0, 20)) {
      console.log(`  🔴 ${err.slice(0, 150)}`);
    }
    
    fs.writeFileSync(CONSOLE_LOG_PATH, JSON.stringify(this.allConsoleErrors, null, 2));
    console.log(`\n  Full console log saved to: ${CONSOLE_LOG_PATH}`);
  }

  async run() {
    console.log(`\n═══════════════════════════════════════`);
    console.log(`  CERMONT COMPREHENSIVE AUDIT`);
    console.log(`  Started: ${new Date().toISOString()}`);
    console.log(`═══════════════════════════════════════\n`);

    await this.init();
    await this.login();
    
    // Audit all routes
    for (const route of ROUTES) {
      await this.auditRoute(route);
    }

    // Test form filling
    await this.testFormFill();

    // Audit workflow
    await this.auditWorkflow();

    // Check console errors
    await this.checkConsoleErrors();

    // Generate report
    await this.generateReport();

    await this.browser.close();
    console.log(`\n[DONE] Audit complete at ${new Date().toISOString()}`);
  }

  async generateReport() {
    const summary = {
      total: this.results.length,
      ok: this.results.filter(r => r.status === 'ok').length,
      error: this.results.filter(r => r.status === 'error').length,
      redirect: this.results.filter(r => r.status === 'redirect').length,
      broken: this.results.filter(r => r.status === 'broken').length,
      totalConsoleErrors: this.allConsoleErrors.filter(e => e.type === 'error' || e.type === 'pageerror').length,
      routesWithErrors: this.results.filter(r => r.consoleErrors.length > 0).map(r => r.route),
      avgLoadTime: Math.round(this.results.reduce((a, r) => a + r.loadTime, 0) / this.results.length),
    };

    const report = {
      startedAt: new Date().toISOString(),
      finishedAt: new Date().toISOString(),
      user: CREDS.email,
      summary,
      httpErrors: Object.entries(this.httpStatuses).slice(0, 30),
      routes: this.results,
      workflow: this.workflowResults,
      consoleErrors: this.allConsoleErrors,
    };

    fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));

    console.log(`\n═══════════════════════════════════════`);
    console.log(`  AUDIT SUMMARY`);
    console.log(`═══════════════════════════════════════`);
    console.log(`  Total routes:        ${summary.total}`);
    console.log(`  OK:                  ${summary.ok}`);
    console.log(`  Errors (4xx/5xx):    ${summary.error}`);
    console.log(`  Redirects:           ${summary.redirect}`);
    console.log(`  Broken:              ${summary.broken}`);
    console.log(`  Console errors:      ${summary.totalConsoleErrors}`);
    console.log(`  Avg load time:       ${summary.avgLoadTime}ms`);
    console.log(`  Routes with errors:  ${summary.routesWithErrors.length}`);
    console.log(`  Workflow accessible: ${this.workflowResults.filter(w => w.accessible).length}/${this.workflowResults.length}`);
    console.log(`  Report:              ${REPORT_PATH}`);
    console.log(`═══════════════════════════════════════\n`);
  }
}

// Override internal console.log writing
if (require.main === module) {
  new AuditSuite().run().catch(e => {
    console.error('[FATAL]', e);
    process.exit(1);
  });
}
