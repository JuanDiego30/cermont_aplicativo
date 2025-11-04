import { Request, Response, NextFunction } from 'express';
export declare const advancedSecurityHeaders: () => ((req: Request, res: Response, next: NextFunction) => void);
export declare const permissionsPolicy: (req: Request, res: Response, next: NextFunction) => void;
export declare const securityMiddleware: Array<any>;
export default advancedSecurityHeaders;
//# sourceMappingURL=securityHeaders.d.ts.map