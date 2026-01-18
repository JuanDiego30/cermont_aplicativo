/// <reference types="node" />
import { defineConfig, devices } from '@playwright/test';

/**
 * Configuración de Playwright para pruebas E2E
 *
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests/e2e',

  // Timeout para cada test
  timeout: 30 * 1000,

  // Número de reintentos
  retries: process.env.CI ? 2 : 0,

  // Número de workers
  workers: process.env.CI ? 1 : undefined,

  // Reporter
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'playwright-results.json' }],
  ],

  // Configuración compartida
  use: {
    // Base URL
    baseURL: 'http://localhost:4200',

    // Screenshot on failure
    screenshot: 'only-on-failure',

    // Video on failure
    video: 'retain-on-failure',

    // Trace on first retry
    trace: 'on-first-retry',
  },

  // Proyectos para diferentes navegadores
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    // Mobile
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],

  // Servidor de desarrollo
  webServer: [
    {
      command: 'pnpm --filter @cermont/backend dev',
      port: 3000,
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    },
    {
      command: 'pnpm --filter @cermont/frontend dev',
      port: 4200,
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    },
  ],
});
