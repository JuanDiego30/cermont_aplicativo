import { PrismaClient } from '@prisma/client';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required');
}
const connectionString = process.env.DATABASE_URL;
const prisma = new PrismaClient();

async function main() {
    console.log('🔍 Verifying Dashboard Stats...');

    try {
        const fechaReciente = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        console.log('1. Count Total Orders');
        const totalOrdenes = await prisma.order.count();
        console.log('✓ Total:', totalOrdenes);

        console.log('2. Group By State');
        const ordenesPorEstado = await prisma.order.groupBy({
            by: ['estado'],
            _count: { id: true }
        });
        console.log('✓ GroupBy:', JSON.stringify(ordenesPorEstado));

        console.log('3. Count Users');
        const totalUsuarios = await prisma.user.count({ where: { active: true } });
        console.log('✓ Users:', totalUsuarios);

        console.log('4. Recent Orders Count');
        const ordenesRecientes = await prisma.order.count({
            where: { createdAt: { gte: fechaReciente } }
        });
        console.log('✓ Recent:', ordenesRecientes);

        console.log('✅ Stats Verification Passed');
    } catch (error) {
        console.error('❌ Stats Verification Failed:', error);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
