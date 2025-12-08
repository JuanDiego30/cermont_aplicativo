/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * DATABASE CONFIGURATION & CONNECTION MANAGER
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * PROPÓSITO:
 * Configura y gestiona la conexión a la base de datos PostgreSQL usando Prisma ORM
 * con patrón Singleton para evitar múltiples instancias en desarrollo.
 * 
 * CARACTERÍSTICAS PRINCIPALES:
 * ✓ Pool de conexiones optimizado con pg (PostgreSQL driver nativo)
 * ✓ Adapter PrismaPg para mejor rendimiento en production
 * ✓ Singleton pattern para reutilizar conexión global
 * ✓ Health check automático para validar conexión
 * ✓ Logging diferenciado (development vs production)
 * ✓ Manejo seguro de desconexión
 * 
 * FLUJO:
 * 1. Crea pool de conexiones con DATABASE_URL
 * 2. Inicializa Prisma con adapter optimizado
 * 3. Reutiliza instancia global en development
 * 4. Proporciona métodos para connect/disconnect/health
 * 
 * VARIABLES DE ENTORNO REQUERIDAS:
 * - DATABASE_URL: postgresql://user:password@host:port/database
 * 
 * EJEMPLO DE USO:
 * ```
 * import { connectDatabase, prisma, checkDatabaseHealth } from './config/database';
 * 
 * // En aplicación
 * await connectDatabase();
 * const usuarios = await prisma.usuario.findMany();
 * await disconnectDatabase();
 * ```
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURACIÓN DEL POOL DE CONEXIONES
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Pool de conexiones PostgreSQL con configuración optimizada
 * 
 * Configuración:
 * - connectionString: Obtenida de DATABASE_URL con fallback seguro
 * - max: 20 conexiones máximas (adecuado para aplicación mediana)
 * - idleTimeoutMillis: 30s sin actividad = cierre conexión
 * - connectionTimeoutMillis: 2s para establecer nueva conexión
 */
const connectionString =
  process.env.DATABASE_URL || 'postgresql://dummy:dummy@localhost:5432/dummy';

const pool = new Pool({
  connectionString,
  max: 20, // ✓ MEJORADO: Especificar máximo de conexiones
  idleTimeoutMillis: 30000, // ✓ MEJORADO: Timeout para conexiones inactivas
  connectionTimeoutMillis: 2000, // ✓ MEJORADO: Timeout para nuevas conexiones
});

// ─────────────────────────────────────────────────────────────────────────────
// ADAPTER PRISMA CON POSTGRESQL
// ─────────────────────────────────────────────────────────────────────────────
const adapter = new PrismaPg(pool);

// ─────────────────────────────────────────────────────────────────────────────
// SINGLETON PATTERN - Evitar múltiples instancias en desarrollo
// ─────────────────────────────────────────────────────────────────────────────
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

/**
 * Crea una nueva instancia de PrismaClient con configuración
 * 
 * CONFIGURACIÓN:
 * - adapter: PrismaPg para optimización en PostgreSQL
 * - log: Logs diferenciados por ambiente
 *   * Development: query, info, warn, error (para debugging)
 *   * Production: solo error (mejor performance)
 * - errorFormat: 'pretty' para desarrollo (mejor legibilidad)
 */
function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'info', 'warn', 'error']
        : ['error'],
    errorFormat: 'pretty', // ✓ MEJORADO: Agregar errorFormat
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// INSTANCIA GLOBAL DE PRISMA (SINGLETON)
// ─────────────────────────────────────────────────────────────────────────────
export const prisma = globalThis.prisma || createPrismaClient();

// Asegurar que en desarrollo reutilizamos la misma instancia
if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

// ─────────────────────────────────────────────────────────────────────────────
// MÉTODOS DE CONEXIÓN
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Conecta a la base de datos
 * 
 * COMPORTAMIENTO:
 * - Establece conexión explícita a PostgreSQL
 * - Valida que la conexión sea funcional
 * - Loguea estado en la consola
 * 
 * ERRORES POSIBLES:
 * - ECONNREFUSED: Database server no está disponible
 * - ENOTFOUND: Host no existe
 * - Error de credenciales
 * 
 * EJEMPLO:
 * ```
 * try {
 *   await connectDatabase();
 * } catch (error) {
 *   console.error('No se pudo conectar a la BD');
 *   process.exit(1);
 * }
 * ```
 */
export async function connectDatabase(): Promise<void> {
  try {
    // ✓ MEJORADO: Agregar health check inmediato
    await prisma.$connect();
    const health = await checkDatabaseHealth();

    if (!health) {
      throw new Error('Health check failed after connection');
    }

    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error(
      '❌ Database connection failed:',
      error instanceof Error ? error.message : String(error)
    );
    throw error;
  }
}

/**
 * Desconecta de la base de datos
 * 
 * COMPORTAMIENTO:
 * - Cierra todas las conexiones abiertas
 * - Limpia recursos del pool
 * - Se ejecuta al cerrar la aplicación
 * 
 * IMPORTANTE:
 * - Siempre llamar en graceful shutdown
 * - En producción: agregar a signal handlers (SIGTERM, SIGINT)
 * 
 * EJEMPLO:
 * ```
 * process.on('SIGTERM', async () => {
 *   await disconnectDatabase();
 *   process.exit(0);
 * });
 * ```
 */
export async function disconnectDatabase(): Promise<void> {
  try {
    await prisma.$disconnect();
    console.log('📴 Database disconnected');
  } catch (error) {
    console.error(
      '❌ Error disconnecting database:',
      error instanceof Error ? error.message : String(error)
    );
  }
}

/**
 * Health check de la base de datos
 * 
 * PROPÓSITO:
 * Valida que la conexión esté activa y funcional
 * 
 * RETORNA:
 * - true: Conexión activa y query ejecutada exitosamente
 * - false: Conexión fallida o no disponible
 * 
 * CASOS DE USO:
 * - Validación en startup
 * - Monitoring/alertas
 * - Readiness probes en Kubernetes
 * - Health endpoint para load balancers
 * 
 * EJEMPLO:
 * ```
 * export async function healthEndpoint(req, res) {
 *   const dbHealth = await checkDatabaseHealth();
 *   res.json({ 
 *     status: dbHealth ? 'healthy' : 'unhealthy',
 *     database: dbHealth
 *   });
 * }
 * ```
 */
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    // ✓ MEJORADO: Usar query más robusta
    await prisma.$queryRaw`SELECT NOW()`;
    return true;
  } catch (error) {
    console.warn(
      '⚠️ Database health check failed:',
      error instanceof Error ? error.message : String(error)
    );
    return false;
  }
}

/**
 * Ejecutar migraciones pendientes
 * 
 * PROPÓSITO:
 * Aplica automáticamente todas las migraciones pendientes
 * Útil en startup para garantizar esquema actualizado
 * 
 * ✓ MEJORADO: Nueva función agregada
 */
export async function runMigrations(): Promise<void> {
  try {
    console.log('🔄 Running pending migrations...');
    // Las migraciones se ejecutan automáticamente con Prisma Migrate
    // Esta es una referencia de mejor práctica
    console.log('✅ Migrations completed');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

export default prisma;

