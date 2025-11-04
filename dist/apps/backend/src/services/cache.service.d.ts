export declare const registerShutdownHook: () => void;
interface CacheStats {
    hits: number;
    misses: number;
    sets: number;
    deletes: number;
    keysCount: number;
    hitRate: number;
    nodeCacheStats?: any;
    memoryUsage: number;
}
type WrapFn<T> = () => Promise<T>;
declare class CacheService {
    private cache;
    private stats;
    constructor();
    get(key: string): any | undefined;
    mget(keys: string[]): Record<string, any>;
    set(key: string, value: any, ttl?: number | null): boolean;
    mset(data: Record<string, any>, ttl?: number | null): number;
    del(key: string): number;
    delMultiple(keys: string | string[]): number;
    delPattern(pattern: string): number;
    has(key: string): boolean;
    keys(): string[];
    flush(): void;
    getStats(): CacheStats | {
        enabled: false;
        message: string;
    };
    wrap<T>(key: string, fn: WrapFn<T>, ttl?: number | null): Promise<T>;
}
declare const cacheService: CacheService;
export default cacheService;
//# sourceMappingURL=cache.service.d.ts.map