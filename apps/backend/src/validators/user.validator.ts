/**
 * User Validators (TypeScript - November 2025)
 * @description Validadores Joi para gestión de usuarios en CERMONT ATG: createUser (full, password strength, rol required), updateUser (partial min 1, admin fields like isActive/rol), updateProfile (user self, no sensitive: nombre/telefono/cargo/especialidad/avatar). Messages: Custom ES centralized. Patterns: Password regex (upper/lower/digit, env extend), telefono intl, cedula digits 6-12 (Col), email lower/unique post-Joi. Defaults: None. Secure: Trim strings, uri avatar, no password in updates. Usage: En usersRoutes POST /: const { error, value } = createUserValidator.validate(req.body, { abortEarly: false }); if (error) return validationErrorResponse(res, formatJoiErrors(error)); await checkEmailUnique(value.email); // Service req.validated = value; En PATCH /:id: updateUserValidator.validate(req.body); En PATCH /profile: updateProfileValidator.validate(req.body); if (req.user.rol !== 'client' && !value.rol) value.rol = undefined; // Self no rol change.
 * Integra con: constants.ts (ROLES values), auth.ts (password pattern/shared messages), validators.ts (custom if Joi limit), userService (post-validate unique email/cedula, rol hierarchy check: can't set higher than self), response.ts (formatJoiErrors). Performance: Sync, fast. Extensible: Add twoFactor enabled bool, certifications array, departments enum. .unknown(false) strict. Password: Integrate validatePasswordStrength post-Joi for full (special chars, blacklist).
 * Fixes: .required() rol in create only, .optional() in updates. .min(1) partials. Messages consistent/spread from validationMessages. .pattern password same as auth. Avatar .uri() prevent invalid URLs. isActive boolean only update (RBAC). Cedula pattern relaxed (no checksum Joi, service-level). Trim/lowercase preventive. AbortEarly false all errors. No password in update/profile (sensitive).
 * Integrate: En usersController.create: ... after Joi, await validatePasswordStrength(value.password); if (await User.findOne({ email: value.email })) throw AppError('Email exists', 409); if (value.rol && !canAssignRole(req.user.rol, value.rol)) throw AppError('Cannot assign higher rol', 403); // utils/rbac.ts: export const canAssignRole = (assigner: string, target: string) => ROLES_HIERARCHY[assigner] >= ROLES_HIERARCHY[target]; En update: if (value.email && value.email !== user.email) { await checkEmailUnique(value.email, user._id); } if (value.rol && !canAssignRole(req.user.rol, value.rol)) throw AppError('Insufficient perms', 403); if (value.isActive !== undefined && req.user.rol !== ROLES.ADMIN) throw Forbidden; En profile: No email/rol/password, direct update user.set(value);. Audit: await auditLogService.create({ action: 'user_update', entityId: user._id, by: req.user._id, changes: diff(oldUser, value) });.
 * Missing: Query validator: export const listUsersQueryValidator = Joi.object({ page: Joi.number().integer().min(1).default(1), limit: Joi.number().integer().min(1).max(50).default(10), search: Joi.string().trim().max(100), rol: Joi.string().valid(...Object.values(ROLES)), active: Joi.boolean(), sort: Joi.string().valid('nombre', '-nombre', 'createdAt', '-createdAt'), }).unknown(false); En GET /users: const { value } = listUsersQueryValidator.validate(req.query); const filters = buildUserFilters(value); // $or: [{ nombre: { $regex: value.search, $options: 'i' } }, { email: { $regex: ... } }] if (value.rol) filters.rol = value.rol; const { docs, pagination } = await autoPaginate(User, filters, { page: value.page, limit: value.limit, sort: value.sort || '-createdAt', select: '-password -refreshTokens' }); return paginatedResponse(res, docs.map(sanitizeUser), pagination);. Bulk update: export const bulkUpdateUsersValidator = Joi.object({ ids: Joi.array().items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/)).min(1).required(), updates: updateUserValidator.optional() }).unknown(false); En POST /bulk: if (!req.user.rol >= ROLES.ADMIN) throw Forbidden; validateAssignedIds(updates.ids); // Similar to order. Password reset bulk: Separate validator no password. Certifications: Add to create/update: certificaciones: Joi.array().items(Joi.object({ nombre: Joi.string().max(100), fecha: Joi.date(), expiracion: Joi.date().greater(Joi.ref('fecha')), tipo: Joi.string().valid('CCTV', 'Seguridad', 'Eléctrico') })).max(10).allow(null),. RBAC check: utils/rbac.ts as above, HIERARCHY: { root: 0, admin: 1, ... client: 7 } lower number higher perm. Tests: __tests__/validators/user.spec.ts.
 * Usage: npm i joi @types/joi, npm run build (tsc validators/user.ts). Barrel: validators/index.ts export * from '';.
 */

