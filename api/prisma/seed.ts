import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Crear usuario admin de prueba
  const adminEmail = 'root@cermont.com';
  const adminPassword = 'admin123456'; // Cambiar en producción

  try {
    // Verificar si ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existingUser) {
      console.log(`✓ Usuario ${adminEmail} ya existe`);
    } else {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);

      const admin = await prisma.user.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          name: 'Administrador',
          role: 'admin',
          phone: '+57 3001234567',
          isActive: true,
        },
      });

      console.log(`✓ Usuario admin creado:`, {
        id: admin.id,
        email: admin.email,
        name: admin.name,
      });
    }

    // Crear usuario técnico de prueba
    const tecnicoEmail = 'tecnico@cermont.com';
    const tecnicoPassword = 'tecnico123456';

    const existingTecnico = await prisma.user.findUnique({
      where: { email: tecnicoEmail },
    });

    if (!existingTecnico) {
      const hashedPassword = await bcrypt.hash(tecnicoPassword, 10);

      const tecnico = await prisma.user.create({
        data: {
          email: tecnicoEmail,
          password: hashedPassword,
          name: 'Técnico de Prueba',
          role: 'tecnico',
          phone: '+57 3007654321',
          isActive: true,
        },
      });

      console.log(`✓ Usuario técnico creado:`, {
        id: tecnico.id,
        email: tecnico.email,
        name: tecnico.name,
      });
    } else {
      console.log(`✓ Usuario ${tecnicoEmail} ya existe`);
    }

    console.log('✅ Seed completado exitosamente');
  } catch (error) {
    console.error('❌ Error durante el seed:', error);
    throw error;
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
