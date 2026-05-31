/**
 * Seed P0 Demo Cases — 10 CERMONT Service Cases at different operational stages
 *
 * Usage: npx tsx backend/scripts/seed-p0-cases.ts
 *
 * Creates representative ServiceCase documents covering:
 *   A. intake            — New work request, no proposal yet
 *   B. assessment        — Site visit completed
 *   C. proposal          — Proposal sent, awaiting approval
 *   D. planning          — Planning blocked by missing AST/PTW
 *   E. in_execution      — Execution started, blocked by missing evidences
 *   F. technical_closure — Report pending approval
 *   G. administrative_closure — Delivery record signed, ready for SES
 *   H. ses_pending       — SES approved, ready for invoice
 *   I. billing_pending   — Invoice approved, ready for payment
 *   J. paid              — Payment reconciled, case closed
 *
 * Idempotent: checks existence by code before creating.
 */

import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI ?? "mongodb://127.0.0.1:27017/cermont";

// ── Helpers ─────────────────────────────────────────────────────────

const NOW = new Date();
function oid(id: string) {
	return new mongoose.Types.ObjectId(id);
}
function art(id: string, code: string, status: string) {
	return { id: oid(id), code, status, updatedAt: NOW };
}
function tle(stage: string, command: string, actorId: string, role: string) {
	return {
		eventId: `${stage}_${command}_${Date.now()}`.slice(0, 80),
		stage,
		command,
		actorId: oid(actorId),
		actorRole: role,
		occurredAt: NOW,
	};
}
function coalesceNumber(...values: (number | undefined | null)[]): number {
	for (const v of values) {
		if (typeof v === "number") { return v; }
	}
	return 0;
}

type SeedArtifact = ReturnType<typeof art>;
type SeedBlocker = {
	code: string;
	severity: "blocking" | "warning";
	message: string;
	ownerRole: string;
	recommendedAction: string;
	artifactType: string;
	stepCode: string;
	field: string;
};
type SeedFinancialSummary = Record<string, number | string>;
type SeedCaseRecord = {
	code: string;
	clientName: string;
	currentStage: string;
	currentStepCode: string;
	artifacts: Record<string, SeedArtifact>;
	financialSummary: SeedFinancialSummary;
	blockers?: SeedBlocker[];
};

const STEP_LABELS: Record<string, string> = {
	step_01_work_request: "Solicitud formal",
	step_02_site_visit: "Visita técnica",
	step_03_proposal: "Propuesta económica",
	step_04_purchase_order: "Aprobación con PO",
	step_05_planning: "Planeación",
	step_06_execution: "Ejecución",
	step_07_technical_report: "Informe técnico",
	step_08_delivery_record: "Acta de entrega",
	step_09_client_signature: "Firma / recibo del cliente",
	step_10_ses_submission: "SES / Ariba",
	step_11_ses_approval: "Aprobación SES",
	step_12_invoice_submission: "Factura",
	step_13_invoice_approval: "Aprobación factura",
	step_14_payment_closure: "Pago y cierre definitivo",
};

const NEXT_ACTIONS: Record<string, { command: string; label: string; requiredRole: string; route: string }> = {
	step_01_work_request: {
		command: "validate_work_request",
		label: "Validar solicitud formal",
		requiredRole: "residente",
		route: "/work-requests",
	},
	step_02_site_visit: {
		command: "complete_site_visit",
		label: "Completar visita técnica",
		requiredRole: "supervisor",
		route: "/site-visits",
	},
	step_03_proposal: {
		command: "send_proposal",
		label: "Enviar propuesta económica",
		requiredRole: "residente",
		route: "/proposals",
	},
	step_04_purchase_order: {
		command: "register_purchase_order",
		label: "Registrar PO aprobada",
		requiredRole: "administrativo",
		route: "/purchase-orders",
	},
	step_05_planning: {
		command: "approve_planning",
		label: "Cerrar readiness de planeación",
		requiredRole: "gerente",
		route: "/planning",
	},
	step_06_execution: {
		command: "organize_evidence",
		label: "Registrar evidencias before/during/after",
		requiredRole: "tecnico",
		route: "/evidences",
	},
	step_07_technical_report: {
		command: "generate_report",
		label: "Generar informe técnico",
		requiredRole: "residente",
		route: "/reports",
	},
	step_08_delivery_record: {
		command: "generate_delivery_record",
		label: "Generar acta de entrega",
		requiredRole: "residente",
		route: "/delivery-records",
	},
	step_09_client_signature: {
		command: "capture_client_signature",
		label: "Capturar firma del cliente",
		requiredRole: "residente",
		route: "/delivery-records",
	},
	step_10_ses_submission: {
		command: "submit_ses",
		label: "Radicar SES / Ariba",
		requiredRole: "administrativo",
		route: "/billing/ses",
	},
	step_11_ses_approval: {
		command: "validate_ses_approval",
		label: "Validar aprobación SES",
		requiredRole: "administrativo",
		route: "/billing/ses",
	},
	step_12_invoice_submission: {
		command: "issue_invoice",
		label: "Emitir factura",
		requiredRole: "administrativo",
		route: "/billing/invoices",
	},
	step_13_invoice_approval: {
		command: "validate_invoice_approval",
		label: "Validar aprobación de factura",
		requiredRole: "administrativo",
		route: "/billing/invoices",
	},
	step_14_payment_closure: {
		command: "register_payment",
		label: "Registrar pago y cierre",
		requiredRole: "administrativo",
		route: "/payments",
	},
};