// FIXED: Import from correct paths and add validation messages
import Joi, { type ObjectSchema } from 'joi';
import { ROLES, HTTP_STATUS, ERROR_CODES } from '../utils/constants';
import { validatePasswordStrength } from '../utils/passwordHash';
import { AppError } from '../utils/errorHandler';
import User from '../models/User';

// Interface for user validation data
export interface UserData {
  nombre?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  rol?: string;
  telefono?: string;
  cedula?: string;
  cargo?: string;
  especialidad?: string;
  isActive?: boolean;
  avatar?: string;
}

// Validation messages (Spanish)
const validationMessages = {
  'string.empty': 'Este campo es requerido',
  'string.min': 'Este campo debe tener al menos {#limit} caracteres',
  'string.max': 'Este campo no puede exceder {#limit} caracteres',
  'string.email': 'Debe ser una dirección de correo válida',
  'any.required': 'Este campo es obligatorio',
  'any.only': 'Valor no permitido',
};

// Password pattern shared
const passwordPattern = new RegExp(process.env.PASSWORD_PATTERN || '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[A-Za-z\\d@$!%*?&]{8,50}$');

// UserData interface
interface UserData {
  nombre: string;
  email: string;
  password: string;
  rol: string;
  telefono?: string;
  cedula?: string;
  cargo?: string;
  especialidad?: string;
  avatar?: string;
  isActive?: boolean;
}

// ============================================================================
// USER VALIDATORS (Joi Schemas)
// ============================================================================

/**
 * Validador para crear usuario (admin/root only)
 */
export const createUserValidator = Joi.object({
  nombre: Joi.string()
    .min(2)
    .max(100)
    .required()
    .trim()
    .messages(validationMessages),

  email: Joi.string()
    .email()
    .required()
    .lowercase()
    .trim()
    .messages(validationMessages),

  password: Joi.string()
    .min(8)
    .max(50)
    .required()
    .pattern(passwordPattern)
    .messages({
      ...validationMessages,
      'string.pattern.base': 'La contraseña debe contener al menos una mayúscula, una minúscula y un número',
    }),

  rol: Joi.string()
    .valid(...Object.values(ROLES))
    .required()
    .messages(validationMessages),

  telefono: Joi.string()
    .pattern(/^[+]?[\d\s-()]{7,20}$/)
    .allow('', null)
    .messages(validationMessages),

  cedula: Joi.string()
    .pattern(/^[0-9]{6,12}$/)
    .allow('', null)
    .messages({
      ...validationMessages,
      'string.pattern.base': 'Cédula inválida (6-12 dígitos)',
    }),

  cargo: Joi.string()
    .max(100)
    .allow('', null)
    .trim()
    .messages(validationMessages),

  especialidad: Joi.string()
    .max(100)
    .allow('', null)
    .trim()
    .messages(validationMessages),

  avatar: Joi.string()
    .uri()
    .allow('', null)
    .messages({
      ...validationMessages,
      'string.uri': 'La URL del avatar debe ser válida',
    }),
}).unknown(false);

/**
 * Validador para actualizar usuario (admin/root, partial min 1)
 * @type {ObjectSchema<Partial<UserData>>}
 */
