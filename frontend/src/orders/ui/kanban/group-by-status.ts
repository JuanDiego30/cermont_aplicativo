import type { OrderStatus } from "@cermont/shared-types";
import type { GroupByStrategy } from "./types";

// Extended status labels to support FSM states
const EXTENDED_STATUS_LABELS: Record<string, string> = {
	open: "Abiertas",
	proposal_sent: "Propuesta enviada",
	proposal_approved: "Propuesta aprobada",
	planning: "En planeación",
	assigned: "Asignadas",
	in_progress: "En curso",
	on_hold: "En pausa",
	report_pending: "Informe pendiente",
	completed: "Completadas",
	ready_for_invoicing: "Listas para facturar",
	acta_signed: "Acta firmada",
	ses_sent: "SES enviada",
	invoice_approved: "Factura aprobada",
	paid: "Pagada",
	closed: "Cerradas",
	cancelled: "Canceladas",
};

export const STATUS_LABELS: Record<OrderStatus, string> = EXTENDED_STATUS_LABELS as Record<
	OrderStatus,
	string
>;

export const STATUS_COLUMNS: OrderStatus[] = [
	"open",
	"proposal_sent",
	"proposal_approved",
	"planning",
	"assigned",
	"in_progress",
	"on_hold",
	"report_pending",
	"completed",
	"ready_for_invoicing",
	"acta_signed",
	"ses_sent",
	"invoice_approved",
	"paid",
	"closed",
	"cancelled",
];

export const groupByStatus: GroupByStrategy = {
	key: "status",
	label: "Estado",
	groups: (items) => {
		const map = new Map<string, typeof items>();
		for (const status of STATUS_COLUMNS) {
			map.set(status, []);
		}
		for (const item of items) {
			map.get(item.status)?.push(item);
		}
		return map;
	},
	groupLabel: (key) => STATUS_LABELS[key as OrderStatus] ?? key,
	columnOrder: STATUS_COLUMNS,
	allowDragDrop: true,
};
