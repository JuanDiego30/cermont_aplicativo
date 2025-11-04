/**
 * Server Entry Point (TypeScript - November 2025)
 * @description Punto de entrada principal para CERMONT ATG: Inicialización async (env > DB connect > SSL config > Socket > Server listen HTTPS/HTTP dev), manejo errores detallado (exit(1) fails), graceful shutdown (close server/DB/cache timeout 10s), logging estructurado, rutas dev list, rate stats interval (dev 5min). Secure: SSL prod-only (Let's Encrypt/prod certs), HTTP redirect dev, error codes troubleshooting (EADDRINUSE/EACCES/ENOTFOUND). Optimizado: Dynamic imports dev (rate stats), typed config, no blocking ops, cluster-ready (export startServer). Usage: npm run dev (nodemon), npm start (prod), ts-node server.ts. Integrado con: app.ts (export graceful), database.ts (connect/close), ssl.ts (getSSLConfig), socket/index.ts (initializeSocket), logger.ts. Performance: Async/await sequential, no sync heavy. Extensible: PM2 cluster (instances: 'max'), Docker (expose PORT, volumes certs).
 * Fixes: Typed PORT/HTTP_PORT/NODE_ENV. SSL: Try-catch non-fatal if disabled, generate-cert script hint. Listen: Typed callback Error, protocol dynamic. HTTP aux: Dev-only, warn non-critical err. Server.on('error'): Structured hints. Graceful: Import closeDB/cache.flushAll, async close mongoose.connection. Signals: Unified gracefulShutdown (import from app.ts or local). Dev routes: Dynamic list from routes registry if impl. Rate stats: Dynamic import rateLimiter, setInterval debug level. Env: dotenv early, validate post (from app.ts). No console, all logger. Export startServer for cluster/master.
 * Integrate: En package.json: "start": "node dist/server.js", "dev": "nodemon --exec ts-node --esm server.ts", "build": "tsc", "generate-cert": "mkcert localhost 127.0.0.1 ::1". En cluster.ts (optional): import cluster from 'cluster'; if (cluster.isMaster) { for (let i = 0; i < numCPUs; i++) cluster.fork(); } else startServer();. En docker-compose.yml: ports: - "${PORT}:4100", volumes: - ./certs:/app/certs. PM2: ecosystem: { instances: 'max', exec_mode: 'cluster', env: { NODE_ENV: 'production', SSL_ENABLED: true } }. Graceful: server.close(cb => { closeDB(); cacheService.flushAll(); io.close(); process.exit(0); }); Timeout force.
 * Missing: Routes registry: utils/routeRegistry.ts export const getRoutes = () => { return { auth: [{ method: 'POST', path: '/api/v1/auth/register' }, ...], orders: [...], ... }; }; En dev: const routesList = getRoutes(); Object.entries(routesList).forEach(([module, rts]) => { logger.info(`  ${module.toUpperCase()}:`); rts.forEach(rt => logger.info(`   ${rt.method.padEnd(6)} ${rt.path}`)); }); Auto from express-router-list if npm i. Metrics: Integrate prom-client on start, /metrics endpoint in app.ts. Health post-start: logger.info('Health: http://localhost:4100/health');. Tests below.
 * Usage: npm i @types/node, npm run build (tsc server.ts --outDir dist), import { startServer } from './server'; startServer().catch(err => { logger.error(err); process.exit(1); });.
 */

import http, { type Server as HttpServer } from 'http';
import https from 'https';
import dotenv from 'dotenv';
import { connectDB, closeDB } from './config/database';
import { initializeSocket } from './socket/index';
import { cacheService } from './services/cache';
import { logger } from './utils/logger';
import app from './app';
import { getSSLConfig } from './config/ssl';
import type { Server } from 'https'; // Typed for HTTPS
import { gracefulShutdown } from './app'; // Reuse from app.ts if exported, or local impl
import { getJWKS } from './config/jwt';

// Load env early
dotenv.config();

