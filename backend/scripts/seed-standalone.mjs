#!/usr/bin/env node
// backend/scripts/seed-standalone.js
// Este script seedea la BD sin depender de npm workspaces

import('dotenv/config').then(async () => {
  const { PrismaClient } = await import('@prisma/client');
  const bcrypt = await import('bcrypt');
  
  const prisma = new PrismaClient();

  const SYSTEM_USER_ID = 'clw1h91q00000e8j8z8z8z8z8';

  async function main() {
    console.log('?? Iniciando seed de base de datos SQLite...');

    const users = [
      {
        id: SYSTEM_USER_ID,
        email: 'system@cermont.com',
        password: await bcrypt.default.hash('SystemOnly!1', 10),
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
        password: await bcrypt.default.hash('Root123!', 10),
        name: 'Root Administrator',
        role: 'ROOT',
        mfaEnabled: false,
        passwordHistory: JSON.stringify([]),
        passwordExpiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        lastPasswordChange: new Date(),
        active: true,
        loginAttempts: 0,
      },
      {
        email: 'admin@cermont.com',
        password: await bcrypt.default.hash('Admin123!', 10),
        name: 'System Administrator',
        role: 'ADMIN',
        mfaEnabled: false,
        passwordHistory: JSON.stringify([]),
        passwordExpiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        lastPasswordChange: new Date(),
        active: true,
        loginAttempts: 0,
      },
      {
        email: 'coordinador@cermont.com',
        password: await bcrypt.default.hash('Coord123!', 10),
        name: 'Coordinador de Pruebas',
        role: 'COORDINADOR',
        mfaEnabled: false,
        passwordHistory: JSON.stringify([]),
        passwordExpiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        lastPasswordChange: new Date(),
        active: true,
        loginAttempts: 0,
      },
      {
        email: 'test@cermont.com',
        password: await bcrypt.default.hash('Test1234!', 10),
        name: 'Test User',
        role: 'OPERARIO',
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
        console.log(`? Usuario creado: ${user.email}`);
      } else {
        console.log(`??  Usuario ya existe: ${user.email}`);
      }
    }

    console.log('?? Seed completado exitosamente');
    console.log('\n?? Usuarios disponibles para login:');
    users.forEach(user => {
      console.log(`   ?? ${user.email}`);
    });
    
    await prisma.$disconnect();
  }

  main().catch((e) => {
    console.error('? Error en seed:', e);
    process.exit(1);
  });
});
