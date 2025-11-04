/**
 * Custom Validators (TypeScript - November 2025)
 * @description Validadores específicos del negocio para CERMONT ATG: User (register/login, strength via password utils), Order (fields, ObjectId, dates, enums), WorkPlan (activities array, refs), File (size/mime/filename), Query (pagination/filters/search, dates). Returns { errors: string[], sanitized: Partial<T> } or throws AppError. Integrates Joi schemas for middleware, custom for complex (e.g. activities map). Secure: Sanitize inputs (no SQLi/XSS via middleware/sanitizers), validate ObjectId (mongoose.isValidObjectId), enums (ROLES, ORDER_STATUS). No passwords sanitized (hash later). Performance: Sync, no DB calls. Types: Interfaces for data shapes (RegisterData, etc.), ValidationResult<T>.
 * Uso: import { validateRegisterData } from '../utils/validators.ts'; const { errors, sanitized } = validateRegisterData(req.body); if (errors.length > 0) return validationErrorResponse(res, errors.map(msg => ({ message: msg }))); En middleware: const { error } = registerSchema.validate(req.body); if (error) return validationErrorResponse(res, formatJoiErrors(error)); const data = validateAndRespond(validateOrderData, req.body, res); if (data.hasErrors) return data.response;
 * Integra con: sanitize.ts (sanitizers.string/email/filename), password.ts (strength en register), response.ts (validationErrorResponse, formatJoiErrors), constants.ts (ROLES, ORDER_STATUS, PRIORITIES), errorHandler.ts (AppError on fail), mongoose (isValidObjectId). En User model: pre('save') validate fields. Extensible: Add geo validate (PointSchema), KPI calc validate (numbers positive).
 * Fixes: Typed interfaces, async? (no), enums from constants, date: new Date safe (UTC?), activities: Typed array. Joi: Export schemas for auto-validation. validateAndRespond: Use errorResponse, no manual JSON.
 * Integrate: En authRoutes POST /register: const { errors, sanitized } = validateRegisterData(req.body); if (errors.length) return validationErrorResponse(res, errors.map(e => ({ message: e, field: 'general' }))); await validatePasswordStrength(sanitized.password); // From password.ts. En orderRoutes: app.post('/orders', authMiddleware, bodyParser, (req, res, next) => { const result = validateAndRespond(validateOrderData, req.body, res); if (result.hasErrors) return; req.validatedData = result.sanitized; next(); }, asyncHandler(async (req, res) => { const order = await orderService.create(req.validatedData); return createdResponse(res, order); })); Para files: En multer middleware post-upload: const fileValid = validateFile(req.file); if (!fileValid.valid) return validationErrorResponse(res, fileValid.errors.map(e => ({ message: e })));
 * Missing: Joi schemas: export const registerSchema = Joi.object({ nombre: Joi.string().min(2).max(100).required(), ... }); En middleware/validation.ts: app.use('/api/v1', (req, res, next) => { const { error } = combinedSchema.validate({ body: req.body, query: req.query, params: req.params }); if (error) return validationErrorResponse(res, formatJoiErrors(error)); next(); }); Zod alternative: npm i zod, export const OrderSchema = z.object({ numeroOrden: z.string().min(1).max(50), ... }).parse(req.body); Tests: __tests__/utils/validators.spec.ts.
 * Usage: npm run build (tsc utils/validators.ts), import { type RegisterData, validateRegisterData } from '../utils/validators.ts'. Barrel: utils/index.ts export * from './validators.ts';.
 */

// FIXED: Import validatePasswordStrength from passwordHash instead of non-existent password.ts
import { Response } from 'express';
import { sanitizers, validateObjectId } from '../middleware/sanitize';
import { AppError } from './errorHandler';
import { validatePasswordStrength } from './passwordHash';
import { ROLES, ORDER_STATUS, ORDER_PRIORITY } from './constants';
import type { ErrorDetails } from './response';
import { errorResponse, validationErrorResponse } from './response';
import Joi from 'joi';

// ============================================================================
// INTERFACES AND TYPES
// ============================================================================

