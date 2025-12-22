/**
 * @service PrismaService
 * Cliente Prisma (PostgreSQL) con ciclo de vida NestJS.
 * Prisma 7+ requiere un adapter explícito para conexión a BD
 */
import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '.prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(PrismaService.name);
    private pool: Pool;

    constructor() {
        const connectionString = process.env.DATABASE_URL ||
            'postgresql://postgres:admin@localhost:5432/cermont_fsm';

        const pool = new Pool({ connectionString });
        const adapter = new PrismaPg(pool);

        super({ adapter });

        this.pool = pool;
        this.logger.log('PrismaService instantiated');
    }

    async onModuleInit() {
        await this.$connect();
        this.logger.log('PostgreSQL Database connected');
    }

    async onModuleDestroy() {
        await this.$disconnect();
        await this.pool.end();
        this.logger.log('PostgreSQL Database disconnected');
    }
}
