import { useState, useEffect } from 'react';
export function useMediaQuery(query) {
    const [matches, setMatches] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.matchMedia(query).matches;
        }
        return false;
    });
    useEffect(() => {
        const media = window.matchMedia(query);
        const listener = (e) => {
            setMatches(e.matches);
        };
        media.addEventListener('change', listener);
        return () => {
            media.removeEventListener('change', listener);
        };
    }, [query]);
    return matches;
}
export const useIsMobile = () => useMediaQuery('(max-width: 768px)');
export const useIsTablet = () => useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
export const useIsDesktop = () => useMediaQuery('(min-width: 1025px)');
//# sourceMappingURL=useMediaQuery.js.map