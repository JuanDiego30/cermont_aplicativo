/**
 * WorkPlan Validators
 * @description Validadores Joi para planes de trabajo
 */

import Joi from 'joi';
import { WORKPLAN_STATUS, BUSINESS_UNITS } from '../utils/constants.js';

/**
 * Validador para crear plan de trabajo
 */
export const createWorkPlanValidator = Joi.object({
  orderId: Joi.string()
    .hex()
    .length(24)
    .required()
    .messages({
      'string.empty': 'El ID de orden es requerido',
      'string.hex': 'ID de orden inválido',
      'string.length': 'ID de orden inválido',
      'any.required': 'El ID de orden es requerido',
    }),

  titulo: Joi.string()
    .min(5)
    .max(200)
    .required()
    .trim()
    .messages({
      'string.empty': 'El título es requerido',
      'string.min': 'El título debe tener al menos 5 caracteres',
      'string.max': 'El título no puede exceder 200 caracteres',
      'any.required': 'El título es requerido',
    }),

  descripcion: Joi.string()
    .max(1000)
    .allow('', null)
    .trim()
    .messages({
      'string.max': 'La descripción no puede exceder 1000 caracteres',
    }),

  alcance: Joi.string()
    .min(10)
    .max(3000)
    .required()
    .trim()
    .messages({
      'string.empty': 'El alcance es requerido',
      'string.min': 'El alcance debe tener al menos 10 caracteres',
      'string.max': 'El alcance no puede exceder 3000 caracteres',
      'any.required': 'El alcance es requerido',
    }),

  unidadNegocio: Joi.string()
    .valid(...Object.values(BUSINESS_UNITS))
    .required()
    .messages({
      'any.only': 'Unidad de negocio inválida',
      'any.required': 'La unidad de negocio es requerida',
    }),

  responsables: Joi.object({
    ingResidente: Joi.string().hex().length(24).allow(null),
    tecnicoElectricista: Joi.string().hex().length(24).allow(null),
    hes: Joi.string().hex().length(24).allow(null),
  }).allow(null),

  materiales: Joi.array().items(
    Joi.object({
      descripcion: Joi.string().required().trim(),
      cantidad: Joi.number().min(0).required(),
      unidad: Joi.string().default('und').trim(),
      proveedor: Joi.string().allow('', null).trim(),
      costo: Joi.number().min(0).allow(null),
    })
  ),

  herramientas: Joi.array().items(
    Joi.object({
      descripcion: Joi.string().required().trim(),
      cantidad: Joi.number().min(1).required(),
      disponible: Joi.boolean().default(true),
    })
  ),

  equipos: Joi.array().items(
    Joi.object({
      descripcion: Joi.string().required().trim(),
      cantidad: Joi.number().min(1).required(),
      certificado: Joi.object({
        numero: Joi.string().allow('', null).trim(),
        vigencia: Joi.date().allow(null),
      }).allow(null),
    })
  ),

  elementosSeguridad: Joi.array().items(
    Joi.object({
      descripcion: Joi.string().required().trim(),
      cantidad: Joi.number().min(1).required(),
    })
  ),

  personalRequerido: Joi.object({
    electricistas: Joi.number().min(0).default(0),
    tecnicosTelecomunicacion: Joi.number().min(0).default(0),
    instrumentistas: Joi.number().min(0).default(0),
    obreros: Joi.number().min(0).default(0),
  }).allow(null),

  cronograma: Joi.array().items(
    Joi.object({
      actividad: Joi.string().required().trim(),
      fechaInicio: Joi.date().required(),
      fechaFin: Joi.date().required().min(Joi.ref('fechaInicio')),
      responsable: Joi.string().hex().length(24).allow(null),
      completada: Joi.boolean().default(false),
    })
  ),

  observaciones: Joi.string()
    .max(2000)
    .allow('', null)
    .trim()
    .messages({
      'string.max': 'Las observaciones no pueden exceder 2000 caracteres',
    }),
});

/**
 * Validador para actualizar plan de trabajo
 */
export const updateWorkPlanValidator = Joi.object({
  titulo: Joi.string().min(5).max(200).trim(),
  descripcion: Joi.string().max(1000).allow('', null).trim(),
  alcance: Joi.string().min(10).max(3000).trim(),
  unidadNegocio: Joi.string().valid(...Object.values(BUSINESS_UNITS)),
  responsables: Joi.object({
    ingResidente: Joi.string().hex().length(24).allow(null),
    tecnicoElectricista: Joi.string().hex().length(24).allow(null),
    hes: Joi.string().hex().length(24).allow(null),
  }),
  materiales: Joi.array().items(
    Joi.object({
      descripcion: Joi.string().required().trim(),
      cantidad: Joi.number().min(0).required(),
      unidad: Joi.string().trim(),
      proveedor: Joi.string().allow('', null).trim(),
      costo: Joi.number().min(0).allow(null),
    })
  ),
  herramientas: Joi.array().items(
    Joi.object({
      descripcion: Joi.string().required().trim(),
      cantidad: Joi.number().min(1).required(),
      disponible: Joi.boolean(),
    })
  ),
  equipos: Joi.array().items(
    Joi.object({
      descripcion: Joi.string().required().trim(),
      cantidad: Joi.number().min(1).required(),
      certificado: Joi.object({
        numero: Joi.string().allow('', null).trim(),
        vigencia: Joi.date().allow(null),
      }).allow(null),
    })
  ),
  elementosSeguridad: Joi.array().items(
    Joi.object({
      descripcion: Joi.string().required().trim(),
      cantidad: Joi.number().min(1).required(),
    })
  ),
  personalRequerido: Joi.object({
    electricistas: Joi.number().min(0),
    tecnicosTelecomunicacion: Joi.number().min(0),
    instrumentistas: Joi.number().min(0),
    obreros: Joi.number().min(0),
  }),
  cronograma: Joi.array().items(
    Joi.object({
      actividad: Joi.string().required().trim(),
      fechaInicio: Joi.date().required(),
      fechaFin: Joi.date().required().min(Joi.ref('fechaInicio')),
      responsable: Joi.string().hex().length(24).allow(null),
      completada: Joi.boolean(),
    })
  ),
  observaciones: Joi.string().max(2000).allow('', null).trim(),
  estado: Joi.string().valid(...Object.values(WORKPLAN_STATUS)),
}).min(1);

/**
 * Validador para aprobar plan de trabajo
 */
export const approveWorkPlanValidator = Joi.object({
  observaciones: Joi.string()
    .max(500)
    .allow('', null)
    .trim()
    .messages({
      'string.max': 'Las observaciones no pueden exceder 500 caracteres',
    }),
});