function stepNumberFromCode(stepCode: string): number {
	const match = /^step_(\d{2})_/.exec(stepCode);
	return match ? Number(match[1]) : 1;
}

function buildNextActions(stepCode: string, blockers: SeedBlocker[]) {
	if (blockers.length > 0) {
		return blockers.slice(0, 3).map((blocker) => ({
			command: blocker.code.toLowerCase(),
			label: blocker.recommendedAction,
			requiredRole: blocker.ownerRole,
			route: NEXT_ACTIONS[stepCode]?.route ?? "/service-cases",
		}));
	}

	const action = NEXT_ACTIONS[stepCode] ?? NEXT_ACTIONS.step_01_work_request;
	return [action];
}

function buildCurrentStepRequirements(stepCode: string, blockers: SeedBlocker[]) {
	return blockers.map((blocker) => ({
		id: `${stepCode}:${blocker.field}`,
		stepCode,
		type: blocker.artifactType === "Evidence" ? "evidence" : "document",
		label: blocker.field,
		required: true,
		blocksTransition: blocker.severity === "blocking",
		blockerCode: blocker.code,
		status: blocker.severity === "blocking" ? "missing" : "warning",
		field: blocker.field,
		blockerMessage: blocker.message,
		recommendedAction: blocker.recommendedAction,
		ownerRole: blocker.ownerRole,
	}));
}

function buildStepsChecklist(stepCode: string, blockers: SeedBlocker[]) {
	const currentStepNumber = stepNumberFromCode(stepCode);
	const hasBlocking = blockers.some((blocker) => blocker.severity === "blocking");

	return Object.entries(STEP_LABELS).map(([code, label]) => {
		const stepNumber = stepNumberFromCode(code);
		const status =
			stepNumber < currentStepNumber
				? "completed"
				: stepNumber === currentStepNumber
					? hasBlocking
						? "blocked"
						: "active"
					: "pending";

		return {
			stepNumber,
			code,
			label,
			status,
			blockers: code === stepCode ? blockers : [],
			requirements: code === stepCode ? buildCurrentStepRequirements(stepCode, blockers) : [],
			canAdvanceFromHere: code === stepCode && !hasBlocking,
		};
	});
}

function buildFinancialSummary(summary: SeedFinancialSummary): SeedFinancialSummary {
	const hasBusinessAmounts = Object.keys(summary).length > 0;
	return {
		status: hasBusinessAmounts ? "complete" : "pending_data",
		...summary,
	};
}

function buildOperationalSummary(seedCase: SeedCaseRecord, blockers: SeedBlocker[]) {
	const criticalBlockersCount = blockers.filter((blocker) => blocker.severity === "blocking").length;
	const currentStepNumber = stepNumberFromCode(seedCase.currentStepCode);

	return {
		blockersCount: blockers.length,
		criticalBlockersCount,
		evidenceCount: seedCase.artifacts.executionSession ? Math.max(currentStepNumber - 4, 0) * 3 : 0,
		currentOwnerRole: NEXT_ACTIONS[seedCase.currentStepCode]?.requiredRole ?? "residente",
		planningStatus: seedCase.artifacts.planningPacket?.status ?? "pending",
		executionStatus: seedCase.artifacts.executionSession?.status ?? "pending",
		reportStatus: seedCase.artifacts.technicalReport?.status ?? "pending",
		deliveryRecordStatus: seedCase.artifacts.deliveryRecord?.status ?? "pending",
		offlineSyncStatus: "synced",
		totalLaborHours: seedCase.artifacts.executionSession ? Math.max(currentStepNumber - 5, 1) * 8 : 0,
		totalMaterialLines: seedCase.artifacts.executionSession ? Math.max(currentStepNumber - 5, 1) : 0,
	};
}

// ── Case definitions ────────────────────────────────────────────────

