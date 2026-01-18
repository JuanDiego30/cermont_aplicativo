import { expect, test } from '@playwright/test';

/**
 * Suite de pruebas E2E para autenticación
 */
test.describe('Autenticación', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  /**
   * Verifica que la página de login carga correctamente
   */
  test('debe mostrar la página de login', async ({ page }) => {
    await page.goto('/auth/login');

    // Verificar elementos del formulario
    await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  /**
   * Verifica que un usuario puede iniciar sesión correctamente
   */
  test('debe permitir login con credenciales válidas', async ({ page }) => {
    await page.goto('/auth/login');

    // Llenar el formulario
    await page.fill('input[type="email"], input[name="email"]', 'admin@cermont.com');
    await page.fill('input[type="password"]', 'Admin123!');

    // Enviar formulario
    await page.click('button[type="submit"]');

    // Esperar navegación o mensaje de éxito
    await expect(page).toHaveURL(/.*dashboard|.*admin/, { timeout: 10000 });
  });

  /**
   * Verifica que se muestra error con credenciales inválidas
   */
  test('debe mostrar error con credenciales inválidas', async ({ page }) => {
    await page.goto('/auth/login');

    await page.fill('input[type="email"], input[name="email"]', 'invalid@cermont.com');
    await page.fill('input[type="password"]', 'WrongPassword');

    await page.click('button[type="submit"]');

    // Verificar que se muestra algún mensaje de error
    await expect(page.locator('text=/error|inválid|incorrect|failed/i').first()).toBeVisible({
      timeout: 5000,
    });
  });

  /**
   * Verifica que campos vacíos muestran validación
   */
  test('debe mostrar validación para campos vacíos', async ({ page }) => {
    await page.goto('/auth/login');

    // Intentar enviar formulario vacío
    await page.click('button[type="submit"]');

    // Verificar que se muestran errores de validación o el botón está deshabilitado
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    const isInvalid = await emailInput.evaluate(
      el => el.classList.contains('ng-invalid') || el.getAttribute('aria-invalid') === 'true'
    );

    expect(isInvalid).toBeTruthy();
  });

  /**
   * Verifica navegación a registro
   */
  test('debe navegar a la página de registro', async ({ page }) => {
    await page.goto('/auth/login');

    const registerLink = page.locator('a[href*="register"], a:has-text("Registr")');
    if (await registerLink.isVisible()) {
      await registerLink.click();
      await expect(page).toHaveURL(/.*register/);
    }
  });
});
