/**
 * Utility functions barrel export.
 * @module lib/utils
 */
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines clsx + tailwind-merge for conditional Tailwind CSS classes.
 * Standard cn() helper used across all UI components.
 */
export function cn(...inputs: ClassValue[]): string {
	return twMerge(clsx(inputs));
}

export { buildQueryString } from "./build-query-string";
export { formatDate, formatDateTime } from "./format-date";
export { useHasMounted } from "./use-has-mounted";
