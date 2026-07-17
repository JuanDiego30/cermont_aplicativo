const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE = 'http://localhost:3000';
const OUT = path.resolve(__dirname, '../test-results/wr-debug');

async function run() {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
  await page.locator('#email').fill('gerencia@cermont.co');
  await page.locator('#password').fill('Cermont2026!Dev01');
  await page.locator('button[type="submit"]').click();
  await page.waitForTimeout(2000);

  await page.goto(`${BASE}/work-requests/new`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  // Analyze the form
  const formAnalysis = await page.evaluate(() => {
    const forms = document.querySelectorAll('form');
    const results = [];
    forms.forEach((form, idx) => {
      const submitBtns = Array.from(form.querySelectorAll('button[type="submit"]')).filter(b => b.textContent?.includes('Crear'));
      const inputs = Array.from(form.querySelectorAll('input, select, textarea')).map(i => ({
        id: i.id,
        name: i.getAttribute('name'),
        type: i.getAttribute('type'),
        required: i.hasAttribute('required'),
        value: i.value,
        valid: i.checkValidity(),
        validationMessage: i.validationMessage,
      }));
      results.push({
        formIdx: idx,
        action: form.getAttribute('action'),
        method: form.getAttribute('method'),
        novalidate: form.hasAttribute('novalidate'),
        submitButtons: submitBtns.length,
        inputsCount: inputs.length,
        inputs,
      });
    });
    return results;
  });

  console.log('=== FORM ANALYSIS ===');
  for (const f of formAnalysis) {
    console.log(`\nForm ${f.formIdx}: action="${f.action}" method="${f.method}" novalidate=${f.novalidate} submitBtns=${f.submitButtons} inputs=${f.inputsCount}`);
    for (const inp of f.inputs) {
      const validIcon = inp.valid ? '✅' : '🔴';
      console.log(`  ${validIcon} id="${inp.id}" type="${inp.type}" required=${inp.required} val="${inp.value.substring(0, 40)}" msg="${inp.validationMessage}"`);
    }
  }

  // Fill the form with proper values and track events
  await page.locator('#clientName').fill('Ecopetrol S.A.S.');
  await page.locator('#requesterName').fill('Carlos Prueba');
  await page.locator('#requesterEmail').fill('carlos@test.com');
  await page.locator('#requesterPhone').fill('3101112233');
  await page.locator('#serviceSite').fill('Sitio de prueba automatizada');
  await page.locator('#shortDescription').fill('Prueba automatizada');
  
  // Check validation state after fill
  const postFill = await page.evaluate(() => {
    const form = document.querySelector('form');
    if (!form) return { error: 'No form' };
    const inputs = Array.from(form.querySelectorAll('input, select, textarea'));
    return inputs.map(i => ({
      id: i.id,
      required: i.hasAttribute('required'),
      value: i.value.substring(0, 40),
      valid: i.checkValidity(),
      validationMessage: i.validationMessage,
    }));
  });

  console.log('\n=== POST-FILL VALIDATION ===');
  for (const inp of postFill) {
    const icon = inp.valid ? '✅' : '🔴';
    console.log(`  ${icon} id="${inp.id}" required=${inp.required} val="${inp.value}" msg="${inp.validationMessage}"`);
  }

  // Now listen for ALL requests and console errors, then click submit
  console.log('\n=== CLICKING SUBMIT WITH NETWORK TRACE ===');
  
  const requests = [];
  page.on('request', req => {
    if (req.url().includes('/api/')) {
      requests.push({ url: req.url().replace(BASE, ''), method: req.method(), headers: req.headers(), postData: req.postData()?.substring(0, 500) });
    }
  });
  page.on('console', msg => {
    if (msg.type() === 'error') requests.push({ type: 'error', text: msg.text().substring(0, 200) });
  });
  page.on('pageerror', err => {
    requests.push({ type: 'pageerror', text: err.message?.substring(0, 200) });
  });

  // Try different ways to submit
  // Method 1: Click button
  console.log('\n  Method 1: Click "Crear solicitud" button');
  const createBtn = page.locator('button:has-text("Crear solicitud")').first();
  console.log(`  Button exists: ${await createBtn.count() > 0}`);
  console.log(`  Button visible: ${await createBtn.isVisible()}`);
  console.log(`  Button enabled: ${await createBtn.isEnabled()}`);
  
  if (await createBtn.count() > 0) {
    // Dispatch a native click
    await createBtn.dispatchEvent('click');
    await page.waitForTimeout(3000);
  }

  // Method 2: Try form submit directly
  console.log('\n  Method 2: Programmatic form submit');
  const formSubmitResult = await page.evaluate(() => {
    const form = document.querySelector('form');
    if (!form) return 'No form';
    const submitEvent = new Event('submit', { cancelable: true });
    const prevented = !form.dispatchEvent(submitEvent);
    return { prevented, action: form.action, method: form.method };
  });
  console.log(`  Form submit prevented: ${formSubmitResult?.prevented}`);

  await page.waitForTimeout(2000);

  // Method 3: Check for any validation errors
  console.log('\n  Method 3: Check for visible errors after click');
  const errors = await page.locator('[role="alert"], [class*="error"], [class*="Error"]').all();
  for (const e of errors) {
    const text = (await e.textContent() || '').trim();
    if (text) console.log(`    Error element: "${text.substring(0, 100)}"`);
  }

  // Check URL
  console.log(`\n  URL after attempts: ${page.url()}`);
  
  // Check if any modal/popup appeared  
  const modals = await page.locator('[class*="modal"], [class*="dialog"], [class*="Modal"], [class*="Dialog"], [role="dialog"]').all();
  console.log(`  Modals/dialogs: ${modals.length}`);
  for (const m of modals) {
    const text = (await m.textContent() || '').trim().substring(0, 150);
    if (text) console.log(`    "${text}"`);
  }

  console.log('\n=== REQUEST LOG ===');
  for (const r of requests) {
    if (r.type) console.log(`  ${r.type}: ${r.text}`);
    else console.log(`  ${r.method} ${r.url}`);
  }

  // Screenshot
  await page.screenshot({ path: `${OUT}/after-submit-attempts.png`, fullPage: true });
  
  await browser.close();
}

run().catch(e => { console.error(e); process.exit(1); });
