interface RateLimitData {
    count: number;
    resetTime: number;
    windowMs: number;
    firstRequest: number;
    lastRequest?: number;
}
interface ViolationData {
    count: number;
    firstViolation: number;
    lastViolation: number;
}
interface RateLimiterOptions {
    windowMs?: number;
    max?: number;
    message?: string;
    statusCode?: number;
    skipSuccessfulRequests?: boolean;
    skipFailedRequests?: boolean;
    keyGenerator?: (req: Request) => string;
    skip?: (req: Request, res: Response) => boolean;
}
declare class RateLimitStore {
    private requests;
    private violations;
    private blocked;
    private cleanupInterval;
    constructor();
    increment(key: string, windowMs: number): RateLimitData;
    get(key: string): RateLimitData | undefined;
    reset(key: string): void;
    recordViolation(key: string): ViolationData;
    shouldBlock(key: string): boolean;
    cleanup(): void;
    getStats(): {
        totalKeys: number;
        totalViolations: number;
        blocked: number;
        whitelist: number;
        blacklist: number;
        topAbusers: Array<{
            key: string;
            count: number;
            first: string;
        }>;
    };
}
export declare const stopRateLimiter: () => void;
export declare const rateLimiter: (options?: RateLimiterOptions) => ((req: Request, res: Response, next: NextFunction) => void);
export declare const loginLimiter: (req: Request, res: Response, next: NextFunction) => void;
export declare const strictLimiter: (req: Request, res: Response, next: NextFunction) => void;
export declare const apiRateLimiter: (req: Request, res: Response, next: NextFunction) => void;
export declare const uploadRateLimiter: (req: Request, res: Response, next: NextFunction) => void;
export declare const createRateLimiter: (req: Request, res: Response, next: NextFunction) => void;
export declare const searchLimiter: (req: Request, res: Response, next: NextFunction) => void;
export declare const blacklistMiddleware: (req: Request, res: Response, next: NextFunction) => void;
export declare const blockIp: (ip: string, reason?: string) => boolean;
export declare const unblockIp: (ip: string) => boolean;
export declare const whitelistIp: (ip: string) => boolean;
export declare const removeFromWhitelist: (ip: string) => boolean;
export declare const resetIpLimit: (ip: string) => number;
export declare const getRateLimitStats: () => ReturnType<RateLimitStore["getStats"]>;
export declare const rateLimitManager: {
    blockIp: (ip: string, reason?: string) => boolean;
    unblockIp: (ip: string) => boolean;
    whitelistIp: (ip: string) => boolean;
    removeFromWhitelist: (ip: string) => boolean;
    resetIpLimit: (ip: string) => number;
    getStats: () => ReturnType<RateLimitStore["getStats"]>;
    isBlacklisted: (ip: string) => boolean;
    isWhitelisted: (ip: string) => boolean;
    getClientIp: (req: Request) => string;
};
export declare const __store__: RateLimitStore | undefined;
export default rateLimiter;
//# sourceMappingURL=rateLimiter.d.ts.map