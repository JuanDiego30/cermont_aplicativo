interface UseAsyncState<T> {
    data: T | null;
    error: Error | null;
    isLoading: boolean;
    isError: boolean;
    isSuccess: boolean;
}
interface UseAsyncReturn<T> extends UseAsyncState<T> {
    execute: (...args: unknown[]) => Promise<T | undefined>;
    reset: () => void;
    setData: (data: T | null) => void;
}
export declare function useAsync<T = unknown>(asyncFunction: (...args: unknown[]) => Promise<T>, immediate?: boolean): UseAsyncReturn<T>;
export {};
//# sourceMappingURL=useAsync.d.ts.map