import Joi from 'joi';
import { ROLES, HTTP_STATUS } from '../utils/constants';
import { validatePasswordStrength } from '../utils/passwordHash';
import { AppError } from '../utils/errorHandler';
import User from '../models/User';
const validationMessages = {
    'string.empty': 'Este campo es requerido',
    'string.min': 'Este campo debe tener al menos {#limit} caracteres',
    'string.max': 'Este campo no puede exceder {#limit} caracteres',
    'string.email': 'Debe ser una dirección de correo válida',
    'any.required': 'Este campo es obligatorio',
    'any.only': 'Valor no permitido',
};
const passwordPattern = new RegExp(process.env.PASSWORD_PATTERN || '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[A-Za-z\\d@$!%*?&]{8,50}$');
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
export const updateUserValidator = Joi.object({
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
export const validateCreateWithStrength = (data) => {
    const { error, value } = createUserValidator.validate(data, { abortEarly: false });
    if (error || !value?.password)
        return { error, value };
    try {
        validatePasswordStrength(value.password);
    }
    catch (strengthError) {
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
            const mergedError = new Joi.ValidationError(error.message, [...error.details, ...customError.details], value);
            return { error: mergedError, value };
        }
        else {
            return { error: customError, value };
        }
    }
    return { error, value };
};
export const validateUniques = async (data, excludeId) => {
    if (data.email) {
        const existing = await User.findOne({ email: data.email, _id: { $ne: excludeId } });
        if (existing)
            throw new AppError('Email ya en uso', HTTP_STATUS.CONFLICT, { code: 'DUPLICATE_EMAIL' });
    }
    if (data.cedula) {
        const existing = await User.findOne({ cedula: data.cedula, _id: { $ne: excludeId } });
        if (existing)
            throw new AppError('Cédula ya en uso', HTTP_STATUS.CONFLICT, { code: 'DUPLICATE_CEDULA' });
    }
};
export default {
    createUserValidator,
    updateUserValidator,
    updateProfileValidator,
    validateCreateWithStrength,
    validateUniques,
};
//# sourceMappingURL=user.validator.js.map