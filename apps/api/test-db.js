const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const users = await prisma.user.findMany();
        console.log('Users found:', users.length);
        users.forEach(u => {
            console.log(`- ${u.email} (${u.role}) - Active: ${u.active}`);
        });
    } catch (e) {
        console.error('Error listing users:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
