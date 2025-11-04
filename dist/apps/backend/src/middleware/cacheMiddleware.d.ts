import type { TypedRequest } from '';
export declare const cacheMiddleware: (ttl?: number, keyGenerator?: (req: TypedRequest) => Promise<string | null>, userSpecific?: boolean, skipQueries?: string[]) => (req: TypedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const invalidateCache: (patterns: string | string[]) => (req: TypedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const invalidateCacheById: (resourceType: string, idParam?: string) => (req: TypedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const clearAllCache: () => Promise<number>;
declare const _default: {
    cacheMiddleware: (ttl?: number, keyGenerator?: (req: TypedRequest) => Promise<string | null>, userSpecific?: boolean, skipQueries?: string[]) => (req: TypedRequest, res: Response, next: NextFunction) => Promise<void>;
    invalidateCache: (patterns: string | string[]) => (req: TypedRequest, res: Response, next: NextFunction) => Promise<void>;
    invalidateCacheById: (resourceType: string, idParam?: string) => (req: TypedRequest, res: Response, next: NextFunction) => Promise<void>;
    clearAllCache: () => Promise<number>;
};
export default _default;
//# sourceMappingURL=cacheMiddleware.d.ts.map