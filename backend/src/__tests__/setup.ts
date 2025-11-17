import prisma from '../infra/db/prisma.js';

// Setup global para tests
beforeAll(async () => {
  // Conectar Prisma
  try {
    await prisma.$connect();
  } catch (error) {
    console.error('Error conectando Prisma:', error);
  }
});

afterAll(async () => {
  // Limpiar y desconectar
  try {
    // Limpiar todas las tablas
    await prisma.user.deleteMany({});
    await prisma.refreshToken.deleteMany({});
  } catch (error) {
    console.error('Error limpiando datos:', error);
  }
  
  // Desconectar Prisma
  try {
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error desconectando Prisma:', error);
  }
});

// Aumentar timeout global
jest.setTimeout(30000);
