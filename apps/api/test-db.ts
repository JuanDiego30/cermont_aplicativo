import { PrismaClient } from '.prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// Crear pool de conexión con el adaptador
const connectionString = process.env.DATABASE_URL ||
    'postgresql://postgres:admin@localhost:5432/cermont_fsm';

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function testConnection() {
    try {
        console.log('🔍 Probando conexión a base de datos...');
        console.log('   Connection String:', connectionString.replace(/:([^:@]+)@/, ':****@'));

        // Intentar una query simple
        const result = await prisma.$queryRaw`SELECT NOW() as current_time`;
        console.log('✅ Conexión exitosa:', result);

        // Contar usuarios
        const userCount = await prisma.user.count();
        console.log(`📊 Usuarios en base de datos: ${userCount}`);

        // Listar usuarios
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                active: true,
            },
        });

        if (users.length > 0) {
            console.log('👥 Usuarios:', JSON.stringify(users, null, 2));
        } else {
            console.log('👥 No hay usuarios en la base de datos. Ejecuta seed-test-user.ts para crear uno.');
        }

    } catch (error) {
        console.error('❌ Error de conexión:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}

testConnection();
