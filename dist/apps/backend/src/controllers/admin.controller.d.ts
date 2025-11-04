import { Request, Response, NextFunction } from 'express';
export declare const getRateLimitStats: (req: Request, res: Response, next: NextFunction) => void;
export declare const blockIp: (req: Request, res: Response, next: NextFunction) => void;
export declare const unblockIp: (req: Request, res: Response, next: NextFunction) => void;
export declare const whitelistIp: (req: Request, res: Response, next: NextFunction) => void;
export declare const removeFromWhitelist: (req: Request, res: Response, next: NextFunction) => void;
export declare const resetIpLimit: (req: Request, res: Response, next: NextFunction) => void;
export declare const checkIpStatus: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=admin.controller.d.ts.map