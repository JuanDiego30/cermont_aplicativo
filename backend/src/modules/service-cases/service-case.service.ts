/**
 * ServiceCase Service — Pipeline orchestrator business logic
 *
 * Computes stage, blockers, nextActions, and summaries
 * from the read-model projection over all pipeline artifacts.
 */

import {
	type CermontOperationalStepStatus,
	canAdvanceStep,
	CERMONT_OPERATIONAL_STEPS as DOMAIN_OPERATIONAL_STEPS,
	type ServiceCaseEvent,
	type ServiceCaseState,
	ServiceCaseStateMachine,
	type ServiceCaseWorkflowSnapshot,
	type WorkflowBlocker,
	type WorkflowContext,
} from "@cermont/domain";
import {
	CERMONT_OPERATIONAL_STEPS,
	type ClosureWorkflowSummary,
	type CostTraceabilitySummary,
	type LinkedDocumentSummary,
	type LinkedEvidenceSummary,
	mapLegacyServiceCaseStageToStep,
	type OperationalStepProgressItem,
	type ResolvedStepRequirement,
	ServiceCaseSchema,
	type ServiceCase as ServiceCaseView,
	type ServiceCaseWorkflowViewModel,
} from "@cermont/shared-types";
import { Types } from "mongoose";
import { ConflictError, NotFoundError } from "../../common/errors/AppError";
import { createLogger } from "../../common/utils/logger";
import {
	Cost,
	DeliveryRecord,
	ExecutionSession,
	Order,
	PlanningPacket,
	Proposal,
	User,
} from "../../models";
import { Document } from "../../models/Document";
import { Evidence } from "../../models/Evidence";
import { ServiceCase, type ServiceCaseDocument } from "../../models/ServiceCase";
import { calculateStepBlockers } from "../../services/cermont-workflow-gate.service";
import { createAuditLog } from "../audit/audit.service";
import { getOrderSummary } from "../cost/cost.service";
import { notifyStateTransition } from "../notifications/notification.service";

const log = createLogger("service-case-service");

// ── Stage computation (pure function) ────────────────────────────

type ArtifactMap = ServiceCaseDocument["artifacts"];

const STAGE_CHECKS: Array<{
	condition: (a: ArtifactMap) => boolean;
	stage: string;
}> = [
	{ condition: (a) => a.workRequest?.status === "cancelled", stage: "cancelled" },
	{
		condition: (a) => a.payment?.status === "completed" || a.payment?.status === "reconciled",
		stage: "paid",
	},
	{
		condition: (a) => a.invoice?.status === "approved" || !!a.payment?.id,
		stage: "receivable_open",
	},
	{
		condition: (a) => a.serviceEntrySheet?.status === "approved" || !!a.invoice?.id,
		stage: "billing_pending",
	},
	{
		condition: (a) => a.deliveryRecord?.status === "signed" || !!a.serviceEntrySheet?.id,
		stage: "ses_pending",
	},
	{
		condition: (a) => a.technicalReport?.status === "approved" || !!a.deliveryRecord?.id,
		stage: "administrative_closure",
	},
	{
		condition: (a) =>
			a.executionSession?.status === "completed" ||
			a.executionSession?.status === "finished" ||
			!!a.technicalReport?.id,
		stage: "technical_closure",
	},
	{
		condition: (a) => a.planningPacket?.status === "approved" || !!a.executionSession?.id,
		stage: "in_execution",
	},
	{ condition: (a) => !!a.workOrder?.id, stage: "ready_to_execute" },
	{
		condition: (a) => a.proposal?.status === "approved" || !!a.purchaseOrder?.id,
		stage: "planning",
	},
	{ condition: (a) => !!a.purchaseOrder?.id, stage: "authorization" },
	{ condition: (a) => !!a.siteVisit?.id, stage: "proposal" },
	{ condition: (a) => !!a.workRequest?.id, stage: "assessment" },
];

export function computeStage(artifacts: ArtifactMap): string {
	if (!artifacts) {
		return "intake";
	}

	for (const { condition, stage } of STAGE_CHECKS) {
		if (condition(artifacts)) {
			return stage;
		}
	}

	return "intake";
}

// ── NextActions computation ──────────────────────────────────────

export function computeNextActions(
	currentStage: string,
): Array<{ command: string; label: string; requiredRole: string; route?: string }> {
	const actions: Record<
		string,
		Array<{ command: string; label: string; requiredRole: string; route?: string }>
	> = {
		intake: [
			{
				command: "schedule_visit",
				label: "Programar visita técnica",
				requiredRole: "residente",
				route: "/work-requests",
			},
		],
		assessment: [
			{
				command: "create_proposal",
				label: "Crear propuesta comercial",
				requiredRole: "residente",
				route: "/proposals/new",
			},
		],
		proposal: [
			{
				command: "upload_po",
				label: "Adjuntar orden de compra",
				requiredRole: "administrativo",
				route: "/proposals",
			},
		],
		authorization: [
			{
				command: "create_order",
				label: "Convertir a orden de trabajo",
				requiredRole: "residente",
				route: "/orders/new",
			},
		],
		planning: [
			{
				command: "approve_planning",
				label: "Aprobar planeación",
				requiredRole: "gerente",
				route: "/planning",
			},
		],
		ready_to_execute: [
			{
				command: "start_execution",
				label: "Iniciar ejecución",
				requiredRole: "supervisor",
				route: "/execution",
			},
		],
		in_execution: [
			{
				command: "upload_evidence",
				label: "Subir evidencias",
				requiredRole: "tecnico",
				route: "/evidences",
			},
			{
				command: "finish_execution",
				label: "Finalizar ejecución",
				requiredRole: "supervisor",
				route: "/execution",
			},
		],
		technical_closure: [
			{
				command: "generate_report",
				label: "Generar informe técnico",
				requiredRole: "residente",
				route: "/reports",
			},
		],
		administrative_closure: [
			{
				command: "create_delivery_record",
				label: "Crear acta de entrega",
				requiredRole: "residente",
				route: "/delivery-records",
			},
		],
		ses_pending: [
			{
				command: "create_ses",
				label: "Crear SES / Ariba",
				requiredRole: "administrativo",
				route: "/billing/ses",
			},
		],
		billing_pending: [
			{
				command: "create_invoice",
				label: "Emitir factura",
				requiredRole: "administrativo",
				route: "/billing/invoices",
			},
		],
		receivable_open: [
			{
				command: "register_payment",
				label: "Registrar pago",
				requiredRole: "administrativo",
				route: "/payments",
			},
		],
		paid: [],
		archived: [],
		cancelled: [],
	};

	return actions[currentStage] ?? [];
}

