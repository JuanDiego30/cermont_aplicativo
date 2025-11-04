import { Request, Response, NextFunction } from 'express';
type AsyncHandlerFn = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;
export declare const asyncHandler: (fn: AsyncHandlerFn) => ((req: Request, res: Response, next: NextFunction) => void);
export {};
//# sourceMappingURL=asyncHandler.d.ts.map