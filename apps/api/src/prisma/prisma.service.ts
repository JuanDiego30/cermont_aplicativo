/**
 * @service PrismaService
 *
 * Cliente Prisma (PostgreSQL) con ciclo de vida NestJS (connect/disconnect).
 *
 * Uso: Inyectar PrismaService desde PrismaModule para acceso a BD.
 */
import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
// Prisma 7 con pnpm: importar desde el cliente generado localmente
import { Prisma, PrismaClient } from '.prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(PrismaService.name);
    private readonly pool: Pool;

    /**
     * Prisma 7.x: asegura inicialización explícita del cliente.
     * Prisma 7 requiere `adapter` o `accelerateUrl`.
     */
    constructor() {
        const connectionString = process.env.DATABASE_URL;
        if (!connectionString) {
            throw new Error('DATABASE_URL is not set');
        }

        // Crear pool y adapter en variables locales antes de super()
        const pool = new Pool({ connectionString });
        const adapter = new PrismaPg(pool);

        const options: Prisma.PrismaClientOptions = {
            adapter,
            log:
                process.env.NODE_ENV === 'production'
                    ? ['error']
                    : ['query', 'info', 'warn', 'error'],
        };

        super(options);

        // Asignar el pool a la propiedad de la clase después de super()
        this.pool = pool;
    }

    async onModuleInit() {
        await this.$connect();
        this.logger.log('Database connected');
    }

    async onModuleDestroy() {
        await this.$disconnect();
        await this.pool.end();
        this.logger.log('Database disconnected');
    }
}
