
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Conectando a BD...');
    const user = await prisma.user.findUnique({
      where: { email: 'root@cermont.com' }
    });
    console.log('Usuario encontrado:', user);
  } catch (error) {
    console.error('Error conectando a BD:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
