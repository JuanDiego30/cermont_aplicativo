import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcryptjs';
import { Pool } from 'pg';
import { PrismaClient, UserRole } from '../backend/prisma/generated/prisma/client';

// Crear pool de conexión con el adaptador
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function seedTestUser() {
  console.log('🌱 Creando usuario de prueba...');

  try {
    // Hashear contraseña de prueba
    const passwordRaw = process.env.SEED_TEST_PASSWORD ?? 'admin123';
    const hashedPassword = await bcrypt.hash(passwordRaw, 12);

    // Crear o actualizar usuario de prueba
    const testUser = await prisma.user.upsert({
      where: { email: 'admin@cermont.com' },
      update: {
        password: hashedPassword,
        active: true,
      },
      create: {
        email: 'admin@cermont.com',
        password: hashedPassword,
        name: 'Admin Cermont',
        role: 'admin' as UserRole,
        active: true,
        authProvider: 'local',
        emailVerified: true,
      },
    });

    console.log('');
    console.log('✅ Usuario de prueba creado/actualizado exitosamente!');
    console.log('');
    console.log('📋 Credenciales de acceso:');
    console.log('   📧 Email:    admin@cermont.com');
    console.log('   🔑 Password: (set via SEED_TEST_PASSWORD)');
    console.log('');
    console.log('🆔 User ID:', testUser.id);
    console.log('');
  } catch (error) {
    console.error('❌ Error en seed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

seedTestUser();
