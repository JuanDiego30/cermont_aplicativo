/**
 * Operational Steps — canonical 14-step CERMONT business pipeline.
 *
 * This file owns the ordered identities of the workflow. Contracts, persistence
 * adapters and UI views must derive from this definition instead of maintaining
 * a second numbered sequence.
 */

export type OperationalStepStatus =
	| "pending"
	| "available"
	| "in_progress"
	| "completed"
	| "blocked";

export interface OperationalStep {
	readonly stepNumber: number;
	readonly key: string;
	readonly canonicalCode: string;
	readonly label: string;
	readonly entityName: string;
	readonly requiresEvidence: boolean;
	readonly requiresDocuments: boolean;
	readonly preconditions: readonly string[];
	readonly nextActions: readonly string[];
	readonly allowedRoles: readonly string[];
}

export const OPERATIONAL_STEPS = [
	{
		stepNumber: 1,
		key: "work_request",
		canonicalCode: "step_01_work_request",
		label: "Solicitud de servicio",
		entityName: "WorkRequest",
		requiresEvidence: false,
		requiresDocuments: true,
		preconditions: [],
		nextActions: ["site_visit"],
		allowedRoles: ["gerente", "residente", "administrativo", "cliente"],
	},
	{
		stepNumber: 2,
		key: "site_visit",
		canonicalCode: "step_02_site_visit",
		label: "Visita técnica",
		entityName: "SiteVisit",
		requiresEvidence: true,
		requiresDocuments: true,
		preconditions: ["work_request"],
		nextActions: ["proposal"],
		allowedRoles: ["gerente", "residente", "supervisor", "tecnico"],
	},
	{
		stepNumber: 3,
		key: "proposal",
		canonicalCode: "step_03_proposal",
		label: "Propuesta económica",
		entityName: "Proposal",
		requiresEvidence: false,
		requiresDocuments: true,
		preconditions: ["site_visit"],
		nextActions: ["purchase_order"],
		allowedRoles: ["gerente", "residente", "administrativo"],
	},
	{
		stepNumber: 4,
		key: "purchase_order",
		canonicalCode: "step_04_purchase_order",
		label: "Aprobación de orden de compra",
		entityName: "PurchaseOrder",
		requiresEvidence: false,
		requiresDocuments: true,
		preconditions: ["proposal"],
		nextActions: ["planning"],
		allowedRoles: ["gerente", "residente", "administrativo", "cliente"],
	},
	{
		stepNumber: 5,
		key: "planning",
		canonicalCode: "step_05_planning",
		label: "Planeación",
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
		canonicalCode: "step_06_execution",
		label: "Ejecución",
		entityName: "ExecutionSession",
		requiresEvidence: false,
		requiresDocuments: true,
		preconditions: ["planning"],
		nextActions: ["evidence"],
		allowedRoles: ["gerente", "residente", "supervisor", "operador", "tecnico"],
	},
	{
		stepNumber: 7,
		key: "evidence",
		canonicalCode: "step_07_evidence",
		label: "Evidencia",
		entityName: "Evidence",
		requiresEvidence: true,
		requiresDocuments: false,
		preconditions: ["execution"],
		nextActions: ["technical_report"],
		allowedRoles: ["gerente", "residente", "supervisor", "operador", "tecnico"],
	},
	{
		stepNumber: 8,
		key: "technical_report",
		canonicalCode: "step_08_technical_report",
		label: "Informe técnico",
		entityName: "TechnicalReport",
		requiresEvidence: false,
		requiresDocuments: true,
		preconditions: ["evidence"],
		nextActions: ["delivery_record"],
		allowedRoles: ["gerente", "residente", "supervisor", "tecnico"],
	},
	{
		stepNumber: 9,
		key: "delivery_record",
		canonicalCode: "step_09_delivery_record",
		label: "Acta de entrega",
		entityName: "DeliveryRecord",
		requiresEvidence: false,
		requiresDocuments: true,
		preconditions: ["technical_report"],
		nextActions: ["client_signature"],
		allowedRoles: ["gerente", "residente", "supervisor", "administrativo"],
	},
	{
		stepNumber: 10,
		key: "client_signature",
		canonicalCode: "step_10_client_signature",
		label: "Firma del cliente",
		entityName: "ClientSignature",
		requiresEvidence: true,
		requiresDocuments: true,
		preconditions: ["delivery_record"],
		nextActions: ["ses"],
		allowedRoles: ["gerente", "residente", "cliente"],
	},
	{
		stepNumber: 11,
		key: "ses",
		canonicalCode: "step_11_ses",
		label: "SES / Ariba",
		entityName: "ServiceEntrySheet",
		requiresEvidence: false,
		requiresDocuments: true,
		preconditions: ["client_signature"],
		nextActions: ["invoice"],
		allowedRoles: ["gerente", "residente", "administrativo"],
	},
	{
		stepNumber: 12,
		key: "invoice",
		canonicalCode: "step_12_invoice",
		label: "Factura",
		entityName: "Invoice",
		requiresEvidence: false,
		requiresDocuments: true,
		preconditions: ["ses"],
		nextActions: ["invoice_approval"],
		allowedRoles: ["gerente", "residente", "administrativo"],
	},
	{
		stepNumber: 13,
		key: "invoice_approval",
		canonicalCode: "step_13_invoice_approval",
		label: "Aprobación de factura",
		entityName: "InvoiceApproval",
		requiresEvidence: false,
		requiresDocuments: true,
		preconditions: ["invoice"],
		nextActions: ["payment"],
		allowedRoles: ["gerente", "residente", "administrativo", "cliente"],
	},
	{
		stepNumber: 14,
		key: "payment",
		canonicalCode: "step_14_payment",
		label: "Pago",
		entityName: "Payment",
		requiresEvidence: false,
		requiresDocuments: true,
		preconditions: ["invoice_approval"],
		nextActions: [],
		allowedRoles: ["gerente", "residente", "administrativo"],
	},
] as const satisfies readonly OperationalStep[];

