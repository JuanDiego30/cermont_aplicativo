import { sanitizers, validateObjectId } from '../middleware/sanitize';
import { validatePasswordStrength } from './passwordHash';
import { ROLES, ORDER_STATUS, ORDER_PRIORITY } from './constants';
import { validationErrorResponse } from './response';
import Joi from 'joi';
export const validateRegisterData = (data) => {
    const errors = [];
    const sanitized = {};
    if (!data.nombre || typeof data.nombre !== 'string') {
        errors.push('Nombre es requerido');
    }
    else {
        const cleanName = sanitizers.string(data.nombre, { maxLength: 100 });
        if (!cleanName || cleanName.length < 2) {
            errors.push('Nombre debe tener al menos 2 caracteres');
        }
        else {
            sanitized.nombre = cleanName;
        }
    }
    if (!data.email || typeof data.email !== 'string') {
        errors.push('Email es requerido');
    }
    else {
        const cleanEmail = sanitizers.email(data.email);
        if (!cleanEmail) {
            errors.push('Email inválido');
        }
        else {
            sanitized.email = cleanEmail;
        }
    }
    if (!data.password || typeof data.password !== 'string') {
        errors.push('Contraseña es requerida');
    }
    else {
        try {
            validatePasswordStrength(data.password);
            sanitized.password = data.password;
        }
        catch (err) {
            errors.push(err.message);
        }
    }
    if (data.rol && typeof data.rol === 'string') {
        if (!(data.rol in ROLES)) {
            errors.push('Rol inválido');
        }
        else {
            sanitized.rol = data.rol;
        }
    }
    if (data.telefono)
        sanitized.telefono = sanitizers.string(data.telefono, { maxLength: 20 });
    if (data.cedula)
        sanitized.cedula = sanitizers.string(data.cedula, { maxLength: 20 });
    if (data.cargo)
        sanitized.cargo = sanitizers.string(data.cargo, { maxLength: 100 });
    if (data.especialidad)
        sanitized.especialidad = sanitizers.string(data.especialidad, { maxLength: 100 });
    return { errors, sanitized };
};
export const validateLoginData = (data) => {
    const errors = [];
    const sanitized = {};
    if (!data.email || typeof data.email !== 'string') {
        errors.push('Email es requerido');
    }
    else {
        const cleanEmail = sanitizers.email(data.email);
        if (!cleanEmail) {
            errors.push('Email inválido');
        }
        else {
            sanitized.email = cleanEmail;
        }
    }
    if (!data.password || typeof data.password !== 'string') {
        errors.push('Contraseña es requerida');
    }
    else {
        sanitized.password = data.password;
    }
    if (data.remember !== undefined) {
        sanitized.remember = Boolean(data.remember);
    }
    return { errors, sanitized };
};
export const validateOrderData = (data) => {
    const errors = [];
    const sanitized = {};
    if (!data.numeroOrden || typeof data.numeroOrden !== 'string') {
        errors.push('Número de orden es requerido');
    }
    else {
        const clean = sanitizers.string(data.numeroOrden, { maxLength: 50 });
        if (clean)
            sanitized.numeroOrden = clean;
        else
            errors.push('Número de orden inválido');
    }
    if (!data.clienteNombre || typeof data.clienteNombre !== 'string') {
        errors.push('Nombre del cliente es requerido');
    }
    else {
        const clean = sanitizers.string(data.clienteNombre, { maxLength: 100 });
        if (clean)
            sanitized.clienteNombre = clean;
        else
            errors.push('Nombre del cliente inválido');
    }
    if (data.cliente && !validateObjectId(data.cliente)) {
        errors.push('ID de cliente inválido');
    }
    else if (data.cliente) {
        sanitized.cliente = data.cliente;
    }
    if (!data.descripcion || typeof data.descripcion !== 'string') {
        errors.push('Descripción es requerida');
    }
    else {
        const clean = sanitizers.string(data.descripcion, { maxLength: 2000, allowHTML: false });
        if (clean)
            sanitized.descripcion = clean;
        else
            errors.push('Descripción inválida');
    }
    if (!data.lugar || typeof data.lugar !== 'string') {
        errors.push('Lugar es requerido');
    }
    else {
        const clean = sanitizers.string(data.lugar, { maxLength: 200 });
        if (clean)
            sanitized.lugar = clean;
        else
            errors.push('Lugar inválido');
    }
    if (!data.creadoPor || !validateObjectId(data.creadoPor)) {
        errors.push('ID de usuario creador inválido');
    }
    else {
        sanitized.creadoPor = data.creadoPor;
    }
    if (!data.fechaInicio) {
        errors.push('Fecha de inicio es requerida');
    }
    else {
        const date = new Date(data.fechaInicio);
        if (isNaN(date.getTime())) {
            errors.push('Fecha de inicio inválida');
        }
        else {
            sanitized.fechaInicio = date.toISOString();
        }
    }
    if (data.fecha) {
        const date = new Date(data.fecha);
        if (!isNaN(date.getTime())) {
            sanitized.fecha = date.toISOString();
        }
    }
    if (data.estado && typeof data.estado === 'string') {
        if (!(data.estado in ORDER_STATUS)) {
            errors.push('Estado inválido');
        }
        else {
            sanitized.estado = data.estado;
        }
    }
    if (data.prioridad && typeof data.prioridad === 'string') {
        if (!(data.prioridad in ORDER_PRIORITY)) {
            errors.push('Prioridad inválida');
        }
        else {
            sanitized.prioridad = data.prioridad;
        }
    }
    return { errors, sanitized };
};
export const validateWorkPlanData = (data) => {
    const errors = [];
    const sanitized = {};
    if (!data.orden || !validateObjectId(data.orden)) {
        errors.push('ID de orden inválido');
    }
    else {
        sanitized.orden = data.orden;
    }
    if (data.actividades && Array.isArray(data.actividades)) {
        sanitized.actividades = data.actividades.map((actividad) => {
            const actErrors = [];
            const actSanitized = {};
            if (!actividad.descripcion || typeof actividad.descripcion !== 'string') {
                actErrors.push('Descripción de actividad requerida');
            }
            else {
                const clean = sanitizers.string(actividad.descripcion, { maxLength: 500 });
                if (clean)
                    actSanitized.descripcion = clean;
                else
                    actErrors.push('Descripción de actividad inválida');
            }
            if (actividad.responsable && !validateObjectId(actividad.responsable)) {
                actErrors.push('ID de responsable inválido');
            }
            else if (actividad.responsable) {
                actSanitized.responsable = actividad.responsable;
            }
            if (actividad.fechaInicio) {
                const date = new Date(actividad.fechaInicio);
                if (!isNaN(date.getTime()))
                    actSanitized.fechaInicio = date.toISOString();
            }
            if (actividad.fechaFin) {
                const date = new Date(actividad.fechaFin);
                if (!isNaN(date.getTime()))
                    actSanitized.fechaFin = date.toISOString();
            }
            const validStates = ['pendiente', 'en_progreso', 'completada'];
            if (actividad.estado && !validStates.includes(actividad.estado)) {
                actErrors.push('Estado de actividad inválido');
            }
            else {
                actSanitized.estado = actividad.estado || 'pendiente';
            }
            if (actErrors.length > 0) {
                errors.push(...actErrors.map(e => `Actividad: ${e}`));
                return null;
            }
            return actSanitized;
        }).filter(Boolean);
    }
    if (data.observaciones && typeof data.observaciones === 'string') {
        const clean = sanitizers.string(data.observaciones, { maxLength: 2000, allowHTML: false });
        if (clean)
            sanitized.observaciones = clean;
    }
    return { errors, sanitized };
};
export const validateFile = (file) => {
    const errors = [];
    if (!file) {
        errors.push('Archivo es requerido');
        return { errors, valid: false };
    }
    const maxSize = 10 * 1024 * 1024;
    if (file.size && file.size > maxSize) {
        errors.push('Archivo debe ser menor a 10MB');
    }
    const allowedMimeTypes = [
        'image/jpeg', 'image/png', 'image/webp',
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (file.mimetype && !allowedMimeTypes.includes(file.mimetype)) {
        errors.push('Tipo de archivo no permitido');
    }
    const sanitizedFilename = sanitizers.filename(file.originalname);
    if (!sanitizedFilename) {
        errors.push('Nombre de archivo inválido');
    }
    const valid = errors.length === 0;
    return { errors, valid, ...(sanitizedFilename && { sanitizedFilename }) };
};
export const validatePaginationParams = (query) => {
    const page = query.page ? Math.max(1, Number(query.page) || 1) : 1;
    const limit = Math.min(Math.max(1, Number(query.limit) || 10), 100);
    const sort = query.sort ? sanitizers.string(query.sort, { maxLength: 50 }) || '-createdAt' : '-createdAt';
    return { page, limit, sort };
};
export const validateSearchFilters = (query) => {
    const filters = {};
    if (query.search) {
        const clean = sanitizers.string(query.search, { maxLength: 100, allowHTML: false });
        if (clean)
            filters.search = clean;
    }
    if (query.estado) {
        if (ORDER_STATUS[query.estado]) {
            filters.estado = query.estado;
        }
    }
    if (query.fechaDesde) {
        const date = new Date(query.fechaDesde);
        if (!isNaN(date.getTime()))
            filters.fechaDesde = date;
    }
    if (query.fechaHasta) {
        const date = new Date(query.fechaHasta);
        if (!isNaN(date.getTime()))
            filters.fechaHasta = date;
    }
    return filters;
};
export const validateAndRespond = (validator, data, res) => {
    const { errors, sanitized } = validator(data);
    if (errors.length > 0) {
        const details = errors.map(message => ({ message, field: 'validation' }));
        return {
            hasErrors: true,
            response: validationErrorResponse(res, details),
        };
    }
    return { hasErrors: false, sanitized };
};
export const registerSchema = Joi.object({
    nombre: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    rol: Joi.string().valid(...Object.keys(ROLES)).optional(),
    telefono: Joi.string().max(20).optional(),
    cedula: Joi.string().max(20).optional(),
    cargo: Joi.string().max(100).optional(),
    especialidad: Joi.string().max(100).optional(),
});
export const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    remember: Joi.boolean().optional(),
});
export const orderSchema = Joi.object({
    numeroOrden: Joi.string().max(50).required(),
    clienteNombre: Joi.string().max(100).required(),
    cliente: Joi.string().optional(),
    descripcion: Joi.string().max(2000).required(),
    lugar: Joi.string().max(200).required(),
    creadoPor: Joi.string().required(),
    fechaInicio: Joi.date().iso().required(),
    fecha: Joi.date().iso().optional(),
    estado: Joi.string().valid(...Object.keys(ORDER_STATUS)).optional(),
    prioridad: Joi.string().valid(...Object.keys(ORDER_PRIORITY)).optional(),
});
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
//# sourceMappingURL=validators.js.map