export interface ValidationResult<T = unknown> {
  errors: string[];
  sanitized: Partial<T>;
}

export interface ErrorDetail extends ErrorDetails {
  field?: string;
  message: string;
}

export interface FileData {
  fieldname?: string;
  originalname?: string;
  encoding?: string;
  mimetype?: string;
  size?: number;
  buffer?: Buffer;
}

export interface RegisterData {
  nombre: string;
  email: string;
  password: string;
  rol?: keyof typeof ROLES;
  telefono?: string;
  cedula?: string;
  cargo?: string;
  especialidad?: string;
}

export interface LoginData {
  email: string;
  password: string;
  remember?: boolean;
}

export interface OrderData {
  numeroOrden: string;
  clienteNombre: string;
  cliente?: string; // ObjectId
  descripcion: string;
  lugar: string;
  creadoPor: string; // ObjectId
  fechaInicio: string;
  fecha?: string;
  estado?: keyof typeof ORDER_STATUS;
  prioridad?: keyof typeof ORDER_PRIORITY;
}

export interface ActivityData {
  descripcion: string;
  responsable?: string; // ObjectId
  fechaInicio?: string;
  fechaFin?: string;
  estado?: 'pendiente' | 'en_progreso' | 'completada';
}

export interface WorkPlanData {
  orden: string; // ObjectId
  actividades?: ActivityData[];
  observaciones?: string;
}

export interface PaginationQuery {
  page?: string;
  limit?: string;
  search?: string;
  estado?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  sort?: string;
}

// ============================================================================
// USER VALIDATORS
// ============================================================================

/**
 * Validar datos de registro de usuario
 * @param data - Raw RegisterData
 * @returns ValidationResult<RegisterData>
 * @throws AppError if critical (but returns errors array)
 */
export const validateRegisterData = (data: Partial<RegisterData>): ValidationResult<RegisterData> => {
  const errors: string[] = [];
  const sanitized: Partial<RegisterData> = {};

  // Nombre required
  if (!data.nombre || typeof data.nombre !== 'string') {
    errors.push('Nombre es requerido');
  } else {
    const cleanName = sanitizers.string(data.nombre, { maxLength: 100 });
    if (!cleanName || cleanName.length < 2) {
      errors.push('Nombre debe tener al menos 2 caracteres');
    } else {
      sanitized.nombre = cleanName;
    }
  }

  // Email required
  if (!data.email || typeof data.email !== 'string') {
    errors.push('Email es requerido');
  } else {
    const cleanEmail = sanitizers.email(data.email);
    if (!cleanEmail) {
      errors.push('Email inválido');
    } else {
      sanitized.email = cleanEmail;
    }
  }

  // Password required + strength
  if (!data.password || typeof data.password !== 'string') {
    errors.push('Contraseña es requerida');
  } else {
    try {
      validatePasswordStrength(data.password); // Throws if weak
      sanitized.password = data.password; // Raw for hash
    } catch (err) {
      errors.push((err as AppError).message);
    }
  }

  // Rol optional enum
  if (data.rol && typeof data.rol === 'string') {
    if (!(data.rol in ROLES)) {
      errors.push('Rol inválido');
    } else {
      sanitized.rol = data.rol as keyof typeof ROLES;
    }
  }

  // Optional fields
  if (data.telefono) sanitized.telefono = sanitizers.string(data.telefono, { maxLength: 20 });
  if (data.cedula) sanitized.cedula = sanitizers.string(data.cedula, { maxLength: 20 });
  if (data.cargo) sanitized.cargo = sanitizers.string(data.cargo, { maxLength: 100 });
  if (data.especialidad) sanitized.especialidad = sanitizers.string(data.especialidad, { maxLength: 100 });

  return { errors, sanitized };
};

/**
 * Validar datos de login
 * @param data - Raw LoginData
 * @returns ValidationResult<LoginData>
 */
