/**
 * Pagination Utilities (TypeScript - November 2025)
 * @description Utilidades de paginación para Mongoose en CERMONT ATG: cursorPaginate (eficiente para grandes datasets, cursor ID-based, sort-aware), offsetPaginate (tradicional page/skip, con total count), autoPaginate (auto-elige basado en options.cursor/page, default cursor). Soporta populate (array PopulateOptions), select (string/Projection), filters (FilterQuery<T>). Limits: PAGINATION.DEFAULT_LIMIT/MAX_LIMIT, validate options. Lean() por default para perf. Secure: Sanitize filters (no user $operators), validate cursor ObjectId, limit <= MAX_LIMIT.
 * Uso: import { autoPaginate } from '../utils/pagination.ts'; const { docs, pagination } = await autoPaginate(Order, { status: ORDER_STATUS.PENDING, assignedTo: userId }, { page: 1, limit: 10, populate: [{ path: 'assignedTo', select: 'name email' }] }); return res.json({ success: true, data: docs, pagination });
 * Integra con: constants.ts (PAGINATION, ORDER_STATUS), logger (logDatabaseOperation('find', 'Order', { filters, duration })), errorHandler (throw AppError si invalid cursor/page). Performance: Cursor no skip (O(1) vs O(n) offset), +1 query para hasMore, lean() reduce memory. Secure: No eval filters (FilterQuery), limit cap anti-DoS. Para ATG: Geo queries (near/sphere), full-text ($text), aggregate paginación si complex.
 * Extensible: Add search: { $text: { $search: query } }, aggregation paginación (facet para total/docs). Types: Generic <T extends Document>, PaginationResult<T>, CursorOptions, OffsetOptions. Fixes: Typed model (mongoose.Model<T>), validate limit/page/cursor (isValidObjectId), filters: FilterQuery<T>, sort: SortDescriptor, error on invalid.
 * Integrate: En routes: const options = { ...req.query, limit: Math.min(Number(req.query.limit) || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT) }; if (options.page) options.page = Math.max(1, Number(options.page)); const start = Date.now(); const result = await autoPaginate(model, filters, options); logDatabaseOperation('paginate', model.modelName, { duration: Date.now() - start, ...options }); En middleware: Validate cursor: if (options.cursor && !isValidObjectId(options.cursor)) throw new AppError(ERROR_MESSAGES.VALIDATION_FAILED, HTTP_STATUS.BAD_REQUEST, { code: ERROR_CODES.VALIDATION_ERROR, details: { field: 'cursor' } });
 * Missing: Validation: export const validatePaginationOptions = (options: Partial<CursorOptions | OffsetOptions>): void => { if (options.limit && (options.limit < 1 || options.limit > PAGINATION.MAX_LIMIT)) throw new AppError(...); }; Sanitize filters: export const sanitizeFilters = <T>(filters: FilterQuery<T>): FilterQuery<T> => { // Remove $ operators from user input except whitelisted }; Tests: __tests__/utils/pagination.spec.ts (mock model, test cursor/offset, populate, invalid inputs).
 * Usage: npm run build (tsc utils/pagination.ts), import { autoPaginate, type PaginationResult } from '../utils/pagination.ts'. Barrel: utils/index.ts export * from './pagination.ts'; export type { PaginationResult, CursorOptions } from './pagination.ts'.
 */

import mongoose, { type Model, type Document, type FilterQuery, type PopulateOptions, type PipelineStage, isValidObjectId } from 'mongoose';
import { AppError } from './errorHandler';
import { PAGINATION, HTTP_STATUS, ERROR_CODES, ERROR_MESSAGES } from './constants';
import { logDatabaseOperation } from './logger'; // For perf logging

// ============================================================================
// INTERFACES AND TYPES
// ============================================================================

export interface PaginationMetadata {
  limit: number;
  count: number;
  hasMore: boolean;
}

export interface CursorPaginationMetadata extends PaginationMetadata {
  cursor: string | null;
  nextCursor: string | null;
}

export interface OffsetPaginationMetadata extends PaginationMetadata {
  page: number;
  total: number;
  pages: number;
}