const CASES: SeedCaseRecord[] = [
	{
		code: "SC-A-INTAKE",
		clientName: "Ecopetrol S.A. — Planta Barranca",
		currentStage: "intake" as const,
		currentStepCode: "step_01_work_request" as const,
		artifacts: {
			workRequest: art("a00000000000000000000001", "WR-2026-001", "received"),
		},
		financialSummary: {},
	},
	{
		code: "SC-B-ASSESS",
		clientName: "Cenit Transporte — Oleoducto Central",
		currentStage: "assessment" as const,
		currentStepCode: "step_02_site_visit" as const,
		artifacts: {
			workRequest: art("a00000000000000000000002", "WR-2026-002", "received"),
			siteVisit: art("a00000000000000000000003", "SV-2026-001", "completed"),
		},
		financialSummary: {},
	},
	{
		code: "SC-C-PROPOSAL",
		clientName: "Oleoducto Bicentenario",
		currentStage: "proposal" as const,
		currentStepCode: "step_03_proposal" as const,
		artifacts: {
			workRequest: art("a00000000000000000000004", "WR-2026-003", "received"),
			siteVisit: art("a00000000000000000000005", "SV-2026-002", "completed"),
			proposal: art("a00000000000000000000006", "PROP-2026-001", "sent"),
		},
		financialSummary: { proposalAmount: 85_000_000 },
	},
	{
		code: "SC-D-PLANNING",
		clientName: "Refinería de Cartagena — Unidad FCC",
		currentStage: "planning" as const,
		currentStepCode: "step_05_planning" as const,
		artifacts: {
			workRequest: art("a00000000000000000000007", "WR-2026-004", "received"),
			siteVisit: art("a00000000000000000000008", "SV-2026-003", "completed"),
			proposal: art("a00000000000000000000009", "PROP-2026-002", "approved"),
			purchaseOrder: art("a00000000000000000000010", "PO-2026-001", "approved"),
			workOrder: art("a00000000000000000000011", "OT-2026-001", "open"),
		},
		financialSummary: { proposalAmount: 120_000_000 },
		blockers: [
			{
				code: "MISSING_AST",
				severity: "blocking",
				message: "Análisis de Seguridad en el Trabajo requerido antes de iniciar",
				ownerRole: "hes",
				recommendedAction: "Completar documento AST para la actividad de mantenimiento",
				artifactType: "PlanningPacket",
				stepCode: "step_05_planning",
				field: "astDocumentId",
			},
			{
				code: "MISSING_PTW",
				severity: "blocking",
				message: "Permiso de Trabajo no registrado",
				ownerRole: "supervisor",
				recommendedAction: "Gestionar PTW con el cliente para la zona de ejecución",
				artifactType: "PlanningPacket",
				stepCode: "step_05_planning",
				field: "ptwDocumentId",
			},
		],
	},
	{
		code: "SC-E-EXECUTION",
		clientName: "Cerrejón — Planta Trituración",
		currentStage: "in_execution" as const,
		currentStepCode: "step_06_execution" as const,
		artifacts: {
			workRequest: art("a00000000000000000000012", "WR-2026-005", "received"),
			siteVisit: art("a00000000000000000000013", "SV-2026-004", "completed"),
			proposal: art("a00000000000000000000014", "PROP-2026-003", "approved"),
			purchaseOrder: art("a00000000000000000000015", "PO-2026-002", "approved"),
			workOrder: art("a00000000000000000000016", "OT-2026-002", "in_progress"),
			planningPacket: art("a00000000000000000000017", "PLAN-2026-001", "approved"),
			executionSession: art("a00000000000000000000018", "EXEC-2026-001", "started"),
		},
		financialSummary: { proposalAmount: 250_000_000, actualCost: 95_000_000 },
		blockers: [
			{
				code: "MISSING_BEFORE_PHOTO",
				severity: "blocking",
				message: "Fotos de antes requeridas para ejecución",
				ownerRole: "tecnico",
				recommendedAction: "Subir fotografías del área de trabajo antes de la intervención",
				artifactType: "Evidence",
				stepCode: "step_06_execution",
				field: "beforePhotoUrls",
			},
			{
				code: "MISSING_MATERIALS_USED",
				severity: "warning",
				message: "Registro de materiales utilizados pendiente",
				ownerRole: "supervisor",
				recommendedAction: "Actualizar lista de materiales en el panel de ejecución",
				artifactType: "Cost",
				stepCode: "step_06_execution",
				field: "materialsUsed",
			},
		],
	},
	{
		code: "SC-F-TECH-CLOSURE",
		clientName: "Drummond — Puerto Ciénaga",
		currentStage: "technical_closure" as const,
		currentStepCode: "step_07_technical_report" as const,
		artifacts: {
			workRequest: art("a00000000000000000000019", "WR-2026-006", "received"),
			siteVisit: art("a00000000000000000000020", "SV-2026-005", "completed"),
			proposal: art("a00000000000000000000021", "PROP-2026-004", "approved"),
			purchaseOrder: art("a00000000000000000000022", "PO-2026-003", "approved"),
			workOrder: art("a00000000000000000000023", "OT-2026-003", "in_progress"),
			planningPacket: art("a00000000000000000000024", "PLAN-2026-002", "approved"),
			executionSession: art("a00000000000000000000025", "EXEC-2026-002", "completed"),
			technicalReport: art("a00000000000000000000026", "TR-2026-001", "draft"),
		},
		financialSummary: { proposalAmount: 180_000_000, actualCost: 162_000_000 },
	},
	{
		code: "SC-G-ADMIN-CLOSURE",
		clientName: "Promigas — Estación Compresora",
		currentStage: "administrative_closure" as const,
		currentStepCode: "step_08_delivery_record" as const,
		artifacts: {
			workRequest: art("a00000000000000000000027", "WR-2026-007", "received"),
			siteVisit: art("a00000000000000000000028", "SV-2026-006", "completed"),
			proposal: art("a00000000000000000000029", "PROP-2026-005", "approved"),
			purchaseOrder: art("a00000000000000000000030", "PO-2026-004", "approved"),
			workOrder: art("a00000000000000000000031", "OT-2026-004", "completed"),
			planningPacket: art("a00000000000000000000032", "PLAN-2026-003", "approved"),
			executionSession: art("a00000000000000000000033", "EXEC-2026-003", "completed"),
			technicalReport: art("a00000000000000000000034", "TR-2026-002", "approved"),
			deliveryRecord: art("a00000000000000000000035", "DR-2026-001", "signed"),
		},
		financialSummary: { proposalAmount: 310_000_000, actualCost: 298_000_000 },
	},
	{
		code: "SC-H-SES-PENDING",
		clientName: "ISA Intercolombia — Subestación Primavera",
		currentStage: "ses_pending" as const,
		currentStepCode: "step_10_ses_submission" as const,
		artifacts: {
			workRequest: art("a00000000000000000000036", "WR-2026-008", "received"),
			siteVisit: art("a00000000000000000000037", "SV-2026-007", "completed"),
			proposal: art("a00000000000000000000038", "PROP-2026-006", "approved"),
			purchaseOrder: art("a00000000000000000000039", "PO-2026-005", "approved"),
			workOrder: art("a00000000000000000000040", "OT-2026-005", "completed"),
			planningPacket: art("a00000000000000000000041", "PLAN-2026-004", "approved"),
			executionSession: art("a00000000000000000000042", "EXEC-2026-004", "completed"),
			technicalReport: art("a00000000000000000000043", "TR-2026-003", "approved"),
			deliveryRecord: art("a00000000000000000000044", "DR-2026-002", "signed"),
			serviceEntrySheet: art("a00000000000000000000045", "SES-2026-001", "approved"),
		},
		financialSummary: {
			proposalAmount: 450_000_000,
			actualCost: 420_000_000,
			sesTotal: 445_000_000,
		},
	},
	{
		code: "SC-I-BILLING",
		clientName: "EPM — Planta La Tasajera",
		currentStage: "billing_pending" as const,
		currentStepCode: "step_13_invoice_approval" as const,
		artifacts: {
			workRequest: art("a00000000000000000000046", "WR-2026-009", "received"),
			siteVisit: art("a00000000000000000000047", "SV-2026-008", "completed"),
			proposal: art("a00000000000000000000048", "PROP-2026-007", "approved"),
			purchaseOrder: art("a00000000000000000000049", "PO-2026-006", "approved"),
			workOrder: art("a00000000000000000000050", "OT-2026-006", "completed"),
			planningPacket: art("a00000000000000000000051", "PLAN-2026-005", "approved"),
			executionSession: art("a00000000000000000000052", "EXEC-2026-005", "completed"),
			technicalReport: art("a00000000000000000000053", "TR-2026-004", "approved"),
			deliveryRecord: art("a00000000000000000000054", "DR-2026-003", "signed"),
			serviceEntrySheet: art("a00000000000000000000055", "SES-2026-002", "approved"),
			invoice: art("a00000000000000000000056", "INV-2026-001", "approved"),
		},
		financialSummary: {
			proposalAmount: 600_000_000,
			actualCost: 575_000_000,
			sesTotal: 590_000_000,
			invoicedAmount: 588_000_000,
		},
	},
	{
		code: "SC-J-PAID",
		clientName: "Surtigas — Red de Distribución",
		currentStage: "paid" as const,
		currentStepCode: "step_14_payment_closure" as const,
		artifacts: {
			workRequest: art("a00000000000000000000057", "WR-2026-010", "received"),
			siteVisit: art("a00000000000000000000058", "SV-2026-009", "completed"),
			proposal: art("a00000000000000000000059", "PROP-2026-008", "approved"),
			purchaseOrder: art("a00000000000000000000060", "PO-2026-007", "approved"),
			workOrder: art("a00000000000000000000061", "OT-2026-007", "completed"),
			planningPacket: art("a00000000000000000000062", "PLAN-2026-006", "approved"),
			executionSession: art("a00000000000000000000063", "EXEC-2026-006", "completed"),
			technicalReport: art("a00000000000000000000064", "TR-2026-005", "approved"),
			deliveryRecord: art("a00000000000000000000065", "DR-2026-004", "signed"),
			serviceEntrySheet: art("a00000000000000000000066", "SES-2026-003", "approved"),
			invoice: art("a00000000000000000000067", "INV-2026-002", "approved"),
			payment: art("a00000000000000000000068", "PAY-2026-001", "recorded"),
		},
		financialSummary: {
			proposalAmount: 200_000_000,
			actualCost: 188_000_000,
			sesTotal: 195_000_000,
			invoicedAmount: 192_000_000,
			paidAmount: 192_000_000,
		},
	},
	{
		code: "SC-K-CLOSED",
		clientName: "Termoeléctrica Termocandelaria",
		currentStage: "closed" as const,
		currentStepCode: "step_14_payment_closure" as const,
		artifacts: {
			workRequest: art("a00000000000000000000069", "WR-2026-011", "received"),
			siteVisit: art("a00000000000000000000070", "SV-2026-010", "completed"),
			proposal: art("a00000000000000000000071", "PROP-2026-009", "approved"),
			purchaseOrder: art("a00000000000000000000072", "PO-2026-008", "approved"),
			workOrder: art("a00000000000000000000073", "OT-2026-008", "completed"),
			planningPacket: art("a00000000000000000000074", "PLAN-2026-007", "approved"),
			executionSession: art("a00000000000000000000075", "EXEC-2026-007", "completed"),
			technicalReport: art("a00000000000000000000076", "TR-2026-006", "approved"),
			deliveryRecord: art("a00000000000000000000077", "DR-2026-005", "signed"),
			serviceEntrySheet: art("a00000000000000000000078", "SES-2026-004", "approved"),
			invoice: art("a00000000000000000000079", "INV-2026-003", "approved"),
			payment: art("a00000000000000000000080", "PAY-2026-002", "recorded"),
		},
		financialSummary: {
			proposalAmount: 550_000_000,
			actualCost: 510_000_000,
			sesTotal: 540_000_000,
			invoicedAmount: 535_000_000,
			paidAmount: 535_000_000,
		},
	},
	{
		code: "SC-L-CANCELLED",
		clientName: "Minera de Cobre — Proyecto Norte",
		currentStage: "cancelled" as const,
		currentStepCode: "step_05_planning" as const,
		artifacts: {
			workRequest: art("a00000000000000000000081", "WR-2026-012", "received"),
			siteVisit: art("a00000000000000000000082", "SV-2026-011", "completed"),
			proposal: art("a00000000000000000000083", "PROP-2026-010", "approved"),
			purchaseOrder: art("a00000000000000000000084", "PO-2026-009", "approved"),
			workOrder: art("a00000000000000000000085", "OT-2026-009", "cancelled"),
		},
		financialSummary: {
			proposalAmount: 780_000_000,
			actualCost: 0,
		},
	},
];

