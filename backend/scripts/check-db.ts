import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔍 Checking database connection...');
    try {
        await prisma.$connect();
        console.log('✅ Database connected successfully.');

        console.log('🔍 Checking User table...');
        const userCount = await prisma.user.count();
        console.log(`✅ User table exists. Count: ${userCount}`);

        console.log('🔍 Checking AuditLog table...');
        const auditCount = await prisma.auditLog.count();
        console.log(`✅ AuditLog table exists. Count: ${auditCount}`);

        console.log('🔍 Checking RefreshToken table...');
        const tokenCount = await prisma.refreshToken.count();
        console.log(`✅ RefreshToken table exists. Count: ${tokenCount}`);

    } catch (error) {
        console.error('❌ Database check failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
