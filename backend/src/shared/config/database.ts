import prisma from '../../infra/db/prisma';

export const connectDatabase = async () => {
  await prisma.$connect();
};

export const disconnectDatabase = async () => {
  await prisma.$disconnect();
};