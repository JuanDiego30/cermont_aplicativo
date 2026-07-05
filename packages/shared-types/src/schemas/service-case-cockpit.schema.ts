import { z } from "zod";
import { ObjectIdSchema } from "./common.schema";

// ─────────────────────────────────────────────────────────────────────────
// ServiceCaseCockpit — Spec-015 lightweight cockpit contract
// Complements service-case-workflow.schema.ts with a flat, UI-oriented
// 14-step progress payload (Spec-012/013 SSOT enrichment).
// ─────────────────────────────────────────────────────────────────────────

export const StepStatusEnum = z.enum(["pending", "in_progress", "completed", "blocked", "skipped"]);
export type StepStatus = z.infer<typeof StepStatusEnum>;

/**
 * Canonical 14-step CERMONT flow (WorkRequest → PaymentRecord).
 * Mirrors CERMONT_OPERATIONAL_STEPS but as a flat step/label/moduleKey list
 * for cockpit progress rendering.
 */
export const CERMONT_14_STEPS = [
	{ step: 1, label: "Solicitud de servicio", moduleKey: "work-requests" },
	{ step: 2, label: "Visita técnica", moduleKey: "site-visits" },
	{ step: 3, label: "Propuesta económica", moduleKey: "proposals" },
	{ step: 4, label: "Aprobación / Orden de compra", moduleKey: "purchase-orders" },
	{ step: 5, label: "Planeación de recursos", moduleKey: "planning" },
	{ step: 6, label: "Ejecución en campo", moduleKey: "execution" },
	{ step: 7, label: "Informe técnico", moduleKey: "reports" },
	{ step: 8, label: "Acta de entrega", moduleKey: "delivery-records" },
	{ step: 9, label: "Firma del cliente", moduleKey: "delivery-records" },
	{ step: 10, label: "Radicación SES", moduleKey: "billing-ses" },
	{ step: 11, label: "Aprobación SES", moduleKey: "billing-ses" },
	{ step: 12, label: "Emisión / envío de factura", moduleKey: "billing-invoices" },
	{ step: 13, label: "Aprobación de factura", moduleKey: "billing-invoices" },
	{ step: 14, label: "Pago y cierre definitivo", moduleKey: "payments" },
] as const;

export const StepProgressSchema = z.object({
	step: z.number().int().min(1).max(14),
	label: z.string().min(1),
	moduleKey: z.string().min(1),
	status: StepStatusEnum,
	completedAt: z.string().datetime().optional(),
	completedBy: z.string().optional(),
	blockerReason: z.string().max(500).optional(),
	deepLink: z.string().optional(),
});
export type StepProgress = z.infer<typeof StepProgressSchema>;

export const NextExpectedActionSchema = z.object({
	stepNumber: z.number().int().min(1).max(14),
	description: z.string().min(1).max(500),
	assignedRoles: z.array(z.string()).default([]),
	dueDate: z.string().datetime().optional(),
	deepLink: z.string().optional(),
	urgency: z.enum(["low", "medium", "high", "critical"]).default("medium"),
});
export type NextExpectedAction = z.infer<typeof NextExpectedActionSchema>;

export const DocumentRequirementStatusSchema = z.object({
	documentType: z.string().min(1),
	label: z.string().min(1),
	step: z.number().int().min(1).max(14),
	status: z.enum(["pending", "uploaded", "approved", "rejected"]),
	fileAssetId: z.string().optional(),
	isRequired: z.boolean().default(true),
});
export type DocumentRequirementStatus = z.infer<typeof DocumentRequirementStatusSchema>;

export const AuditEventSummarySchema = z.object({
	event: z.string().min(1),
	entityType: z.string().min(1),
	actorName: z.string().optional(),
	occurredAt: z.string().datetime(),
});
export type AuditEventSummary = z.infer<typeof AuditEventSummarySchema>;

export const CockpitBlockerSchema = z.object({
	code: z.string().min(1),
	message: z.string().min(1).max(500),
	step: z.number().int().min(1).max(14).optional(),
	severity: z.enum(["warning", "blocking", "critical"]).default("blocking"),
});
export type CockpitBlocker = z.infer<typeof CockpitBlockerSchema>;

export const ServiceCaseCockpitSchema = z.object({
	serviceCaseId: ObjectIdSchema,
	serviceCaseCode: z.string().min(1),
	clientName: z.string().min(1),
	workDescription: z.string().max(2000).optional(),
	activityType: z.string().optional(),
	stepProgress: z.array(StepProgressSchema),
	currentStep: z.number().int().min(1).max(14),
	completedSteps: z.number().int().min(0).max(14),
	nextExpectedAction: NextExpectedActionSchema.optional(),
	blockers: z.array(CockpitBlockerSchema).default([]),
	documentRequirements: z.array(DocumentRequirementStatusSchema).default([]),
	riskLevel: z.enum(["low", "medium", "high", "critical"]).default("low"),
	slaDeadline: z.string().datetime().optional(),
	slaStatus: z.enum(["on_track", "at_risk", "overdue"]).optional(),
	lastAuditEvents: z.array(AuditEventSummarySchema).default([]),
	generatedAt: z.string().datetime(),
});
export type ServiceCaseCockpit = z.infer<typeof ServiceCaseCockpitSchema>;
