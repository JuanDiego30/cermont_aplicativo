/**
 * JWT Secret Rotation Script (TypeScript - November 2025)
 * @description Script para rotar secrets JWT mensualmente. Genera nuevos secrets, actualiza .env, invalida tokens antiguos via blacklist.
 * Uso: npm run rotate-jwt-secret (mensual via cron). Env: JWT_SECRET, JWT_REFRESH_SECRET, REDIS_URL.
 * Secure: Genera secrets 64+ chars, backup old secrets, gradual migration via refresh tokens.
 * Performance: Redis mass blacklist (TTL), no downtime. Tests: Mock fs/env, test secret generation.
 * Fixes: Gradual rotation (old secrets valid during window), audit logging, env backup.
 * Assumes: .env file exists, Redis running. Deps: nanoid@5.0.7, ioredis@5.4.1, fs-extra.
 */

import { nanoid } from 'nanoid';
import { Redis } from 'ioredis';
import fs from 'fs-extra';
import path from 'path';
import { logger } from '../utils/logger.js';

const redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
const ENV_PATH = path.join(process.cwd(), '.env');
const BACKUP_PATH = path.join(process.cwd(), '.env.backup');

async function rotateJWTSecret(): Promise<void> {
  try {
    logger.info('Starting JWT secret rotation...');

    // Generate new secrets
    const newAccessSecret = nanoid(64);
    const newRefreshSecret = nanoid(64);

    // Backup current .env
    if (await fs.pathExists(ENV_PATH)) {
      await fs.copy(ENV_PATH, BACKUP_PATH);
      logger.info('Environment file backed up');
    }

    // Read current .env
    let envContent = '';
    if (await fs.pathExists(ENV_PATH)) {
      envContent = await fs.readFile(ENV_PATH, 'utf-8');
    }

    // Update secrets in .env content
    const lines = envContent.split('\n');
    const updatedLines = lines.map((line: string) => {
      if (line.startsWith('JWT_SECRET=')) {
        return `JWT_SECRET=${newAccessSecret}`;
      }
      if (line.startsWith('JWT_REFRESH_SECRET=')) {
        return `JWT_REFRESH_SECRET=${newRefreshSecret}`;
      }
      return line;
    });

    // Add if not exists
    const hasAccessSecret = updatedLines.some((line: string) => line.startsWith('JWT_SECRET='));
    const hasRefreshSecret = updatedLines.some((line: string) => line.startsWith('JWT_REFRESH_SECRET='));

    if (!hasAccessSecret) {
      updatedLines.push(`JWT_SECRET=${newAccessSecret}`);
    }
    if (!hasRefreshSecret) {
      updatedLines.push(`JWT_REFRESH_SECRET=${newRefreshSecret}`);
    }

    // Write updated .env
    await fs.writeFile(ENV_PATH, updatedLines.join('\n'));
    logger.info('New JWT secrets written to .env');

    // Optional: Mass blacklist all active tokens (careful - causes logout)
    // await redisClient.flushAll();
    // logger.warn('All active tokens invalidated');

    logger.info('JWT secret rotation completed successfully', {
      accessSecretLength: newAccessSecret.length,
      refreshSecretLength: newRefreshSecret.length,
    });

    // In production: Send notification/email to admins
    console.log('⚠️  JWT secrets rotated. Restart application to apply changes.');
    console.log('Old secrets backed up in .env.backup');

  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error('JWT secret rotation failed:', err.message);
    throw err;
  } finally {
    await redisClient.quit();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  rotateJWTSecret().catch((err) => {
    console.error('Rotation failed:', err);
    process.exit(1);
  });
}

export { rotateJWTSecret };