// ── Multi-Collection Materialization ────────────────────────────────

/**
 * Ensure a document exists by code. Creates it if missing.
 * Returns the document _id (as string) regardless of create-or-skip.
 */
async function ensureDocument(
	db: mongoose.mongo.Db,
	collectionName: string,
	code: string,
	doc: Record<string, unknown>,
): Promise<string | undefined> {
	const collection = db.collection(collectionName);
	const existing = await collection.findOne({ code });
	if (existing) {
		console.log(`  [skip] ${collectionName} ${code} — already exists`);
		return existing._id.toString();
	}
	const result = await collection.insertOne({
		...doc,
		createdAt: NOW,
		updatedAt: NOW,
	});
	console.log(`  [create] ${collectionName} ${code} — ${result.insertedId}`);
	return result.insertedId.toString();
}

const ADMIN_USER = "a00000000000000000000000001" as const;
const RESIDENT_USER = "a00000000000000000000000002" as const;
const SUPERVISOR_USER = "a00000000000000000000000003" as const;
const TECNICO_USER = "a00000000000000000000000004" as const;
const ADMINISTRATIVO_USER = "a00000000000000000000000005" as const;
const HES_USER = "a00000000000000000000000006" as const;

const SEED_USERS = [
	{
		_id: oid(ADMIN_USER),
		name: "Ana Gerente",
		email: "ana.gerente@cermont.com",
		password: "$2a$12$seedplaceholderGerente2026",
		role: "gerente",
		isActive: true,
	},
	{
		_id: oid(RESIDENT_USER),
		name: "Roberto Residente",
		email: "roberto.residente@cermont.com",
		password: "$2a$12$seedplaceholderResidente2026",
		role: "residente",
		isActive: true,
	},
	{
		_id: oid(SUPERVISOR_USER),
		name: "Silvia Supervisor",
		email: "silvia.supervisor@cermont.com",
		password: "$2a$12$seedplaceholderSupervisor2026",
		role: "supervisor",
		isActive: true,
	},
	{
		_id: oid(TECNICO_USER),
		name: "Carlos Técnico",
		email: "carlos.tecnico@cermont.com",
		password: "$2a$12$seedplaceholderTecnico2026",
		role: "tecnico",
		isActive: true,
	},
	{
		_id: oid(ADMINISTRATIVO_USER),
		name: "Adriana Administrativo",
		email: "adriana.admin@cermont.com",
		password: "$2a$12$seedplaceholderAdmin2026",
		role: "administrativo",
		isActive: true,
	},
	{
		_id: oid(HES_USER),
		name: "Héctor HES",
		email: "hector.hes@cermont.com",
		password: "$2a$12$seedplaceholderHes2026",
		role: "HES",
		isActive: true,
	},
];

