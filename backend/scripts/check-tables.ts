
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Verificando tablas...');
    const userCount = await prisma.user.count();
    console.log('Usuarios:', userCount);

    const tokenCount = await prisma.refreshToken.count();
    console.log('RefreshTokens:', tokenCount);

    const auditCount = await prisma.auditLog.count();
    console.log('AuditLogs:', auditCount);
    
    console.log('Tablas verificadas correctamente.');
  } catch (error) {
    console.error('Error verificando tablas:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
