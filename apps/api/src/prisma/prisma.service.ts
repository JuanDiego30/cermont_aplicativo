/**
 * @service PrismaService
 *
 * Cliente Prisma (PostgreSQL) con ciclo de vida NestJS (connect/disconnect).
 *
 * Uso: Inyectar PrismaService desde PrismaModule para acceso a BD.
 * 
 * NOTA: Prisma maneja las conexiones PostgreSQL automáticamente.
 * Compatible con PostgreSQL 12+ y funciona perfectamente con Docker.
 */
import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '.prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(PrismaService.name);

    constructor() {
        super({
            log: process.env.NODE_ENV === 'production'
                ? ['error']
                : ['query', 'info', 'warn', 'error'],
        });
    }

    async onModuleInit() {
        await this.$connect();
        this.logger.log('PostgreSQL Database connected');
    }

    async onModuleDestroy() {
        await this.$disconnect();
        this.logger.log('PostgreSQL Database disconnected');
    }
}