export type OperationalStepKey = (typeof OPERATIONAL_STEPS)[number]["key"];
export type CanonicalOperationalStepCode = (typeof OPERATIONAL_STEPS)[number]["canonicalCode"];

/** Canonical persisted/API codes derived from the ordered step definition. */
export const CANONICAL_CODES = OPERATIONAL_STEPS.map((step) => step.canonicalCode) as [
	CanonicalOperationalStepCode,
	...CanonicalOperationalStepCode[],
];

export const LEGACY_OPERATIONAL_STEP_CODES = [
	"step_10_ses",
	"step_11_invoice",
	"step_12_invoice_approval",
	"step_13_payment",
	"step_14_closure",
	"step_07_technical_report",
	"step_08_delivery_record",
	"step_09_client_signature",
	"step_10_ses_submission",
	"step_11_ses_approval",
	"step_12_invoice_submission",
	"step_14_payment_closure",
	"STEP_01_WORK_REQUEST",
	"STEP_02_SITE_VISIT",
	"STEP_03_PROPOSAL",
	"STEP_04_PURCHASE_ORDER",
	"STEP_05_PLANNING",
	"STEP_06_EXECUTION",
	"STEP_07_TECHNICAL_REPORT",
	"STEP_08_DELIVERY_RECORD",
	"STEP_09_CLIENT_SIGNATURE",
	"STEP_10_SES",
	"STEP_11_INVOICE",
	"STEP_12_INVOICE_APPROVAL",
	"STEP_13_PAYMENT",
	"STEP_14_CLOSURE",
] as const;

export type LegacyOperationalStepCode = (typeof LEGACY_OPERATIONAL_STEP_CODES)[number];

const LEGACY_CODE_ALIASES: Readonly<
	Record<LegacyOperationalStepCode, CanonicalOperationalStepCode>
