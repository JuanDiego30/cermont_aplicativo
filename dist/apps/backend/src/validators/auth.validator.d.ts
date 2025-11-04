import Joi, { type ObjectSchema } from 'joi';
export interface RegisterData {
    nombre: string;
    email: string;
    password: string;
    confirmPassword?: string;
    rol?: string;
    telefono?: string;
    cedula?: string;
    cargo?: string;
    especialidad?: string;
}
export interface LoginData {
    email: string;
    password: string;
}
export interface ForgotPasswordData {
    email: string;
}
export interface ResetPasswordData {
    token: string;
    newPassword: string;
    confirmPassword: string;
}
export interface ChangePasswordData {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}
export declare const registerValidator: ObjectSchema<RegisterData>;
export declare const loginValidator: ObjectSchema<LoginData>;
export declare const changePasswordValidator: Joi.ObjectSchema<any>;
export declare const forgotPasswordValidator: Joi.ObjectSchema<any>;
export declare const resetPasswordValidator: Joi.ObjectSchema<any>;
export declare const validateWithStrength: (schema: ObjectSchema, data: unknown) => {
    error: Joi.ValidationError | undefined;
    value: any;
};
declare const _default: {
    registerValidator: Joi.ObjectSchema<RegisterData>;
    loginValidator: Joi.ObjectSchema<LoginData>;
    changePasswordValidator: Joi.ObjectSchema<any>;
    forgotPasswordValidator: Joi.ObjectSchema<any>;
    resetPasswordValidator: Joi.ObjectSchema<any>;
    validateWithStrength: (schema: ObjectSchema, data: unknown) => {
        error: Joi.ValidationError | undefined;
        value: any;
    };
};
export default _default;
//# sourceMappingURL=auth.validator.d.ts.map