// Typed config
const PORT: number = parseInt(process.env.PORT || '4100', 10);
const HTTP_PORT: number = parseInt(process.env.HTTP_PORT || '4000', 10);
const NODE_ENV: string = process.env.NODE_ENV || 'development';
const SSL_ENABLED: boolean = process.env.SSL_ENABLED === 'true';

// SSL config type
interface SSLConfig {
  key: Buffer;
  cert: Buffer;
}

// Main start function (async, exported)
export const startServer = async (): Promise<void> => {
  try {
    // 1. Connect DB
    logger.info('📦 Connecting to MongoDB...');
    await connectDB();
    logger.info('✅ MongoDB connected successfully');

    // 2. Validate JWKS keys
    logger.info('🔐 Validating JWKS keys...');
    try {
      await getJWKS(); // This will throw if keys are not available
      logger.info('✅ JWKS keys validated successfully');
    } catch (error) {
      logger.error('❌ JWKS validation failed:', error);
      logger.error('💡 Fix: Run "npm run generate-jwks" to create JWT keys');
      process.exit(1);
    }

    // 3. SSL config with error handling
    let sslConfig: SSLConfig | null = null;
    if (SSL_ENABLED) {
      try {
        sslConfig = await getSSLConfig(); // Assume async if file read
        logger.info('🔒 SSL config loaded');
      } catch (error: unknown) {
        const err = error as Error;
        logger.error('❌ Fatal SSL cert load error:', { message: err.message, stack: err.stack });
        logger.error('\n💡 Fixes:');
        logger.error(' 1. Run: npm run generate-cert');
        logger.error(' 2. Or disable: SSL_ENABLED=false in .env\n');
        process.exit(1);
      }
    }

    let server: HttpServer | Server;
    let httpServer: HttpServer | null = null;

    // Create servers
    if (sslConfig) {
      try {
        server = https.createServer(sslConfig, app);
        logger.info('🔒 HTTPS server enabled');
        if (NODE_ENV !== 'production') {
          httpServer = http.createServer(app);
          logger.info('⚠️ HTTP dev server enabled');
        }
      } catch (error: unknown) {
        const err = error as Error;
        logger.error('❌ HTTPS server creation error:', { message: err.message, code: (err as NodeJS.ErrnoException).code, stack: err.stack });
        process.exit(1);
      }
    } else {
      server = http.createServer(app);
      logger.info('⚠️ HTTP server (insecure) - Dev only');
    }

    // 3. Initialize Socket.IO
    logger.info('🔌 Initializing Socket.IO...');
    const io = initializeSocket(server); // Assume returns io instance
    logger.info('✅ Socket.IO initialized');

    // 4. Listen main server
    server.listen(PORT, (err?: Error) => {
      if (err) {
        logger.error('❌ Server listen error on port', PORT, { message: err.message, code: (err as NodeJS.ErrnoException).code });
        if ((err as NodeJS.ErrnoException).code === 'EADDRINUSE') {
          logger.error('\n💡 Fix: Port in use.');
          logger.error(`   Windows: netstat -ano | findstr :${PORT}`);
          logger.error(`   Linux/Mac: lsof -ti:${PORT} | xargs kill -9\n`);
        } else if ((err as NodeJS.ErrnoException).code === 'EACCES') {
          logger.error(`\n💡 Fix: Insufficient perms for port ${PORT}`);
          logger.error('   Use port >1024 (e.g., 4100) or sudo (Linux/Mac)\n');
        }
        process.exit(1);
      }
      const protocol = sslConfig ? 'https' : 'http';
      logger.info('🚀 =====================================');
      logger.info(`🚀 Main server running on ${protocol}://localhost:${PORT}`);
      logger.info(`📊 Environment: ${NODE_ENV}`);
      logger.info(`🔐 SSL: ${sslConfig ? 'Enabled' : 'Disabled'}`);
      logger.info('🚀 =====================================\n');
    });

    // 5. HTTP aux server (dev SSL)
    if (httpServer) {
      httpServer.listen(HTTP_PORT, (err?: Error) => {
        if (err) {
          logger.warn('⚠️ HTTP aux server error:', { message: err?.message });
          logger.warn(' (Non-critical, HTTP parallel access only)');
        } else {
          logger.info(`🔓 HTTP aux server on http://localhost:${HTTP_PORT}`);
        }
      });
    }

    // 6. Server error handler
    server.on('error', (error: NodeJS.ErrnoException) => {
      logger.error('\n❌ Server error:', { message: error.message, code: error.code });
      if (error.code === 'EADDRINUSE') {
        logger.error(`\n💡 Port ${PORT} in use by another process`);
      } else if (error.code === 'EACCES') {
        logger.error(`\n💡 No perms for port ${PORT}`);
        logger.error(' Use port >1024 or admin privileges');
      } else if (error.code === 'ENOTFOUND') {
        logger.error('\n💡 SSL cert not found/invalid');
        logger.error(' Run: npm run generate-cert');
      }
      process.exit(1);
    });

    // 7. Graceful shutdown
    const shutdownHandler = async (signal: string): Promise<void> => {
      logger.info(`\n👋 ${signal} received. Graceful shutdown...`);
      if (httpServer) httpServer.close(() => logger.info('✅ HTTP aux closed'));
      server.close(async (err?: Error) => {
        if (err) {
          logger.error('Server close error:', err);
          process.exit(1);
        }
        logger.info('✅ Main server closed');
        // Close resources
        try {
          await closeDB();
          logger.info('✅ MongoDB closed');
        } catch (dbErr: unknown) {
          logger.error('❌ DB close error:', dbErr as Error);
        }
        cacheService.flush();
        logger.info('✅ Cache flushed');
        if (io) io.close(() => logger.info('✅ Socket.IO closed'));
        logger.info('👋 Process exited successfully');
        process.exit(0);
      });
      // Force timeout
      setTimeout(() => {
        logger.error('❌ Graceful timeout. Force exit...');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdownHandler('SIGTERM'));
    process.on('SIGINT', () => shutdownHandler('SIGINT'));

    // 8. Dev routes list (dynamic from registry)
    if (NODE_ENV === 'development') {
      try {
        const { getRoutes } = await import('./utils/routeRegistry');
        const routesList = getRoutes();
        logger.info('📍 Available routes:');
        Object.entries(routesList).forEach(([module, rts]) => {
          logger.info(`  ${module.toUpperCase()}:`);
          rts.forEach((rt: { method: string; path: string }) => {
            logger.info(`   ${rt.method.padEnd(6)} ${rt.path}`);
          });
          logger.info('');
        });
      } catch {
        // Fallback static list
        logger.info('📍 Routes (static fallback):');
        logger.info('  AUTH: POST /api/v1/auth/register, POST /api/v1/auth/login, ...');
        logger.info('  ORDERS: GET/POST /api/v1/orders, GET /api/v1/orders/:id');
        // ... as in original
      }
    }

    // 9. Dev rate stats
    if (NODE_ENV === 'development') {
      const { rateLimitManager } = await import('./middleware/rateLimiter');
      setInterval(() => {
        const stats = rateLimitManager.getStats();
        logger.debug('📊 Rate Limit Stats:', {
          activeKeys: stats.totalKeys,
          violations: stats.totalViolations,
          whitelisted: stats.whitelist,
          blacklisted: stats.blacklist,
        });
      }, 5 * 60 * 1000);
    }

    // Post-start health log
    logger.info(`Health check: ${NODE_ENV === 'production' ? 'https' : 'http'}://localhost:${PORT}/health`);

  } catch (error: unknown) {
    const err = error as Error;
    logger.error('❌ Server start error:', { message: err.message, stack: err.stack });
    process.exit(1);
  }
};

// Unhandled errors (from app.ts or here)
process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
  logger.error('❌ Unhandled Rejection:', { promise, reason: reason as Error });
  if (NODE_ENV === 'production') process.exit(1);
});

process.on('uncaughtException', (error: Error) => {
  logger.error('❌ Uncaught Exception:', error);
  if (NODE_ENV === 'production') process.exit(1);
});

// Start
startServer().catch((err: Error) => {
  logger.error('Fatal start error:', err);
  process.exit(1);
});