> = {
	step_10_ses: "step_11_ses",
	step_11_invoice: "step_12_invoice",
	step_12_invoice_approval: "step_13_invoice_approval",
	step_13_payment: "step_14_payment",
	step_14_closure: "step_14_payment",
	step_07_technical_report: "step_08_technical_report",
	step_08_delivery_record: "step_09_delivery_record",
	step_09_client_signature: "step_10_client_signature",
	step_10_ses_submission: "step_11_ses",
	step_11_ses_approval: "step_11_ses",
	step_12_invoice_submission: "step_12_invoice",
	step_14_payment_closure: "step_14_payment",
	STEP_01_WORK_REQUEST: "step_01_work_request",
	STEP_02_SITE_VISIT: "step_02_site_visit",
	STEP_03_PROPOSAL: "step_03_proposal",
	STEP_04_PURCHASE_ORDER: "step_04_purchase_order",
	STEP_05_PLANNING: "step_05_planning",
	STEP_06_EXECUTION: "step_06_execution",
	STEP_07_TECHNICAL_REPORT: "step_08_technical_report",
	STEP_08_DELIVERY_RECORD: "step_09_delivery_record",
	STEP_09_CLIENT_SIGNATURE: "step_10_client_signature",
	STEP_10_SES: "step_11_ses",
	STEP_11_INVOICE: "step_12_invoice",
	STEP_12_INVOICE_APPROVAL: "step_13_invoice_approval",
	STEP_13_PAYMENT: "step_14_payment",
	STEP_14_CLOSURE: "step_14_payment",
};

export type OperationalStepCodeNormalization =
	| { readonly status: "canonical"; readonly code: CanonicalOperationalStepCode }
	| {
			readonly status: "legacy_alias";
			readonly legacyCode: LegacyOperationalStepCode;
			readonly code: CanonicalOperationalStepCode;
	  }
	| { readonly status: "invalid"; readonly input: string };

const CANONICAL_CODE_SET: ReadonlySet<string> = new Set(CANONICAL_CODES);
const LEGACY_CODE_SET: ReadonlySet<string> = new Set(LEGACY_OPERATIONAL_STEP_CODES);

export function normalizeOperationalStepCode(input: string): OperationalStepCodeNormalization {
	if (CANONICAL_CODE_SET.has(input)) {
		return { status: "canonical", code: input as CanonicalOperationalStepCode };
	}
	if (LEGACY_CODE_SET.has(input)) {
		const legacyCode = input as LegacyOperationalStepCode;
		return { status: "legacy_alias", legacyCode, code: LEGACY_CODE_ALIASES[legacyCode] };
	}
	return { status: "invalid", input };
}

/** Historical codes that represent the same semantic step, for compatibility reads. */
export function getOperationalStepCodeAliases(
	canonicalCode: CanonicalOperationalStepCode,
): readonly LegacyOperationalStepCode[] {
	return LEGACY_OPERATIONAL_STEP_CODES.filter(
		(legacyCode) => LEGACY_CODE_ALIASES[legacyCode] === canonicalCode,
	);
}

/** Ordered list of step keys for iteration. */
export const STEP_KEYS: readonly OperationalStepKey[] = OPERATIONAL_STEPS.map((step) => step.key);

/** Map step key to its definition for constant-time lookup. */
export const STEP_BY_KEY: ReadonlyMap<OperationalStepKey, (typeof OPERATIONAL_STEPS)[number]> =
	new Map(OPERATIONAL_STEPS.map((step) => [step.key, step]));

export function getStep(key: string): OperationalStep | undefined {
	return STEP_BY_KEY.get(key as OperationalStepKey);
}

export function getNextStep(key: string): OperationalStep | undefined {
	const index = STEP_KEYS.indexOf(key as OperationalStepKey);
	if (index === -1 || index >= OPERATIONAL_STEPS.length - 1) {
		return undefined;
	}
	return OPERATIONAL_STEPS[index + 1];
}

export function isValidStepKey(key: string): key is OperationalStepKey {
	return STEP_KEYS.includes(key as OperationalStepKey);
}
