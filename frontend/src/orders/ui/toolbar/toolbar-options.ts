import type { OrderPriority, OrderStatus, OrderType } from "@cermont/shared-types";

export const ORDER_STATUS_OPTIONS: Array<{ value: OrderStatus; label: string }> = [
	{ value: "open", label: "Abierta" },
	{ value: "assigned", label: "Asignada" },
	{ value: "in_progress", label: "En curso" },
	{ value: "on_hold", label: "En pausa" },
	{ value: "completed", label: "Completada" },
	{ value: "ready_for_invoicing", label: "Lista facturación" },
	{ value: "closed", label: "Cerrada" },
	{ value: "cancelled", label: "Cancelada" },
];

export const ORDER_PRIORITY_OPTIONS: Array<{ value: OrderPriority; label: string }> = [
	{ value: "low", label: "Baja" },
	{ value: "medium", label: "Media" },
	{ value: "high", label: "Alta" },
	{ value: "critical", label: "Crítica" },
];

export const ORDER_TYPE_OPTIONS: Array<{ value: OrderType; label: string }> = [
	{ value: "maintenance", label: "Mantenimiento" },
	{ value: "inspection", label: "Inspección" },
	{ value: "installation", label: "Instalación" },
	{ value: "repair", label: "Reparación" },
	{ value: "decommission", label: "Descomisión" },
];

export const GROUP_BY_OPTIONS = [
	{ value: "status", label: "Estado" },
	{ value: "priority", label: "Prioridad" },
	{ value: "technician", label: "Técnico" },
	{ value: "client", label: "Cliente" },
] as const;

export type OrdersGroupByValue = (typeof GROUP_BY_OPTIONS)[number]["value"];
