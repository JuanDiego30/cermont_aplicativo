import { Response } from 'express';
import { ROLES, ORDER_STATUS, ORDER_PRIORITY } from './constants';
import type { ErrorDetails } from './response';
import Joi from 'joi';
export interface ValidationResult<T = unknown> {
    errors: string[];
    sanitized: Partial<T>;
}
export interface ErrorDetail extends ErrorDetails {
    field?: string;
    message: string;
}
export interface FileData {
    fieldname?: string;
    originalname?: string;
    encoding?: string;
    mimetype?: string;
    size?: number;
    buffer?: Buffer;
}
export interface RegisterData {
    nombre: string;
    email: string;
    password: string;
    rol?: keyof typeof ROLES;
    telefono?: string;
    cedula?: string;
    cargo?: string;
    especialidad?: string;
}
export interface LoginData {
    email: string;
    password: string;
    remember?: boolean;
}
export interface OrderData {
    numeroOrden: string;
    clienteNombre: string;
    cliente?: string;
    descripcion: string;
    lugar: string;
    creadoPor: string;
    fechaInicio: string;
    fecha?: string;
    estado?: keyof typeof ORDER_STATUS;
    prioridad?: keyof typeof ORDER_PRIORITY;
}
export interface ActivityData {
    descripcion: string;
    responsable?: string;
    fechaInicio?: string;
    fechaFin?: string;
    estado?: 'pendiente' | 'en_progreso' | 'completada';
}
export interface WorkPlanData {
    orden: string;
    actividades?: ActivityData[];
    observaciones?: string;
}
export interface PaginationQuery {
    page?: string;
    limit?: string;
    search?: string;
    estado?: string;
    fechaDesde?: string;
    fechaHasta?: string;
    sort?: string;
}
export declare const validateRegisterData: (data: Partial<RegisterData>) => ValidationResult<RegisterData>;
export declare const validateLoginData: (data: Partial<LoginData>) => ValidationResult<LoginData>;
export declare const validateOrderData: (data: Partial<OrderData>) => ValidationResult<OrderData>;
export declare const validateWorkPlanData: (data: Partial<WorkPlanData>) => ValidationResult<WorkPlanData>;
export declare const validateFile: (file?: FileData) => {
    errors: string[];
    valid: boolean;
    sanitizedFilename?: string;
};
export declare const validatePaginationParams: (query: Partial<PaginationQuery>) => {
    page: number;
    limit: number;
    sort: string;
};
export declare const validateSearchFilters: (query: Partial<PaginationQuery>) => Record<string, any>;
export declare const validateAndRespond: <T>(validator: (data: any) => ValidationResult<T>, data: any, res: Response) => {
    hasErrors: boolean;
    response?: Response;
    sanitized?: Partial<T>;
};
export declare const registerSchema: Joi.ObjectSchema<RegisterData>;
export declare const loginSchema: Joi.ObjectSchema<LoginData>;
export declare const orderSchema: Joi.ObjectSchema<OrderData>;
declare const _default: {
    validateRegisterData: (data: Partial<RegisterData>) => ValidationResult<RegisterData>;
    validateLoginData: (data: Partial<LoginData>) => ValidationResult<LoginData>;
    validateOrderData: (data: Partial<OrderData>) => ValidationResult<OrderData>;
    validateWorkPlanData: (data: Partial<WorkPlanData>) => ValidationResult<WorkPlanData>;
    validateFile: (file?: FileData) => {
        errors: string[];
        valid: boolean;
        sanitizedFilename?: string;
    };
    validatePaginationParams: (query: Partial<PaginationQuery>) => {
        page: number;
        limit: number;
        sort: string;
    };
    validateSearchFilters: (query: Partial<PaginationQuery>) => Record<string, any>;
    validateAndRespond: <T>(validator: (data: any) => ValidationResult<T>, data: any, res: Response) => {
        hasErrors: boolean;
        response?: Response;
        sanitized?: Partial<T>;
    };
    registerSchema: Joi.ObjectSchema<RegisterData>;
    loginSchema: Joi.ObjectSchema<LoginData>;
    orderSchema: Joi.ObjectSchema<OrderData>;
};
export default _default;
//# sourceMappingURL=validators.d.ts.map