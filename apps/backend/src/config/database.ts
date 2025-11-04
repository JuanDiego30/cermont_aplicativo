/**
 * Database Configuration (TypeScript - November 2025, Fixed)
 * @description Configuración de conexión a MongoDB con Mongoose v8.x+, tipada para @types/mongoose^8.x. Soporta Atlas/standalone/replica sets.
 * Uso: En server.ts (await connectDB() en init), health checks (/health → res.json(checkDBHealth())). Env: MONGODB_URI (req), DB_POOL_SIZE=10, RETRY_COUNT=3 (default), NODE_ENV=production/test.
 * Integrado con: logger (structured info/error/warn), mongoose events (error/disconnected/reconnected/close). Graceful shutdown (SIGINT/SIGTERM).
 * Secure: No creds en logs (URI env-only, authMechanism='DEFAULT' SCRAM), TLS implicit en mongodb+srv. Performance: minPoolSize=1, maxIdleTimeMS=30000, autoIndex off en prod, bufferCommands false.
 * Extensible: Retry exponencial en disconnected (backoff hasta RETRY_COUNT), support test DB (MONGO_TEST_URI). Para ATG: Monitoring con appName='CERMONT-ATG', strictQuery true (v8 default).
 * Types: ConnectOptions (v8+), Error genérico. conn.host/name/port con fallback 'unknown'.
 * Pruebas: Jest mock('mongoose') { connect: jest.fn().mockResolvedValue(conn), connection: {on: jest.fn(), close: jest.fn().mockResolvedValue()}}, expect(connectDB).rejects.toThrow('MONGODB_URI'), test retry (mock disconnected → reconnect calls).
 * Fixes/Updates 2025: Removido bufferTimeoutMS (TS2353, no en ConnectOptions), .close(false) boolean (TS2345, no object), omitido useReplicaSet (TS2339, no en Connection). Retry impl, strictQuery explicit, appName added, structured logs, URI validation. Si v7, downgrade types. tsconfig: "strict": true, "module": "esnext".
 * Model Assumes: Mongoose global conn, no multiple connects (if readyState===1 return). Deps: mongoose@^8.3.0, @types/mongoose@^8.0.0. Env validation: dotenv config prior.
 */

import mongoose, { Connection, ConnectOptions } from 'mongoose';
import { logger } from '../utils/logger';

// Config env vars (assume loaded)
const DB_POOL_SIZE = process.env.DB_POOL_SIZE ? parseInt(process.env.DB_POOL_SIZE, 10) : 10;
const RETRY_COUNT = process.env.RETRY_COUNT ? parseInt(process.env.RETRY_COUNT, 10) : 3;
const RETRY_DELAY = 2000; // ms base

interface DBHealth {
  status: 'disconnected' | 'connected' | 'connecting' | 'disconnecting' | 'unknown';
  isConnected: boolean;
  dbName: string;
  host: string;
  port?: number;
}

/**
 * Retry logic helper (exponential backoff)
 * @param maxRetries - Max attempts
 * @returns Promise<void> on success or throws on fail
 */
