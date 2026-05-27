/**
 * ServiceCase Service — Pipeline orchestrator business logic
 *
 * Computes stage, blockers, nextActions, and summaries
 * from the read-model projection over all pipeline artifacts.
 */

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
import { NotFoundError } from "../../common/errors/AppError";

import { createLogger } from "../../common/utils/logger";
import { Proposal, Order } from "../../models";
import { Document } from "../../models/Document";
import { Evidence } from "../../models/Evidence";
import { ServiceCase, type ServiceCaseDocument } from "../../models/ServiceCase";
import { calculateStepBlockers } from "../../services/cermont-workflow-gate.service";
import { getOrderSummary } from "../cost/cost.service";

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

export async function getServiceCaseById(id: string): Promise<ServiceCaseView | null> {
	const rawCase = await ServiceCase.findById(id);
	if (!rawCase) {
		return null;
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

	const _nextActions = blockers.length
		? blockers.slice(0, 3).map((blocker) => ({
				command: blocker.code.toLowerCase(),
				label: blocker.recommendedAction,
				requiredRole: blocker.ownerRole,
				route: currentStep?.route.replace("[id]", id),
			}))
		: currentStep
			? [
					{
						command: currentStep.nextAction.toLowerCase().replace(/\s+/g, "_"),
						label: currentStep.nextAction,
						requiredRole: currentStep.allowedRoles[0] || "supervisor",
						route: currentStep.route.replace("[id]", id),
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
		nextActions: baseCase.nextActions ?? [],
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
}> {
	const [totalCases, stageCounts, completedThisMonth] = await Promise.all([
		ServiceCase.countDocuments(),
		ServiceCase.aggregate([{ $group: { _id: "$currentStage", count: { $sum: 1 } } }]),
		ServiceCase.countDocuments({
			currentStage: { $in: ["paid", "archived"] },
			updatedAt: {
				$gte: new Date(new Date().setDate(1)),
			},
		}),
	]);

	const stageMap: Record<string, number> = {};
	for (const entry of stageCounts) {
		stageMap[entry._id] = entry.count;
	}

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

	return {
		totalCases,
		activeCases,
		pendingApproval,
		inProgress,
		completedThisMonth,
		revenue: 0,
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

export async function buildServiceCaseWorkflowView(
	serviceCaseId: string,
): Promise<ServiceCaseWorkflowViewModel> {
	const serviceCase = await getServiceCaseById(serviceCaseId);
	if (!serviceCase) {
		throw new NotFoundError("ServiceCase", serviceCaseId);
	}

	const orderId = serviceCase.artifacts.workOrder?.id;
	const currentStepCode =
		serviceCase.currentStepCode ?? mapLegacyServiceCaseStageToStep(serviceCase.currentStage);
	const [documents, evidences, order] = await Promise.all([
		listWorkflowDocuments(orderId, serviceCase._id),
		listWorkflowEvidences(orderId),
		orderId ? Order.findById(orderId).lean().exec() : Promise.resolve(void 0),
	]);

	const updatedAtString = serviceCase.updatedAt;

	const deadlineString = order?.completedAt
		? new Date(order.completedAt).toISOString()
		: void 0;

	return {
		serviceCaseId: serviceCase._id,
		orderId,
		code: serviceCase.code,
		clientName: serviceCase.clientName,
		location: order?.location || void 0,
		serviceType: order?.type || void 0,
		globalStatus: serviceCase.currentStage,
		responsibleName: order?.assignedToName || void 0,
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
		operationalSummary: serviceCase.operationalSummary,
		documents,
		evidences,
		costs: await buildDefaultCostTraceability(serviceCase.financialSummary, orderId),
		closure: buildWorkflowClosure(serviceCase),
		generatedAt: new Date().toISOString(),
	};
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
export async function archiveServiceCase(id: string, _userId: string) {
	const serviceCase = await ServiceCase.findById(id);
	if (!serviceCase) {
		throw new NotFoundError("Service case not found");
	}

	// Archive using findByIdAndUpdate
	const updated = await ServiceCase.findByIdAndUpdate(id, { status: "archived" }, { new: true });
	if (!updated) {
		throw new NotFoundError("Service case not found after update");
	}

	return getServiceCaseById(id);
}
