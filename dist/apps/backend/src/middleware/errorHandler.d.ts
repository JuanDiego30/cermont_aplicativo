export declare const errorHandler: (err: unknown, req: Request, res: Response, _next: NextFunction) => void;
export declare const notFound: (req: Request, res: Response) => void;
export declare const asyncErrorHandler: <T = void>(fn: (req: Request, res: Response, next: NextFunction) => Promise<T>) => (req: Request, res: Response, next: NextFunction) => void;
export declare const unhandledRejectionHandler: () => void;
export declare const uncaughtExceptionHandler: () => void;
//# sourceMappingURL=errorHandler.d.ts.map