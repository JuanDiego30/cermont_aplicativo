import Joi from 'joi';
import { ORDER_STATUS, ORDER_PRIORITY, HTTP_STATUS, ERROR_CODES } from '../utils/constants';
import { validateObjectId } from '../middleware/sanitize';
import { AppError } from '../utils/errorHandler';
const orderMessages = {
    'string.empty': 'Este campo es requerido',
    'string.min': 'Este campo debe tener al menos {#limit} caracteres',
    'string.max': 'Este campo no puede exceder {#limit} caracteres',
    'any.required': 'Este campo es requerido',
    'any.only': 'Valor no permitido',
    'number.min': 'El valor no puede ser negativo',
    'date.base': 'Debe ser una fecha válida',
    'date.min': 'La fecha debe ser posterior a la de inicio',
    'array.min': 'Debe proporcionar al menos {#limit} elementos',
    'array.base': 'Debe ser un array',
    'string.pattern.base': 'Formato inválido',
    'any.invalid': 'Valor inválido',
    'object.base': 'Debe ser un objeto válido',
};
const objectIdPattern = /^[0-9a-fA-F]{24}$/;
export const createOrderValidator = Joi.object({
    numeroOrden: Joi.string()
        .uppercase()
        .trim()
        .allow('', null)
        .messages(orderMessages),
    clienteNombre: Joi.string()
        .min(2)
        .max(200)
        .required()
        .trim()
        .messages(orderMessages),
    clienteContacto: Joi.object({
        nombre: Joi.string().trim().allow('', null).messages(orderMessages),
        email: Joi.string().email().lowercase().trim().allow('', null).messages(orderMessages),
        telefono: Joi.string().pattern(/^[+]?[\d\s-()]{7,20}$/).allow('', null).messages(orderMessages),
    }).allow(null).messages({ 'object.base': 'Contacto del cliente inválido' }),
    poNumber: Joi.string()
        .trim()
        .allow('', null)
        .messages(orderMessages),
    descripcion: Joi.string()
        .min(10)
        .max(2000)
        .required()
        .trim()
        .messages(orderMessages),
    alcance: Joi.string()
        .max(3000)
        .allow('', null)
        .trim()
        .messages(orderMessages),
    lugar: Joi.string()
        .min(2)
        .max(200)
        .required()
        .trim()
        .messages(orderMessages),
    coordenadas: Joi.object({
        lat: Joi.number().min(-90).max(90).required(),
        lng: Joi.number().min(-180).max(180).required(),
    }).allow(null).messages(orderMessages),
    fechaInicio: Joi.date()
        .iso()
        .required()
        .messages(orderMessages),
    fechaFinEstimada: Joi.date()
        .iso()
        .min(Joi.ref('fechaInicio'))
        .allow(null)
        .messages(orderMessages),
    prioridad: Joi.string()
        .valid(...Object.values(ORDER_PRIORITY))
        .default(ORDER_PRIORITY.MEDIUM)
        .messages(orderMessages),
    costoEstimado: Joi.number()
        .min(0)
        .default(0)
        .messages(orderMessages),
    moneda: Joi.string()
        .valid('COP', 'USD')
        .default('COP')
        .messages(orderMessages),
    asignadoA: Joi.array()
        .items(Joi.string().pattern(objectIdPattern))
        .unique()
        .allow(null)
        .messages(orderMessages),
    supervisorId: Joi.string()
        .pattern(objectIdPattern)
        .allow(null)
        .messages(orderMessages),
}).unknown(false);
export const updateOrderValidator = Joi.object({
    clienteNombre: Joi.string().min(2).max(200).trim().messages(orderMessages),
    clienteContacto: Joi.object({
        nombre: Joi.string().trim().allow('', null).messages(orderMessages),
        email: Joi.string().email().lowercase().trim().allow('', null).messages(orderMessages),
        telefono: Joi.string().pattern(/^[+]?[\d\s-()]{7,20}$/).allow('', null).messages(orderMessages),
    }).allow(null).messages({ 'object.base': 'Contacto inválido' }),
    poNumber: Joi.string().trim().allow('', null).messages(orderMessages),
    descripcion: Joi.string().min(10).max(2000).trim().messages(orderMessages),
    alcance: Joi.string().max(3000).allow('', null).trim().messages(orderMessages),
    lugar: Joi.string().min(2).max(200).trim().messages(orderMessages),
    coordenadas: Joi.object({
        lat: Joi.number().min(-90).max(90).required(),
        lng: Joi.number().min(-180).max(180).required(),
    }).allow(null).messages(orderMessages),
    fechaInicio: Joi.date().iso().messages(orderMessages),
    fechaFinEstimada: Joi.date().iso().messages(orderMessages),
    fechaFinReal: Joi.date().iso().allow(null).messages(orderMessages),
    prioridad: Joi.string().valid(...Object.values(ORDER_PRIORITY)).messages(orderMessages),
    costoEstimado: Joi.number().min(0).messages(orderMessages),
    costoReal: Joi.number().min(0).messages(orderMessages),
    moneda: Joi.string().valid('COP', 'USD').messages(orderMessages),
    asignadoA: Joi.array().items(Joi.string().pattern(objectIdPattern)).unique().messages(orderMessages),
    supervisorId: Joi.string().pattern(objectIdPattern).allow(null).messages(orderMessages),
}).min(1).unknown(false);
export const updateOrderStatusValidator = Joi.object({
    estado: Joi.string()
        .valid(...Object.values(ORDER_STATUS))
        .required()
        .messages(orderMessages),
}).unknown(false);
export const addNoteValidator = Joi.object({
    contenido: Joi.string()
        .min(1)
        .max(1000)
        .required()
        .trim()
        .messages(orderMessages),
}).unknown(false);
export const assignUsersValidator = Joi.object({
    asignadoA: Joi.array()
        .items(Joi.string().pattern(objectIdPattern))
        .unique()
        .min(1)
        .required()
        .messages(orderMessages),
    supervisorId: Joi.string()
        .pattern(objectIdPattern)
        .allow(null)
        .messages(orderMessages),
}).unknown(false);
export const validateAssignedIds = (asignadoA, supervisorId) => {
    if (asignadoA) {
        asignadoA.forEach(id => {
            if (!validateObjectId(id)) {
                throw new AppError(`ID de usuario inválido: ${id}`, HTTP_STATUS.BAD_REQUEST, { code: ERROR_CODES.INVALID_OBJECTID });
            }
        });
    }
    if (supervisorId && !validateObjectId(supervisorId)) {
        throw new AppError('ID de supervisor inválido', HTTP_STATUS.BAD_REQUEST, { code: ERROR_CODES.INVALID_OBJECTID });
    }
};
export default {
    createOrderValidator,
    updateOrderValidator,
    updateOrderStatusValidator,
    addNoteValidator,
    assignUsersValidator,
    validateAssignedIds,
};
//# sourceMappingURL=order.validator.js.map