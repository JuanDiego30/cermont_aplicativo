import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
    schema: './prisma/schema.prisma',
    datasource: {
        url: process.env.DATABASE_URL || 'postgresql://postgres:admin@localhost:5432/cermont_fsm?connect_timeout=10&sslmode=prefer',
    },
});
