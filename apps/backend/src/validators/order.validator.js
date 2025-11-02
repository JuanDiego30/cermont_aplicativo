/**
 * Order Validators
 * @description Validadores Joi para órdenes de trabajo
 */

import Joi from 'joi';
import { ORDER_STATUS, ORDER_PRIORITY } from '../utils/constants.js';

/**
 * Validador para crear orden
 */
export const createOrderValidator = Joi.object({
  numeroOrden: Joi.string()
    .uppercase()
    .trim()
    .allow('', null)
    .messages({
      'string.uppercase': 'El número de orden debe estar en mayúsculas',
    }),

  clienteNombre: Joi.string()
    .min(2)
    .max(200)
    .required()
    .trim()
    .messages({
      'string.empty': 'El nombre del cliente es requerido',
      'string.min': 'El nombre del cliente debe tener al menos 2 caracteres',
      'string.max': 'El nombre del cliente no puede exceder 200 caracteres',
      'any.required': 'El nombre del cliente es requerido',
    }),

  clienteContacto: Joi.object({
    nombre: Joi.string().trim().allow('', null),
    email: Joi.string().email().lowercase().trim().allow('', null),
    telefono: Joi.string().pattern(/^[+]?[\d\s-()]{7,20}$/).allow('', null),
  }).allow(null),

  poNumber: Joi.string()
    .trim()
    .allow('', null),

  descripcion: Joi.string()
    .min(10)
    .max(2000)
    .required()
    .trim()
    .messages({
      'string.empty': 'La descripción es requerida',
      'string.min': 'La descripción debe tener al menos 10 caracteres',
      'string.max': 'La descripción no puede exceder 2000 caracteres',
      'any.required': 'La descripción es requerida',
    }),

  alcance: Joi.string()
    .max(3000)
    .allow('', null)
    .trim(),

  lugar: Joi.string()
    .min(2)
    .max(200)
    .required()
    .trim()
    .messages({
      'string.empty': 'El lugar es requerido',
      'any.required': 'El lugar es requerido',
    }),

  coordenadas: Joi.object({
    lat: Joi.number().min(-90).max(90),
    lng: Joi.number().min(-180).max(180),
  }).allow(null),

  fechaInicio: Joi.date()
    .required()
    .messages({
      'date.base': 'La fecha de inicio debe ser válida',
      'any.required': 'La fecha de inicio es requerida',
    }),

  fechaFinEstimada: Joi.date()
    .min(Joi.ref('fechaInicio'))
    .allow(null)
    .messages({
      'date.min': 'La fecha de fin estimada debe ser posterior a la fecha de inicio',
    }),

  prioridad: Joi.string()
    .valid(...Object.values(ORDER_PRIORITY))
    .default(ORDER_PRIORITY.MEDIUM)
    .messages({
      'any.only': 'Prioridad inválida',
    }),

  costoEstimado: Joi.number()
    .min(0)
    .default(0)
    .messages({
      'number.min': 'El costo estimado no puede ser negativo',
    }),

  moneda: Joi.string()
    .valid('COP', 'USD')
    .default('COP'),

  asignadoA: Joi.array()
    .items(Joi.string().hex().length(24))
    .allow(null),

  supervisorId: Joi.string()
    .hex()
    .length(24)
    .allow(null),
});

/**
 * Validador para actualizar orden
 */
export const updateOrderValidator = Joi.object({
  clienteNombre: Joi.string().min(2).max(200).trim(),
  clienteContacto: Joi.object({
    nombre: Joi.string().trim().allow('', null),
    email: Joi.string().email().lowercase().trim().allow('', null),
    telefono: Joi.string().pattern(/^[+]?[\d\s-()]{7,20}$/).allow('', null),
  }),
  poNumber: Joi.string().trim().allow('', null),
  descripcion: Joi.string().min(10).max(2000).trim(),
  alcance: Joi.string().max(3000).allow('', null).trim(),
  lugar: Joi.string().min(2).max(200).trim(),
  coordenadas: Joi.object({
    lat: Joi.number().min(-90).max(90),
    lng: Joi.number().min(-180).max(180),
  }).allow(null),
  fechaInicio: Joi.date(),
  fechaFinEstimada: Joi.date(),
  fechaFinReal: Joi.date().allow(null),
  prioridad: Joi.string().valid(...Object.values(ORDER_PRIORITY)),
  costoEstimado: Joi.number().min(0),
  costoReal: Joi.number().min(0),
  moneda: Joi.string().valid('COP', 'USD'),
  asignadoA: Joi.array().items(Joi.string().hex().length(24)),
  supervisorId: Joi.string().hex().length(24).allow(null),
}).min(1);

/**
 * Validador para cambiar estado de orden
 */
export const updateOrderStatusValidator = Joi.object({
  estado: Joi.string()
    .valid(...Object.values(ORDER_STATUS))
    .required()
    .messages({
      'string.empty': 'El estado es requerido',
      'any.only': 'Estado inválido',
      'any.required': 'El estado es requerido',
    }),
});

/**
 * Validador para agregar nota
 */
export const addNoteValidator = Joi.object({
  contenido: Joi.string()
    .min(1)
    .max(1000)
    .required()
    .trim()
    .messages({
      'string.empty': 'El contenido de la nota es requerido',
      'string.max': 'La nota no puede exceder 1000 caracteres',
      'any.required': 'El contenido de la nota es requerido',
    }),
});

/**
 * Validador para asignar usuarios
 */
export const assignUsersValidator = Joi.object({
  asignadoA: Joi.array()
    .items(Joi.string().hex().length(24))
    .min(1)
    .required()
    .messages({
      'array.min': 'Debe asignar al menos un usuario',
      'any.required': 'Los usuarios asignados son requeridos',
    }),

  supervisorId: Joi.string()
    .hex()
    .length(24)
    .allow(null),
});
