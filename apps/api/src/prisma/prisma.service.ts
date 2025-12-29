/**
 * @service PrismaService
 * Cliente Prisma (PostgreSQL) con ciclo de vida NestJS.
 * Prisma 7+ requiere un adapter explícito para conexión a BD
 */
import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(PrismaService.name);

    constructor() {
        super({
            datasources: {
                db: {
                    url: process.env.DATABASE_URL
                }
            },
        });
        this.logger.log('PrismaService instantiated (Standard)');
    }

    async onModuleInit() {
        this.logger.log('Connecting to database...');
        try {
            await this.$connect();
            this.logger.log('PostgreSQL Database connected successfully');
        } catch (error) {
            this.logger.error('Failed to connect to database', error);
            throw error;
        }
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}