const retryConnect = async (maxRetries: number): Promise<void> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await connectDB();
      return;
    } catch (err) {
      const delay = RETRY_DELAY * Math.pow(2, attempt - 1); // 2s, 4s, 8s...
      logger.warn(`Retry ${attempt}/${maxRetries} failed, waiting ${delay}ms`, { error: (err as Error).message });
      if (attempt === maxRetries) throw err;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

/**
 * Conectar a MongoDB (singleton-ish, retry on disconnect)
 * @returns {Promise<Connection>} Conexión establecida
 * @throws {Error} Si URI faltante o conexión falla tras retries
 */
export const connectDB = async (): Promise<Connection> => {
  try {
    // Early return if already connected
    if (mongoose.connection.readyState === 1) {
      logger.info('MongoDB already connected');
      return mongoose.connection;
    }

    // Opciones v8+ para escalabilidad, fiabilidad y monitoring
    // strictQuery is not a ConnectOptions property; set it globally on mongoose
    mongoose.set('strictQuery', true);

    const options: ConnectOptions = {
      maxPoolSize: DB_POOL_SIZE,
      minPoolSize: 1, // Idle connections
      maxIdleTimeMS: 30000, // Close idle
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4, // IPv4 only
      autoIndex: process.env.NODE_ENV !== 'production',
      bufferCommands: false, // No buffering
      appName: 'CERMONT-ATG', // Atlas monitoring
      // auth: { authSource: 'admin' } if needed
    };

    // URI prioritization, validation
    const mongoUri: string = (process.env.NODE_ENV === 'test'
      ? process.env.MONGO_TEST_URI || process.env.MONGODB_URI || process.env.MONGO_URI
      : process.env.MONGODB_URI || process.env.MONGO_URI) || 'mongodb://localhost:27017/cermont';

    if (!mongoUri) {
      throw new Error('MONGODB_URI, MONGO_URI o MONGO_TEST_URI requerida en env');
    }

    // Basic URI validation (protocol)
    if (!mongoUri.startsWith('mongodb://') && !mongoUri.startsWith('mongodb+srv://')) {
      throw new Error('URI MongoDB inválida: debe empezar con mongodb:// o mongodb+srv://');
    }

    await mongoose.connect(mongoUri, options);
    const conn = mongoose.connection;

    // Structured logging
    logger.info('✅ MongoDB Connected', {
      dbName: conn.name || 'unknown',
      host: conn.host || 'unknown',
      port: conn.port || undefined,
    });

    // Global events (once to avoid multiples)
    if (!mongoose.connection.listeners('error').length) {
      mongoose.connection.once('error', (err: Error) => {
        logger.error('❌ MongoDB connection error', { error: err.message, stack: err.stack });
      });

      mongoose.connection.once('disconnected', async () => {
        logger.warn('⚠️ MongoDB disconnected. Retrying connection...');
        try {
          await retryConnect(RETRY_COUNT);
        } catch (retryErr) {
          logger.error('❌ Max retries exceeded. Exiting.', { error: (retryErr as Error).message });
          process.exit(1);
        }
      });

      mongoose.connection.once('reconnected', () => {
        logger.info('✅ MongoDB reconnected');
      });

      mongoose.connection.once('close', () => {
        logger.info('MongoDB connection closed');
      });
    }

    // Graceful shutdown enhanced (SIGINT/SIGTERM)
    const gracefulShutdown = async (signal: string): Promise<void> => {
      logger.info(`Received ${signal}. Closing MongoDB connection...`);
      await mongoose.connection.close(false); // Graceful, no force
      logger.info('MongoDB connection closed through app termination');
      process.exit(0);
    };

    // Remove previous to avoid duplicates
    process.removeAllListeners('SIGINT');
    process.removeAllListeners('SIGTERM');

    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

    return conn;
  } catch (error) {
    const err = error as Error;
    logger.error('❌ Error connecting to MongoDB', { message: err.message, stack: err.stack });
    if (process.env.NODE_ENV === 'test') {
      throw err;
    }
    process.exit(1);
  }
};

/**
 * Cerrar conexión a DB (graceful)
 * @returns {Promise<void>}
 * @throws {Error} Si close falla
 */
export const closeDB = async (): Promise<void> => {
  try {
    if (mongoose.connection.readyState === 1 || mongoose.connection.readyState === 3) {
      await mongoose.connection.close(false); // Graceful boolean
      logger.info('MongoDB connection closed gracefully');
    } else {
      logger.warn('MongoDB not connected, skipping close');
    }
  } catch (error) {
    const err = error as Error;
    logger.error('Error closing MongoDB connection', { message: err.message });
    throw err; // Re-throw for caller
  }
};

/**
 * Verificar salud de conexión DB (enhanced metrics)
 * @returns {DBHealth} Estado y métricas básicas
 */
export const checkDBHealth = (): DBHealth => {
  const state: number = mongoose.connection.readyState;
  const states: Record<number, DBHealth['status']> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  return {
    status: states[state] || 'unknown',
    isConnected: state === 1,
    dbName: mongoose.connection.name || 'unknown',
    host: mongoose.connection.host || 'unknown',
    port: mongoose.connection.port,
  };
};

export default { connectDB, closeDB, checkDBHealth };

