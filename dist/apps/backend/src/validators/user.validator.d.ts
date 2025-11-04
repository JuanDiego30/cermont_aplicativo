import Joi, { type ObjectSchema } from 'joi';
export interface UserData {
    nombre?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    rol?: string;
    telefono?: string;
    cedula?: string;
    cargo?: string;
    especialidad?: string;
    isActive?: boolean;
    avatar?: string;
}
interface UserData {
    nombre: string;
    email: string;
    password: string;
    rol: string;
    telefono?: string;
    cedula?: string;
    cargo?: string;
    especialidad?: string;
    avatar?: string;
    isActive?: boolean;
}
export declare const createUserValidator: Joi.ObjectSchema<any>;
export declare const updateUserValidator: ObjectSchema<Partial<UserData>>;
export declare const updateProfileValidator: Joi.ObjectSchema<any>;
export declare const validateCreateWithStrength: (data: unknown) => {
    error?: Joi.ValidationError;
    value: any;
};
export declare const validateUniques: (data: Partial<UserData>, excludeId?: string) => Promise<void>;
declare const _default: {
    createUserValidator: Joi.ObjectSchema<any>;
    updateUserValidator: Joi.ObjectSchema<Partial<UserData>>;
    updateProfileValidator: Joi.ObjectSchema<any>;
    validateCreateWithStrength: (data: unknown) => {
        error?: Joi.ValidationError;
        value: any;
    };
    validateUniques: (data: Partial<UserData>, excludeId?: string) => Promise<void>;
};
export default _default;
//# sourceMappingURL=user.validator.d.ts.map