async function materializeUsers(db: mongoose.mongo.Db) {
	console.log("\n── Materializing Users ──");
	for (const user of SEED_USERS) {
		await ensureDocument(db, "users", user.email, user as unknown as Record<string, unknown>);
	}
}

async function materializeOrder(
	db: mongoose.mongo.Db,
	code: string,
	_id: string,
	status: string,
	serviceCaseCode: string,
	clientName: string,
) {
	const orderDoc = {
		_id: oid(_id),
		code,
		type: "mantenimiento",
		status,
		priority: "medium",
		description: `Orden generada desde caso ${serviceCaseCode} — ${clientName}`,
		assetId: "ASSET-SEED-001",
		assetName: "Activo de prueba",
		location: "Ubicación de prueba",
		createdBy: oid(RESIDENT_USER),
	};
	await ensureDocument(db, "orders", code, orderDoc as unknown as Record<string, unknown>);
}

async function materializeExecutionSession(
	db: mongoose.mongo.Db,
	code: string,
	_id: string,
	status: string,
	_workOrderCode: string,
	workOrderId: string,
) {
	const sessionDoc = {
		_id: oid(_id),
		code,
		workOrderId: oid(workOrderId),
		status,
		assignedCrew: [oid(TECNICO_USER), oid(SUPERVISOR_USER)],
		startedBy: oid(SUPERVISOR_USER),
		startedAt: NOW,
		completedAt: status === "completed" ? NOW : undefined,
		completedBy: status === "completed" ? oid(TECNICO_USER) : undefined,
		offlineSyncStatus: "synced",
		createdBy: oid(SUPERVISOR_USER),
	};
	await ensureDocument(db, "executionsessions", code, sessionDoc as unknown as Record<string, unknown>);
}

