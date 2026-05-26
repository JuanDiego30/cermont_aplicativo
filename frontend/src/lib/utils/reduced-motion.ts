/**
 * Check if the user prefers reduced motion via the
 * `@media (prefers-reduced-motion: reduce)` CSS media query.
 */
export function prefersReducedMotion(): boolean {
	if (typeof window === "undefined") {
		return true;
	}

	return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