export interface PaginationResult<T extends Document> {
  docs: T[];
  pagination: CursorPaginationMetadata | OffsetPaginationMetadata;
}

export interface BasePaginationOptions {
  limit?: number;
  sort?: Record<string, 1 | -1> | string;
  populate?: PopulateOptions[];
  select?: string | Record<string, any> | null;
}

export interface CursorPaginationOptions extends BasePaginationOptions {
  cursor?: string | null;
}

export interface OffsetPaginationOptions extends BasePaginationOptions {
  page?: number;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Valida y normaliza opciones de paginación comunes
 * @param options - Opciones base
 * @returns Opciones normalizadas
 * @throws AppError si invalid
 */
const normalizeOptions = (options: BasePaginationOptions): Required<BasePaginationOptions> => {
  const limit = Math.min(Math.max(Number(options.limit) || PAGINATION.DEFAULT_LIMIT, 1), PAGINATION.MAX_LIMIT);
  const sort = options.sort || { _id: -1 };
  const populate = Array.isArray(options.populate) ? options.populate : [];
  const select = options.select || null;

  return { limit, sort, populate, select };
};

/**
 * Sanitiza filtros para seguridad (opcional, anti-injection)
 * @param filters - Filtros raw
 * @returns Filtros sanitizados (remueve $operators no whitelisted si needed)
 */
export const sanitizeFilters = <T extends Document>(filters: FilterQuery<T>): FilterQuery<T> => {
  // Implementa remoción de $operators user-provided si no trusted
  // Ej: const allowedOps = ['$eq', '$in', '$or']; // Whitelist
  // For now, assume trusted; add validation en middleware
  return { ...filters };
};

/**
 * Valida cursor como ObjectId válido
 * @param cursor - Cursor string
 * @returns true si válido
 * @throws AppError si invalid
 */
const validateCursor = (cursor?: string | null): boolean => {
  if (!cursor) return true;
  if (!isValidObjectId(cursor)) {
    throw new AppError(
      ERROR_MESSAGES.VALIDATION_FAILED,
      HTTP_STATUS.BAD_REQUEST,
      { code: ERROR_CODES.VALIDATION_ERROR, details: { field: 'cursor', message: 'Invalid ObjectId' } }
    );
  }
  return true;
};

/**
 * Valida y normaliza opciones de paginación cursor
 * @param options - Opciones cursor
 * @returns Opciones normalizadas
 */
const normalizeCursorOptions = (options: CursorPaginationOptions): Required<CursorPaginationOptions> => {
  validateCursor(options.cursor);
  return { ...normalizeOptions(options), cursor: options.cursor || null };
};

/**
 * Valida y normaliza opciones de paginación offset
 * @param options - Opciones offset
 * @returns Opciones normalizadas
 */
const normalizeOffsetOptions = (options: OffsetPaginationOptions): Required<OffsetPaginationOptions> => {
  const page = Math.max(Number(options.page) || PAGINATION.DEFAULT_PAGE, 1);
  return { ...normalizeOptions(options), page };
};

// ============================================================================
// CURSOR-BASED PAGINATION
// ============================================================================

/**
 * Paginación cursor-based para queries de MongoDB (eficiente O(1))
 * @param model - Modelo de Mongoose
 * @param filters - Filtros de búsqueda (FilterQuery<T>)
 * @param options - Opciones de paginación cursor
 * @returns Resultado paginado con metadata
 */
export const cursorPaginate = async <T extends Document>(
  model: Model<T>,
  filters: FilterQuery<T> = {} as FilterQuery<T>,
  options: CursorPaginationOptions = {}
): Promise<PaginationResult<T>> => {
  const { limit, sort, populate, select, cursor } = normalizeCursorOptions(options);
  const startTime = Date.now();

  let query: FilterQuery<T> = sanitizeFilters(filters);

  // Aplicar cursor si existe
  if (cursor) {
    // FIXED: Type-safe cursor value extraction
    const sortKey = typeof sort === 'string' ? sort : Object.keys(sort as Record<string, 1 | -1>)[0] || '_id';
    const sortDir = typeof sort === 'string' ? -1 : (sort as Record<string, 1 | -1>)[sortKey];
    const cursorDoc = await model.findById(cursor).select(sortKey).lean().exec();
    const cursorValue = cursorDoc && sortKey in cursorDoc ? (cursorDoc as any)[sortKey] : new mongoose.Types.ObjectId(cursor);

    const op = sortDir < 0 ? '$lt' : '$gt';
    query = { ...query, [sortKey]: { [op]: sortKey === '_id' ? new mongoose.Types.ObjectId(cursor) : cursorValue } };
  }

  // Construir y ejecutar query
  let queryBuilder = model.find(query).sort(sort).limit(limit + 1).lean(); // +1 para hasMore

  if (populate.length > 0) {
    queryBuilder = queryBuilder.populate(populate);
  }

  if (select) {
    queryBuilder = queryBuilder.select(select);
  }

  // FIXED: Type assertion for docs array
  const results = await queryBuilder.exec();
  const hasMore = results.length > limit;
  const docs = (hasMore ? results.slice(0, limit) : results) as T[];

  const nextCursor = hasMore && docs.length > 0 ? (docs[docs.length - 1]._id as mongoose.Types.ObjectId).toString() : null;

  const duration = Date.now() - startTime;
  logDatabaseOperation('cursorPaginate', model.modelName, { filters: JSON.stringify(filters), cursor, limit, duration, count: docs.length });

  return {
    docs,
    pagination: {
      cursor,
      nextCursor,
      hasMore,
      limit,
      count: docs.length,
    },
  };
};

// ============================================================================
// OFFSET-BASED PAGINATION
// ============================================================================

/**
 * Paginación offset-based tradicional (page/skip, O(n) para large pages)
 * @param model - Modelo de Mongoose
 * @param filters - Filtros de búsqueda (FilterQuery<T>)
 * @param options - Opciones de paginación offset
 * @returns Resultado paginado con metadata (incluye total)
 */
export const offsetPaginate = async <T extends Document>(
  model: Model<T>,
  filters: FilterQuery<T> = {} as FilterQuery<T>,
  options: OffsetPaginationOptions = {}
): Promise<PaginationResult<T>> => {
  const { limit, sort, populate, select, page } = normalizeOffsetOptions(options);
  const startTime = Date.now();
  const skip = (page - 1) * limit;

  let query: FilterQuery<T> = sanitizeFilters(filters);

  // Count total (expensive, cache si frequent)
  const total = await model.countDocuments(query).exec();

  // Construir y ejecutar query
  let queryBuilder = model.find(query).sort(sort).skip(skip).limit(limit).lean();

  if (populate.length > 0) {
    queryBuilder = queryBuilder.populate(populate);
  }

  if (select) {
    queryBuilder = queryBuilder.select(select);
  }

  // FIXED: Type assertion for docs array
  const docs = (await queryBuilder.exec()) as T[];

  const duration = Date.now() - startTime;
  logDatabaseOperation('offsetPaginate', model.modelName, { filters: JSON.stringify(filters), page, limit, skip, total, duration, count: docs.length });

  return {
    docs,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      hasMore: page * limit < total,
      count: docs.length,
    },
  };
};

// ============================================================================
// AUTO PAGINATION
// ============================================================================

/**
 * Auto-selecciona tipo de paginación basado en options
 * @param model - Modelo de Mongoose
 * @param filters - Filtros de búsqueda
 * @param options - Opciones mixtas (cursor o page)
 * @returns Resultado paginado apropiado
 */
export const autoPaginate = async <T extends Document>(
  model: Model<T>,
  filters: FilterQuery<T>,
  options: CursorPaginationOptions | OffsetPaginationOptions = {}
): Promise<PaginationResult<T>> => {
  // Prioridad: cursor si presente, sino offset si page, sino default cursor
  if ('cursor' in options && options.cursor !== undefined) {
    return cursorPaginate(model, filters, options as CursorPaginationOptions);
  }
  if ('page' in options && options.page !== undefined) {
    return offsetPaginate(model, filters, options as OffsetPaginationOptions);
  }
  // Default: cursor con defaults
  return cursorPaginate(model, filters, { ...options } as CursorPaginationOptions);
};

export default { cursorPaginate, offsetPaginate, autoPaginate };
