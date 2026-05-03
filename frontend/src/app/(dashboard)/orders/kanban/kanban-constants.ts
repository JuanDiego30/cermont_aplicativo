/**
 * Kanban Page — Constants
 * Uses English OrderStatus keys from shared-types SSOT
 */
import type { OrderStatus } from "@cermont/shared-types";

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

export type KanbanData = Record<string, KanbanOrder[]>;

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
	open: "bg-slate-50 border-slate-200 dark:border-slate-800 dark:bg-slate-800/50",
	assigned: "bg-blue-50/50 border-blue-100 dark:bg-blue-900/10 dark:border-blue-900/30",
	in_progress: "bg-indigo-50/50 border-indigo-100 dark:bg-indigo-900/10 dark:border-indigo-900/30",
	on_hold: "bg-yellow-50/50 border-yellow-100 dark:bg-yellow-900/10 dark:border-yellow-900/30",
	completed: "bg-green-50/50 border-green-100 dark:bg-green-900/10 dark:border-green-900/30",
};