export const validateLoginData = (data: Partial<LoginData>): ValidationResult<LoginData> => {
  const errors: string[] = [];
  const sanitized: Partial<LoginData> = {};

  // Email required
  if (!data.email || typeof data.email !== 'string') {
    errors.push('Email es requerido');
  } else {
    const cleanEmail = sanitizers.email(data.email);
    if (!cleanEmail) {
      errors.push('Email inválido');
    } else {
      sanitized.email = cleanEmail;
    }
  }

  // Password required
  if (!data.password || typeof data.password !== 'string') {
    errors.push('Contraseña es requerida');
  } else {
    sanitized.password = data.password; // Raw for verify
  }

  // Remember optional
  if (data.remember !== undefined) {
    sanitized.remember = Boolean(data.remember);
  }

  return { errors, sanitized };
};

// ============================================================================
// ORDER VALIDATORS
// ============================================================================

/**
 * Validar datos de orden de trabajo
 * @param data - Raw OrderData
 * @returns ValidationResult<OrderData>
 */
export const validateOrderData = (data: Partial<OrderData>): ValidationResult<OrderData> => {
  const errors: string[] = [];
  const sanitized: Partial<OrderData> = {};

  // NumeroOrden required
  if (!data.numeroOrden || typeof data.numeroOrden !== 'string') {
    errors.push('Número de orden es requerido');
  } else {
    const clean = sanitizers.string(data.numeroOrden, { maxLength: 50 });
    if (clean) sanitized.numeroOrden = clean;
    else errors.push('Número de orden inválido');
  }

  // ClienteNombre required
  if (!data.clienteNombre || typeof data.clienteNombre !== 'string') {
    errors.push('Nombre del cliente es requerido');
  } else {
    const clean = sanitizers.string(data.clienteNombre, { maxLength: 100 });
    if (clean) sanitized.clienteNombre = clean;
    else errors.push('Nombre del cliente inválido');
  }

  // Cliente optional ObjectId
  if (data.cliente && !validateObjectId(data.cliente)) {
    errors.push('ID de cliente inválido');
  } else if (data.cliente) {
    sanitized.cliente = data.cliente;
  }

  // Descripcion required
  if (!data.descripcion || typeof data.descripcion !== 'string') {
    errors.push('Descripción es requerida');
  } else {
    const clean = sanitizers.string(data.descripcion, { maxLength: 2000, allowHTML: false });
    if (clean) sanitized.descripcion = clean;
    else errors.push('Descripción inválida');
  }

  // Lugar required
  if (!data.lugar || typeof data.lugar !== 'string') {
    errors.push('Lugar es requerido');
  } else {
    const clean = sanitizers.string(data.lugar, { maxLength: 200 });
    if (clean) sanitized.lugar = clean;
    else errors.push('Lugar inválido');
  }

  // CreadoPor required ObjectId
  if (!data.creadoPor || !validateObjectId(data.creadoPor)) {
    errors.push('ID de usuario creador inválido');
  } else {
    sanitized.creadoPor = data.creadoPor;
  }

  // FechaInicio required date
  if (!data.fechaInicio) {
    errors.push('Fecha de inicio es requerida');
  } else {
    const date = new Date(data.fechaInicio);
    if (isNaN(date.getTime())) {
      errors.push('Fecha de inicio inválida');
    } else {
      sanitized.fechaInicio = date.toISOString(); // UTC
    }
  }

  // Fecha optional legacy
  if (data.fecha) {
    const date = new Date(data.fecha);
    if (!isNaN(date.getTime())) {
      sanitized.fecha = date.toISOString();
    }
  }

  // Estado optional enum
  if (data.estado && typeof data.estado === 'string') {
    if (!(data.estado in ORDER_STATUS)) {
      errors.push('Estado inválido');
    } else {
      sanitized.estado = data.estado as keyof typeof ORDER_STATUS;
    }
  }

  // Prioridad optional enum
  if (data.prioridad && typeof data.prioridad === 'string') {
    if (!(data.prioridad in ORDER_PRIORITY)) {
      errors.push('Prioridad inválida');
    } else {
      sanitized.prioridad = data.prioridad as keyof typeof ORDER_PRIORITY;
    }
  }

  return { errors, sanitized };
};

