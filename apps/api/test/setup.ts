/**
 * @file Test Setup
 *
 * Configuración global para tests e2e.
 * Inspirado en samchon/backend: reset de DB antes de cada suite.
 */
import { execSync } from 'child_process';

// Aumentar timeout para operaciones de DB
jest.setTimeout(30000);

/**
 * Hook global antes de todos los tests
 * Resetea la base de datos de prueba
 */
beforeAll(async () => {
    // Solo si estamos en entorno de test
    if (process.env.NODE_ENV !== 'test') {
        console.warn('⚠️ Tests should run with NODE_ENV=test');
    }

    console.log('🔄 Resetting test database...');

    const testDatabaseUrl = process.env.TEST_DATABASE_URL;
    if (!testDatabaseUrl) {
        console.warn('⚠️ TEST_DATABASE_URL no está configurada; se omite el reset de DB (unit tests).');
        return;
    }
    
    try {
        // Resetear DB con Prisma
        execSync('npx prisma migrate reset --force --skip-seed', {
            stdio: 'pipe',
            env: {
                ...process.env,
                DATABASE_URL: testDatabaseUrl,
            },
        });
        
        console.log('✅ Test database reset complete');
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.warn('⚠️ Failed to reset test database (continuando):', message);
        // No fallar si la DB ya está limpia
    }
});

/**
 * Hook global después de todos los tests
 */
afterAll(async () => {
    console.log('🧹 Test cleanup complete');
});

/**
 * Helpers globales para tests
 */
declare global {
    namespace NodeJS {
        interface Global {
            testHelpers: {
                generateEmail: () => string;
                generatePassword: () => string;
            };
        }
    }
}

// Helpers de utilidad
(global as any).testHelpers = {
    generateEmail: () => `test-${Date.now()}@cermont.test`,
    generatePassword: () => `TestPass${Date.now()}!`,
};
