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
