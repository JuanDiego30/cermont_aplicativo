/**
 * Seed para crear usuario root/admin
 * Ejecutar con: npx tsx prisma/seed_root.ts
 */
// Variables de entorno se cargan automáticamente por tsx
// No se requiere importar dotenv explícitamente
import { resolve } from 'path';
import { PrismaClient, Prisma } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

// Cargar variables de entorno desde .env
// Variables de entorno cargadas automáticamente por 'dotenv/config'

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    throw new Error('DATABASE_URL is not set. Make sure .env file exists in apps/api directory.');
}

const prisma = new PrismaClient();

async function main() {
    const email = 'root@cermont.com';
    const passwordRaw = 'Cermont2025!';
    const hashedPassword = await bcrypt.hash(passwordRaw, 10);

    const user = await prisma.user.upsert({
        where: { email },
        update: {
            password: hashedPassword,
            role: 'admin',
            active: true,
        },
        create: {
            email,
            name: 'Super Admin',
            password: hashedPassword,
            role: 'admin',
            active: true,
        },
    });

    console.log('✅ Usuario creado/actualizado:');
    console.log({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
    });
    console.log('\n📧 Email: root@cermont.com');
    console.log('🔑 Password: Cermont2025!');
}

main()
    .catch((e) => {
        console.error('❌ Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
