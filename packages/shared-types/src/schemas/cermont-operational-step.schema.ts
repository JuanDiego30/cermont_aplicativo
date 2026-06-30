import {
	CANONICAL_CODES,
	LEGACY_OPERATIONAL_STEP_CODES,
	normalizeOperationalStepCode,
	OPERATIONAL_STEPS,
	type OperationalStepKey,
} from "@cermont/domain";
import { z } from "zod";
import { UserRoleSchema } from "./user.schema";

/** Strict schema for values already using the canonical v2 code set. */
export const CanonicalCermontOperationalStepCodeSchema = z.enum(CANONICAL_CODES);

/**
 * Boundary schema. It accepts the persisted v1 aliases while returning only a
 * canonical v2 code, so old documents remain readable during online migration.
 */
export const CermontOperationalStepCodeSchema = z
	.union([CanonicalCermontOperationalStepCodeSchema, z.enum(LEGACY_OPERATIONAL_STEP_CODES)])
	.transform((input) => {
		const normalized = normalizeOperationalStepCode(input);
		if (normalized.status === "invalid") {
			throw new Error(`Unsupported operational step code: ${input}`);
		}
		return normalized.code;
	});

export type CermontOperationalStepCode = z.infer<typeof CermontOperationalStepCodeSchema>;
export type CanonicalCermontOperationalStepCode = z.infer<
	typeof CanonicalCermontOperationalStepCodeSchema
>;
export { normalizeOperationalStepCode as normalizeCermontOperationalStepCode };

export const CermontOperationalStepViewSchema = z.object({
	stepNumber: z.number().int().min(1).max(14),
	code: CanonicalCermontOperationalStepCodeSchema,
	label: z.string(),
	description: z.string(),
	phase: z.enum(["operational", "administrative"]),
	entityType: z.string(),
	relatedEntity: z.string(),
	route: z.string(),
	allowedRoles: z.array(UserRoleSchema),
	requiredDocuments: z.array(z.string()),
	requiredEvidences: z.array(z.string()),
	requiredSignatures: z.array(z.string()),
	requiredForms: z.array(z.string()),
	blocksTransition: z.boolean(),
	nextAction: z.string(),
});

export type CermontOperationalStepView = z.infer<typeof CermontOperationalStepViewSchema>;

interface OperationalStepViewMetadata {
	readonly description: string;
	readonly phase: "operational" | "administrative";
	readonly entityType: string;
	readonly relatedEntity: string;
	readonly route: string;
	readonly requiredDocuments: readonly string[];
	readonly requiredEvidences: readonly string[];
	readonly requiredSignatures: readonly string[];
	readonly requiredForms: readonly string[];
	readonly blocksTransition: boolean;
	readonly nextAction: string;
}

