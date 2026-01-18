const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seed simple iniciando...');
  const hashedPassword = await bcrypt.hash('admin123456', 10);

  try {
    const admin = await prisma.user.upsert({
      where: { email: 'root@cermont.com' },
      update: { password: hashedPassword },
      create: {
        email: 'root@cermont.com',
        password: hashedPassword,
        name: 'Administrador',
        role: 'admin',
        phone: '+57 3001234567',
        isActive: true,
      },
    });
    console.log('Admin user ready:', admin.email);

    const tecnico = await prisma.user.upsert({
      where: { email: 'tecnico@cermont.com' },
      update: { password: await bcrypt.hash('tecnico123456', 10) },
      create: {
        email: 'tecnico@cermont.com',
        password: await bcrypt.hash('tecnico123456', 10),
        name: 'Tecnico Test',
        role: 'tecnico',
        isActive: true,
      },
    });
    console.log('Tecnico user ready:', tecnico.email);
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
