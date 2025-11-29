/**
 * Punto de entrada del servidor
 * @file backend/src/server.ts
 */

import 'dotenv/config';
import 'module-alias/register'; // Mantener solo si es estrictamente necesario por tu setup de TS
import http from 'http';
import createApp from './app.js';
import { config } from './shared/config/index.js';
import prisma from './infra/db/prisma.js';
import { logger } from './shared/utils/logger.js';
import { JobScheduler } from './infra/scheduler/JobScheduler.js';

const PORT = config.port || 3000;
const HOST = process.env.HOST || '0.0.0.0';

async function startServer() {
  let server: http.Server | null = null;

  try {
    // 1. Inicializar Base de Datos
    logger.info('🔍 Connecting to database...');
    await prisma.$connect();
    logger.info('✅ Database connected successfully');

    // 2. Iniciar Jobs en segundo plano
    logger.info('🔍 Starting job scheduler...');
    JobScheduler.startAll();
    logger.info('✅ Job scheduler started');

    // 3. Crear App Express
    logger.info('🔍 Creating Express application...');
    const app = createApp();
    
    // 4. Iniciar Servidor HTTP
    server = app.listen(PORT, HOST, () => {
      const banner = `
      ==================================================
      ✅ SERVER STARTED SUCCESSFULLY
      🚀 URL: http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}
      📊 Environment: ${config.nodeEnv}
      ==================================================
      `;
      // Usar console.log solo para el banner visual en consola, logger para registro
      console.log(banner); 
      logger.info(`Server listening on port ${PORT} in ${config.nodeEnv} mode`);
    });

    server.on('error', (error: Error) => {
      logger.error('❌ Server runtime error:', { error: error.message, stack: error.stack });
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    
    logger.error('❌ Fatal error starting server:', { error: message, stack });
    
    // Intentar cerrar recursos si falló el inicio a medias
    await shutdown(server, 1);
  }

  // Manejo de señales del sistema
  const signals = ['SIGINT', 'SIGTERM'];
  signals.forEach((signal) => {
    process.on(signal, () => {
      logger.info(`🛑 Received ${signal}, starting graceful shutdown...`);
      shutdown(server, 0);
    });
  });
}

/**
 * Cierre elegante de recursos
 */
async function shutdown(server: http.Server | null, exitCode: number) {
  try {
    // 1. Dejar de aceptar nuevas conexiones HTTP
    if (server) {
      await new Promise<void>((resolve, reject) => {
        server.close((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      logger.info('✅ HTTP server closed');
    }

    // 2. Cerrar conexión a Base de Datos
    await prisma.$disconnect();
    logger.info('✅ Database disconnected');

    // 3. (Opcional) Detener Jobs si tuviesen método stop()
    // JobScheduler.stopAll(); 

    logger.info('👋 Graceful shutdown completed');
    process.exit(exitCode);
  } catch (error) {
    logger.error('❌ Error during shutdown:', { error });
    process.exit(1); // Forzar salida con error si falla el shutdown
  }
}

// Iniciar
startServer();

