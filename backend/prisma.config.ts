// Prisma 7 Configuration File
// This file configures the Prisma CLI for database operations
// @see https://www.prisma.io/docs/orm/reference/prisma-config-reference

import 'dotenv/config';

// Ensure DATABASE_URL is available for Prisma CLI commands
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.warn('⚠️ DATABASE_URL not found in environment. Some Prisma CLI commands may fail.');
}

export default {
  // Path to the Prisma schema file
  schema: './prisma/schema.prisma',

  // Seed configuration
  migrations: {
    seed: 'npx tsx ./prisma/seed.ts',
  },
};
