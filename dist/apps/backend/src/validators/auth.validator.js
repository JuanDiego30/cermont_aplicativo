import Joi from 'joi';
import { ROLES } from '../utils/constants';
import { validatePasswordStrength } from '../utils/passwordHash';
const validationMessages = {
    'string.empty': 'Este campo es requerido',
    'string.min': 'Este campo debe tener al menos {#limit} caracteres',
    'string.max': 'Este campo no puede exceder {#limit} caracteres',
    'string.email': 'Debe ser un email válido',
    'string.pattern.base': 'Formato inválido',
    'any.required': 'Este campo es requerido',
    'any.only': 'Valor no permitido',
    'any.invalid': 'Valor no válido',
};
const passwordPattern = new RegExp(process.env.PASSWORD_PATTERN || '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[A-Za-z\\d@$!%*?&]{8,50}$');
export const registerValidator = Joi.object({
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
        .default(ROLES.TECHNICIAN)
        .messages(validationMessages),
    telefono: Joi.string()
        .pattern(/^[+]?[\d\s-()]{7,20}$/)
        .allow('', null)
        .messages(validationMessages),
    cedula: Joi.string()
        .pattern(/^[0-9]{6,12}$/)
        .allow('', null)
        .messages(validationMessages),
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
});
export const loginValidator = Joi.object({
    email: Joi.string()
        .email()
        .required()
        .lowercase()
        .trim()
        .messages(validationMessages),
    password: Joi.string()
        .required()
        .messages(validationMessages),
});
export const changePasswordValidator = Joi.object({
    currentPassword: Joi.string()
        .required()
        .messages(validationMessages),
    newPassword: Joi.string()
        .min(8)
        .max(50)
        .required()
        .pattern(passwordPattern)
        .invalid(Joi.ref('currentPassword'))
        .messages({
        ...validationMessages,
        'string.pattern.base': 'La nueva contraseña debe contener al menos una mayúscula, una minúscula y un número',
        'any.invalid': 'La nueva contraseña debe ser diferente a la actual',
    }),
    confirmPassword: Joi.string()
        .valid(Joi.ref('newPassword'))
        .required()
        .messages({
        ...validationMessages,
        'any.only': 'Las contraseñas no coinciden',
    }),
});
export const forgotPasswordValidator = Joi.object({
    email: Joi.string()
        .email()
        .required()
        .lowercase()
        .trim()
        .messages(validationMessages),
});
export const resetPasswordValidator = Joi.object({
    token: Joi.string()
        .required()
        .messages(validationMessages),
    newPassword: Joi.string()
        .min(8)
        .max(50)
        .required()
        .pattern(passwordPattern)
        .messages({
        ...validationMessages,
        'string.pattern.base': 'La nueva contraseña debe contener al menos una mayúscula, una minúscula y un número',
    }),
    confirmPassword: Joi.string()
        .valid(Joi.ref('newPassword'))
        .required()
        .messages({
        ...validationMessages,
        'any.only': 'Las contraseñas no coinciden',
    }),
});
export const validateWithStrength = (schema, data) => {
    let { error, value } = schema.validate(data, { abortEarly: false });
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
        error = customError;
    }
    return { error, value };
};
export default {
    registerValidator,
    loginValidator,
    changePasswordValidator,
    forgotPasswordValidator,
    resetPasswordValidator,
    validateWithStrength,
};
//# sourceMappingURL=auth.validator.js.map