import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Iniciando seed de base de datos...');

    // Limpiar datos existentes
    await prisma.refreshToken.deleteMany();
    await prisma.user.deleteMany();

    console.log('✅ Base de datos limpiada');

    // Hash de contraseñas
    const adminPassword = await bcrypt.hash('Admin@2025!', 12);
    const supervisorPassword = await bcrypt.hash('Supervisor@2025!', 12);
    const tecnicoPassword = await bcrypt.hash('Tecnico@2025!', 12);

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
    console.log('   - Admin:', admin.email, '/ Admin@2025!');
    console.log('   - Supervisor:', supervisor.email, '/ Supervisor@2025!');
    console.log('   - Técnico 1:', tecnico1.email, '/ Tecnico@2025!');
    console.log('   - Técnico 2:', tecnico2.email, '/ Tecnico@2025!');

    console.log('🎉 Seed completado exitosamente!');
}

main()
    .catch((e) => {
        console.error('❌ Error en seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
