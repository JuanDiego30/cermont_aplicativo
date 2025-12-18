/**
 * ARCHIVO: auth.spec.ts
 * FUNCION: Tests E2E para flujo de autenticación
 * IMPLEMENTACION: Basado en vercel/examples/testing/playwright
 */
import { test, expect } from '@playwright/test';

test.describe('Autenticación', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('debe mostrar página de login', async ({ page }) => {
    // Debería redirigir a login si no está autenticado
    await expect(page).toHaveURL(/signin|login/);
  });

  test('debe mostrar formulario de login', async ({ page }) => {
    // Esperar a que cargue el formulario
    const emailInput = page.getByLabel(/correo|email/i);
    const passwordInput = page.getByLabel(/contraseña|password/i);
    const submitButton = page.getByRole('button', { name: /iniciar|login|entrar/i });

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitButton).toBeVisible();
  });

  test('debe mostrar error con credenciales inválidas', async ({ page }) => {
    await page.goto('/signin');
    
    await page.fill('[name="email"], [type="email"]', 'invalid@test.com');
    await page.fill('[name="password"], [type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    // Esperar mensaje de error
    const errorMessage = page.getByText(/inválido|incorrect|error/i);
    await expect(errorMessage).toBeVisible({ timeout: 10000 });
  });

  test('debe redirigir a dashboard después de login exitoso', async ({ page }) => {
    // Este test requiere credenciales válidas de prueba
    const testEmail = process.env.TEST_USER_EMAIL;
    const testPassword = process.env.TEST_USER_PASSWORD;

    if (!testEmail || !testPassword) {
      test.skip();
      return;
    }

    await page.goto('/signin');
    await page.fill('[name="email"], [type="email"]', testEmail);
    await page.fill('[name="password"], [type="password"]', testPassword);
    await page.click('button[type="submit"]');

    // Esperar redirección al dashboard
    await expect(page).toHaveURL(/dashboard/);
  });
});

test.describe('Navegación protegida', () => {
  test('debe redirigir rutas protegidas a login', async ({ page }) => {
    // Intentar acceder a rutas protegidas sin autenticación
    const rutasProtegidas = ['/dashboard', '/ordenes', '/clientes', '/tecnicos'];

    for (const ruta of rutasProtegidas) {
      await page.goto(ruta);
      await expect(page).toHaveURL(/signin|login/);
    }
  });
});

test.describe('Accesibilidad', () => {
  test('formulario de login debe ser accesible', async ({ page }) => {
    await page.goto('/signin');

    // Verificar que los inputs tengan labels asociados
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');

    // El input debe ser enfocable
    await emailInput.focus();
    await expect(emailInput).toBeFocused();

    // Tab debe mover el foco al password
    await page.keyboard.press('Tab');
    await expect(passwordInput).toBeFocused();
  });
});
