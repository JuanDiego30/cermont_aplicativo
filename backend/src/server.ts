import 'dotenv/config';
import 'module-alias/register';
import createApp from './app.js';
import { config } from './shared/config/index.js';
import prisma from './infra/db/prisma.js';
import { logger } from './shared/utils/logger.js';
import { JobScheduler } from './jobs/JobScheduler.js';

const PORT = config.port;

async function startServer() {
  try {
    console.log('🔍 Intentando conectar a la base de datos...');
    await prisma.$connect();
    logger.info('✅ Base de datos conectada correctamente');

    console.log('🔍 Iniciando job scheduler...');
    JobScheduler.startAll();
    logger.info('✅ Job scheduler iniciado');

    console.log('🔍 Creando aplicación Express...');
    const expressApp = createApp();
    logger.info('✅ Aplicación Express creada');

    console.log(`🔍 Iniciando servidor en puerto ${PORT}...`);
    const server = expressApp.listen(PORT, () => {
      console.log(`\n${'='.repeat(50)}`);
      console.log(`✅ SERVIDOR INICIADO CORRECTAMENTE`);
      console.log(`🚀 URL: http://localhost:${PORT}`);
      console.log(`📊 Entorno: ${config.nodeEnv}`);
      console.log(`${'='.repeat(50)}\n`);
      logger.info(`✅ Servidor escuchando en http://localhost:${PORT}`);
    });

    server.on('error', (error: any) => {
      console.error('❌ Error del servidor:', error);
      logger.error('Server error:', error);
    });
  } catch (error: unknown) {
    console.error('❌ Error al iniciar el servidor:', error);
    logger.error('❌ Error al iniciar el servidor:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    process.exit(1);
  }
}

process.on('SIGINT', async () => {
  logger.info('🛑 Recibida señal SIGINT, cerrando servidor...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('🛑 Recibida señal SIGTERM, cerrando servidor...');
  await prisma.$disconnect();
  process.exit(0);
});

startServer();
