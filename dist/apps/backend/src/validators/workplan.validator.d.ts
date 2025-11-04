import Joi, { type ObjectSchema } from 'joi';
export interface WorkPlanData {
    orderId?: string;
    titulo?: string;
    assignedUsers?: string[];
    tools?: string[];
    responsables?: Record<string, string>;
    [key: string]: any;
}
export declare const createWorkPlanValidator: ObjectSchema<WorkPlanData>;
export declare const updateWorkPlanValidator: ObjectSchema<Partial<WorkPlanData>>;
export declare const approveWorkPlanValidator: Joi.ObjectSchema<any>;
export declare const validateWorkPlanIds: (data: Partial<WorkPlanData>) => void;
declare const _default: {
    createWorkPlanValidator: Joi.ObjectSchema<WorkPlanData>;
    updateWorkPlanValidator: Joi.ObjectSchema<Partial<WorkPlanData>>;
    approveWorkPlanValidator: Joi.ObjectSchema<any>;
    validateWorkPlanIds: (data: Partial<WorkPlanData>) => void;
};
export default _default;
//# sourceMappingURL=workplan.validator.d.ts.map