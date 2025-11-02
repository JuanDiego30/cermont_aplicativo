/**
 * Auth Validators
 * @description Validadores Joi para autenticación
 */

import Joi from 'joi';
import { ROLES } from '../utils/constants.js';

/**
 * Validador para registro de usuario
 */
export const registerValidator = Joi.object({
  nombre: Joi.string()
    .min(2)
    .max(100)
    .required()
    .trim()
    .messages({
      'string.empty': 'El nombre es requerido',
      'string.min': 'El nombre debe tener al menos 2 caracteres',
      'string.max': 'El nombre no puede exceder 100 caracteres',
      'any.required': 'El nombre es requerido',
    }),

  email: Joi.string()
    .email()
    .required()
    .lowercase()
    .trim()
    .messages({
      'string.empty': 'El email es requerido',
      'string.email': 'El email debe ser válido',
      'any.required': 'El email es requerido',
    }),

  password: Joi.string()
    .min(8)
    .max(50)
    .required()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .messages({
      'string.empty': 'La contraseña es requerida',
      'string.min': 'La contraseña debe tener al menos 8 caracteres',
      'string.max': 'La contraseña no puede exceder 50 caracteres',
      'string.pattern.base': 'La contraseña debe contener al menos una mayúscula, una minúscula y un número',
      'any.required': 'La contraseña es requerida',
    }),

  rol: Joi.string()
    .valid(...Object.values(ROLES))
    .default(ROLES.TECHNICIAN)
    .messages({
      'any.only': 'Rol inválido',
    }),

  telefono: Joi.string()
    .pattern(/^[+]?[\d\s-()]{7,20}$/)
    .allow('', null)
    .messages({
      'string.pattern.base': 'Teléfono inválido',
    }),

  cedula: Joi.string()
    .pattern(/^[0-9]{6,12}$/)
    .allow('', null)
    .messages({
      'string.pattern.base': 'Cédula inválida',
    }),

  cargo: Joi.string()
    .max(100)
    .allow('', null)
    .trim(),

  especialidad: Joi.string()
    .max(100)
    .allow('', null)
    .trim(),
});

/**
 * Validador para login
 */
export const loginValidator = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .lowercase()
    .trim()
    .messages({
      'string.empty': 'El email es requerido',
      'string.email': 'El email debe ser válido',
      'any.required': 'El email es requerido',
    }),

  password: Joi.string()
    .required()
    .messages({
      'string.empty': 'La contraseña es requerida',
      'any.required': 'La contraseña es requerida',
    }),
});

/**
 * Validador para cambio de contraseña
 */
export const changePasswordValidator = Joi.object({
  currentPassword: Joi.string()
    .required()
    .messages({
      'string.empty': 'La contraseña actual es requerida',
      'any.required': 'La contraseña actual es requerida',
    }),

  newPassword: Joi.string()
    .min(8)
    .max(50)
    .required()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .invalid(Joi.ref('currentPassword'))
    .messages({
      'string.empty': 'La nueva contraseña es requerida',
      'string.min': 'La nueva contraseña debe tener al menos 8 caracteres',
      'string.max': 'La nueva contraseña no puede exceder 50 caracteres',
      'string.pattern.base': 'La nueva contraseña debe contener al menos una mayúscula, una minúscula y un número',
      'any.invalid': 'La nueva contraseña debe ser diferente a la actual',
      'any.required': 'La nueva contraseña es requerida',
    }),

  confirmPassword: Joi.string()
    .valid(Joi.ref('newPassword'))
    .required()
    .messages({
      'any.only': 'Las contraseñas no coinciden',
      'any.required': 'La confirmación de contraseña es requerida',
    }),
});

/**
 * Validador para solicitud de restablecimiento de contraseña
 */
export const forgotPasswordValidator = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .lowercase()
    .trim()
    .messages({
      'string.empty': 'El email es requerido',
      'string.email': 'El email debe ser válido',
      'any.required': 'El email es requerido',
    }),
});

/**
 * Validador para restablecimiento de contraseña con token
 */
export const resetPasswordValidator = Joi.object({
  token: Joi.string()
    .required()
    .messages({
      'string.empty': 'El token es requerido',
      'any.required': 'El token es requerido',
    }),

  newPassword: Joi.string()
    .min(8)
    .max(50)
    .required()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .messages({
      'string.empty': 'La nueva contraseña es requerida',
      'string.min': 'La nueva contraseña debe tener al menos 8 caracteres',
      'string.max': 'La nueva contraseña no puede exceder 50 caracteres',
      'string.pattern.base': 'La nueva contraseña debe contener al menos una mayúscula, una minúscula y un número',
      'any.required': 'La nueva contraseña es requerida',
    }),

  confirmPassword: Joi.string()
    .valid(Joi.ref('newPassword'))
    .required()
    .messages({
      'any.only': 'Las contraseñas no coinciden',
      'any.required': 'La confirmación de contraseña es requerida',
    }),
});
