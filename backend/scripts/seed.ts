import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { SYSTEM_USER_ID } from '../src/shared/constants/system.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de base de datos SQLite...');

  // Usuarios de ejemplo
  const users = [
    {
      id: SYSTEM_USER_ID,
      email: 'system@cermont.com',
      password: await bcrypt.hash('SystemOnly!1', 10),
      name: 'Sistema',
      role: 'SYSTEM',
      mfaEnabled: false,
      passwordHistory: JSON.stringify([]),
      passwordExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      lastPasswordChange: new Date(),
      active: true,
      loginAttempts: 0,
    },
    {
      email: 'root@cermont.com',
      password: await bcrypt.hash('Root123!', 10),
      name: 'Root Administrator',
      role: 'ROOT',
      mfaEnabled: false,
      passwordHistory: JSON.stringify([]),
      passwordExpiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      lastPasswordChange: new Date(),
      active: true,
      loginAttempts: 0,
    },
  ];

  for (const user of users) {
    const exists = await prisma.user.findUnique({ where: { email: user.email } });
    if (!exists) {
      await prisma.user.create({ data: user });
      console.log(`✅ Usuario creado: ${user.email}`);
    } else {
      console.log(`⚠️  Usuario ya existe: ${user.email}`);
    }
  }

  console.log('🎉 Seed completado exitosamente');
  console.log('\n📋 Usuarios disponibles para login:');
  users.forEach(user => {
    console.log(`   📧 ${user.email}`);
  });

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error('❌ Error en seed:', e);
  process.exit(1);
});
