import Joi, { type ObjectSchema } from 'joi';
export interface OrderData {
    numeroOrden: string;
    clienteNombre?: string;
    [key: string]: any;
}
export declare const createOrderValidator: ObjectSchema<OrderData>;
export declare const updateOrderValidator: ObjectSchema<Partial<OrderData>>;
export declare const updateOrderStatusValidator: Joi.ObjectSchema<any>;
export declare const addNoteValidator: Joi.ObjectSchema<any>;
export declare const assignUsersValidator: Joi.ObjectSchema<any>;
export declare const validateAssignedIds: (asignadoA: string[] | null, supervisorId?: string) => void;
declare const _default: {
    createOrderValidator: Joi.ObjectSchema<OrderData>;
    updateOrderValidator: Joi.ObjectSchema<Partial<OrderData>>;
    updateOrderStatusValidator: Joi.ObjectSchema<any>;
    addNoteValidator: Joi.ObjectSchema<any>;
    assignUsersValidator: Joi.ObjectSchema<any>;
    validateAssignedIds: (asignadoA: string[] | null, supervisorId?: string) => void;
};
export default _default;
//# sourceMappingURL=order.validator.d.ts.map