/**
 * ARCHIVO: playwright.config.ts
 * FUNCION: Configuración de Playwright para testing E2E
 * IMPLEMENTACION: Basado en vercel/examples/testing/playwright
 * FEATURES: Múltiples navegadores, screenshots en errores, videos, server dev
 */
import { defineConfig, devices } from '@playwright/test';

/**
 * Lee variables de entorno de archivo .env si existe
 */
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

/**
 * URL base para pruebas
 */
const baseURL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';

export default defineConfig({
  /* Directorio de tests */
  testDir: './tests/e2e',
  
  /* Patrón de archivos de test */
  testMatch: '**/*.spec.ts',
  
  /* Timeout máximo para cada test */
  timeout: 30 * 1000,
  
  /* Timeout para expect */
  expect: {
    timeout: 5000,
  },
  
  /* Ejecutar tests en paralelo */
  fullyParallel: true,
  
  /* Fallar el build si dejaste test.only en el código */
  forbidOnly: !!process.env.CI,
  
  /* Reintentos en CI */
  retries: process.env.CI ? 2 : 0,
  
  /* Workers paralelos */
  workers: process.env.CI ? 1 : undefined,
  
  /* Reporter de resultados */
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'playwright-report/results.json' }],
    ['list'],
  ],
  
  /* Configuración compartida para todos los proyectos */
  use: {
    /* URL base para page.goto('/') */
    baseURL,
    
    /* Recolectar trace en primer reintento de test fallido */
    trace: 'on-first-retry',
    
    /* Screenshot en caso de error */
    screenshot: 'only-on-failure',
    
    /* Video en caso de error */
    video: 'on-first-retry',
    
    /* Headers extra para identificar tests */
    extraHTTPHeaders: {
      'x-playwright-test': 'true',
    },
  },

  /* Configurar proyectos para diferentes navegadores */
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

    /* Test en dispositivos móviles */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  /* Iniciar servidor de desarrollo antes de los tests */
  webServer: {
    command: 'pnpm dev',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
  
  /* Directorio de outputs */
  outputDir: 'test-results/',
});
