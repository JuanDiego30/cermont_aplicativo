/**
 * Async Handler Utility
 * @description Wrapper para manejar errores en controladores async/await
 */

import { logger } from './logger.js';

/**
 * Wrapper para funciones async en Express
 * Captura errores automáticamente y los pasa al middleware de error
 * @param {Function} fn - Función async a ejecutar
 * @returns {Function} Función wrapped
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
      logger.error('Error en asyncHandler:', {
        error: error.message,
        stack: error.stack,
        path: req.path,
        method: req.method,
        userId: req.userId,
      });
      next(error);
    });
  };
};

/**
 * Try-catch wrapper para funciones async genéricas
 * @param {Function} fn - Función async a ejecutar
 * @param {string} errorMessage - Mensaje de error personalizado
 */
export const tryCatch = async (fn, errorMessage = 'Error en operación') => {
  try {
    return await fn();
  } catch (error) {
    logger.error(`${errorMessage}:`, error);
    throw error;
  }
};

/**
 * Wrapper para operaciones de base de datos con retry
 * @param {Function} operation - Operación a ejecutar
 * @param {number} maxRetries - Número máximo de reintentos
 * @param {number} delay - Delay entre reintentos en ms
 */
export const retryOperation = async (operation, maxRetries = 3, delay = 1000) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (attempt < maxRetries) {
        logger.warn(`Intento ${attempt} falló, reintentando en ${delay}ms...`, {
          error: error.message,
        });
        
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      }
    }
  }
  
  logger.error(`Operación falló después de ${maxRetries} intentos:`, lastError);
  throw lastError;
};

/**
 * Ejecutar múltiples promesas con manejo de errores individual
 * @param {Array} promises - Array de promesas
 * @returns {Array} Array con resultados o errores
 */
export const settleAll = async (promises) => {
  const results = await Promise.allSettled(promises);
  
  return results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return { success: true, data: result.value, index };
    } else {
      logger.error(`Promesa ${index} falló:`, result.reason);
      return { success: false, error: result.reason, index };
    }
  });
};

export default asyncHandler;
