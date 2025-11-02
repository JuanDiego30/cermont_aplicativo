/**
 * User Validators
 * @description Validadores Joi para usuarios
 */

import Joi from 'joi';
import { ROLES } from '../utils/constants.js';

/**
 * Validador para crear usuario
 */
export const createUserValidator = Joi.object({
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
    .required()
    .messages({
      'any.only': 'Rol inválido',
      'any.required': 'El rol es requerido',
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
      'string.pattern.base': 'Cédula inválida (6-12 dígitos)',
    }),

  cargo: Joi.string()
    .max(100)
    .allow('', null)
    .trim()
    .messages({
      'string.max': 'El cargo no puede exceder 100 caracteres',
    }),

  especialidad: Joi.string()
    .max(100)
    .allow('', null)
    .trim()
    .messages({
      'string.max': 'La especialidad no puede exceder 100 caracteres',
    }),

  avatar: Joi.string()
    .uri()
    .allow('', null)
    .messages({
      'string.uri': 'La URL del avatar debe ser válida',
    }),
});

/**
 * Validador para actualizar usuario
 */
export const updateUserValidator = Joi.object({
  nombre: Joi.string()
    .min(2)
    .max(100)
    .trim()
    .messages({
      'string.min': 'El nombre debe tener al menos 2 caracteres',
      'string.max': 'El nombre no puede exceder 100 caracteres',
    }),

  email: Joi.string()
    .email()
    .lowercase()
    .trim()
    .messages({
      'string.email': 'El email debe ser válido',
    }),

  rol: Joi.string()
    .valid(...Object.values(ROLES))
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
      'string.pattern.base': 'Cédula inválida (6-12 dígitos)',
    }),

  cargo: Joi.string()
    .max(100)
    .allow('', null)
    .trim(),

  especialidad: Joi.string()
    .max(100)
    .allow('', null)
    .trim(),

  avatar: Joi.string()
    .uri()
    .allow('', null),

  isActive: Joi.boolean(),
}).min(1);

/**
 * Validador para actualizar perfil propio
 */
export const updateProfileValidator = Joi.object({
  nombre: Joi.string()
    .min(2)
    .max(100)
    .trim(),

  telefono: Joi.string()
    .pattern(/^[+]?[\d\s-()]{7,20}$/)
    .allow('', null),

  cargo: Joi.string()
    .max(100)
    .allow('', null)
    .trim(),

  especialidad: Joi.string()
    .max(100)
    .allow('', null)
    .trim(),

  avatar: Joi.string()
    .uri()
    .allow('', null),
}).min(1);