const STEP_VIEW_METADATA = {
	work_request: {
		description: "Registrar y validar la necesidad del cliente antes de iniciar la gestión.",
		phase: "operational",
		entityType: "workRequest",
		relatedEntity: "work_request",
		route: "/work-requests",
		requiredDocuments: ["work_request"],
		requiredEvidences: [],
		requiredSignatures: [],
		requiredForms: [],
		blocksTransition: true,
		nextAction: "Registrar o validar solicitud de servicio",
	},
	site_visit: {
		description: "Levantar condiciones reales de sitio y soportar técnicamente la solución.",
		phase: "operational",
		entityType: "siteVisit",
		relatedEntity: "site_visit",
		route: "/site-visits",
		requiredDocuments: ["site_visit_report"],
		requiredEvidences: ["before_photos"],
		requiredSignatures: [],
		requiredForms: [],
		blocksTransition: true,
		nextAction: "Registrar visita técnica e inspeccionar sitio",
	},
	proposal: {
		description: "Formalizar alcance, cantidades y condiciones comerciales para aprobación.",
		phase: "operational",
		entityType: "proposal",
		relatedEntity: "proposal",
		route: "/proposals",
		requiredDocuments: ["proposal_document"],
		requiredEvidences: [],
		requiredSignatures: [],
		requiredForms: [],
		blocksTransition: true,
		nextAction: "Elaborar propuesta comercial e indicar tarifas",
	},
	purchase_order: {
		description: "Asegurar la autorización contractual antes de comprometer recursos.",
		phase: "operational",
		entityType: "purchaseOrder",
		relatedEntity: "purchase_order",
		route: "/purchase-orders",
		requiredDocuments: ["purchase_order"],
		requiredEvidences: [],
		requiredSignatures: [],
		requiredForms: [],
		blocksTransition: true,
		nextAction: "Registrar la orden de compra aprobada",
	},
	planning: {
		description: "Asignar cuadrilla, herramientas, seguridad y cronograma para el servicio.",
		phase: "operational",
		entityType: "planningPacket",
		relatedEntity: "planning_packet",
		route: "/planning",
		requiredDocuments: ["planning_packet"],
		requiredEvidences: [],
		requiredSignatures: [],
		requiredForms: [],
		blocksTransition: true,
		nextAction: "Asignar cuadrilla, herramientas y cronograma",
	},
	execution: {
		description: "Registrar la ejecución real, consumos, incidentes y controles operativos.",
		phase: "operational",
		entityType: "executionSession",
		relatedEntity: "execution_session",
		route: "/execution",
		requiredDocuments: ["ast_document", "ptw_document"],
		requiredEvidences: [],
		requiredSignatures: ["firma_tecnico", "firma_supervisor"],
		requiredForms: ["execution_checklist", "execution_dynamic_form"],
		blocksTransition: true,
		nextAction: "Diligenciar controles y registrar la labor ejecutada",
	},
	evidence: {
		description: "Consolidar y validar las evidencias trazables de la ejecución en campo.",
		phase: "operational",
		entityType: "evidence",
		relatedEntity: "evidence",
		route: "/evidences",
		requiredDocuments: [],
		requiredEvidences: ["during_photos", "after_photos"],
		requiredSignatures: [],
		requiredForms: [],
		blocksTransition: true,
		nextAction: "Validar evidencia, ubicación, fecha y vínculo con la orden",
	},
	technical_report: {
		description: "Consolidar resultados técnicos y cierre operacional del trabajo ejecutado.",
		phase: "operational",
		entityType: "technicalReport",
		relatedEntity: "technical_report",
		route: "/reports",
		requiredDocuments: ["technical_report"],
		requiredEvidences: [],
		requiredSignatures: [],
		requiredForms: ["technical_report_form"],
		blocksTransition: true,
		nextAction: "Registrar informe técnico final",
	},
	delivery_record: {
		description: "Formalizar la entrega técnica y operativa del servicio.",
		phase: "administrative",
		entityType: "deliveryRecord",
		relatedEntity: "delivery_record",
		route: "/delivery-records",
		requiredDocuments: ["delivery_record"],
		requiredEvidences: [],
		requiredSignatures: [],
		requiredForms: [],
		blocksTransition: true,
		nextAction: "Generar acta de entrega física y técnica",
	},
	client_signature: {
		description: "Obtener aceptación expresa del cliente sobre la entrega realizada.",
		phase: "administrative",
		entityType: "clientSignature",
		relatedEntity: "delivery_record_signature",
		route: "/delivery-records",
		requiredDocuments: ["signed_delivery_record"],
		requiredEvidences: [],
		requiredSignatures: ["client_signature"],
		requiredForms: [],
		blocksTransition: true,
		nextAction: "Obtener firma del cliente en el acta",
	},
	ses: {
		description: "Radicar y confirmar la aprobación de la SES o soporte equivalente en Ariba.",
		phase: "administrative",
		entityType: "serviceEntrySheet",
		relatedEntity: "service_entry_sheet",
		route: "/billing/ses",
		requiredDocuments: ["ses_receipt", "ses_approval_document"],
		requiredEvidences: [],
		requiredSignatures: [],
		requiredForms: [],
		blocksTransition: true,
		nextAction: "Radicar y confirmar aprobación de SES / Ariba",
	},
	invoice: {
		description: "Emitir la factura y enviarla formalmente con sus soportes de cobro.",
		phase: "administrative",
		entityType: "invoice",
		relatedEntity: "invoice",
		route: "/billing/invoices",
		requiredDocuments: ["invoice_document"],
		requiredEvidences: [],
		requiredSignatures: [],
		requiredForms: [],
		blocksTransition: true,
		nextAction: "Emitir y enviar factura electrónica",
	},
	invoice_approval: {
		description: "Validar que la factura fue aceptada para entrar al ciclo de pago.",
		phase: "administrative",
		entityType: "invoiceApproval",
		relatedEntity: "invoice_approval",
		route: "/billing/invoices",
		requiredDocuments: ["invoice_approval_document"],
		requiredEvidences: [],
		requiredSignatures: [],
		requiredForms: [],
		blocksTransition: true,
		nextAction: "Verificar aprobación de la factura",
	},
	payment: {
		description: "Registrar pago y conciliación bancaria para completar el flujo.",
		phase: "administrative",
		entityType: "payment",
		relatedEntity: "payment",
		route: "/payments",
		requiredDocuments: ["payment_voucher"],
		requiredEvidences: ["bank_statement"],
		requiredSignatures: [],
		requiredForms: [],
		blocksTransition: true,
		nextAction: "Registrar y conciliar el pago",
	},
} as const satisfies Readonly<Record<OperationalStepKey, OperationalStepViewMetadata>>;

/** UI/API view derived from the domain's ordered identities. */
export const CERMONT_OPERATIONAL_STEPS: readonly CermontOperationalStepView[] =
	OPERATIONAL_STEPS.map((step) => {
		const metadata = STEP_VIEW_METADATA[step.key];
		return {
			stepNumber: step.stepNumber,
			code: step.canonicalCode,
			label: step.label,
			description: metadata.description,
			phase: metadata.phase,
			entityType: metadata.entityType,
			relatedEntity: metadata.relatedEntity,
			route: metadata.route,
			allowedRoles: [...step.allowedRoles],
			requiredDocuments: [...metadata.requiredDocuments],
			requiredEvidences: [...metadata.requiredEvidences],
			requiredSignatures: [...metadata.requiredSignatures],
			requiredForms: [...metadata.requiredForms],
			blocksTransition: metadata.blocksTransition,
			nextAction: metadata.nextAction,
		};
	});
