/**
 * @file Test Setup
 *
 * Configuración global para tests e2e.
 * Inspirado en samchon/backend: reset de DB antes de cada suite.
 */
import { execSync } from "child_process";

// Aumentar timeout para operaciones de DB
jest.setTimeout(30000);

/**
 * Hook global antes de todos los tests
 * Resetea la base de datos de prueba
 */
beforeAll(async () => {
  // Asegurar entorno de test sin producir output en consola
  process.env.NODE_ENV ||= "test";

  const testDatabaseUrl = process.env.TEST_DATABASE_URL;
  if (!testDatabaseUrl) {
    return;
  }

  try {
    // Resetear DB con Prisma
    execSync("npx prisma migrate reset --force --skip-seed", {
      stdio: "pipe",
      env: {
        ...process.env,
        DATABASE_URL: testDatabaseUrl,
      },
    });
  } catch (error) {
    // No fallar si la DB ya está limpia
  }
});

/**
 * Hook global después de todos los tests
 */
afterAll(async () => {});

/**
 * Helpers globales para tests
 */
declare global {
  // eslint-disable-next-line no-var
  var testHelpers: {
    generateEmail: () => string;
    generatePassword: () => string;
  };
}

// Helpers de utilidad
globalThis.testHelpers = {
  generateEmail: () => `test-${Date.now()}@cermont.test`,
  generatePassword: () => `TestPass${Date.now()}!`,
};
