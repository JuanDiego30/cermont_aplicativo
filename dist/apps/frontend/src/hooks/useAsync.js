import { useState, useCallback } from 'react';
export function useAsync(asyncFunction, immediate = false) {
    const [state, setState] = useState({
        data: null,
        error: null,
        isLoading: immediate,
        isError: false,
        isSuccess: false,
    });
    const execute = useCallback(async (...args) => {
        setState((prev) => ({
            ...prev,
            isLoading: true,
            error: null,
            isError: false,
        }));
        try {
            const data = await asyncFunction(...args);
            setState({
                data,
                error: null,
                isLoading: false,
                isError: false,
                isSuccess: true,
            });
            return data;
        }
        catch (error) {
            const err = error instanceof Error ? error : new Error('Unknown error');
            setState({
                data: null,
                error: err,
                isLoading: false,
                isError: true,
                isSuccess: false,
            });
        }
    }, [asyncFunction]);
    const reset = useCallback(() => {
        setState({
            data: null,
            error: null,
            isLoading: false,
            isError: false,
            isSuccess: false,
        });
    }, []);
    const setData = useCallback((data) => {
        setState((prev) => ({
            ...prev,
            data,
            isSuccess: data !== null,
        }));
    }, []);
    return { ...state, execute, reset, setData };
}
//# sourceMappingURL=useAsync.js.map