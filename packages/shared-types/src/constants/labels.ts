import type { UserRole } from "../rbac/roles";
import type { ChecklistItemCategory, ChecklistStatus } from "../schemas/checklist.schema";
import type { CostCategory, CostLineDeltaStatus } from "../schemas/cost.schema";
import type { EvidenceType } from "../schemas/evidence.schema";
import type { OrderPriority, OrderStatus, OrderType } from "../schemas/order.schema";
import type { OrderPipelineStage } from "../schemas/work-order-fsm";

export const ORDER_STATUS_LABELS_ES: Record<OrderStatus, string> = {
	open: "Abierta",
	proposal_sent: "Propuesta enviada",
	proposal_approved: "Propuesta aprobada",
	planning: "Planeación",
	assigned: "Asignada",
	in_progress: "En progreso",
	on_hold: "En pausa",
	report_pending: "Informe pendiente",
	completed: "Completada",
	ready_for_invoicing: "Lista para facturación",
	acta_signed: "Acta firmada",
	ses_sent: "SES enviada",
	invoice_approved: "Factura aprobada",
	paid: "Pagada",
	closed: "Cerrada",
	cancelled: "Cancelada",
};

export const ORDER_STATUS_PLURAL_LABELS_ES: Record<OrderStatus, string> = {
	open: "Abiertas",
	proposal_sent: "Propuestas enviadas",
	proposal_approved: "Propuestas aprobadas",
	planning: "Planeaciones",
	assigned: "Asignadas",
	in_progress: "En curso",
	on_hold: "En pausa",
	report_pending: "Informes pendientes",
	completed: "Completadas",
	ready_for_invoicing: "Listas para facturar",
	acta_signed: "Actas firmadas",
	ses_sent: "SES enviadas",
	invoice_approved: "Facturas aprobadas",
	paid: "Pagadas",
	closed: "Cerradas",
	cancelled: "Canceladas",
};

export const ORDER_PIPELINE_STAGE_LABELS_ES: Record<OrderPipelineStage, string> = {
	request_received: "Solicitud recibida",
	proposal_draft: "Propuesta en elaboración",
	proposal_sent: "Propuesta enviada",
	proposal_approved: "Propuesta aprobada",
	planning: "Planeación",
	assigned: "Asignación",
	in_progress: "Ejecución",
	report_pending: "Informe pendiente",
	report_generated: "Informe generado",
	acta_signed: "Acta firmada",
	ses_pending: "SES pendiente",
	ses_sent: "SES enviada",
	invoice_sent: "Factura enviada",
	invoice_approved: "Factura aprobada",
	paid: "Pagada",
};

export const ORDER_PRIORITY_LABELS_ES: Record<OrderPriority, string> = {
	low: "Baja",
	medium: "Media",
	high: "Alta",
	critical: "Crítica",
};

export const ORDER_TYPE_LABELS_ES: Record<OrderType, string> = {
	maintenance: "Mantenimiento",
	inspection: "Inspección",
	installation: "Instalación",
	repair: "Reparación",
	decommission: "Descomisionamiento",
};

export const COST_CATEGORY_LABELS_ES: Record<CostCategory, string> = {
	labor: "Mano de obra",
	materials: "Materiales",
	equipment: "Equipos",
	transport: "Transporte",
	subcontract: "Subcontratos",
	overhead: "Gastos generales",
	other: "Otros",
};

export const COST_LINE_DELTA_STATUS_LABELS_ES: Record<CostLineDeltaStatus, string> = {
	under_budget: "Bajo presupuesto",
	on_budget: "En presupuesto",
	over_budget: "Sobre presupuesto",
	critical: "Crítico",
};

export const EVIDENCE_TYPE_LABELS_ES: Record<EvidenceType, string> = {
	before: "Antes",
	during: "Durante",
	after: "Después",
	defect: "Defecto",
	safety: "Seguridad",
	signature: "Firma",
};

export const CHECKLIST_ITEM_CATEGORY_LABELS_ES: Record<ChecklistItemCategory, string> = {
	tool: "Herramientas",
	equipment: "Equipos",
	ppe: "EPP",
	procedure: "Procedimiento",
};

export const CHECKLIST_STATUS_LABELS_ES: Record<ChecklistStatus, string> = {
	pending: "Pendiente",
	in_progress: "En progreso",
	completed: "Completado",
	cancelled: "Cancelado",
};

export const USER_ROLE_LABELS_ES: Record<UserRole, string> = {
	manager: "Gerente",
	resident_engineer: "Ing. Residente",
	hse_coordinator: "Coordinador HES",
	supervisor: "Supervisor",
	operator: "Operador",
	technician: "Técnico",
	administrator: "Administrativo",
	client: "Cliente",
};
