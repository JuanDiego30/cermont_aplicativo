// 📁 api/src/tests/setup.ts

// Configurar variables de entorno para tests ANTES de importar otros módulos
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-for-vitest-minimum-32-characters';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'test-refresh-secret-for-vitest-minimum-32-chars';
process.env.NODE_ENV = 'test';

import { beforeAll, afterAll } from 'vitest';

let prismaClient: any;

beforeAll(async () => {
  console.log('🧪 Iniciando tests...');
  // Importar prisma de forma lazy para que tome las variables de entorno
  try {
    const db = await import('../config/database');
    prismaClient = db.prisma;
  } catch {
    console.log('⚠️ No se pudo conectar a la base de datos, algunos tests pueden fallar');
  }
});

afterAll(async () => {
  if (prismaClient) {
    try {
      await prismaClient.$disconnect();
    } catch {
      // Ignorar errores de desconexión
    }
  }
  console.log('✅ Tests completados');
});
