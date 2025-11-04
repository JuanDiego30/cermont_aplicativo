import { useState, useEffect, useCallback } from 'react';
export function useLocalStorage(key, initialValue) {
    const [storedValue, setStoredValue] = useState(() => {
        if (typeof window === 'undefined') {
            return initialValue;
        }
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        }
        catch (error) {
            console.error(`Error loading ${key} from localStorage:`, error);
            return initialValue;
        }
    });
    const setValue = useCallback((value) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            if (typeof window !== 'undefined') {
                window.localStorage.setItem(key, JSON.stringify(valueToStore));
            }
        }
        catch (error) {
            console.error(`Error saving ${key} to localStorage:`, error);
        }
    }, [key, storedValue]);
    const removeValue = useCallback(() => {
        try {
            setStoredValue(initialValue);
            if (typeof window !== 'undefined') {
                window.localStorage.removeItem(key);
            }
        }
        catch (error) {
            console.error(`Error removing ${key} from localStorage:`, error);
        }
    }, [key, initialValue]);
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === key && e.newValue !== null) {
                try {
                    setStoredValue(JSON.parse(e.newValue));
                }
                catch (error) {
                    console.error(`Error parsing ${key} from storage event:`, error);
                }
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [key]);
    return [storedValue, setValue, removeValue];
}
//# sourceMappingURL=useLocalStorage.js.map