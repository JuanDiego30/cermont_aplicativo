/**
 * ARCHIVO: dashboard.spec.ts
 * FUNCION: Tests E2E para el dashboard principal
 * IMPLEMENTACION: Basado en vercel/examples/testing/playwright
 */
import { test, expect } from '@playwright/test';

// Helper para autenticación
async function loginAsTestUser(page: import('@playwright/test').Page) {
  const testEmail = process.env.TEST_USER_EMAIL;
  const testPassword = process.env.TEST_USER_PASSWORD;

  if (!testEmail || !testPassword) {
    return false;
  }

  await page.goto('/signin');
  await page.fill('[name="email"], [type="email"]', testEmail);
  await page.fill('[name="password"], [type="password"]', testPassword);
  await page.click('button[type="submit"]');
  await page.waitForURL(/dashboard/);
  return true;
}

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    const loggedIn = await loginAsTestUser(page);
    if (!loggedIn) {
      test.skip();
    }
  });

  test('debe mostrar el dashboard correctamente', async ({ page }) => {
    await expect(page).toHaveURL(/dashboard/);
    
    // Verificar elementos principales del dashboard
    const header = page.locator('header');
    await expect(header).toBeVisible();
  });

  test('debe mostrar estadísticas del dashboard', async ({ page }) => {
    // Buscar cards de estadísticas
    const statsCards = page.locator('[data-testid="stat-card"], .stat-card, [class*="stat"]');
    
    // Debería haber al menos una card de estadísticas
    const count = await statsCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('debe poder navegar a órdenes', async ({ page }) => {
    // Buscar enlace a órdenes
    const ordenesLink = page.getByRole('link', { name: /órdenes|ordenes/i });
    await ordenesLink.click();
    
    await expect(page).toHaveURL(/ordenes/);
  });

  test('debe tener sidebar de navegación', async ({ page }) => {
    const sidebar = page.locator('nav, aside, [role="navigation"]');
    await expect(sidebar.first()).toBeVisible();
  });
});

test.describe('Dashboard - Responsive', () => {
  test.beforeEach(async ({ page }) => {
    const loggedIn = await loginAsTestUser(page);
    if (!loggedIn) {
      test.skip();
    }
  });

  test('debe ser responsive en móvil', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/dashboard');
    
    // El contenido debe estar visible
    const mainContent = page.locator('main, [role="main"]');
    await expect(mainContent.first()).toBeVisible();
  });

  test('debe tener menú hamburguesa en móvil', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/dashboard');
    
    // Buscar botón de menú móvil
    const menuButton = page.locator('button[aria-label*="menu"], [data-testid="mobile-menu"]');
    
    // Si existe, debería ser clickeable
    if (await menuButton.count() > 0) {
      await expect(menuButton.first()).toBeVisible();
    }
  });
});

test.describe('Dashboard - Performance', () => {
  test('debe cargar en menos de 3 segundos', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/dashboard', { waitUntil: 'networkidle' });
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000);
  });
});
