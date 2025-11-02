import cacheService from '../services/cache.service.js';
import logger from '../utils/logger.js';

/**
 * Middleware para cachear respuestas de rutas GET
 * Uso: router.get('/users', cacheMiddleware(60), userController.list)
 * 
 * @param {number} ttl - TTL en segundos (por defecto 60)
 * @param {Function} keyGenerator - Función para generar key (opcional)
 * @returns {Function} Middleware de Express
 */
export const cacheMiddleware = (ttl = 60, keyGenerator = null) => {
  return (req, res, next) => {
    // Solo cachear GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Generar clave de cache
    const cacheKey = keyGenerator 
      ? keyGenerator(req)
      : generateCacheKey(req);

    // Verificar si existe en cache
    const cached = cacheService.get(cacheKey);

    if (cached) {
      // HIT: Devolver desde cache
      logger.debug(`[Cache Middleware] HIT: ${cacheKey}`);
      
      return res.json({
        ...cached,
        _cached: true,
        _cachedAt: new Date().toISOString()
      });
    }

    // MISS: Interceptar res.json para guardar en cache
    const originalJson = res.json.bind(res);

    res.json = function(body) {
      // Solo cachear respuestas exitosas
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cacheService.set(cacheKey, body, ttl);
        logger.debug(`[Cache Middleware] MISS guardado: ${cacheKey} (TTL: ${ttl}s)`);
      }

      return originalJson(body);
    };

    next();
  };
};

/**
 * Generar clave de cache estándar
 * Formato: ruta:query:user
 */
const generateCacheKey = (req) => {
  const path = req.originalUrl || req.url;
  const userId = req.user?._id?.toString() || 'anonymous';
  
  // Incluir query params en la key
  const queryString = new URLSearchParams(req.query).toString();
  
  return `route:${path}:${queryString}:${userId}`;
};

/**
 * Middleware para invalidar cache por patrón
 * Uso: router.post('/users', invalidateCache('users:*'), userController.create)
 * 
 * @param {string} pattern - Patrón de keys a invalidar
 * @returns {Function} Middleware de Express
 */
export const invalidateCache = (pattern) => {
  return (req, res, next) => {
    // Ejecutar después de la respuesta
    res.on('finish', () => {
      // Solo invalidar en operaciones exitosas
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const deleted = cacheService.delPattern(pattern);
        
        if (deleted > 0) {
          logger.info(`[Cache] Invalidadas ${deleted} keys con patrón: ${pattern}`);
        }
      }
    });

    next();
  };
};

/**
 * Middleware para invalidar cache específico por ID
 * Útil para rutas de actualización/eliminación
 */
export const invalidateCacheById = (resourceType) => {
  return (req, res, next) => {
    res.on('finish', () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const id = req.params.id;
        
        // Invalidar cache del recurso específico
        cacheService.del(`${resourceType}:${id}`);
        
        // Invalidar listas que puedan contener este recurso
        cacheService.delPattern(`route:*/api/${resourceType}*`);
        
        logger.info(`[Cache] Invalidado cache de ${resourceType}:${id}`);
      }
    });

    next();
  };
};

export default cacheMiddleware;