/**
 * Operational Steps — 14-step CERMONT business pipeline
 *
 * This is the Single Source of Truth for the operational step definitions.
 * Every step includes: number, key, label, entity, requirements, next actions.
 *
 * Import by:
 *   import { OPERATIONAL_STEPS, type OperationalStepKey } from '@cermont/domain';
 */

export type OperationalStepStatus =
	| "pending"
	| "available"
	| "in_progress"
	| "completed"
	| "blocked";

export interface OperationalStep {
	stepNumber: number;
	key: string;
	canonicalCode: string;
	label: string;
	entityName: string;
	requiresEvidence: boolean;
	requiresDocuments: boolean;
	preconditions: string[];
	nextActions: string[];
	allowedRoles: string[];
}

/**
 * All 14 operational steps of the CERMONT business pipeline.
 * Steps 1-4: Pre-contract (solicitud → PO)
 * Steps 5-7: Execution (planeación → evidencias)
 * Steps 8-10: Delivery (informe → acta → firma)
 * Steps 11-14: Closure (SES → factura → pago → cierre)
 */
export const OPERATIONAL_STEPS: readonly OperationalStep[] = [
	{
		stepNumber: 1,
		key: "work_request",
		canonicalCode: "STEP_01_WORK_REQUEST",
		label: "Solicitud del Cliente",
		entityName: "WorkRequest",
		requiresEvidence: false,
		requiresDocuments: true,
		preconditions: [],
		nextActions: ["site_visit", "proposal"],
		allowedRoles: ["gerente", "residente", "hes", "cliente"],
	},
	{
		stepNumber: 2,
		key: "site_visit",
		canonicalCode: "STEP_02_SITE_VISIT",
		label: "Visita Técnica",
		entityName: "SiteVisit",
		requiresEvidence: true,
		requiresDocuments: false,
		preconditions: ["work_request"],
		nextActions: ["proposal"],
		allowedRoles: ["gerente", "residente", "supervisor", "tecnico"],
	},
	{
		stepNumber: 3,
		key: "proposal",
		canonicalCode: "STEP_03_PROPOSAL",
		label: "Propuesta Económica",
		entityName: "Proposal",
		requiresEvidence: false,
		requiresDocuments: true,
		preconditions: ["site_visit", "work_request"],
		nextActions: ["purchase_order"],
		allowedRoles: ["gerente", "residente", "hes"],
	},
	{
		stepNumber: 4,
		key: "purchase_order",
		canonicalCode: "STEP_04_PURCHASE_ORDER",
		label: "Aprobación con PO",
		entityName: "PurchaseOrder",
		requiresEvidence: false,
		requiresDocuments: true,
		preconditions: ["proposal"],
		nextActions: ["planning"],
		allowedRoles: ["gerente", "residente", "cliente"],
	},
	{
		stepNumber: 5,
		key: "planning",
		canonicalCode: "STEP_05_PLANNING",
		label: "Planeación de Obra",
		entityName: "PlanningPacket",
		requiresEvidence: false,
		requiresDocuments: true,
		preconditions: ["purchase_order"],
		nextActions: ["execution"],
		allowedRoles: ["gerente", "residente", "supervisor"],
	},
	{
		stepNumber: 6,
		key: "execution",
		canonicalCode: "STEP_06_EXECUTION",
		label: "Ejecución en Campo",
		entityName: "ExecutionSession",
		requiresEvidence: true,
		requiresDocuments: false,
		preconditions: ["planning"],
		nextActions: ["technical_report"],
		allowedRoles: ["gerente", "residente", "supervisor", "operador", "tecnico"],
	},
	{
		stepNumber: 7,
		key: "technical_report",
		canonicalCode: "STEP_07_TECHNICAL_REPORT",
		label: "Informe Técnico",
		entityName: "TechnicalReport",
		requiresEvidence: false,
		requiresDocuments: true,
		preconditions: ["execution"],
		nextActions: ["delivery_record"],
		allowedRoles: ["gerente", "residente", "supervisor", "tecnico"],
	},
	{
		stepNumber: 8,
		key: "delivery_record",
		canonicalCode: "STEP_08_DELIVERY_RECORD",
		label: "Acta de Entrega",
		entityName: "DeliveryRecord",
		requiresEvidence: false,
		requiresDocuments: true,
		preconditions: ["technical_report"],
		nextActions: ["client_signature"],
		allowedRoles: ["gerente", "residente", "supervisor"],
	},
	{
		stepNumber: 9,
		key: "client_signature",
		canonicalCode: "STEP_09_CLIENT_SIGNATURE",
		label: "Firma del Cliente",
		entityName: "ClientSignature",
		requiresEvidence: true,
		requiresDocuments: false,
		preconditions: ["delivery_record"],
		nextActions: ["ses"],
		allowedRoles: ["gerente", "residente", "cliente"],
	},
	{
		stepNumber: 10,
		key: "ses",
		canonicalCode: "STEP_10_SES",
		label: "SES / Ariba",
		entityName: "ServiceEntrySheet",
		requiresEvidence: false,
		requiresDocuments: true,
		preconditions: ["client_signature"],
		nextActions: ["invoice"],
		allowedRoles: ["gerente", "residente", "administrativo"],
	},
	{
		stepNumber: 11,
		key: "invoice",
		canonicalCode: "STEP_11_INVOICE",
		label: "Factura",
		entityName: "Invoice",
		requiresEvidence: false,
		requiresDocuments: true,
		preconditions: ["ses"],
		nextActions: ["invoice_approval"],
		allowedRoles: ["gerente", "residente", "administrativo"],
	},
	{
		stepNumber: 12,
		key: "invoice_approval",
		canonicalCode: "STEP_12_INVOICE_APPROVAL",
		label: "Aprobación de Factura",
		entityName: "InvoiceApproval",
		requiresEvidence: false,
		requiresDocuments: true,
		preconditions: ["invoice"],
		nextActions: ["payment"],
		allowedRoles: ["gerente", "residente", "cliente"],
	},
	{
		stepNumber: 13,
		key: "payment",
		canonicalCode: "STEP_13_PAYMENT",
		label: "Pago",
		entityName: "Payment",
		requiresEvidence: false,
		requiresDocuments: true,
		preconditions: ["invoice_approval"],
		nextActions: ["closure"],
		allowedRoles: ["gerente", "residente", "administrativo"],
	},
	{
		stepNumber: 14,
		key: "closure",
		canonicalCode: "STEP_14_CLOSURE",
		label: "Cierre Administrativo",
		entityName: "ServiceCase",
		requiresEvidence: false,
		requiresDocuments: true,
		preconditions: ["payment"],
		nextActions: [],
		allowedRoles: ["gerente", "residente", "administrativo"],
	},
];

/** Canonical codes for all 14 steps */
export const CANONICAL_CODES: readonly string[] = OPERATIONAL_STEPS.map((s) => s.canonicalCode);

/** Step keys as a type for discriminated unions */
export type OperationalStepKey = (typeof OPERATIONAL_STEPS)[number]["key"];

/** Ordered list of step keys for iteration */
export const STEP_KEYS: readonly string[] = OPERATIONAL_STEPS.map((s) => s.key);

/** Map stepKey → OperationalStep for O(1) lookup */
export const STEP_BY_KEY: ReadonlyMap<string, OperationalStep> = new Map(
	OPERATIONAL_STEPS.map((s) => [s.key, s]),
);

/** Get a step by its key */
export function getStep(key: string): OperationalStep | undefined {
	return STEP_BY_KEY.get(key);
}

/** Get the next step after a given step key */
export function getNextStep(key: string): OperationalStep | undefined {
	const index = STEP_KEYS.indexOf(key);
	if (index === -1 || index >= OPERATIONAL_STEPS.length - 1) {
		return undefined;
	}
	return OPERATIONAL_STEPS[index + 1];
}

/** Check if a step key is valid */
export function isValidStepKey(key: string): boolean {
	return STEP_KEYS.includes(key);
}
