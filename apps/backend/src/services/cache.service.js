import NodeCache from 'node-cache';
import logger from '../utils/logger.js';

/**
 * Servicio de caché in-memory con Node-Cache
 * Alternativa ligera a Redis para desarrollo y producción pequeña
 * 
 * Configuración:
 * - TTL por defecto: 5 minutos (300 segundos)
 * - Limpieza automática cada 60 segundos
 * - Límite de 1000 keys para evitar memory leaks
 */
class CacheService {
  constructor() {
    this.cache = new NodeCache({
      stdTTL: 300,           // TTL por defecto: 5 minutos
      checkperiod: 60,       // Verificar expiración cada 60 segundos
      maxKeys: 1000,         // Límite máximo de keys
      useClones: false,      // No clonar objetos (mejor performance)
      deleteOnExpire: true   // Eliminar automáticamente al expirar
    });

    // Estadísticas de uso
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0
    };

    // Logs de eventos importantes
    this.cache.on('set', (key, _value) => {
      this.stats.sets++;
      logger.debug(`[Cache] Set: ${key}`);
    });

    this.cache.on('del', (key, _value) => {
      this.stats.deletes++;
      logger.debug(`[Cache] Delete: ${key}`);
    });

    this.cache.on('expired', (key, _value) => {
      logger.debug(`[Cache] Expired: ${key}`);
    });

    logger.info('✅ Cache service inicializado (in-memory)');
  }

  /**
   * Obtener valor del cache
   * @param {string} key - Clave de búsqueda
   * @returns {*} Valor almacenado o undefined
   */
  get(key) {
    const value = this.cache.get(key);
    
    if (value !== undefined) {
      this.stats.hits++;
      logger.debug(`[Cache] HIT: ${key}`);
    } else {
      this.stats.misses++;
      logger.debug(`[Cache] MISS: ${key}`);
    }
    
    return value;
  }

  /**
   * Guardar valor en cache
   * @param {string} key - Clave
   * @param {*} value - Valor a almacenar
   * @param {number} ttl - TTL en segundos (opcional)
   * @returns {boolean} True si se guardó correctamente
   */
  set(key, value, ttl = null) {
    try {
      const success = ttl 
        ? this.cache.set(key, value, ttl)
        : this.cache.set(key, value);
      
      if (success) {
        logger.debug(`[Cache] Guardado: ${key} (TTL: ${ttl || 'default'}s)`);
      }
      
      return success;
    } catch (error) {
      logger.error(`[Cache] Error guardando ${key}:`, error);
      return false;
    }
  }

  /**
   * Eliminar clave específica
   * @param {string} key - Clave a eliminar
   * @returns {number} Cantidad de keys eliminadas
   */
  del(key) {
    return this.cache.del(key);
  }

  /**
   * Eliminar múltiples claves
   * @param {string[]} keys - Array de claves
   * @returns {number} Cantidad de keys eliminadas
   */
  delMultiple(keys) {
    return this.cache.del(keys);
  }

  /**
   * Eliminar todas las claves que coincidan con patrón
   * @param {string} pattern - Patrón de búsqueda (ej: 'user:*')
   * @returns {number} Cantidad de keys eliminadas
   */
  delPattern(pattern) {
    const regex = new RegExp(pattern.replace('*', '.*'));
    const keys = this.cache.keys().filter(key => regex.test(key));
    return this.cache.del(keys);
  }

  /**
   * Verificar si existe una clave
   * @param {string} key - Clave a verificar
   * @returns {boolean} True si existe
   */
  has(key) {
    return this.cache.has(key);
  }

  /**
   * Obtener todas las claves almacenadas
   * @returns {string[]} Array de keys
   */
  keys() {
    return this.cache.keys();
  }

  /**
   * Limpiar todo el cache
   */
  flush() {
    this.cache.flushAll();
    logger.info('[Cache] Cache limpiado completamente');
  }

  /**
   * Obtener estadísticas de uso
   * @returns {Object} Estadísticas
   */
  getStats() {
    return {
      ...this.stats,
      keys: this.cache.keys().length,
      hitRate: this.stats.hits / (this.stats.hits + this.stats.misses) || 0,
      size: this.cache.getStats()
    };
  }

  /**
   * Wrapper para cachear resultados de funciones
   * @param {string} key - Clave de cache
   * @param {Function} fn - Función a ejecutar si no hay cache
   * @param {number} ttl - TTL en segundos
   * @returns {*} Resultado (desde cache o función)
   */
  async wrap(key, fn, ttl = null) {
    // Verificar si existe en cache
    const cached = this.get(key);
    if (cached !== undefined) {
      return cached;
    }

    // Ejecutar función y guardar resultado
    try {
      const result = await fn();
      this.set(key, result, ttl);
      return result;
    } catch (error) {
      logger.error(`[Cache] Error en wrap para ${key}:`, error);
      throw error;
    }
  }
}

// Exportar instancia única (singleton)
const cacheService = new CacheService();
export default cacheService;