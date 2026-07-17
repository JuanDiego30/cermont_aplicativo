const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);
  
  const html = await page.content();
  const formMatch = html.match(/<form[\s\S]*?<\/form>/);
  if (formMatch) {
    console.log('=== FORM HTML ===');
    console.log(formMatch[0].substring(0, 3000));
  }
  
  const inputs = await page.locator('input').all();
  console.log('\n=== INPUT FIELDS ===');
  for (const input of inputs) {
    const type = await input.getAttribute('type');
    const name = await input.getAttribute('name');
    const id = await input.getAttribute('id');
    const placeholder = await input.getAttribute('placeholder');
    const labelEl = id ? page.locator('label[for="' + id + '"]') : null;
    let labelText = '';
    if (labelEl && await labelEl.count() > 0) labelText = (await labelEl.textContent() || '').trim();
    console.log(JSON.stringify({ type, name, id, placeholder, label: labelText }));
  }
  
  const buttons = await page.locator('button').all();
  console.log('\n=== BUTTONS ===');
  for (const btn of buttons) {
    console.log(JSON.stringify({ text: (await btn.textContent() || '').trim(), type: await btn.getAttribute('type') }));
  }

  // Try login with various strategies
  console.log('\n=== TRYING LOGIN ===');
  
  // Strategy 1: Try filling by placeholder
  const emailInput = page.locator('input[type="email"], input[name="email"]').first();
  const passInput = page.locator('input[type="password"]').first();
  
  console.log('Email input exists:', await emailInput.count() > 0);
  console.log('Pass input exists:', await passInput.count() > 0);
  
  if (await emailInput.count() > 0) {
    await emailInput.fill('gerencia@cermont.co');
    await passInput.fill('Cermont2026!Dev01');
    
    // Find submit button
    const submitBtn = page.locator('button[type="submit"]').first();
    if (await submitBtn.count() > 0) {
      console.log('Submit button text:', await submitBtn.textContent());
      // Listen for response
      const [response] = await Promise.all([
        page.waitForResponse(r => r.url().includes('/api/') && r.status() !== 200, { timeout: 10000 }).catch(() => null),
        submitBtn.click(),
      ]);
      await page.waitForTimeout(3000);
      console.log('Post-login URL:', page.url());
      if (response) console.log('Login API response:', response.status(), response.url());
      
      // Check if login succeeded
      if (!page.url().includes('/login')) {
        console.log('LOGIN SUCCESSFUL!');
        const dashHtml = await page.content();
        console.log('Dashboard content (first 1000 chars):', dashHtml.substring(0, 1000));
      } else {
        console.log('Login FAILED - still on login page');
        // Check for error messages
        const errorText = await page.locator('[class*="error"], [class*="alert"], [role="alert"]').textContent();
        console.log('Error text:', errorText?.substring(0, 500));
      }
    }
  }
  
  await browser.close();
})();
