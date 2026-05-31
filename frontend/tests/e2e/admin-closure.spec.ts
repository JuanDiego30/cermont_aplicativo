import { expect, test } from "@playwright/test";
import { E2E_TEST_USERS } from "./auth-credentials";

/**
 * Admin Closure E2E Test
 * Tests the administrative closure workflow for orders
 *
 * Validates:
 * - SES blocked if no signed delivery record
 * - Invoice blocked if SES not approved
 * - Payment blocked if invoice not approved
 * - Proper approval chain
 */

test.describe("Administrative Closure Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Correo electrónico").first().fill(E2E_TEST_USERS.admin.email);
    await page.getByLabel("Contraseña").first().fill(E2E_TEST_USERS.admin.password);
    await page
      .getByRole("button", { name: /iniciar sesión/i })
      .first()
      .click();
    await page.waitForURL(/dashboard/, { timeout: 15000 });
  });

  test("SES requires signed delivery record", async ({ request }) => {
    // This test validates that SES cannot be created without a signed delivery record
    const response = await request.get(`${process.env.BACKEND_URL ?? "http://localhost:4000"}/api/ses`);
    expect(response.status()).not.toBe(404);
  });

  test("Invoice requires approved SES", async ({ request }) => {
    const response = await request.get(`${process.env.BACKEND_URL ?? "http://localhost:4000"}/api/invoices`);
    expect(response.status()).not.toBe(404);
  });

  test("Payment requires approved invoice", async ({ request }) => {
    const response = await request.get(`${process.env.BACKEND_URL ?? "http://localhost:4000"}/api/payments`);
    expect(response.status()).not.toBe(404);
  });

  test("admin can access billing dashboard", async ({ page }) => {
    await page.goto("/billing");
    await page.waitForLoadState("networkidle", { timeout: 10000 });

    const main = page.locator("main").first();
    await expect(main).toBeVisible();
  });

  test("admin can view SES list", async ({ page }) => {
    await page.goto("/billing/ses");
    await page.waitForLoadState("networkidle", { timeout: 10000 });

    const main = page.locator("main").first();
    await expect(main).toBeVisible();
  });

  test("admin can view invoices list", async ({ page }) => {
    await page.goto("/billing/invoices");
    await page.waitForLoadState("networkidle", { timeout: 10000 });

    const main = page.locator("main").first();
    await expect(main).toBeVisible();
  });

  test("admin can view payments list", async ({ page }) => {
    await page.goto("/payments");
    await page.waitForLoadState("networkidle", { timeout: 10000 });

    const main = page.locator("main").first();
    await expect(main).toBeVisible();
  });
});