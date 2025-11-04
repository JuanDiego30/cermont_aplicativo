import Joi from 'joi';
import { WORKPLAN_STATUS, BUSINESS_UNITS, HTTP_STATUS, ERROR_CODES } from '../utils/constants';
import { validateObjectId } from '../middleware/sanitize';
import { AppError } from '../utils/errorHandler';
const workPlanMessages = {
    'string.empty': 'Este campo es requerido',
    'string.min': 'Este campo debe tener al menos {#limit} caracteres',
    'string.max': 'Este campo no puede exceder {#limit} caracteres',
    'any.required': 'Este campo es requerido',
    'any.only': 'Valor no permitido',
    'number.min': 'La cantidad no puede ser negativa',
    'date.base': 'Debe ser una fecha válida',
    'date.min': 'La fecha de fin debe ser posterior a la de inicio',
    'date.format': 'La fecha debe estar en formato ISO',
    'array.min': 'Debe proporcionar al menos {#limit} elementos',
    'array.base': 'Debe ser un array',
    'string.pattern.base': 'Formato inválido',
    'object.base': 'Debe ser un objeto válido',
};
const objectIdPattern = /^[0-9a-fA-F]{24}$/;
const materialSchema = Joi.object({
    descripcion: Joi.string().required().trim().messages(workPlanMessages),
    cantidad: Joi.number().min(0).required().messages(workPlanMessages),
    unidad: Joi.string().default('und').trim().messages(workPlanMessages),
    proveedor: Joi.string().allow('', null).trim().messages(workPlanMessages),
    costo: Joi.number().min(0).allow(null).messages(workPlanMessages),
});
const herramientaSchema = Joi.object({
    descripcion: Joi.string().required().trim().messages(workPlanMessages),
    cantidad: Joi.number().min(1).required().messages(workPlanMessages),
    disponible: Joi.boolean().default(true).messages(workPlanMessages),
});
const equipoSchema = Joi.object({
    descripcion: Joi.string().required().trim().messages(workPlanMessages),
    cantidad: Joi.number().min(1).required().messages(workPlanMessages),
    certificado: Joi.object({
        numero: Joi.string().allow('', null).trim().messages(workPlanMessages),
        vigencia: Joi.date().iso().allow(null).messages(workPlanMessages),
    }).allow(null).messages({ 'object.base': 'Certificado inválido' }),
});
const seguridadSchema = Joi.object({
    descripcion: Joi.string().required().trim().messages(workPlanMessages),
    cantidad: Joi.number().min(1).required().messages(workPlanMessages),
});
const cronogramaItemSchema = Joi.object({
    actividad: Joi.string().required().trim().messages(workPlanMessages),
    fechaInicio: Joi.date().iso().required().messages(workPlanMessages),
    fechaFin: Joi.date().iso().required().min(Joi.ref('fechaInicio')).messages(workPlanMessages),
    responsable: Joi.string().pattern(objectIdPattern).allow(null).messages(workPlanMessages),
    completada: Joi.boolean().default(false).messages(workPlanMessages),
});
export const createWorkPlanValidator = Joi.object({
    orderId: Joi.string()
        .pattern(objectIdPattern)
        .required()
        .messages(workPlanMessages),
    titulo: Joi.string()
        .min(5)
        .max(200)
        .required()
        .trim()
        .messages(workPlanMessages),
    descripcion: Joi.string()
        .max(1000)
        .allow('', null)
        .trim()
        .messages(workPlanMessages),
    alcance: Joi.string()
        .min(10)
        .max(3000)
        .required()
        .trim()
        .messages(workPlanMessages),
    unidadNegocio: Joi.string()
        .valid(...Object.values(BUSINESS_UNITS))
        .default(BUSINESS_UNITS.IT)
        .required()
        .messages(workPlanMessages),
    startDate: Joi.date()
        .iso()
        .required()
        .messages(workPlanMessages),
    endDate: Joi.date()
        .iso()
        .min(Joi.ref('startDate'))
        .required()
        .messages(workPlanMessages),
    assignedUsers: Joi.array()
        .items(Joi.string().pattern(objectIdPattern))
        .unique()
        .min(1)
        .messages(workPlanMessages),
    tools: Joi.array()
        .items(Joi.string().pattern(objectIdPattern))
        .unique()
        .min(1)
        .messages(workPlanMessages),
    responsables: Joi.object({
        ingResidente: Joi.string().pattern(objectIdPattern).allow(null).messages(workPlanMessages),
        tecnicoElectricista: Joi.string().pattern(objectIdPattern).allow(null).messages(workPlanMessages),
        hes: Joi.string().pattern(objectIdPattern).allow(null).messages(workPlanMessages),
    }).allow(null).messages({ 'object.base': 'Responsables inválidos' }),
    materiales: Joi.array().items(materialSchema).messages(workPlanMessages),
    herramientas: Joi.array().items(herramientaSchema).messages(workPlanMessages),
    equipos: Joi.array().items(equipoSchema).messages(workPlanMessages),
    elementosSeguridad: Joi.array().items(seguridadSchema).min(1).messages(workPlanMessages),
    personalRequerido: Joi.object({
        electricistas: Joi.number().min(0).default(0).messages(workPlanMessages),
        tecnicosTelecomunicacion: Joi.number().min(0).default(0).messages(workPlanMessages),
        instrumentistas: Joi.number().min(0).default(0).messages(workPlanMessages),
        obreros: Joi.number().min(0).default(0).messages(workPlanMessages),
    }).allow(null).messages({ 'object.base': 'Personal requerido inválido' }),
    cronograma: Joi.array().items(cronogramaItemSchema).min(1).messages(workPlanMessages),
    observaciones: Joi.string()
        .max(2000)
        .allow('', null)
        .trim()
        .messages(workPlanMessages),
}).unknown(false);
export const updateWorkPlanValidator = Joi.object({
    titulo: Joi.string().min(5).max(200).trim().messages(workPlanMessages),
    descripcion: Joi.string().max(1000).allow('', null).trim().messages(workPlanMessages),
    alcance: Joi.string().min(10).max(3000).trim().messages(workPlanMessages),
    unidadNegocio: Joi.string().valid(...Object.values(BUSINESS_UNITS)).messages(workPlanMessages),
    startDate: Joi.date().iso().messages(workPlanMessages),
    endDate: Joi.date().iso().messages(workPlanMessages),
    assignedUsers: Joi.array().items(Joi.string().pattern(objectIdPattern)).unique().messages(workPlanMessages),
    tools: Joi.array().items(Joi.string().pattern(objectIdPattern)).unique().messages(workPlanMessages),
    responsables: Joi.object({
        ingResidente: Joi.string().pattern(objectIdPattern).allow(null).messages(workPlanMessages),
        tecnicoElectricista: Joi.string().pattern(objectIdPattern).allow(null).messages(workPlanMessages),
        hes: Joi.string().pattern(objectIdPattern).allow(null).messages(workPlanMessages),
    }).allow(null).messages({ 'object.base': 'Responsables inválidos' }),
    materiales: Joi.array().items(materialSchema).messages(workPlanMessages),
    herramientas: Joi.array().items(herramientaSchema).messages(workPlanMessages),
    equipos: Joi.array().items(equipoSchema).messages(workPlanMessages),
    elementosSeguridad: Joi.array().items(seguridadSchema).messages(workPlanMessages),
    personalRequerido: Joi.object({
        electricistas: Joi.number().min(0).messages(workPlanMessages),
        tecnicosTelecomunicacion: Joi.number().min(0).messages(workPlanMessages),
        instrumentistas: Joi.number().min(0).messages(workPlanMessages),
        obreros: Joi.number().min(0).messages(workPlanMessages),
    }).allow(null).messages({ 'object.base': 'Personal requerido inválido' }),
    cronograma: Joi.array().items(cronogramaItemSchema).messages(workPlanMessages),
    observaciones: Joi.string().max(2000).allow('', null).trim().messages(workPlanMessages),
    estado: Joi.string().valid(...Object.values(WORKPLAN_STATUS)).messages(workPlanMessages),
}).min(1).unknown(false);
export const approveWorkPlanValidator = Joi.object({
    observaciones: Joi.string()
        .max(500)
        .allow('', null)
        .trim()
        .messages(workPlanMessages),
}).unknown(false);
export const validateWorkPlanIds = (data) => {
    if (data.orderId && !validateObjectId(data.orderId)) {
        throw new AppError('ID de orden inválido', HTTP_STATUS.BAD_REQUEST, { code: ERROR_CODES.INVALID_OBJECTID });
    }
    if (data.assignedUsers) {
        data.assignedUsers.forEach((id) => {
            if (!validateObjectId(id))
                throw new AppError(`ID de usuario inválido: ${id}`, HTTP_STATUS.BAD_REQUEST, { code: ERROR_CODES.INVALID_OBJECTID });
        });
    }
    if (data.tools) {
        data.tools.forEach((id) => {
            if (!validateObjectId(id))
                throw new AppError(`ID de herramienta inválido: ${id}`, HTTP_STATUS.BAD_REQUEST, { code: ERROR_CODES.INVALID_OBJECTID });
        });
    }
    if (data.responsables) {
        Object.values(data.responsables).forEach((id) => {
            if (typeof id === 'string' && id && !validateObjectId(id)) {
                throw new AppError('ID de responsable inválido', HTTP_STATUS.BAD_REQUEST, { code: ERROR_CODES.INVALID_OBJECTID });
            }
        });
    }
};
export default {
    createWorkPlanValidator,
    updateWorkPlanValidator,
    approveWorkPlanValidator,
    validateWorkPlanIds,
};
//# sourceMappingURL=workplan.validator.js.map