// ============================================================================
// WORK PLAN VALIDATORS
// ============================================================================

/**
 * Validar datos de plan de trabajo
 * @param data - Raw WorkPlanData
 * @returns ValidationResult<WorkPlanData>
 */
export const validateWorkPlanData = (data: Partial<WorkPlanData>): ValidationResult<WorkPlanData> => {
  const errors: string[] = [];
  const sanitized: Partial<WorkPlanData> = {};

  // Orden required ObjectId
  if (!data.orden || !validateObjectId(data.orden)) {
    errors.push('ID de orden inválido');
  } else {
    sanitized.orden = data.orden;
  }

  // Actividades optional array
  if (data.actividades && Array.isArray(data.actividades)) {
    sanitized.actividades = data.actividades.map((actividad: Partial<ActivityData>): ActivityData | null => {
      const actErrors: string[] = [];
      const actSanitized: Partial<ActivityData> = {};

      if (!actividad.descripcion || typeof actividad.descripcion !== 'string') {
        actErrors.push('Descripción de actividad requerida');
      } else {
        const clean = sanitizers.string(actividad.descripcion, { maxLength: 500 });
        if (clean) actSanitized.descripcion = clean;
        else actErrors.push('Descripción de actividad inválida');
      }

      if (actividad.responsable && !validateObjectId(actividad.responsable)) {
        actErrors.push('ID de responsable inválido');
      } else if (actividad.responsable) {
        actSanitized.responsable = actividad.responsable;
      }

      if (actividad.fechaInicio) {
        const date = new Date(actividad.fechaInicio);
        if (!isNaN(date.getTime())) actSanitized.fechaInicio = date.toISOString();
      }

      if (actividad.fechaFin) {
        const date = new Date(actividad.fechaFin);
        if (!isNaN(date.getTime())) actSanitized.fechaFin = date.toISOString();
      }

      const validStates = ['pendiente', 'en_progreso', 'completada'] as const;
      if (actividad.estado && !validStates.includes(actividad.estado as any)) {
        actErrors.push('Estado de actividad inválido');
      } else {
        actSanitized.estado = actividad.estado || 'pendiente';
      }

      if (actErrors.length > 0) {
        errors.push(...actErrors.map(e => `Actividad: ${e}`));
        return null;
      }

      return actSanitized as ActivityData;
    }).filter(Boolean) as ActivityData[]; // Filter invalids
  }

  // Observaciones optional
  if (data.observaciones && typeof data.observaciones === 'string') {
    const clean = sanitizers.string(data.observaciones, { maxLength: 2000, allowHTML: false });
    if (clean) sanitized.observaciones = clean;
  }

  return { errors, sanitized };
};

// ============================================================================
// FILE VALIDATORS
// ============================================================================

/**
 * Validar archivo subido
 * @param file - Multer FileData
 * @returns { errors: string[], valid: boolean, sanitizedFilename?: string }
 */
export const validateFile = (file?: FileData): { errors: string[]; valid: boolean; sanitizedFilename?: string } => {
  const errors: string[] = [];

  if (!file) {
    errors.push('Archivo es requerido');
    return { errors, valid: false };
  }

  // Size max 10MB
  const maxSize = 10 * 1024 * 1024;
  if (file.size && file.size > maxSize) {
    errors.push('Archivo debe ser menor a 10MB');
  }

  // Allowed mimes
  const allowedMimeTypes = [
    'image/jpeg', 'image/png', 'image/webp',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];
  if (file.mimetype && !allowedMimeTypes.includes(file.mimetype)) {
    errors.push('Tipo de archivo no permitido');
  }

  // Filename
  const sanitizedFilename = sanitizers.filename(file.originalname || 'file');
  if (!sanitizedFilename) {
    errors.push('Nombre de archivo inválido');
  }

  const valid = errors.length === 0;
  return { errors, valid, ...(sanitizedFilename && { sanitizedFilename }) };
};

// ============================================================================
// QUERY VALIDATORS
// ============================================================================

/**
 * Validar parámetros de paginación (compat with pagination.ts)
 * @param query - Raw PaginationQuery
 * @returns { page: number, limit: number, sort: string }
 */
