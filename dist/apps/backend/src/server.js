import http from 'http';
import https from 'https';
import dotenv from 'dotenv';
import { connectDB, closeDB } from './config/database';
import { initializeSocket } from './socket/index';
import { cacheService } from './services/cache';
import { logger } from './utils/logger';
import app from './app';
import { getSSLConfig } from './config/ssl';
dotenv.config();
const PORT = parseInt(process.env.PORT || '4100', 10);
const HTTP_PORT = parseInt(process.env.HTTP_PORT || '4000', 10);
const NODE_ENV = process.env.NODE_ENV || 'development';
const SSL_ENABLED = process.env.SSL_ENABLED === 'true';
export const startServer = async () => {
    try {
        logger.info('📦 Connecting to MongoDB...');
        await connectDB();
        logger.info('✅ MongoDB connected successfully');
        let sslConfig = null;
        if (SSL_ENABLED) {
            try {
                sslConfig = await getSSLConfig();
                logger.info('🔒 SSL config loaded');
            }
            catch (error) {
                const err = error;
                logger.error('❌ Fatal SSL cert load error:', { message: err.message, stack: err.stack });
                logger.error('\n💡 Fixes:');
                logger.error(' 1. Run: npm run generate-cert');
                logger.error(' 2. Or disable: SSL_ENABLED=false in .env\n');
                process.exit(1);
            }
        }
        let server;
        let httpServer = null;
        if (sslConfig) {
            try {
                server = https.createServer(sslConfig, app);
                logger.info('🔒 HTTPS server enabled');
                if (NODE_ENV !== 'production') {
                    httpServer = http.createServer(app);
                    logger.info('⚠️ HTTP dev server enabled');
                }
            }
            catch (error) {
                const err = error;
                logger.error('❌ HTTPS server creation error:', { message: err.message, code: err.code, stack: err.stack });
                process.exit(1);
            }
        }
        else {
            server = http.createServer(app);
            logger.info('⚠️ HTTP server (insecure) - Dev only');
        }
        logger.info('🔌 Initializing Socket.IO...');
        const io = initializeSocket(server);
        logger.info('✅ Socket.IO initialized');
        server.listen(PORT, (err) => {
            if (err) {
                logger.error('❌ Server listen error on port', PORT, { message: err.message, code: err.code });
                if (err.code === 'EADDRINUSE') {
                    logger.error('\n💡 Fix: Port in use.');
                    logger.error(`   Windows: netstat -ano | findstr :${PORT}`);
                    logger.error(`   Linux/Mac: lsof -ti:${PORT} | xargs kill -9\n`);
                }
                else if (err.code === 'EACCES') {
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
        if (httpServer) {
            httpServer.listen(HTTP_PORT, (err) => {
                if (err) {
                    logger.warn('⚠️ HTTP aux server error:', { message: err?.message });
                    logger.warn(' (Non-critical, HTTP parallel access only)');
                }
                else {
                    logger.info(`🔓 HTTP aux server on http://localhost:${HTTP_PORT}`);
                }
            });
        }
        server.on('error', (error) => {
            logger.error('\n❌ Server error:', { message: error.message, code: error.code });
            if (error.code === 'EADDRINUSE') {
                logger.error(`\n💡 Port ${PORT} in use by another process`);
            }
            else if (error.code === 'EACCES') {
                logger.error(`\n💡 No perms for port ${PORT}`);
                logger.error(' Use port >1024 or admin privileges');
            }
            else if (error.code === 'ENOTFOUND') {
                logger.error('\n💡 SSL cert not found/invalid');
                logger.error(' Run: npm run generate-cert');
            }
            process.exit(1);
        });
        const shutdownHandler = async (signal) => {
            logger.info(`\n👋 ${signal} received. Graceful shutdown...`);
            if (httpServer)
                httpServer.close(() => logger.info('✅ HTTP aux closed'));
            server.close(async (err) => {
                if (err) {
                    logger.error('Server close error:', err);
                    process.exit(1);
                }
                logger.info('✅ Main server closed');
                try {
                    await closeDB();
                    logger.info('✅ MongoDB closed');
                }
                catch (dbErr) {
                    logger.error('❌ DB close error:', dbErr);
                }
                cacheService.flushAll();
                logger.info('✅ Cache flushed');
                if (io)
                    io.close(() => logger.info('✅ Socket.IO closed'));
                logger.info('👋 Process exited successfully');
                process.exit(0);
            });
            setTimeout(() => {
                logger.error('❌ Graceful timeout. Force exit...');
                process.exit(1);
            }, 10000);
        };
        process.on('SIGTERM', () => shutdownHandler('SIGTERM'));
        process.on('SIGINT', () => shutdownHandler('SIGINT'));
        if (NODE_ENV === 'development') {
            try {
                const { getRoutes } = await import('./utils/routeRegistry');
                const routesList = getRoutes();
                logger.info('📍 Available routes:');
                Object.entries(routesList).forEach(([module, rts]) => {
                    logger.info(`  ${module.toUpperCase()}:`);
                    rts.forEach((rt) => {
                        logger.info(`   ${rt.method.padEnd(6)} ${rt.path}`);
                    });
                    logger.info('');
                });
            }
            catch {
                logger.info('📍 Routes (static fallback):');
                logger.info('  AUTH: POST /api/v1/auth/register, POST /api/v1/auth/login, ...');
                logger.info('  ORDERS: GET/POST /api/v1/orders, GET /api/v1/orders/:id');
            }
        }
        if (NODE_ENV === 'development') {
            const { rateLimitManager } = await import('./middleware/rateLimiter');
            setInterval(() => {
                const stats = rateLimitManager.getStats();
                logger.debug('📊 Rate Limit Stats:', {
                    activeKeys: stats.totalKeys,
                    violations: stats.totalViolations,
                    whitelisted: stats.whitelistSize,
                    blacklisted: stats.blacklistSize,
                });
            }, 5 * 60 * 1000);
        }
        logger.info(`Health check: ${NODE_ENV === 'production' ? 'https' : 'http'}://localhost:${PORT}/health`);
    }
    catch (error) {
        const err = error;
        logger.error('❌ Server start error:', { message: err.message, stack: err.stack });
        process.exit(1);
    }
};
process.on('unhandledRejection', (reason, promise) => {
    logger.error('❌ Unhandled Rejection:', { promise, reason: reason });
    if (NODE_ENV === 'production')
        process.exit(1);
});
process.on('uncaughtException', (error) => {
    logger.error('❌ Uncaught Exception:', error);
    if (NODE_ENV === 'production')
        process.exit(1);
});
startServer().catch((err) => {
    logger.error('Fatal start error:', err);
    process.exit(1);
});
//# sourceMappingURL=server.js.map