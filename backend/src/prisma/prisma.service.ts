/**
 * @service PrismaService
 * @description Cliente Prisma (PostgreSQL) con ciclo de vida NestJS - Prisma 7
 * @layer Infrastructure
 *
 * Prisma 7 Compliant:
 * - Uses driver adapter (@prisma/adapter-pg) as required by Prisma 7
 * - Uses @Injectable() for dependency injection
 * - Extends PrismaClient with proper lifecycle hooks
 * - Implements OnModuleInit and OnModuleDestroy
 * - Uses LoggerService for logging
 * - Handles connection errors gracefully
 * - Supports transactions
 * - Provides health check
 */
import { LoggerService } from '@/lib/logging/logger.service';
import type { Prisma } from '@/prisma/client';
import { PrismaClient } from '@/prisma/client';
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger: LoggerService;
  private readonly configService: ConfigService;
  private readonly pool: Pool;

  constructor(configService: ConfigService) {
    const nodeEnv = configService.get<string>('NODE_ENV', 'development');
    const logLevel = PrismaService.getLogLevel(nodeEnv);
    const databaseUrl = configService.get<string>('DATABASE_URL');

    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is required');
    }

    // Create pg Pool for Prisma 7 adapter
    const pool = new Pool({
      connectionString: databaseUrl,
    });

    // Create Prisma adapter using the pg pool
    const adapter = new PrismaPg(pool);

    // Initialize PrismaClient with driver adapter (Prisma 7 requirement)
    super({
      adapter,
      log: logLevel,
    });

    this.pool = pool;
    this.configService = configService;
    this.logger = new LoggerService('PrismaService');
    this.logger.log('PrismaService instantiated with Prisma 7 driver adapter', undefined, {
      environment: nodeEnv,
    });
  }

  /**
   * Connect to database on module initialization
   */
  async onModuleInit(): Promise<void> {
    this.logger.log('Connecting to database...');

    try {
      await this.$connect();
      this.logger.log('PostgreSQL Database connected successfully (Prisma 7)');
      this.logDatabaseInfo();
    } catch (error) {
      this.logger.logErrorWithStack(error as Error, 'Failed to connect to database');
      throw error;
    }
  }

  /**
   * Disconnect from database on module destruction
   */
  async onModuleDestroy(): Promise<void> {
    this.logger.log('Disconnecting from database...');

    try {
      await this.$disconnect();
      // Also close the pg pool
      await this.pool.end();
      this.logger.log('PostgreSQL Database disconnected successfully');
    } catch (error) {
      this.logger.logErrorWithStack(error as Error, 'Failed to disconnect from database');
    }
  }

  /**
   * Execute a transaction with proper error handling
   * @param fn Transaction callback function
   * @returns Result of transaction
   */
  async transaction<R>(fn: (prisma: Prisma.TransactionClient) => Promise<R>): Promise<R> {
    this.logger.debug('Starting transaction');

    try {
      const result = await this.$transaction(fn);
      this.logger.debug('Transaction completed successfully');
      return result as R;
    } catch (error) {
      this.logger.logErrorWithStack(error as Error, 'Transaction failed');
      throw error;
    }
  }

  /**
   * Health check for database connection
   * @returns True if database is healthy, false otherwise
   */
  async isHealthy(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      this.logger.logErrorWithStack(error as Error, 'Database health check failed');
      return false;
    }
  }

  /**
   * Get database connection info
   * @returns Database connection information
   */
  async getConnectionInfo(): Promise<{ connected: boolean; database?: string }> {
    try {
      const result = await this.$queryRaw<
        { current_database: string }[]
      >`SELECT current_database()`;

      return {
        connected: true,
        database: result[0]?.current_database,
      };
    } catch (error) {
      this.logger.logErrorWithStack(error as Error, 'Failed to get database info');
      return { connected: false };
    }
  }

  /**
   * Get Prisma log level based on environment
   * @param nodeEnv Node environment
   * @returns Log level array
   */
  private static getLogLevel(nodeEnv: string): Array<never> | Array<'query' | 'error' | 'warn'> {
    if (nodeEnv === 'development') {
      return ['query', 'error', 'warn'];
    } else if (nodeEnv === 'test') {
      return ['error'];
    }
    return ['error'];
  }

  /**
   * Log database connection information
   */
  private async logDatabaseInfo(): Promise<void> {
    try {
      const info = await this.getConnectionInfo();
      if (info.connected && info.database) {
        this.logger.log('Connected to database', undefined, {
          database: info.database,
        });
      }
    } catch {
      // Silently fail if we can't get database info
    }
  }
}