export const validatePaginationParams = (query: Partial<PaginationQuery>): { page: number; limit: number; sort: string } => {
  const page = query.page ? Math.max(1, Number(query.page) || 1) : 1;
  const limit = Math.min(Math.max(1, Number(query.limit) || 10), 100); // Cap 100
  const sort = query.sort ? sanitizers.string(query.sort, { maxLength: 50 }) || '-createdAt' : '-createdAt';

  return { page, limit, sort };
};

/**
 * Validar filtros de búsqueda
 * @param query - Raw PaginationQuery
 * @returns Partial filters { search?: string, estado?: string, fechaDesde?: Date, fechaHasta?: Date }
 */
export const validateSearchFilters = (query: Partial<PaginationQuery>): Record<string, any> => {
  const filters: Record<string, any> = {};

  if (query.search) {
    const clean = sanitizers.string(query.search, { maxLength: 100, allowHTML: false });
    if (clean) filters.search = clean;
  }

  if (query.estado) {
    if (ORDER_STATUS[query.estado as keyof typeof ORDER_STATUS]) {
      filters.estado = query.estado;
    }
  }

  if (query.fechaDesde) {
    const date = new Date(query.fechaDesde);
    if (!isNaN(date.getTime())) filters.fechaDesde = date;
  }

  if (query.fechaHasta) {
    const date = new Date(query.fechaHasta);
    if (!isNaN(date.getTime())) filters.fechaHasta = date;
  }

  return filters;
};

// ============================================================================
// HELPER: VALIDATE AND RESPOND
// ============================================================================

/**
 * Helper para validar y responder con error si fails
 * @param validator - Validation function (returns ValidationResult)
 * @param data - Input data
 * @param res - Response
 * @returns { hasErrors: boolean, response?: Response, sanitized?: T }
 */
export const validateAndRespond = <T>(
  validator: (data: any) => ValidationResult<T>,
  data: any,
  res: Response
// FIXED: Use validationErrorResponse with proper ErrorDetails type
): { hasErrors: boolean; response?: Response; sanitized?: Partial<T> } => {
  const { errors, sanitized } = validator(data);

  if (errors.length > 0) {
    const details: ErrorDetails[] = errors.map(message => ({ message, field: 'validation' }));
    return {
      hasErrors: true,
      response: validationErrorResponse(res, details),
    };
  }

  return { hasErrors: false, sanitized };
};

// ============================================================================
// JOI SCHEMAS (RECOMMENDED FOR MIDDLEWARE)
// ============================================================================

export const registerSchema = Joi.object<RegisterData>({
  nombre: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(), // Strength separate
  rol: Joi.string().valid(...Object.keys(ROLES)).optional(),
  telefono: Joi.string().max(20).optional(),
  cedula: Joi.string().max(20).optional(),
  cargo: Joi.string().max(100).optional(),
  especialidad: Joi.string().max(100).optional(),
});

export const loginSchema = Joi.object<LoginData>({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  remember: Joi.boolean().optional(),
});

export const orderSchema = Joi.object<OrderData>({
  numeroOrden: Joi.string().max(50).required(),
  clienteNombre: Joi.string().max(100).required(),
  cliente: Joi.string().optional(), // Validate ObjectId later
  descripcion: Joi.string().max(2000).required(),
  lugar: Joi.string().max(200).required(),
  creadoPor: Joi.string().required(), // ObjectId
  fechaInicio: Joi.date().iso().required(),
  fecha: Joi.date().iso().optional(),
  estado: Joi.string().valid(...Object.keys(ORDER_STATUS)).optional(),
  prioridad: Joi.string().valid(...Object.keys(ORDER_PRIORITY)).optional(),
});

// Similar for others...

export default {
  validateRegisterData,
  validateLoginData,
  validateOrderData,
  validateWorkPlanData,
  validateFile,
  validatePaginationParams,
  validateSearchFilters,
  validateAndRespond,
  registerSchema,
  loginSchema,
  orderSchema,
};