async function materializeTechnicalReport(
	db: mongoose.mongo.Db,
	code: string,
	_id: string,
	status: string,
	workOrderId: string,
	executionSessionId: string,
) {
	const trDoc = {
		_id: oid(_id),
		code,
		workOrderId: oid(workOrderId),
		executionSessionId: oid(executionSessionId),
		executionSummary:
			status === "draft"
				? "Reporte en borrador — pendiente de completar"
				: "Ejecución completada según planeación. Se realizaron las actividades programadas sin novedades.",
		activitiesPerformed: [
			"Inspección visual del área de trabajo",
			"Ejecución de mantenimiento programado",
			"Verificación de parámetros operativos",
		],
		findings: [
			"Equipo operando dentro de parámetros normales",
			"Se identificó desgaste en componente secundario",
		],
		deviations: [],
		status,
		generatedBy: oid(RESIDENT_USER),
		generatedAt: NOW,
	};
	await ensureDocument(db, "technicalreports", code, trDoc as unknown as Record<string, unknown>);
}

async function materializeDeliveryRecord(
	db: mongoose.mongo.Db,
	code: string,
	_id: string,
	status: string,
	workOrderId: string,
	technicalReportId: string,
	acceptanceStatus: string,
) {
	const drDoc = {
		_id: oid(_id),
		code,
		workOrderId: oid(workOrderId),
		technicalReportId: oid(technicalReportId),
		status,
		acceptanceStatus,
		deliveryDate: NOW,
		clientRepresentative: "Cliente representante",
		signatureMethod: "digital",
		signedAt: status === "signed" || status === "delivered" ? NOW : undefined,
		signedBy: status === "signed" || status === "delivered" ? "Cliente Firma" : undefined,
		clientMutationIds: [],
	};
	await ensureDocument(db, "deliveryrecords", code, drDoc as unknown as Record<string, unknown>);
}

async function materializeServiceEntrySheet(
	db: mongoose.mongo.Db,
	code: string,
	_id: string,
	status: string,
	workOrderId: string,
	deliveryRecordId: string,
	clientName: string,
	amount: number,
) {
	const sesDoc = {
		_id: oid(_id),
		code,
		workOrderId: oid(workOrderId),
		deliveryRecordId: oid(deliveryRecordId),
		clientId: oid(ADMINISTRATIVO_USER),
		clientName,
		amount,
		currency: "COP",
		taxAmount: Math.round(amount * 0.19),
		totalAmount: Math.round(amount * 1.19),
		status,
		serviceLines: [
			{
				description: `Servicios correspondientes a ${code}`,
				quantity: 1,
				unit: "global",
				unitPrice: amount,
				total: amount,
			},
		],
		createdBy: oid(ADMINISTRATIVO_USER),
		submittedAt: status === "submitted" || status === "approved" ? NOW : undefined,
		approvedAt: status === "approved" ? NOW : undefined,
		approvedBy: status === "approved" ? oid(RESIDENT_USER) : undefined,
	};
	await ensureDocument(db, "serviceentrysheets", code, sesDoc as unknown as Record<string, unknown>);
}

async function materializeInvoice(
	db: mongoose.mongo.Db,
	code: string,
	_id: string,
	status: string,
	workOrderId: string,
	serviceEntrySheetId: string,
	clientName: string,
	amount: number,
) {
	const invDoc = {
		_id: oid(_id),
		code,
		workOrderId: oid(workOrderId),
		serviceEntrySheetId: oid(serviceEntrySheetId),
		clientId: oid(ADMINISTRATIVO_USER),
		clientName,
		amount,
		currency: "COP",
		taxAmount: Math.round(amount * 0.19),
		totalAmount: Math.round(amount * 1.19),
		status,
		invoiceLines: [
			{
				description: `Facturación correspondiente a ${code}`,
				quantity: 1,
				unit: "global",
				unitPrice: amount,
				total: amount,
			},
		],
		createdBy: oid(ADMINISTRATIVO_USER),
		issueDate: NOW,
		dueDate: new Date(NOW.getTime() + 30 * 24 * 60 * 60 * 1000),
		submittedAt: status === "submitted" || status === "approved" ? NOW : undefined,
		approvedAt: status === "approved" ? NOW : undefined,
		approvedBy: status === "approved" ? oid(RESIDENT_USER) : undefined,
	};
	await ensureDocument(db, "invoices", code, invDoc as unknown as Record<string, unknown>);
}

async function materializePayment(
	db: mongoose.mongo.Db,
	code: string,
	_id: string,
	status: string,
	invoiceId: string,
	workOrderId: string,
	serviceEntrySheetId: string,
	_clientName: string,
	amount: number,
) {
	const payDoc = {
		_id: oid(_id),
		code,
		invoiceId: oid(invoiceId),
		workOrderId: oid(workOrderId),
		serviceEntrySheetId: oid(serviceEntrySheetId),
		clientId: oid(ADMINISTRATIVO_USER),
		paymentReference: `BANK-REF-${code}`,
		paidAt: NOW,
		amount,
		currency: "COP",
		paymentMethod: "bank_transfer",
		bankReference: `BANK-TRANSFER-${code}`,
		recordedBy: oid(ADMINISTRATIVO_USER),
		recordedAt: NOW,
		reconciledBy: oid(ADMINISTRATIVO_USER),
		reconciledAt: NOW,
		status,
	};
	await ensureDocument(db, "payments", code, payDoc as unknown as Record<string, unknown>);
}

