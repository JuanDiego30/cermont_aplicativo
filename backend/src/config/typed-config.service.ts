/**
 * NestJS Typed Configuration Service
 *
 * Provides type-safe access to application configuration
 * with Zod validation at startup.
 */
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
  AppConfig,
  DatabaseConfig,
  JwtConfig,
  ServerConfig,
  StorageConfig,
  RedisConfig,
  EmailConfig,
  Environment,
  safeParseConfig,
} from './config.schema';

@Injectable()
export class TypedConfigService implements OnModuleInit {
  private readonly logger = new Logger(TypedConfigService.name);
  private config!: AppConfig;

  onModuleInit(): void {
    const result = safeParseConfig();

    if (!result.success) {
      this.logger.error('Configuration validation failed:');
      const issues = result.error.issues ?? [];
      issues.forEach(issue => {
        this.logger.error(`  - ${String(issue.path?.join('.') ?? 'unknown')}: ${issue.message}`);
      });
      throw new Error('Invalid application configuration. See logs for details.');
    }

    this.config = result.data;
    this.logger.log(`Configuration loaded successfully for ${this.config.nodeEnv} environment`);
  }

  get environment(): Environment {
    return this.config.nodeEnv;
  }

  get isProduction(): boolean {
    return this.config.nodeEnv === 'production';
  }

  get isDevelopment(): boolean {
    return this.config.nodeEnv === 'development';
  }

  get isTest(): boolean {
    return this.config.nodeEnv === 'test';
  }

  get database(): DatabaseConfig {
    return this.config.database;
  }

  get jwt(): JwtConfig {
    return this.config.jwt;
  }

  get server(): ServerConfig {
    return this.config.server;
  }

  get storage(): StorageConfig {
    return this.config.storage;
  }

  get redis(): RedisConfig {
    return this.config.redis;
  }

  get email(): EmailConfig {
    return this.config.email;
  }

  /**
   * Get the complete configuration object
   * Use with caution - prefer specific getters for type safety
   */
  getAll(): AppConfig {
    return { ...this.config };
  }

  /**
   * Get a specific configuration value by path
   */
  get<K extends keyof AppConfig>(key: K): AppConfig[K] {
    return this.config[key];
  }
}
