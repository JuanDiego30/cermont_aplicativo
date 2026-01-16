import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcryptjs';
import { Pool } from 'pg';
import { PrismaClient } from '../generated/prisma/client';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Iniciando seed de base de datos...');

  // Limpiar datos existentes
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ Base de datos limpiada');

  // Hash de contraseñas
  const adminPasswordRaw = process.env.SEED_ADMIN_PASSWORD ?? 'Admin@2025!';
  const supervisorPasswordRaw = process.env.SEED_SUPERVISOR_PASSWORD ?? 'Supervisor@2025!';
  const tecnicoPasswordRaw = process.env.SEED_TECH_PASSWORD ?? 'Tecnico@2025!';

  const adminPassword = await bcrypt.hash(adminPasswordRaw, 12);
  const supervisorPassword = await bcrypt.hash(supervisorPasswordRaw, 12);
  const tecnicoPassword = await bcrypt.hash(tecnicoPasswordRaw, 12);

  // Crear usuarios
  const admin = await prisma.user.create({
    data: {
      email: 'admin@cermont.com',
      password: adminPassword,
      name: 'Administrador Principal',
      role: 'admin',
      phone: '+573001234567',
      active: true,
      emailVerified: true,
    },
  });

  const supervisor = await prisma.user.create({
    data: {
      email: 'supervisor@cermont.com',
      password: supervisorPassword,
      name: 'Supervisor de Mantenimiento',
      role: 'supervisor',
      phone: '+573001234568',
      active: true,
      emailVerified: true,
    },
  });

  const tecnico1 = await prisma.user.create({
    data: {
      email: 'tecnico1@cermont.com',
      password: tecnicoPassword,
      name: 'Juan Técnico',
      role: 'tecnico',
      phone: '+573001234569',
      active: true,
      emailVerified: true,
    },
  });

  const tecnico2 = await prisma.user.create({
    data: {
      email: 'tecnico2@cermont.com',
      password: tecnicoPassword,
      name: 'María Técnica',
      role: 'tecnico',
      phone: '+573001234570',
      active: true,
      emailVerified: false,
    },
  });

  // Usuario inactivo
  await prisma.user.create({
    data: {
      email: 'inactivo@cermont.com',
      password: tecnicoPassword,
      name: 'Usuario Inactivo',
      role: 'tecnico',
      active: false,
      emailVerified: false,
    },
  });

  console.log('✅ Usuarios creados:');
  console.log('   - Admin:', admin.email, '/ (set via SEED_ADMIN_PASSWORD)');
  console.log('   - Supervisor:', supervisor.email, '/ (set via SEED_SUPERVISOR_PASSWORD)');
  console.log('   - Técnico 1:', tecnico1.email, '/ (set via SEED_TECH_PASSWORD)');
  console.log('   - Técnico 2:', tecnico2.email, '/ (set via SEED_TECH_PASSWORD)');

  console.log('🎉 Seed completado exitosamente!');
}

main()
  .catch(e => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
