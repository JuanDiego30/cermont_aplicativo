import { Request, Response, NextFunction } from 'express';
interface PaginationOptions {
    maxLimit?: number;
    defaultLimit?: number;
    defaultPage?: number;
}
export declare const validateBody: (schema: Joi.ObjectSchema) => ((req: Request, res: Response, next: NextFunction) => void);
export declare const validateQuery: (schema: Joi.ObjectSchema) => ((req: Request, res: Response, next: NextFunction) => void);
export declare const validateParams: (schema: Joi.ObjectSchema) => ((req: Request, res: Response, next: NextFunction) => void);
export declare const validateRequest: (schemas?: Partial<Record<"body" | "query" | "params", Joi.ObjectSchema | object>>) => ((req: Request, res: Response, next: NextFunction) => void);
export declare const validateObjectId: (paramName?: string) => ((req: Request, res: Response, next: NextFunction) => void);
export declare const validatePagination: (options?: Partial<PaginationOptions>) => ((req: Request, res: Response, next: NextFunction) => void);
export declare const pagSchema: Joi.ObjectSchema;
export declare const idSchema: Joi.ObjectSchema;
declare const _default: {
    validateBody: (schema: Joi.ObjectSchema) => ((req: Request, res: Response, next: NextFunction) => void);
    validateQuery: (schema: Joi.ObjectSchema) => ((req: Request, res: Response, next: NextFunction) => void);
    validateParams: (schema: Joi.ObjectSchema) => ((req: Request, res: Response, next: NextFunction) => void);
    validateRequest: (schemas?: Partial<Record<"body" | "query" | "params", Joi.ObjectSchema | object>>) => ((req: Request, res: Response, next: NextFunction) => void);
    validateObjectId: (paramName?: string) => ((req: Request, res: Response, next: NextFunction) => void);
    validatePagination: (options?: Partial<PaginationOptions>) => ((req: Request, res: Response, next: NextFunction) => void);
    pagSchema: Joi.ObjectSchema;
    idSchema: Joi.ObjectSchema;
};
export default _default;
//# sourceMappingURL=validate.d.ts.map