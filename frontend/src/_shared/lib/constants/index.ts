/**
 * Centralized constants for CERMONT application.
 * All status/priority keys use English to match shared-types SSOT.
 */

import {
	ORDER_PRIORITY_LABELS_ES,
	ORDER_STATUS_LABELS_ES,
	USER_ROLE_LABELS_ES,
} from "@cermont/shared-types";

/**
 * Order status labels — re-exported from FSM SSOT
 */
export const STATUS_LABELS: Record<string, string> = {
	...ORDER_STATUS_LABELS_ES,
};

/**
 * Order status Tailwind styles — keyed by English OrderStatus
 */
export const STATUS_STYLES: Record<string, string> = {
	open: "bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700",
	assigned:
		"bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:ring-blue-900",
	in_progress:
		"bg-cyan-50 text-cyan-700 ring-cyan-200 dark:bg-cyan-900/20 dark:text-cyan-400 dark:ring-cyan-900",
	on_hold:
		"bg-yellow-50 text-yellow-700 ring-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:ring-yellow-900",
	completed:
		"bg-green-50 text-green-700 ring-green-200 dark:bg-green-900/20 dark:text-green-400 dark:ring-green-900",
	closed:
		"bg-slate-100 text-slate-500 ring-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700",
	cancelled:
		"bg-red-50 text-red-700 ring-red-200 dark:bg-red-900/20 dark:text-red-400 dark:ring-red-900",
};

/**
 * Priority labels — keyed by English OrderPriority from shared-types
 */
export const PRIORITY_LABELS: Record<string, string> = {
	...ORDER_PRIORITY_LABELS_ES,
};

/**
 * Priority Tailwind styles — keyed by English OrderPriority
 */
export const PRIORITY_STYLES: Record<string, string> = {
	low: "bg-slate-100 text-slate-600 ring-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700",
	medium:
		"bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:ring-blue-900",
	high: "bg-orange-50 text-orange-700 ring-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:ring-orange-900",
	critical:
		"bg-red-50 text-red-700 ring-red-200 dark:bg-red-900/20 dark:text-red-400 dark:ring-red-900",
};

/**
 * Role labels — matches @cermont/shared-types/rbac roles.ts SSOT
 */
export const ROLE_LABELS: Record<string, string> = {
	...USER_ROLE_LABELS_ES,
};

// Re-export query configuration
export { CACHE_CONFIG, STALE_TIMES } from "./query-config";
