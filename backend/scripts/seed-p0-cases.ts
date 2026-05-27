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
];

// ── Main ────────────────────────────────────────────────────────────

async function main() {
	await mongoose.connect(MONGO_URI, { family: 4, serverSelectionTimeoutMS: 10_000 });

	const model = mongoose.connection.collection("service_cases");

	let created = 0;
	let skipped = 0;

	for (const c of CASES) {
		const exists = await model.findOne({ code: c.code });
		if (exists) {
			console.log(`[skip] ${c.code} — already exists`);
			skipped++;
			continue;
		}

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

	console.log(`\nDone. Created ${created}, skipped ${skipped}.`);

	await mongoose.disconnect();
	process.exit(0);
}

main().catch((err) => {
	console.error("Seed failed:", err);
	process.exit(1);
});