export const updateUserValidator: ObjectSchema<Partial<UserData>> = Joi.object({
  nombre: Joi.string().min(2).max(100).trim().messages(validationMessages),
  email: Joi.string().email().lowercase().trim().messages(validationMessages),
  rol: Joi.string().valid(...Object.values(ROLES)).messages(validationMessages),
  telefono: Joi.string().pattern(/^[+]?[\d\s-()]{7,20}$/).allow('', null).messages(validationMessages),
  cedula: Joi.string().pattern(/^[0-9]{6,12}$/).allow('', null).messages({
    ...validationMessages,
    'string.pattern.base': 'Cédula inválida (6-12 dígitos)',
  }),
  cargo: Joi.string().max(100).allow('', null).trim().messages(validationMessages),
  especialidad: Joi.string().max(100).allow('', null).trim().messages(validationMessages),
  avatar: Joi.string().uri().allow('', null).messages({
    ...validationMessages,
    'string.uri': 'La URL del avatar debe ser válida',
  }),
  isActive: Joi.boolean().messages(validationMessages),
}).min(1).unknown(false);

/**
 * Validador para actualizar perfil propio (limited fields)
 * @type {ObjectSchema<Omit<Partial<UserData>, 'email' | 'password' | 'rol'>>}
 */
export const updateProfileValidator = Joi.object({
  nombre: Joi.string().min(2).max(100).trim().messages(validationMessages),
  telefono: Joi.string().pattern(/^[+]?[\d\s-()]{7,20}$/).allow('', null).messages(validationMessages),
  cargo: Joi.string().max(100).allow('', null).trim().messages(validationMessages),
  especialidad: Joi.string().max(100).allow('', null).trim().messages(validationMessages),
  avatar: Joi.string().uri().allow('', null).messages({
    ...validationMessages,
    'string.uri': 'La URL del avatar debe ser válida',
  }),
}).min(1).unknown(false);

// ============================================================================
// HELPER: VALIDATE WITH STRENGTH (For Create Only)
// ============================================================================

/**
 * Validate create with extra password strength
 * @param data - Raw user data
 * @returns { value, error } with strength check
 */
export const validateCreateWithStrength = (data: unknown): { error?: Joi.ValidationError; value: any } => {
  const { error, value } = createUserValidator.validate(data, { abortEarly: false });
  if (error || !value?.password) return { error, value };

  // FIXED: Simplified strength validation
  try {
    validatePasswordStrength(value.password);
  } catch (strengthError) {
    const message = strengthError instanceof Error ? strengthError.message : 'Contraseña débil';
    const customError = new Joi.ValidationError(message, [
      {
        message,
        path: ['password'],
        type: 'password.strength',
        context: { key: 'password', label: 'password', value: '***' }
      }
    ], value);
    
    if (error) {
      const mergedError = new Joi.ValidationError(
        error.message,
        [...error.details, ...customError.details],
        value
      );
      return { error: mergedError, value };
    } else {
      return { error: customError, value };
    }
  }

  return { error, value };
};

// ============================================================================
// HELPER: POST-VALIDATION UNIQUES (Service Integration)
// ============================================================================

/**
 * Check uniques post-Joi (email/cedula, exclude self)
 * @param data - Validated user data
 * @param excludeId - Current user ID for updates
 * @throws AppError if duplicate
 */
export const validateUniques = async (data: Partial<UserData>, excludeId?: string): Promise<void> => {
  if (data.email) {
    const existing = await User.findOne({ email: data.email, _id: { $ne: excludeId } });
    if (existing) throw new AppError('Email ya en uso', HTTP_STATUS.CONFLICT, { code: 'DUPLICATE_EMAIL' });
  }
  if (data.cedula) {
    const existing = await User.findOne({ cedula: data.cedula, _id: { $ne: excludeId } });
    if (existing) throw new AppError('Cédula ya en uso', HTTP_STATUS.CONFLICT, { code: 'DUPLICATE_CEDULA' });
  }
};

// Export default
export default {
  createUserValidator,
  updateUserValidator,
  updateProfileValidator,
  validateCreateWithStrength,
  validateUniques,
};