async function materializeOperationalArtifacts(
	db: mongoose.mongo.Db,
	c: SeedCaseRecord,
	arts: Record<string, { id: { toString: () => string }; code: string; status: string }>,
) {
	// Order (workOrder)
	if (!arts.workOrder) { return; }
	await materializeOrder(
		db,
		arts.workOrder.code,
		arts.workOrder.id.toString(),
		arts.workOrder.status,
		c.code,
		c.clientName,
	);

	// ExecutionSession (depends on workOrder)
	if (arts.executionSession) {
		const woCode = arts.workOrder.code;
		const woId = arts.workOrder.id.toString();
		await materializeExecutionSession(
			db,
			arts.executionSession.code,
			arts.executionSession.id.toString(),
			arts.executionSession.status,
			woCode,
			woId,
		);
	}

	// TechnicalReport (depends on workOrder + executionSession)
	if (arts.technicalReport) {
		const woId = arts.workOrder.id.toString();
		const exId = arts.executionSession?.id.toString() ?? "a00000000000000000000000000";
		await materializeTechnicalReport(
			db,
			arts.technicalReport.code,
			arts.technicalReport.id.toString(),
			arts.technicalReport.status,
			woId,
			exId,
		);
	}

	// DeliveryRecord (depends on workOrder + technicalReport)
	if (arts.deliveryRecord) {
		const woId = arts.workOrder.id.toString();
		const trId = arts.technicalReport?.id.toString() ?? "a00000000000000000000000000";
		await materializeDeliveryRecord(
			db,
			arts.deliveryRecord.code,
			arts.deliveryRecord.id.toString(),
			arts.deliveryRecord.status,
			woId,
			trId,
			arts.deliveryRecord.status === "signed" ? "accepted" : "pending",
		);
	}
}

async function materializeBillingArtifacts(
	db: mongoose.mongo.Db,
	c: SeedCaseRecord,
	arts: Record<string, { id: { toString: () => string }; code: string; status: string }>,
) {
	// ServiceEntrySheet (depends on workOrder + deliveryRecord)
	if (arts.serviceEntrySheet) {
		const woId = arts.workOrder?.id.toString() ?? "a00000000000000000000000000";
		const drId = arts.deliveryRecord?.id.toString() ?? "a00000000000000000000000000";
		const sesAmount = coalesceNumber(c.financialSummary.sesTotal, c.financialSummary.proposalAmount);
		await materializeServiceEntrySheet(
			db,
			arts.serviceEntrySheet.code,
			arts.serviceEntrySheet.id.toString(),
			arts.serviceEntrySheet.status,
			woId,
			drId,
			c.clientName,
			sesAmount,
		);
	}

	// Invoice (depends on workOrder + serviceEntrySheet)
	if (arts.invoice) {
		const woId = arts.workOrder?.id.toString() ?? "a00000000000000000000000000";
		const sesId = arts.serviceEntrySheet?.id.toString() ?? "a00000000000000000000000000";
		const invAmount = coalesceNumber(c.financialSummary.invoicedAmount, c.financialSummary.proposalAmount);
		await materializeInvoice(
			db,
			arts.invoice.code,
			arts.invoice.id.toString(),
			arts.invoice.status,
			woId,
			sesId,
			c.clientName,
			invAmount,
		);
	}

	// Payment (depends on invoice + workOrder + serviceEntrySheet)
	if (arts.payment) {
		const invId = arts.invoice?.id.toString() ?? "a00000000000000000000000000";
		const woId = arts.workOrder?.id.toString() ?? "a00000000000000000000000000";
		const sesId = arts.serviceEntrySheet?.id.toString() ?? "a00000000000000000000000000";
		const payAmount = coalesceNumber(c.financialSummary.paidAmount, c.financialSummary.invoicedAmount);
		await materializePayment(
			db,
			arts.payment.code,
			arts.payment.id.toString(),
			arts.payment.status,
			invId,
			woId,
			sesId,
			c.clientName,
			payAmount,
		);
	}
}

async function materializeEvidence(
	db: mongoose.mongo.Db,
	code: string,
	_id: string,
	executionSessionId: string,
	evidenceType: string,
) {
	const evDoc = {
		_id: oid(_id),
		code,
		executionSessionId: oid(executionSessionId),
		type: evidenceType,
		urls: [
			`/uploads/evidences/${code.toLowerCase()}_photo_1.jpg`,
			`/uploads/evidences/${code.toLowerCase()}_photo_2.jpg`,
			`/uploads/evidences/${code.toLowerCase()}_photo_3.jpg`,
		],
		status: "completed",
		uploadedBy: oid(TECNICO_USER),
		uploadedAt: NOW,
		createdAt: NOW,
		updatedAt: NOW,
	};
	await ensureDocument(db, "evidences", code, evDoc as unknown as Record<string, unknown>);
}

const COST_CATEGORIES = ["labor", "materials", "equipment", "transport", "subcontract", "overhead"] as const;

