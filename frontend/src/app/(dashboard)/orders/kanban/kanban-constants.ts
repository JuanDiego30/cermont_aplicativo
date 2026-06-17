/**
 * Kanban Page — Constants
 * Uses English OrderStatus keys from shared-types SSOT
 */
import { MAX_PAGE_LIMIT, type OrderStatus } from "@cermont/shared-types";

export interface KanbanOrder {
	id: string;
	code: string;
	description: string;
	status: OrderStatus;
	priority: string;
	assignedToName: string | null;
	startedAt: string | null;
	completedAt: string | null;
}

export type KanbanBoard = Record<string, KanbanOrder[]>;

export const KANBAN_ORDER_QUERY_LIMIT = MAX_PAGE_LIMIT;

export const VISIBLE_COLUMNS: OrderStatus[] = [
	"open",
	"assigned",
	"in_progress",
	"on_hold",
	"completed",
];

export const COLUMN_LABELS: Record<string, string> = {
	open: "Abierta",
	assigned: "Asignada",
	in_progress: "En Progreso",
	on_hold: "En Pausa",
	completed: "Completada",
};

export const COLUMN_COLORS: Record<string, string> = {
	open: "bg-surface border-hairline dark:border-slate-800 dark:bg-surface/50",
	assigned: "bg-info-bg/50 border-blue-100 dark:bg-blue-900/10 dark:border-blue-900/30",
	in_progress: "bg-indigo-50/50 border-indigo-100 dark:bg-indigo-900/10 dark:border-indigo-900/30",
	on_hold: "bg-warning-bg/50 border-yellow-100 dark:bg-yellow-900/10 dark:border-yellow-900/30",
	completed: "bg-success-bg/50 border-green-100 dark:bg-green-900/10 dark:border-green-900/30",
};
