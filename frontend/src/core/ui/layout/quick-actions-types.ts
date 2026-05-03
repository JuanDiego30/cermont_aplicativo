/**
 * Module Quick Actions — Types and Constants
 */

export interface QuickActionOrderOption {
	id: string;
	number: string;
	client: string;
}

export type QuickActionMode = "document" | "evidence";

export const QUICK_ACTION_ORDERS_LIMIT = 20;

export interface QuickActionsOrdersResponse {
	data?: Record<string, Array<{ id: string; code: string; clientName: string | null }>>;
	error?: string;
}