async function materializeCost(
	db: mongoose.mongo.Db,
	code: string,
	_id: string,
	orderId: string,
	category: string,
	description: string,
	estimatedAmount: number,
	actualAmount: number,
) {
	const cstDoc = {
		_id: oid(_id),
		code,
		orderId: oid(orderId),
		category,
		description,
		estimatedAmount,
		actualAmount,
		taxAmount: Math.round(actualAmount * 0.19),
		taxRate: 0.19,
		currency: "COP",
		notes: `Costo generado desde semilla — ${code}`,
		recordedBy: oid(RESIDENT_USER),
		recordedAt: NOW,
		createdAt: NOW,
		updatedAt: NOW,
	};
	await ensureDocument(db, "costs", code, cstDoc as unknown as Record<string, unknown>);
}

async function materializeEvidenceArtifacts(
	db: mongoose.mongo.Db,
	arts: Record<string, { id: { toString: () => string }; code: string; status: string }>,
	stage: string,
) {
	if (!arts.executionSession) {
		return;
	}
	const exId = arts.executionSession.id.toString();
	const exCode = arts.executionSession.code;
	const evidenceTypes: string[] =
		stage === "in_execution" ? ["before"] : ["before", "during", "after"];
	for (const evType of evidenceTypes) {
		const evCode = `EVD-${exCode}-${evType.toUpperCase()}`;
		const evId = new mongoose.Types.ObjectId().toString();
		await materializeEvidence(db, evCode, evId, exId, evType);
	}
}

const CATEGORY_PCT: Record<string, number> = {
	labor: 0.35,
	materials: 0.25,
	equipment: 0.20,
	transport: 0.10,
	subcontract: 0.07,
	overhead: 0.03,
};

async function materializeCostArtifacts(
	db: mongoose.mongo.Db,
	c: SeedCaseRecord,
	arts: Record<string, { id: { toString: () => string }; code: string; status: string }>,
) {
	if (!arts.workOrder) {
		return;
	}
	const woId = arts.workOrder.id.toString();
	const woCode = arts.workOrder.code;
	const proposalAmt = typeof c.financialSummary.proposalAmount === "number" ? c.financialSummary.proposalAmount : 0;
	const actualAmt = typeof c.financialSummary.actualCost === "number" ? c.financialSummary.actualCost : 0;
	const pctActual = actualAmt > 0 ? actualAmt / proposalAmt : 0.9;

	for (const cat of COST_CATEGORIES) {
		const catPct = CATEGORY_PCT[cat] ?? 0.03;
		const est = Math.round(proposalAmt * catPct);
		if (est <= 0) {
			continue;
		}
		const act = Math.round(proposalAmt * catPct * pctActual);
		const cstCode = `CST-${woCode}-${cat.toUpperCase()}`;
		const cstId = new mongoose.Types.ObjectId().toString();
		await materializeCost(db, cstCode, cstId, woId, cat, `Costo de ${cat} — ${c.clientName}`, est, act);
	}
}

async function materializeArtifacts(db: mongoose.mongo.Db, c: SeedCaseRecord) {
	const arts = c.artifacts as unknown as Record<string, { id: { toString: () => string }; code: string; status: string }>;
	await materializeOperationalArtifacts(db, c, arts);
	await materializeBillingArtifacts(db, c, arts);
	await materializeEvidenceArtifacts(db, arts, c.currentStage);
	await materializeCostArtifacts(db, c, arts);
}

// ── Main ────────────────────────────────────────────────────────────

async function main() {
	await mongoose.connect(MONGO_URI, { family: 4, serverSelectionTimeoutMS: 10_000 });
	const db = mongoose.connection.db;
	if (!db) {
		throw new Error("Database not initialized");
	}

	// Materialize seed users first (needed as references for all entities)
	await materializeUsers(db);

	const model = mongoose.connection.collection("service_cases");

	let created = 0;
	let skipped = 0;

	for (const c of CASES) {
		const exists = await model.findOne({ code: c.code });
		if (exists) {
			console.log(`[skip] ${c.code} — already exists`);
			skipped++;
		} else {
			const blockers = c.blockers ?? [];

			await model.insertOne({
				code: c.code,
				clientName: c.clientName,
				currentStage: c.currentStage,
				currentStepCode: c.currentStepCode,
				artifacts: c.artifacts,
				blockers,
				nextActions: buildNextActions(c.currentStepCode, blockers),
				currentStepRequirements: buildCurrentStepRequirements(c.currentStepCode, blockers),
				stepsChecklist: buildStepsChecklist(c.currentStepCode, blockers),
				timeline: [tle(c.currentStage, "create_seed_case", "a00000000000000000000000", "gerente")],
				financialSummary: buildFinancialSummary(c.financialSummary),
				operationalSummary: buildOperationalSummary(c, blockers),
				createdAt: NOW,
				updatedAt: NOW,
			});

			console.log(`[created] ${c.code} — ${c.clientName} [${c.currentStage}]`);
			created++;
		}

		// ALWAYS materialize artifacts — previous seed runs may have created the case
		// but not the related collection documents
		console.log(`  materializing artifacts for ${c.code}...`);
		await materializeArtifacts(db, c);
	}

	console.log(`\nDone. Created ${created} cases, skipped ${skipped} existing.`);

	await mongoose.disconnect();
	process.exit(0);
}

main().catch((err) => {
	console.error("Seed failed:", err);
	process.exit(1);
});
