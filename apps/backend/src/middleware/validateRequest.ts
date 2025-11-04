/**
 * Compatibility Wrapper - Validation Middleware (TypeScript - November 2025)
 * @description Re-export de funciones de validación para compatibilidad legacy en CERMONT ATG.
 * Mantiene rutas existentes que importan directamente de este archivo (e.g., ../middleware/validateRequest.js).
 * Soporta Joi/AJV schemas; integra con sanitize/audit. No lógica nueva: Pure re-export.
 * Uso legacy:  // -> ./validate.ts
 * Nota: En refactor, migra imports a ../middleware/validate.ts directamente. Remover este wrapper post-refactor.
 * Para ATG: Protege endpoints como /orders/:id (validateObjectId via validate.ts).
 * Pruebas: Import en routes (no errors), re-export types inferred (Joi.ObjectSchema, Middleware funcs).
 * Types: No new interfaces; infer from ./validate.ts (e.g., validateBody: (schema: ObjectSchema) => Middleware).
 * Fixes: Import from './validate' (TS resolves .ts). Default export Record with all funcs.
 * Assumes: ./validate.ts exists with typed exports. Legacy routes update path to .js (TS handles).
 */

import {
  validateBody,
  validateQuery,
  validateParams,
  validateRequest,
  validateObjectId,
  validatePagination,
  pagSchema,
  idSchema,
} from './validate';

/**
 * Re-exports principales para compatibilidad
 */
export {
  validateRequest, // Core multi-part validator
  validateBody, // Joi body
  validateQuery, // Joi query
  validateParams, // Joi params
  validateObjectId, // Mongo ID
  validatePagination, // Pagination params
};

// Predefined schemas (ATG common)
export { pagSchema, idSchema };

// Default export (si legacy usa default)
export default {
  validateRequest,
  validateBody,
  validateQuery,
  validateParams,
  validateObjectId,
  validatePagination,
};
