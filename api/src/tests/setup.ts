// 📁 api/src/tests/setup.ts

import { beforeAll, afterAll, beforeEach } from 'vitest';
import { prisma } from '../config/database';

beforeAll(async () => {
  console.log('🧪 Iniciando tests...');
});

beforeEach(async () => {
  // Limpiar BD antes de cada test
  // Use try-catch to avoid errors if tables don't exist yet/are empty
  // try {
  //   await prisma.$executeRawUnsafe('DELETE FROM audit_logs;');
  //   await prisma.$executeRawUnsafe('DELETE FROM refresh_tokens;');
  //   await prisma.$executeRawUnsafe('DELETE FROM users;');
  // } catch (error) {
  //   console.warn("Could not clean database tables, they might not exist yet.");
  // }
});

afterAll(async () => {
  await prisma.$disconnect();
  console.log('✅ Tests completados');
});
