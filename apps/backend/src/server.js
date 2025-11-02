/**
 * Server Entry Point (Optimized - October 2025)
 * @description Punto de entrada con inicialización completa y rate limiting
 */

import http from 'http';
import https from 'https';
import dotenv from 'dotenv';
import { connectDB } from './config/database.js';
import { initializeSocket } from './socket/index.js';
import { logger } from './utils/logger.js';
import app from './app.js';
import { getSSLConfig } from './config/ssl.js';

// Cargar variables de entorno
dotenv.config();

// ====================
// CONFIGURACIÓN
// ====================

const PORT = parseInt(process.env.PORT) || 4100;
const HTTP_PORT = parseInt(process.env.HTTP_PORT) || 4000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ====================
// INICIALIZACIÓN
// ====================

/**
 * Función principal de inicialización
 */
const startServer = async () => {
  try {
    // 1. Conectar a MongoDB
    logger.info('📦 Conectando a MongoDB...');
    await connectDB();
    logger.info('✅ MongoDB conectado exitosamente');


    // 2. Configuración SSL con manejo de errores detallado
    let sslConfig = null;
    try {
      sslConfig = getSSLConfig();
    } catch (error) {
      logger.error('❌ Error fatal cargando certificados SSL:', error.message);
      logger.error(' Stack:', error.stack);
      if (process.env.SSL_ENABLED === 'true') {
        logger.error('\n💡 Solución:');
        logger.error(' 1. Ejecuta: npm run generate-cert');
        logger.error(' 2. O desactiva SSL: SSL_ENABLED=false en .env\n');
        process.exit(1);
      }
    }

    let server;
    let httpServer;

    // Crear servidor HTTPS si SSL está habilitado
    if (sslConfig) {
      try {
        server = https.createServer(sslConfig, app);
        logger.info('🔒 Servidor HTTPS habilitado');
        if (NODE_ENV !== 'production') {
          httpServer = http.createServer(app);
          logger.info('⚠️  Servidor HTTP paralelo activo (solo desarrollo)');
        }
      } catch (error) {
        logger.error('❌ Error creando servidor HTTPS:', error.message);
        logger.error(' Código:', error.code);
        logger.error(' Stack:', error.stack);
        process.exit(1);
      }
    } else {
      server = http.createServer(app);
      logger.info('⚠️  Servidor HTTP (no seguro) - Solo para desarrollo');
    }

    // Inicializar Socket.IO
    logger.info('🔌 Inicializando Socket.IO...');
    initializeSocket(server);
    logger.info('✅ Socket.IO inicializado');

    // Iniciar servidor principal con manejo de errores mejorado
    server.listen(PORT, (err) => {
      if (err) {
        logger.error('❌ Error al iniciar servidor en puerto', PORT);
        logger.error(' Error:', err.message);
        logger.error(' Código:', err.code);
        if (err.code === 'EADDRINUSE') {
          logger.error('\n💡 Solución: El puerto está en uso.');
          logger.error(`   Windows: netstat -ano | findstr :${PORT}`);
          logger.error(`   Linux/Mac: lsof -ti:${PORT} | xargs kill -9\n`);
        } else if (err.code === 'EACCES') {
          logger.error(`\n💡 Solución: Permisos insuficientes para el puerto ${PORT}`);
          logger.error('   Prueba con un puerto > 1024 (ej: 4100)');
          logger.error('   O ejecuta con sudo (Linux/Mac)\n');
        }
        process.exit(1);
      }
      const protocol = sslConfig ? 'https' : 'http';
      logger.info('🚀 ======================================');
      logger.info(`🚀 Servidor principal corriendo en ${protocol}://localhost:${PORT}`);
      logger.info(`📊 Ambiente: ${NODE_ENV}`);
      logger.info(`🔐 SSL: ${sslConfig ? 'Habilitado' : 'Deshabilitado'}`);
      logger.info('🚀 ======================================\n');
    });

    // Iniciar servidor HTTP auxiliar si está en desarrollo con SSL
    if (httpServer) {
      httpServer.listen(HTTP_PORT, (err) => {
        if (err) {
          logger.warn('⚠️ No se pudo iniciar servidor HTTP auxiliar:', err.message);
          logger.warn(' (No crítico, solo afecta acceso HTTP paralelo)');
        } else {
          logger.info(`🔓 Servidor HTTP auxiliar corriendo en http://localhost:${HTTP_PORT}`);
        }
      });
    }

    // Capturar errores no manejados del servidor
    server.on('error', (error) => {
      logger.error('\n❌ Error en servidor HTTPS:', error.message);
      logger.error(' Código:', error.code);
      if (error.code === 'EADDRINUSE') {
        logger.error(`\n💡 Puerto ${PORT} ya está en uso por otro proceso`);
      } else if (error.code === 'EACCES') {
        logger.error(`\n💡 Sin permisos para usar puerto ${PORT}`);
        logger.error(' Usa un puerto > 1024 o ejecuta con privilegios de administrador');
      } else if (error.code === 'ENOTFOUND') {
        logger.error('\n💡 Certificado SSL no encontrado o inválido');
        logger.error(' Ejecuta: npm run generate-cert');
      }
      process.exit(1);
    });

    // Manejo de cierre graceful
    const gracefulShutdown = async (signal) => {
      logger.info(`\n👋 ${signal} recibido. Cerrando servidor gracefully...`);
      server.close(async () => {
        logger.info('✅ Servidor HTTP cerrado');

        // Cerrar conexión a MongoDB
        try {
          const mongoose = await import('mongoose');
          await mongoose.default.connection.close();
          logger.info('✅ Conexión a MongoDB cerrada');
        } catch (error) {
          logger.error('❌ Error al cerrar MongoDB:', error);
        }

        logger.info('👋 Proceso terminado exitosamente');
        process.exit(0);
      });

      // Forzar cierre después de 10 segundos
      setTimeout(() => {
        logger.error('❌ No se pudo cerrar gracefully. Forzando salida...');
        process.exit(1);
      }, 10000);
    };

    // Escuchar señales de terminación
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // 7. Mostrar rutas disponibles (solo en desarrollo)
    if (NODE_ENV === 'development') {
      logger.info('📍 Rutas disponibles:');
      logger.info('   AUTH:');
      logger.info('   POST   /api/v1/auth/register');
      logger.info('   POST   /api/v1/auth/login');
      logger.info('   POST   /api/v1/auth/logout');
      logger.info('   POST   /api/v1/auth/refresh');
      logger.info('   GET    /api/v1/auth/me');
      logger.info('   GET    /api/v1/auth/sessions');
      logger.info('');
      logger.info('   ORDERS:');
      logger.info('   GET    /api/v1/orders');
      logger.info('   POST   /api/v1/orders');
      logger.info('   GET    /api/v1/orders/:id');
      logger.info('');
      logger.info('   WORKPLANS:');
      logger.info('   GET    /api/v1/workplans');
      logger.info('   POST   /api/v1/workplans');
      logger.info('');
      logger.info('   ADMIN (NEW):');
      logger.info('   GET    /api/v1/admin/rate-limit/stats');
      logger.info('   POST   /api/v1/admin/rate-limit/block');
      logger.info('   POST   /api/v1/admin/rate-limit/unblock');
      logger.info('   GET    /api/v1/admin/rate-limit/check/:ip');
      logger.info('');
      logger.info('   USERS:');
      logger.info('   GET    /api/v1/users');
      logger.info('   POST   /api/v1/users');
      logger.info('');
      logger.info('   UPLOADS:');
      logger.info('   POST   /api/v1/upload/single');
      logger.info('   POST   /api/v1/upload/multiple\n');
    }

    // NUEVO: Mostrar estadísticas de rate limiting en desarrollo
    if (NODE_ENV === 'development') {
      // Importar dinámicamente para evitar problemas
      const { rateLimitManager } = await import('./middleware/rateLimiter.js');
      
      // Mostrar estadísticas cada 5 minutos
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

  } catch (error) {
    logger.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

// ====================
// INICIAR SERVIDOR
// ====================

startServer();