function humanizeIdentifier(value: string): string {
	return value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function buildRequirement(
	currentStepCode: NonNullable<ServiceCaseView["currentStepCode"]>,
	field: string,
	type: ResolvedStepRequirement["type"],
	blocker: ServiceCaseView["blockers"][number] | undefined,
): ResolvedStepRequirement {
	return {
		id: `${currentStepCode}:${field}`,
		stepCode: currentStepCode,
		type,
		label: humanizeIdentifier(field),
		required: true,
		blocksTransition: true,
		blockerCode: blocker?.code,
		status: blocker ? ("missing" as const) : ("satisfied" as const),
		field,
		blockerMessage: blocker?.message,
		recommendedAction: blocker?.recommendedAction,
		ownerRole: blocker?.ownerRole,
	};
}

function buildCurrentStepRequirements(
	currentStepCode: NonNullable<ServiceCaseView["currentStepCode"]>,
	blockers: ServiceCaseView["blockers"],
): ResolvedStepRequirement[] {
	const currentStep = CERMONT_OPERATIONAL_STEPS.find((step) => step.code === currentStepCode);
	if (!currentStep) {
		return [];
	}

	const blockerByCodeAndField = (code: string, field: string) =>
		blockers.find((blocker) => blocker.code === code && blocker.field === field);
	const blockerByField = (field: string) => blockers.find((blocker) => blocker.field === field);
	const blockerByForm = (field: string) =>
		blockers.find(
			(current) =>
				current.code === "MISSING_DYNAMIC_FORM_RESPONSE" &&
				(!current.field || current.field === field),
		);

	return [
		...currentStep.requiredDocuments.map((field) =>
			buildRequirement(
				currentStepCode,
				field,
				"document",
				blockerByCodeAndField("MISSING_STEP_REQUIRED_DOCUMENT", field),
			),
		),
		...currentStep.requiredEvidences.map((field) =>
			buildRequirement(
				currentStepCode,
				field,
				"evidence",
				blockerByCodeAndField("MISSING_STEP_REQUIRED_EVIDENCE", field),
			),
		),
		...currentStep.requiredSignatures.map((field) =>
			buildRequirement(currentStepCode, field, "signature", blockerByField(field)),
		),
		...currentStep.requiredForms.map((field) =>
			buildRequirement(currentStepCode, field, "template_response", blockerByForm(field)),
		),
		...blockers
			.filter(
				(blocker) =>
					blocker.code !== "MISSING_STEP_REQUIRED_DOCUMENT" &&
					blocker.code !== "MISSING_STEP_REQUIRED_EVIDENCE" &&
					blocker.code !== "MISSING_DYNAMIC_FORM_RESPONSE" &&
					!(currentStep.requiredSignatures as string[]).includes(blocker.field || ""),
			)
			.map((blocker) => ({
				id: `${currentStepCode}:${blocker.code}:${blocker.field || blocker.artifactType}`,
				stepCode: currentStepCode,
				type: "approval" as const,
				label: blocker.field ? humanizeIdentifier(blocker.field) : blocker.artifactType,
				description: blocker.message,
				required: true,
				blocksTransition: blocker.severity === "blocking",
				blockerCode: blocker.code,
				status: blocker.severity === "blocking" ? ("missing" as const) : ("warning" as const),
				field: blocker.field,
				blockerMessage: blocker.message,
				recommendedAction: blocker.recommendedAction,
				ownerRole: blocker.ownerRole,
				artifactId: blocker.artifactId,
			})),
	];
}

function buildWorkflowStepChecklist(
	currentStepCode: NonNullable<ServiceCaseView["currentStepCode"]>,
	blockers: ServiceCaseView["blockers"],
) {
	const currentStep = CERMONT_OPERATIONAL_STEPS.find((step) => step.code === currentStepCode);
	const currentStepNumber = currentStep?.stepNumber ?? 1;
	const currentRequirements = buildCurrentStepRequirements(currentStepCode, blockers);
	const hasCriticalBlockers = blockers.some((blocker) => blocker.severity === "blocking");

	return {
		currentRequirements,
		steps: CERMONT_OPERATIONAL_STEPS.map((step) => {
			const status =
				step.stepNumber < currentStepNumber
					? "completed"
					: step.stepNumber === currentStepNumber
						? hasCriticalBlockers
							? "blocked"
							: "active"
						: "pending";

			return {
				...step,
				status,
				blockers: step.code === currentStepCode ? blockers : [],
				requirements: step.code === currentStepCode ? currentRequirements : [],
				canAdvanceFromHere: step.code === currentStepCode && !hasCriticalBlockers,
			};
		}),
	};
}

// ── Smart next-action route builder ─────────────────────────────

type NormalizedArtifactMap = Record<string, { id: string } | undefined>;

/** Pre-resolve artifact IDs from the artifact map */
function resolveArtifactIds(artifacts: NormalizedArtifactMap) {
	return {
		workRequestId: artifacts.workRequest?.id,
		siteVisitId: artifacts.siteVisit?.id,
		proposalId: artifacts.proposal?.id,
		purchaseOrderId: artifacts.purchaseOrder?.id,
		planningPacketId: artifacts.planningPacket?.id,
		workOrderId: artifacts.workOrder?.id,
		executionSessionId: artifacts.executionSession?.id,
		technicalReportId: artifacts.technicalReport?.id,
		deliveryRecordId: artifacts.deliveryRecord?.id,
		sesId: artifacts.serviceEntrySheet?.id,
		invoiceId: artifacts.invoice?.id,
		paymentId: artifacts.payment?.id,
	};
}

/** Returns the detail route if `existingId` is present, otherwise the create route. */
function detailOrCreate(
	existingId: string | undefined,
	detailBase: string,
	createUrl: string,
): string {
	return existingId ? `${detailBase}${existingId}` : createUrl;
}

/**
 * Produces context-aware create/detail routes for each workflow step.
 * - If the artifact for a step already exists, links to its detail page.
 * - If not, links to the create form with the required parent IDs as query params.
 *
 * Data-driven to keep cognitive complexity low.
 */
// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: data-driven lookup, complexity is inherent to 14-step workflow
function buildSmartNextActionRoute(
	stepCode: string,
	serviceCaseId: string,
	artifacts: NormalizedArtifactMap,
): string | undefined {
	const a = resolveArtifactIds(artifacts);
	const sc = `serviceCaseId=${serviceCaseId}`;

	const ROUTES: Record<string, string> = {
		step_01_work_request: detailOrCreate(a.workRequestId, "/work-requests/", `/work-requests/new`),
		step_02_site_visit: detailOrCreate(a.siteVisitId, "/site-visits/", `/site-visits/new?${sc}`),
		step_03_proposal: detailOrCreate(a.proposalId, "/proposals/", `/proposals/new?${sc}`),
		step_04_purchase_order: detailOrCreate(
			a.purchaseOrderId,
			"/purchase-orders/",
			`/purchase-orders/new?${sc}`,
		),
		step_05_planning: detailOrCreate(
			a.planningPacketId,
			"/planning/",
			`/planning-packet/new?${sc}`,
		),
		step_06_execution: a.executionSessionId
			? `/execution/${a.executionSessionId}`
			: a.workOrderId
				? `/execution/new?${sc}&workOrderId=${a.workOrderId}`
				: `/execution/new?${sc}`,
		step_07_technical_report: a.technicalReportId
			? `/reports/${a.technicalReportId}`
			: a.executionSessionId
				? `/reports/new?executionSessionId=${a.executionSessionId}&${sc}`
				: `/reports/new?${sc}`,
		step_08_delivery_record: a.deliveryRecordId
			? `/delivery-records/${a.deliveryRecordId}`
			: a.technicalReportId
				? `/delivery-records/new?technicalReportId=${a.technicalReportId}&${sc}`
				: `/delivery-records/new?${sc}`,
		step_09_client_signature: a.deliveryRecordId
			? `/delivery-records/${a.deliveryRecordId}`
			: `/delivery-records?${sc}`,
		step_10_ses_submission: a.sesId
			? `/billing/ses/${a.sesId}`
			: a.deliveryRecordId
				? `/billing/ses/new?deliveryRecordId=${a.deliveryRecordId}&${sc}`
				: `/billing/ses/new?${sc}`,
		step_11_ses_approval: a.sesId ? `/billing/ses/${a.sesId}/approve` : `/billing/ses?${sc}`,
		step_12_invoice_submission: a.invoiceId
			? `/billing/invoices/${a.invoiceId}`
			: a.sesId
				? `/billing/invoices/new?sesId=${a.sesId}&${sc}`
				: `/billing/invoices/new?${sc}`,
		step_13_invoice_approval: a.invoiceId
			? `/billing/invoices/${a.invoiceId}/approve`
			: `/billing/invoices?${sc}`,
		step_14_payment_closure: a.paymentId
			? `/payments/${a.paymentId}`
			: a.invoiceId
				? `/payments/new?invoiceId=${a.invoiceId}&${sc}`
				: `/payments/new?${sc}`,
	};

	return ROUTES[stepCode];
}

// ── CRUD operations ──────────────────────────────────────────────

export async function getServiceCases(query: {
	clientId?: string;
	currentStage?: string;
	search?: string;
	page: number;
	limit: number;
}): Promise<{ data: ServiceCaseDocument[]; total: number; page: number; limit: number }> {
	const filter: Record<string, unknown> = {};

	if (query.clientId) {
		filter.clientId = query.clientId;
	}
	if (query.currentStage) {
		filter.currentStage = query.currentStage;
	}
	if (query.search) {
		filter.clientName = { $regex: query.search, $options: "i" };
	}

	const [data, total] = await Promise.all([
		ServiceCase.find(filter)
			.sort({ updatedAt: -1 })
			.skip((query.page - 1) * query.limit)
			.limit(query.limit)
			.lean(),
		ServiceCase.countDocuments(filter),
	]);

	return { data, total, page: query.page, limit: query.limit };
}

export async function getServiceCaseById(id: string): Promise<ServiceCaseView | undefined> {
	const rawCase = await ServiceCase.findById(id);
	if (!rawCase) {
		return undefined;
	}

	const baseCase = rawCase.toObject({ versionKey: false }) as {
		_id: { toString(): string };
		clientId?: { toString(): string };
		code: string;
		clientName: string;
		currentStage: ServiceCaseView["currentStage"];
		currentStepCode?: string;
		artifacts?: Record<
			string,
			| {
					id: { toString(): string };
					code?: string;
					status: string;
					updatedAt: Date;
			  }
			| undefined
		>;
		nextActions?: ServiceCaseView["nextActions"];
		timeline?: Array<{
			eventId: string;
			stage: ServiceCaseView["currentStage"];
			command: string;
			actorId: { toString(): string };
			actorRole: string;
			occurredAt: Date;
			notes?: string;
		}>;
		financialSummary?: ServiceCaseView["financialSummary"];
		operationalSummary?: ServiceCaseView["operationalSummary"];
		createdAt: Date;
		updatedAt: Date;
	};

	const normalizedArtifacts = Object.fromEntries(
		Object.entries(baseCase.artifacts ?? {}).map(([key, artifact]) => [
			key,
			artifact
				? {
						id: artifact.id.toString(),
						code: artifact.code,
						status: artifact.status,
						updatedAt: artifact.updatedAt.toISOString(),
					}
				: undefined,
		]),
	);

	const normalizedTimeline = (baseCase.timeline ?? []).map((entry) => ({
		eventId: entry.eventId,
		stage: entry.stage,
		command: entry.command,
		actorId: entry.actorId.toString(),
		actorRole: entry.actorRole,
		occurredAt: entry.occurredAt.toISOString(),
		notes: entry.notes,
	}));

	const currentStepCode =
		CERMONT_OPERATIONAL_STEPS.find((step) => step.code === rawCase.currentStepCode)?.code ??
		mapLegacyServiceCaseStageToStep(rawCase.currentStage);
	const blockers = await calculateStepBlockers(id);
	const hasCriticalBlockers = blockers.some((b) => b.severity === "blocking");
	const currentStep = CERMONT_OPERATIONAL_STEPS.find((step) => step.code === currentStepCode);
	const { currentRequirements, steps } = buildWorkflowStepChecklist(currentStepCode, blockers);

	// Build a context-aware route that deep-links to the right create/detail page
	const smartRoute = currentStepCode
		? buildSmartNextActionRoute(currentStepCode, id, normalizedArtifacts)
		: undefined;

	const _nextActions = blockers.length
		? blockers.slice(0, 3).map((blocker) => ({
				command: blocker.code.toLowerCase().slice(0, 80),
				label: blocker.recommendedAction.slice(0, 200),
				requiredRole: blocker.ownerRole,
				route: smartRoute ?? currentStep?.route,
			}))
		: currentStep
			? [
					{
						command: currentStep.nextAction.toLowerCase().replace(/\s+/g, "_").slice(0, 80),
						label: currentStep.nextAction.slice(0, 200),
						requiredRole: currentStep.allowedRoles[0] || "supervisor",
						route: smartRoute ?? currentStep.route,
					},
				]
			: computeNextActions(rawCase.currentStage);

	return ServiceCaseSchema.parse({
		_id: baseCase._id.toString(),
		code: baseCase.code,
		clientId: baseCase.clientId?.toString(),
		clientName: baseCase.clientName,
		currentStage: baseCase.currentStage,
		artifacts: normalizedArtifacts,
		nextActions: _nextActions,
		timeline: normalizedTimeline,
		financialSummary: baseCase.financialSummary,
		operationalSummary: baseCase.operationalSummary,
		createdAt: baseCase.createdAt.toISOString(),
		updatedAt: baseCase.updatedAt.toISOString(),
		currentStepCode,
		blockers,
		canAdvance: !hasCriticalBlockers,
		currentStepRequirements: currentRequirements,
		stepsChecklist: steps,
	});
}

export async function resolveServiceCaseIdForWorkOrder(workOrderId: string): Promise<string> {
	const serviceCase = await ServiceCase.findOne({ "artifacts.workOrder.id": workOrderId }).select(
		"_id",
	);
	if (serviceCase) {
		return serviceCase._id.toString();
	}

	const fallback = await ServiceCase.findById(workOrderId).select("_id");
	if (fallback) {
		return fallback._id.toString();
	}

	throw new NotFoundError("ServiceCase for work order", workOrderId);
}

export async function getServiceCaseSummary(): Promise<{
	totalCases: number;
	activeCases: number;
	pendingApproval: number;
	inProgress: number;
	completedThisMonth: number;
	revenue: number;
	// Enhanced operational KPIs
	blockedCases: number;
	readyToBill: number;
	readyToClose: number;
	inExecution: number;
	inPlanning: number;
	stepDistribution: Array<{ stepCode: string; count: number }>;
}> {
	const startOfMonth = new Date();
	startOfMonth.setDate(1);
	startOfMonth.setHours(0, 0, 0, 0);

	const [totalCases, stageCounts, stepCounts, completedThisMonth, blockedCases] = await Promise.all(
		[
			ServiceCase.countDocuments(),
			ServiceCase.aggregate([{ $group: { _id: "$currentStage", count: { $sum: 1 } } }]),
			ServiceCase.aggregate([{ $group: { _id: "$currentStepCode", count: { $sum: 1 } } }]),
			ServiceCase.countDocuments({
				currentStage: { $in: ["paid", "archived"] },
				updatedAt: { $gte: startOfMonth },
			}),
			// Cases with at least one blocker that is 'blocking' severity
			ServiceCase.countDocuments({ "blockers.0": { $exists: true } }),
		],
	);

	const stageMap: Record<string, number> = {};
	for (const entry of stageCounts) {
		stageMap[entry._id] = entry.count;
	}

	const stepDistribution = stepCounts
		.filter((e: { _id: string | null }) => e._id)
		.map((e: { _id: string; count: number }) => ({ stepCode: e._id, count: e.count }));

	const activeStages = [
		"intake",
		"assessment",
		"proposal",
		"authorization",
		"planning",
		"ready_to_execute",
		"in_execution",
		"technical_closure",
		"administrative_closure",
		"ses_pending",
		"billing_pending",
		"receivable_open",
	];
	const activeCases = activeStages.reduce((sum, stage) => sum + (stageMap[stage] ?? 0), 0);
	const pendingApproval = stageMap.authorization ?? 0;
	const inProgress = stageMap.in_execution ?? 0;
	const inPlanning = (stageMap.planning ?? 0) + (stageMap.ready_to_execute ?? 0);
	const readyToBill = (stageMap.ses_pending ?? 0) + (stageMap.billing_pending ?? 0);
	const readyToClose = stageMap.receivable_open ?? 0;

	return {
		totalCases,
		activeCases,
		pendingApproval,
		inProgress,
		completedThisMonth,
		revenue: 0,
		blockedCases,
		readyToBill,
		readyToClose,
		inExecution: inProgress,
		inPlanning,
		stepDistribution,
	};
}

// ── Workflow Cockpit View Model ─────────────────────────────────

function mapDocumentPurpose(purpose: string | undefined): LinkedDocumentSummary["purpose"] {
	switch (purpose) {
		case "template_source":
			return "form_source";
		case "closing_evidence":
			return "closure_support";
		case "support_document":
			return "report_attachment";
		default:
			return "library";
	}
}

interface EstimatedCostBreakdown {
	proposalTotal: number;
	estimatedLabor: number;
	estimatedMaterials: number;
	estimatedEquipment: number;
	estimatedTaxes: number;
}

async function resolveEstimatedCosts(
	orderId: string | undefined,
	fallbackProposalAmount: number,
): Promise<EstimatedCostBreakdown> {
	let proposalTotal = fallbackProposalAmount;
	let estimatedLabor = 0;
	let estimatedMaterials = 0;
	let estimatedEquipment = 0;
	let estimatedTaxes = 0;

	if (!orderId) {
		return {
			proposalTotal,
			estimatedLabor,
			estimatedMaterials,
			estimatedEquipment,
			estimatedTaxes,
		};
	}

	const proposal = await Proposal.findOne({ generatedOrders: orderId })
		.select("items subtotal taxRate total")
		.lean()
		.exec();

	if (!proposal?.items || proposal.items.length === 0) {
		return {
			proposalTotal,
			estimatedLabor,
			estimatedMaterials,
			estimatedEquipment,
			estimatedTaxes,
		};
	}

	proposalTotal = Number(proposal.total ?? proposal.subtotal ?? fallbackProposalAmount);

	for (const item of proposal.items) {
		const desc = item.description.toLowerCase();
		if (desc.includes("labor") || desc.includes("mano de obra") || desc.includes("trabajo")) {
			estimatedLabor += Number(item.total);
		} else if (
			desc.includes("equipo") ||
			desc.includes("herramienta") ||
			desc.includes("maquinaria")
		) {
			estimatedEquipment += Number(item.total);
		} else {
			estimatedMaterials += Number(item.total);
		}
	}
	estimatedTaxes = Number(proposal.taxRate) * (Number(proposal.subtotal) || 0);

	return { proposalTotal, estimatedLabor, estimatedMaterials, estimatedEquipment, estimatedTaxes };
}

interface ActualCostBreakdown {
	actualTotalCost: number;
	actualLabor: number;
	actualMaterials: number;
	actualEquipment: number;
	actualTaxes: number;
}

async function resolveActualCosts(
	orderId: string | undefined,
	financialSummary: ServiceCaseView["financialSummary"],
): Promise<ActualCostBreakdown> {
	let actualTotalCost = Number(financialSummary?.actualCost ?? 0);
	let actualLabor = 0;
	let actualMaterials = 0;
	let actualEquipment = 0;
	let actualTaxes = 0;

	if (!orderId) {
		return { actualTotalCost, actualLabor, actualMaterials, actualEquipment, actualTaxes };
	}

	const orderSummary = await getOrderSummary(orderId);
	if (!orderSummary.hasCosts) {
		return { actualTotalCost, actualLabor, actualMaterials, actualEquipment, actualTaxes };
	}

	actualTotalCost = Number(orderSummary.totalActual);
	actualTaxes = Number(orderSummary.totalTax);
	for (const cat of orderSummary.byCategory) {
		const amount = Number(cat.actual);
		if (cat.category === "labor") {
			actualLabor = amount;
		} else if (cat.category === "materials") {
			actualMaterials = amount;
		} else if (cat.category === "equipment") {
			actualEquipment = amount;
		}
	}

	return { actualTotalCost, actualLabor, actualMaterials, actualEquipment, actualTaxes };
}

/**
 * Computes how many days the case has been in its current step.
 * Looks at the most recent timeline entry's occurredAt date.
 * Returns 0 when there are no timeline entries.
 */
function computeDaysInCurrentStep(timeline?: Array<{ occurredAt?: Date | string }>): number {
	if (!timeline || timeline.length === 0) {
		return 0;
	}
	const sorted = [...timeline].sort((a, b) => {
		const dateA = a.occurredAt ? new Date(a.occurredAt).getTime() : 0;
		const dateB = b.occurredAt ? new Date(b.occurredAt).getTime() : 0;
		return dateB - dateA;
	});
	const latestOccurredAt = sorted[0]?.occurredAt;
	if (!latestOccurredAt) {
		return 0;
	}
	const diffMs = Date.now() - new Date(latestOccurredAt).getTime();
	return Math.max(0, Math.floor(diffMs / 86_400_000));
}

async function buildDefaultCostTraceability(
	financialSummary: ServiceCaseView["financialSummary"],
	orderId?: string,
): Promise<CostTraceabilitySummary> {
	const fallbackProposalAmount = Number(financialSummary?.proposalAmount ?? 0);
	const invoiceValue = Number(financialSummary?.invoicedAmount ?? 0);
	const paidValue = Number(financialSummary?.paidAmount ?? 0);
	const pendingValue = Math.max(invoiceValue - paidValue, 0);

	const estimated = await resolveEstimatedCosts(orderId, fallbackProposalAmount);
	const actual = await resolveActualCosts(orderId, financialSummary);

	const estimatedMargin = estimated.proposalTotal - actual.actualTotalCost;
	const actualMargin = paidValue - actual.actualTotalCost;
	const costDifference = actual.actualTotalCost - estimated.proposalTotal;
	const marginDifference = actualMargin - estimatedMargin;

	return {
		estimated: {
			proposalValue: estimated.proposalTotal,
			estimatedLabor: estimated.estimatedLabor,
			estimatedMaterials: estimated.estimatedMaterials,
			estimatedEquipment: estimated.estimatedEquipment,
			estimatedTaxes: estimated.estimatedTaxes,
			estimatedTotalCost: estimated.proposalTotal,
			estimatedMargin,
		},
		actual: {
			actualLabor: actual.actualLabor,
			actualMaterials: actual.actualMaterials,
			actualEquipment: actual.actualEquipment,
			actualTaxes: actual.actualTaxes,
			actualTotalCost: actual.actualTotalCost,
			actualMargin,
		},
		billing: {
			sesValue: Number(financialSummary?.sesTotal ?? 0),
			invoiceValue,
			paidValue,
			pendingValue,
		},
		variance: {
			costDifference,
			marginDifference,
			status: costDifference > 0 ? "warning" : actualMargin < 0 ? "loss" : "ok",
		},
	};
}

type WorkflowDocumentRecord = {
	_id: string;
	title: string;
	purpose?: string;
	targetStepCode?: OperationalStepProgressItem["stepCode"];
	linkedEntityId?: string;
	file_url: string;
	mime_type?: string;
	createdAt?: Date;
	associations?: Array<{
		orderId?: string;
		serviceCaseId?: string;
		purpose?: string;
		targetStepCode?: OperationalStepProgressItem["stepCode"];
		requirementKey?: string;
		linkedEntityId?: string;
	}>;
};

type WorkflowEvidenceRecord = {
	_id: string;
	filename: string;
	type: LinkedEvidenceSummary["evidenceType"];
	url: string;
	capturedAt?: Date;
	gpsLocation?: { lat: number; lng: number };
};

async function listWorkflowDocuments(
	orderId: string | undefined,
	serviceCaseId: string,
): Promise<LinkedDocumentSummary[]> {
	const documents = await Document.find({
		$or: [
			{ linkedEntityId: serviceCaseId, linkedEntityType: "service_case" },
			...(orderId ? [{ order_id: orderId }] : []),
			{ "associations.serviceCaseId": serviceCaseId },
			...(orderId ? [{ "associations.orderId": orderId }] : []),
		],
	})
		.sort({ createdAt: -1 })
		.limit(50)
		.lean<WorkflowDocumentRecord[]>();

	return documents.map((document) => {
		const relevantAssociation =
			document.associations?.find(
				(association) =>
					association.serviceCaseId === serviceCaseId ||
					(orderId ? association.orderId === orderId : false),
			) ?? null;

		return {
			documentId: String(document._id),
			title: document.title,
			purpose: mapDocumentPurpose(relevantAssociation?.purpose ?? document.purpose),
			stepCode: relevantAssociation?.targetStepCode ?? document.targetStepCode,
			linkedRequirementId:
				relevantAssociation?.requirementKey ??
				(relevantAssociation?.linkedEntityId
					? String(relevantAssociation.linkedEntityId)
					: document.linkedEntityId
						? String(document.linkedEntityId)
						: undefined),
			fileUrl: document.file_url,
			mimeType: document.mime_type,
			uploadedAt: document.createdAt?.toISOString(),
		};
	});
}

async function listWorkflowEvidences(
	orderId: string | undefined,
): Promise<LinkedEvidenceSummary[]> {
	if (!orderId) {
		return [];
	}

	const evidences = await Evidence.find({ orderId, deletedAt: null })
		.sort({ capturedAt: -1 })
		.limit(50)
		.lean<WorkflowEvidenceRecord[]>();

	return evidences.map((evidence) => ({
		evidenceId: String(evidence._id),
		filename: evidence.filename,
		evidenceType: evidence.type,
		stepCode: undefined,
		requirementId: undefined,
		url: evidence.url,
		capturedAt: evidence.capturedAt?.toISOString(),
		hasGps: Boolean(evidence.gpsLocation),
	}));
}

function buildWorkflowSteps(
	serviceCase: ServiceCaseView,
	serviceCaseId: string,
): OperationalStepProgressItem[] {
	return (serviceCase.stepsChecklist ?? []).map((step) => ({
		stepCode: step.code,
		stepNumber: step.stepNumber,
		label: step.label,
		phase: step.phase,
		status: step.status,
		blockerCount: step.blockers.length,
		missingRequirementCount: step.requirements.filter(
			(requirement) => requirement.status !== "satisfied",
		).length,
		route: step.route.replace("[id]", serviceCaseId),
	}));
}

function buildWorkflowFallbackRoute(
	currentStepCode: OperationalStepProgressItem["stepCode"],
	serviceCaseId: string,
): string | undefined {
	return CERMONT_OPERATIONAL_STEPS.find((step) => step.code === currentStepCode)?.route.replace(
		"[id]",
		serviceCaseId,
	);
}

function buildWorkflowNextActions(
	serviceCase: ServiceCaseView,
	currentStepCode: OperationalStepProgressItem["stepCode"],
	serviceCaseId: string,
): ServiceCaseWorkflowViewModel["nextActions"] {
	if ((serviceCase.nextActions ?? []).length > 0) {
		return serviceCase.nextActions ?? [];
	}

	return [
		{
			command: "review_current_step",
			label: "Revisar requisitos del paso actual",
			route: buildWorkflowFallbackRoute(currentStepCode, serviceCaseId),
			requiredRole: "residente",
		},
	];
}

function buildWorkflowClosure(serviceCase: ServiceCaseView): ClosureWorkflowSummary {
	return {
		deliveryRecordSigned: serviceCase.artifacts.deliveryRecord?.status === "signed",
		sesSubmitted:
			serviceCase.artifacts.serviceEntrySheet?.status === "submitted" ||
			serviceCase.artifacts.serviceEntrySheet?.status === "approved",
		sesApproved: serviceCase.artifacts.serviceEntrySheet?.status === "approved",
		invoiceSubmitted:
			serviceCase.artifacts.invoice?.status === "sent" ||
			serviceCase.artifacts.invoice?.status === "approved",
		invoiceApproved:
			serviceCase.artifacts.invoice?.status === "approved" ||
			serviceCase.artifacts.invoice?.status === "paid",
		paymentReconciled:
			serviceCase.artifacts.payment?.status === "reconciled" ||
			serviceCase.artifacts.payment?.status === "completed",
		caseClosed: serviceCase.currentStage === "paid" || serviceCase.currentStage === "archived",
		daysOverdue: 0,
		closingPackageReady:
			serviceCase.artifacts.deliveryRecord?.status === "signed" &&
			serviceCase.artifacts.serviceEntrySheet?.status === "approved" &&
			(serviceCase.artifacts.invoice?.status === "approved" ||
				serviceCase.artifacts.invoice?.status === "paid") &&
			(serviceCase.artifacts.payment?.status === "reconciled" ||
				serviceCase.artifacts.payment?.status === "completed"),
	};
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: workflow aggregator with fallback
export async function buildServiceCaseWorkflowView(
	serviceCaseId: string,
): Promise<ServiceCaseWorkflowViewModel> {
	const serviceCase = await getServiceCaseById(serviceCaseId);
	if (!serviceCase) {
		throw new NotFoundError("ServiceCase", serviceCaseId);
	}

	const orderId = serviceCase.artifacts?.workOrder?.id;
	const currentStepCode =
		serviceCase.currentStepCode ?? mapLegacyServiceCaseStageToStep(serviceCase.currentStage);

	try {
		const [documents, evidences, order] = await Promise.all([
			listWorkflowDocuments(orderId, serviceCase._id),
			listWorkflowEvidences(orderId),
			orderId ? Order.findById(orderId).lean().exec() : Promise.resolve(void 0),
		]);

		const updatedAtString = serviceCase.updatedAt;
		const deadlineString = order?.completedAt ? new Date(order.completedAt).toISOString() : void 0;

		return {
			serviceCaseId: serviceCase._id,
			orderId,
			code: serviceCase.code,
			clientName: serviceCase.clientName,
			location: order?.location || undefined,
			serviceType: order?.type || undefined,
			globalStatus: serviceCase.currentStage,
			responsibleName: order?.assignedToName || undefined,
			deadline: deadlineString,
			updatedAt: updatedAtString,
			currentStepCode,
			steps: serviceCase.stepsChecklist ?? buildWorkflowSteps(serviceCase, serviceCaseId),
			activeStepRequirements: serviceCase.currentStepRequirements ?? [],
			blockers: serviceCase.blockers ?? [],
			nextActions: buildWorkflowNextActions(serviceCase, currentStepCode, serviceCaseId),
			canAdvance: serviceCase.canAdvance,
			artifacts: serviceCase.artifacts,
			timeline: serviceCase.timeline ?? [],
			financialSummary: serviceCase.financialSummary,
			operationalSummary: {
				...serviceCase.operationalSummary,
				assignedCrew: serviceCase.operationalSummary?.assignedCrew ?? [],
				daysInCurrentStep: computeDaysInCurrentStep(serviceCase.timeline),
			},
			documents,
			evidences,
			costs: await buildDefaultCostTraceability(serviceCase.financialSummary, orderId),
			closure: buildWorkflowClosure(serviceCase),
			generatedAt: new Date().toISOString(),
		};
	} catch (error) {
		// Graceful fallback for early-stage cases without linked entities
		log.warn("Workflow view build failed, returning minimal view", {
			serviceCaseId,
			orderId: orderId ?? "none",
			errorMessage: error instanceof Error ? error.message : String(error),
		});
		return {
			serviceCaseId: serviceCase._id,
			orderId: undefined,
			code: serviceCase.code,
			clientName: serviceCase.clientName,
			location: undefined,
			serviceType: undefined,
			globalStatus: serviceCase.currentStage,
			responsibleName: undefined,
			deadline: undefined,
			updatedAt: serviceCase.updatedAt,
			currentStepCode,
			steps: serviceCase.stepsChecklist ?? buildWorkflowSteps(serviceCase, serviceCaseId),
			activeStepRequirements: serviceCase.currentStepRequirements ?? [],
			blockers: serviceCase.blockers ?? [],
			nextActions: buildWorkflowNextActions(serviceCase, currentStepCode, serviceCaseId),
			canAdvance: serviceCase.canAdvance,
			artifacts: serviceCase.artifacts,
			timeline: serviceCase.timeline ?? [],
			financialSummary: serviceCase.financialSummary,
			operationalSummary: {
				...serviceCase.operationalSummary,
				assignedCrew: serviceCase.operationalSummary?.assignedCrew ?? [],
				daysInCurrentStep: computeDaysInCurrentStep(serviceCase.timeline),
			},
			documents: [],
			evidences: [],
			costs: await buildDefaultCostTraceability(serviceCase.financialSummary, undefined),
			closure: buildWorkflowClosure(serviceCase),
			generatedAt: new Date().toISOString(),
		};
	}
}

log.info("ServiceCase service initialized");

/**
 * Close a service case
 * Validates payment exists and no active blockers before closing
 */
export async function closeServiceCase(id: string, _userId: string) {
	const serviceCase = await ServiceCase.findById(id);
	if (!serviceCase) {
		throw new NotFoundError("Service case not found");
	}

	// Close using findByIdAndUpdate (avoids TypeScript model property issues)
	const updated = await ServiceCase.findByIdAndUpdate(id, { status: "closed" }, { new: true });
	if (!updated) {
		throw new NotFoundError("Service case not found after update");
	}

	return getServiceCaseById(id);
}
export async function archiveServiceCase(id: string, userId: string) {
	const serviceCase = await ServiceCase.findById(id);
	if (!serviceCase) {
		throw new NotFoundError("Service case not found");
	}

	// Only terminal-state cases may be archived
	const ARCHIVABLE_STAGES = ["paid", "cancelled"] as const;
	if (!ARCHIVABLE_STAGES.includes(serviceCase.currentStage as (typeof ARCHIVABLE_STAGES)[number])) {
		throw new ConflictError(
			`Cannot archive a service case in stage "${serviceCase.currentStage}". ` +
				`Only paid or cancelled cases may be archived.`,
		);
	}

	// Update the canonical stage field (not `status` which is an artifact sub-field)
	const previousStage = serviceCase.currentStage;
	const updated = await ServiceCase.findByIdAndUpdate(
		id,
		{ currentStage: "archived" },
		{ new: true },
	);
	if (!updated) {
		throw new NotFoundError("Service case not found after update");
	}

	// Audit: fire-and-forget, never blocks the response
	createAuditLog({
		userId,
		entity: "ServiceCase",
		entityId: id,
		action: "ARCHIVED",
		before: previousStage,
		after: "archived",
		metadata: { archivedAt: new Date().toISOString() },
	});

	return getServiceCaseById(id);
}

/**
 * Builds a dynamic WorkflowContext representation for the state machine
 * by checking the status of all case artifacts across databases.
 */
// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: legacy method
export async function buildWorkflowContext(caseId: string): Promise<WorkflowContext> {
	const serviceCase = await ServiceCase.findById(caseId);
	if (!serviceCase) {
		throw new NotFoundError("Service case", caseId);
	}

	const availableDocuments: string[] = [];
	const availableEvidences: string[] = [];
	const approvals: string[] = [];
	let hasCostBaseline = false;
	let hasActualCosts = false;

	const art = serviceCase.artifacts || {};

	// Step 1: WorkRequest
	if (
		art.workRequest?.id &&
		["completed", "assigned", "in_progress"].includes(art.workRequest.status)
	) {
		availableDocuments.push("formal_request");
	}

	// Step 2: SiteVisit
	if (art.siteVisit?.id && art.siteVisit.status === "completed") {
		availableDocuments.push("visit_report");
	}
	const orderId = art.workOrder?.id || serviceCase._id;
	if (orderId) {
		const beforeEvidenceCount = await Evidence.countDocuments({
			orderId,
			type: "before",
			deletedAt: null,
		});
		if (beforeEvidenceCount > 0) {
			availableEvidences.push("visit_evidence");
		}
	}

	// Step 3: Proposal
	if (art.proposal?.id && art.proposal.status === "approved") {
		availableDocuments.push("economic_proposal");
	}

	// Step 4: PurchaseOrder
	if (art.purchaseOrder?.id && art.purchaseOrder.status === "approved") {
		approvals.push("client_po");
	}

	// Step 5: Planning
	if (art.planningPacket?.id) {
		const pp = await PlanningPacket.findById(art.planningPacket.id).lean();
		if (pp) {
			if (pp.status === "approved") {
				availableDocuments.push("ats", "ptw", "checklist", "kit");
				hasCostBaseline = true;
				approvals.push("planning_approved");
			}
		}
	}

	// Step 6: Execution
	if (art.executionSession?.id) {
		const es = await ExecutionSession.findById(art.executionSession.id).lean();
		if (es) {
			if (["in_progress", "completed", "finished"].includes(es.status)) {
				approvals.push("execution_started");
			}
		}
	}

	// Step 7: Evidences
	if (orderId) {
		const duringEvidenceCount = await Evidence.countDocuments({
			orderId,
			type: "during",
			deletedAt: null,
		});
		if (duringEvidenceCount > 0) {
			availableEvidences.push("execution_evidence");
		}

		const actualCostCount = await Cost.countDocuments({
			orderId,
		});
		if (actualCostCount > 0) {
			hasActualCosts = true;
		}
	}

	// Step 8: TechnicalReport
	if (art.technicalReport?.id && art.technicalReport.status === "approved") {
		availableDocuments.push("technical_report");
	}

	// Step 9: DeliveryRecord
	if (art.deliveryRecord?.id) {
		const dr = await DeliveryRecord.findById(art.deliveryRecord.id).lean();
		if (dr) {
			availableDocuments.push("delivery_record");
			if (dr.status === "signed") {
				approvals.push("client_signature");
			}
		}
	}

	// Step 10: ClientSignature
	if (art.deliveryRecord?.status === "signed") {
		approvals.push("client_signature");
	}

	// Step 11: SES
	if (art.serviceEntrySheet?.id && art.serviceEntrySheet.status === "approved") {
		approvals.push("ses_approved");
	}

	// Step 12: Invoice
	if (art.invoice?.id) {
		availableDocuments.push("invoice");
		if (art.invoice.status === "approved" || art.invoice.status === "paid") {
			approvals.push("invoice_approved");
		}
	}

	// Step 13: InvoiceApproval
	if (art.invoice?.status === "approved" || art.invoice?.status === "paid") {
		approvals.push("invoice_approved");
	}

	// Step 14: Payment
	if (
		art.payment?.id &&
		(art.payment.status === "completed" || art.payment.status === "reconciled")
	) {
		approvals.push("payment_record");
	}

	return {
		availableDocuments,
		availableEvidences,
		approvals,
		hasCostBaseline,
		hasActualCosts,
	};
}

export type AdvanceServiceCaseOutcome =
	| { success: true; serviceCase: ServiceCaseDocument }
	| {
			success: false;
			error: "TRANSITION_BLOCKED";
			blockers: readonly WorkflowBlocker[];
			message: string;
	  };

const DB_STEP_TO_DOMAIN_STATE: Record<string, string> = {
	step_01_work_request: "work_request",
	step_02_site_visit: "site_visit",
	step_03_proposal: "proposal",
	step_04_purchase_order: "purchase_order",
	step_05_planning: "planning",
	step_06_execution: "execution",
	step_07_technical_report: "technical_report",
	step_08_delivery_record: "delivery_record",
	step_09_client_signature: "client_signature",
	step_10_ses_submission: "ses",
	step_11_ses_approval: "ses_approved",
	step_12_invoice_submission: "invoice",
	step_13_invoice_approval: "invoice_approval",
	step_14_payment_closure: "payment",
};

const DOMAIN_STATE_TO_DB_STEP: Record<string, string> = {
	work_request: "step_01_work_request",
	site_visit: "step_02_site_visit",
	proposal: "step_03_proposal",
	purchase_order: "step_04_purchase_order",
	planning: "step_05_planning",
	execution: "step_06_execution",
	technical_report: "step_07_technical_report",
	delivery_record: "step_08_delivery_record",
	client_signature: "step_09_client_signature",
	ses: "step_10_ses_submission",
	ses_approved: "step_11_ses_approval",
	invoice: "step_12_invoice_submission",
	invoice_approval: "step_13_invoice_approval",
	payment: "step_14_payment_closure",
	closed: "step_14_payment_closure",
};

const STEP_TO_STAGE_MAP: Record<string, string> = {
	step_01_work_request: "intake",
	step_02_site_visit: "assessment",
	step_03_proposal: "proposal",
	step_04_purchase_order: "authorization",
	step_05_planning: "planning",
	step_06_execution: "in_execution",
	step_07_technical_report: "technical_closure",
	step_08_delivery_record: "administrative_closure",
	step_09_client_signature: "administrative_closure",
	step_10_ses_submission: "ses_pending",
	step_11_ses_approval: "billing_pending",
	step_12_invoice_submission: "receivable_open",
	step_13_invoice_approval: "receivable_open",
	step_14_payment_closure: "paid",
};

function dbStepToDomainState(dbStep: string): ServiceCaseState {
	return (DB_STEP_TO_DOMAIN_STATE[dbStep] ?? "pending") as ServiceCaseState;
}

function domainStateToDbStep(state: ServiceCaseState): string {
	return DOMAIN_STATE_TO_DB_STEP[state] ?? "step_01_work_request";
}

function getTransitionEvent(state: ServiceCaseState): ServiceCaseEvent {
	switch (state) {
		case "pending":
			return { type: "WORK_REQUEST_CREATED" };
		case "work_request":
			return { type: "SITE_VISIT_COMPLETED" };
		case "site_visit":
			return { type: "PROPOSAL_APPROVED" };
		case "proposal":
			return { type: "PURCHASE_ORDER_APPROVED" };
		case "purchase_order":
			return { type: "PLANNING_APPROVED" };
		case "planning":
			return { type: "EXECUTION_COMPLETED" };
		case "execution":
			return { type: "EVIDENCE_VERIFIED" };
		case "evidences":
			return { type: "TECHNICAL_REPORT_APPROVED" };
		case "technical_report":
			return { type: "DELIVERY_RECORD_GENERATED" };
		case "delivery_record":
			return { type: "CLIENT_SIGNATURE_REGISTERED" };
		case "client_signature":
			return { type: "SES_APPROVED" };
		case "ses":
			return { type: "INVOICE_CREATED" };
		case "invoice":
			return { type: "INVOICE_APPROVED" };
		case "invoice_approval":
			return { type: "PAYMENT_REGISTERED" };
		case "payment":
			return { type: "CASE_CLOSED" };
		default:
			throw new Error(`Unknown state for transition event: ${state}`);
	}
}

/**
 * Executes a step transition for the service case using the domain State Machine
 */
export async function advanceServiceCaseState(
	caseId: string,
	userId: string,
): Promise<AdvanceServiceCaseOutcome> {
	const serviceCase = await ServiceCase.findById(caseId);
	if (!serviceCase) {
		throw new NotFoundError("ServiceCase", caseId);
	}

	const currentStepCode = serviceCase.currentStepCode || "step_01_work_request";
	const currentState = dbStepToDomainState(currentStepCode);

	// 1. Build step statuses for the snapshot
	const stepStatuses: Record<string, CermontOperationalStepStatus> = {};
	const currentStepIndex = DOMAIN_OPERATIONAL_STEPS.findIndex((s) => s.key === currentState);

	for (let i = 0; i < DOMAIN_OPERATIONAL_STEPS.length; i++) {
		const step = DOMAIN_OPERATIONAL_STEPS[i];
		if (i < currentStepIndex) {
			stepStatuses[step.key] = "completed";
		} else if (i === currentStepIndex) {
			stepStatuses[step.key] = "in_progress";
		} else {
			stepStatuses[step.key] = "pending";
		}
	}

	const snapshot: ServiceCaseWorkflowSnapshot = {
		currentStepKey: currentState,
		stepStatuses,
	};

	// 2. Build workflow context
	const context = await buildWorkflowContext(caseId);

	// 3. Verify via state machine if we can advance
	const canAdvance = canAdvanceStep(snapshot, context);
	if (!canAdvance.allowed) {
		return {
			success: false,
			error: "TRANSITION_BLOCKED",
			blockers: canAdvance.blockers,
			message: "No se puede avanzar al siguiente paso. Requisitos faltantes.",
		};
	}

	// 4. Perform transition
	const event = getTransitionEvent(currentState);
	const transitionResult = ServiceCaseStateMachine.transition(
		currentState,
		event,
		snapshot,
		context,
	);

	if (transitionResult.status === "blocked") {
		return {
			success: false,
			error: "TRANSITION_BLOCKED",
			blockers: transitionResult.reasons.map((msg) => ({
				code: "STATE_MACHINE_BLOCKED",
				message: msg,
				stepKey: currentState,
				severity: "critical" as const,
			})),
			message:
				"No se puede avanzar al siguiente paso. Transición rechazada por la máquina de estado.",
		};
	}

	const newDomainState = transitionResult.state;
	const newStepCode = domainStateToDbStep(newDomainState);
	const newStage = (STEP_TO_STAGE_MAP[newStepCode] ??
		"intake") as ServiceCaseDocument["currentStage"];

	// 5. Update serviceCase document
	serviceCase.currentStepCode = newStepCode;
	serviceCase.currentStage = newStage;

	const actor = await User.findById(userId);
	const actorRole = actor ? actor.role : "supervisor";

	serviceCase.timeline.push({
		eventId: `evt_${Date.now()}`,
		stage: newStage,
		command: "MANUAL_ADVANCE",
		occurredAt: new Date(),
		actorId: new Types.ObjectId(userId),
		actorRole,
		notes: `Advanced operational step from ${currentStepCode} to ${newStepCode} via domain State Machine`,
	});

	await serviceCase.save();

	// Calculate and save new blockers for the new step
	const newBlockers = await calculateStepBlockers(serviceCase._id.toString());
	await ServiceCase.findByIdAndUpdate(serviceCase._id, {
		blockers: newBlockers.map((blocker) => ({ ...blocker })),
	});

	// 6. Log Audit
	createAuditLog({
		userId,
		entity: "ServiceCase",
		entityId: serviceCase._id.toString(),
		action: "STATE_TRANSITION",
		before: currentStepCode,
		after: newStepCode,
		metadata: {
			previousState: currentState,
			newState: newDomainState,
			stage: newStage,
		},
	});

	// 7. Notify State Transition
	await notifyStateTransition(serviceCase._id.toString(), currentState, newDomainState, userId);

	const updatedCase = await ServiceCase.findById(caseId);
	if (!updatedCase) {
		throw new NotFoundError("ServiceCase", caseId);
	}

	return {
		success: true,
		serviceCase: updatedCase,
	};
}
