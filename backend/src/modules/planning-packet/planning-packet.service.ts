import { MANAGEMENT_ROLES, PLANNING_ACCESS_ROLES } from "@cermont/domain";
import type {
	AddReferenceDocumentInput,
	ApprovePlanningPacketInput,
	CreatePlanningPacketInput,
	PlanningPacketStatus,
	ReopenPlanningPacketInput,
	UpdatePlanningPacketInput,
} from "@cermont/shared-types";
import mongoose from "mongoose";
import { AppError, ServiceUnavailableError } from "../../common/errors";
import { isTransientDatabaseError } from "../../common/utils/transient-database-error";
import { getKitTemplate, type KitTemplate } from "../../config/kit-templates";
import { Kit } from "../../models/Kit";
import { PlanningPacket } from "../../models/PlanningPacket";
import { createAuditLog } from "../audit/audit.service";

const PLANNING_READINESS_ROLES = [...PLANNING_ACCESS_ROLES, "hes"] as const;
const REQUIRED_PLANNING_RESPONSIBLE_ROLES = [
	"ingeniero_residente",
	"tecnico_electricista",
	"hes",
] as const;
type PlanningReferenceValue = string | Date | { toString(): string };
type PlanningBlockerReadiness = { resolved: boolean };
type PlanningPacketReadinessView = {
	status: PlanningPacketStatus;
	responsibleInspectorId?: PlanningReferenceValue;
	responsibleInspectorName?: string;
	place?: string;
	plannedDate?: Date | string;
	businessUnit?: string;
	scope?: string;
	schedule?: { plannedStartAt?: Date | string };
	crew: Array<{ name?: string; role?: string }>;
	materials: Array<{ description?: string; quantity?: number }>;
	tools: Array<{ available: boolean }>;
	equipment: Array<{ available: boolean; certificateRequired?: boolean }>;
	safetyElements: Array<{ description?: string; quantity?: number }>;
	workerRequirements?: {
		electricistas?: number;
		tecnicosTelecomunicacion?: number;
		instrumentistas?: number;
		obreros?: number;
	};
	responsibles: Array<{
		role: string;
		status?: string;
		userId?: PlanningReferenceValue;
		name?: string;
		signatureEvidenceId?: PlanningReferenceValue;
	}>;
	requiredCertifications: Array<{ verified: boolean }>;
	astRequired: boolean;
	ptwRequired: boolean;
	supportDocuments: Array<{ documentType: string; required: boolean }>;
	readinessChecklist: Array<{ checked: boolean }>;
	blockers: PlanningBlockerReadiness[];
};

function hasAllowedRole(userRole: string, allowedRoles: readonly string[]) {
	return allowedRoles.includes(userRole);
}

function hasCompletePlanningHeader(packet: PlanningPacketReadinessView) {
	return [
		Boolean(packet.responsibleInspectorId || packet.responsibleInspectorName),
		Boolean(packet.place && packet.place.trim().length >= 3),
		Boolean(packet.plannedDate || packet.schedule?.plannedStartAt),
		Boolean(packet.businessUnit),
		Boolean(packet.scope && packet.scope.trim().length >= 20),
	].every(Boolean);
}

function hasCompleteResourcePlan(packet: PlanningPacketReadinessView) {
	const workerRequirements = packet.workerRequirements;
	const totalRequiredWorkers =
		(workerRequirements?.electricistas ?? 0) +
		(workerRequirements?.tecnicosTelecomunicacion ?? 0) +
		(workerRequirements?.instrumentistas ?? 0) +
		(workerRequirements?.obreros ?? 0);

	return [
		packet.crew.length > 0,
		packet.materials.length > 0,
		packet.tools.length > 0 && packet.tools.every((tool) => tool.available),
		packet.equipment.length > 0 && packet.equipment.every((equipment) => equipment.available),
		packet.safetyElements.length > 0,
		totalRequiredWorkers > 0,
	].every(Boolean);
}

function hasRequiredPlanningResponsibles(packet: PlanningPacketReadinessView) {
	return REQUIRED_PLANNING_RESPONSIBLE_ROLES.every((role) =>
		packet.responsibles.some(
			(responsible) =>
				responsible.role === role &&
				responsible.status !== "pending" &&
				Boolean(responsible.userId || responsible.name || responsible.signatureEvidenceId),
		),
	);
}

function hasRequiredReferenceDocuments(packet: PlanningPacketReadinessView) {
	const hasRequiredATS =
		!packet.astRequired ||
		packet.supportDocuments.some(
			(document) =>
				(document.documentType === "ats" || document.documentType === "ast") && document.required,
		);
	const hasRequiredPTW =
		!packet.ptwRequired ||
		packet.supportDocuments.some(
			(document) => document.documentType === "ptw" && document.required,
		);

	return hasRequiredATS && hasRequiredPTW;
}

function hasRequiredCertifications(packet: PlanningPacketReadinessView) {
	const allCertificationsVerified =
		packet.requiredCertifications.length === 0 ||
		packet.requiredCertifications.every((certification) => certification.verified);
	const equipmentRequiresCertification = packet.equipment.some(
		(equipment) => equipment.certificateRequired,
	);
	const hasRequiredEquipmentCertifications =
		!equipmentRequiresCertification ||
		(packet.requiredCertifications.length > 0 && allCertificationsVerified);

	return allCertificationsVerified && hasRequiredEquipmentCertifications;
}

function resolvePlanningReadinessStatus(packet: PlanningPacketReadinessView): PlanningPacketStatus {
	const readinessChecks = [
		packet.readinessChecklist.every((item) => item.checked),
		packet.blockers.every((blocker) => blocker.resolved),
		hasCompletePlanningHeader(packet),
		hasCompleteResourcePlan(packet),
		hasRequiredPlanningResponsibles(packet),
		hasRequiredReferenceDocuments(packet),
		hasRequiredCertifications(packet),
	];

	return readinessChecks.every(Boolean) ? "ready" : "incomplete";
}

function normalizeNumber(value: unknown): number {
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : 0;
}

export async function listPlanningPackets(query: {
	workOrderId?: string;
	status?: PlanningPacketStatus;
	limit: number;
}) {
	const filter: { workOrderId?: string; status?: PlanningPacketStatus } = {};
	if (query.workOrderId) {
		filter.workOrderId = query.workOrderId;
	}
	if (query.status) {
		filter.status = query.status;
	}

	return PlanningPacket.find(filter)
		.sort({ updatedAt: -1 })
		.limit(query.limit)
		.populate("supervisorId", "name email role")
		.populate("hesResponsibleId", "name email role")
		.populate("crew.userId", "name email role")
		.populate("approvedBy", "name email")
		.populate("createdBy", "name email")
		.catch((error: unknown) => {
			if (isTransientDatabaseError(error as Error)) {
				throw new ServiceUnavailableError("Database temporarily unavailable. Please try again.");
			}
			throw error;
		});
}

/**
 * Create a new planning packet
 * @param data - Validated planning packet data
 * @param userId - ID of the user creating the packet
 * @returns Created planning packet
 */
export async function createPlanningPacket(data: CreatePlanningPacketInput, userId: string) {
	const planningPacket = await PlanningPacket.create({
		...data,
		createdBy: userId,
	});

	createAuditLog({
		userId,
		entity: "PlanningPacket",
		entityId: planningPacket._id.toString(),
		action: "PLANNING_PACKET_CREATED",
		after: {
			status: planningPacket.status,
			workOrderId: planningPacket.workOrderId?.toString(),
		},
	});

	return planningPacket;
}

/**
 * Get planning packet by ID
 * @param id - Planning packet ID
 * @param userId - ID of the user making the request
 * @param userRole - Role of the user making the request
 * @returns Planning packet
 */
export async function getPlanningPacketById(id: string) {
	const planningPacket = await PlanningPacket.findById(id)
		.populate("workOrderId")
		.populate("supervisorId", "name email role")
		.populate("hesResponsibleId", "name email role")
		.populate("crew.userId", "name email role")
		.populate("approvedBy", "name email")
		.populate("createdBy", "name email");

	if (!planningPacket) {
		throw new AppError("PLANNING_PACKET_NOT_FOUND", 404, "Planning packet not found");
	}

	return planningPacket;
}

/**
 * Get planning packet by work order ID
 * @param workOrderId - Work order ID
 * @param userId - ID of the user making the request
 * @param userRole - Role of the user making the request
 * @returns Planning packet
 */
export async function getPlanningPacketByWorkOrderId(workOrderId: string) {
	const planningPacket = await PlanningPacket.findOne({ workOrderId })
		.populate("supervisorId", "name email role")
		.populate("hesResponsibleId", "name email role")
		.populate("crew.userId", "name email role")
		.populate("approvedBy", "name email")
		.populate("createdBy", "name email");

	return planningPacket;
}

/**
 * Update a planning packet
 * @param id - Planning packet ID
 * @param data - Validated update data
 * @param userId - ID of the user making the update
 * @param userRole - Role of the user making the update
 * @returns Updated planning packet
 */
export async function updatePlanningPacket(
	id: string,
	data: UpdatePlanningPacketInput,
	userId: string,
	userRole: string,
) {
	const planningPacket = await PlanningPacket.findById(id);

	if (!planningPacket) {
		throw new AppError("PLANNING_PACKET_NOT_FOUND", 404, "Planning packet not found");
	}

	// RBAC: Only gerente, residente, supervisor can update
	if (!hasAllowedRole(userRole, PLANNING_ACCESS_ROLES)) {
		throw new AppError("FORBIDDEN", 403, "You do not have permission to update planning packets");
	}

	// Cannot update costs or status if already approved and frozen
	if (
		planningPacket.status === "approved" &&
		(planningPacket.toObject() as Record<string, unknown>).costBaselineSnapshot
	) {
		const costFieldsChanged =
			data.materials !== undefined ||
			data.tools !== undefined ||
			data.equipment !== undefined ||
			data.safetyElements !== undefined;
		if (costFieldsChanged) {
			throw new AppError(
				"COST_BASELINE_FROZEN",
				409,
				"Cannot update costs after planning approval. Cost baseline is frozen.",
			);
		}
	}

	const updatedPacket = await PlanningPacket.findByIdAndUpdate(
		id,
		{ ...data, updatedBy: userId },
		{
			new: true,
			runValidators: true,
		},
	)
		.populate("supervisorId", "name email role")
		.populate("hesResponsibleId", "name email role")
		.populate("crew.userId", "name email role")
		.populate("approvedBy", "name email")
		.populate("createdBy", "name email");

	createAuditLog({
		userId,
		entity: "PlanningPacket",
		entityId: id,
		action: "PLANNING_PACKET_UPDATED",
		before: { status: planningPacket.status },
		after: { ...data },
	});

	return updatedPacket;
}

/**
 * Validate planning readiness
 * @param id - Planning packet ID
 * @param userId - ID of the user making the validation
 * @param userRole - Role of the user making the validation
 * @returns Updated planning packet with readiness status
 */
export async function validatePlanningReadiness(id: string, userId: string, userRole: string) {
	const planningPacket = await PlanningPacket.findById(id);

	if (!planningPacket) {
		throw new AppError("PLANNING_PACKET_NOT_FOUND", 404, "Planning packet not found");
	}

	// RBAC: Only gerente, residente, supervisor, HES can validate
	if (!hasAllowedRole(userRole, PLANNING_READINESS_ROLES)) {
		throw new AppError(
			"FORBIDDEN",
			403,
			"You do not have permission to validate planning readiness",
		);
	}

	const newStatus = resolvePlanningReadinessStatus(
		planningPacket as unknown as PlanningPacketReadinessView,
	);

	const updatedPacket = await PlanningPacket.findByIdAndUpdate(
		id,
		{ status: newStatus, updatedBy: userId },
		{
			new: true,
			runValidators: true,
		},
	)
		.populate("supervisorId", "name email role")
		.populate("hesResponsibleId", "name email role")
		.populate("crew.userId", "name email role")
		.populate("approvedBy", "name email")
		.populate("createdBy", "name email");

	createAuditLog({
		userId,
		entity: "PlanningPacket",
		entityId: id,
		action: "PLANNING_PACKET_VALIDATED",
		after: { status: newStatus },
	});

	return updatedPacket;
}

function computeCostBaseline(packet: {
	materials: Array<{ quantity?: number }>;
	tools: Array<{ quantity?: number; specifications?: string | null }>;
	equipment: Array<{ quantity?: number }>;
	safetyElements: Array<{ quantity?: number }>;
	crewSize: number;
}) {
	const estimateUnitCost = (item: {
		quantity?: number;
		specifications?: string | null;
	}): number => {
		const quantity = normalizeNumber(item.quantity);
		const note = (item.specifications || "").toLowerCase();
		const premium =
			note.includes("certificado") || note.includes("especializado") || note.includes("industrial")
				? 1.25
				: 1;
		return quantity * 50000 * premium;
	};

	const laborCosts = packet.crewSize * 50000;
	const materialCosts = packet.materials.reduce((sum, item) => {
		const quantity = normalizeNumber(item.quantity);
		return sum + quantity * 25000;
	}, 0);
	const equipmentCosts = packet.equipment.reduce((sum, item) => sum + estimateUnitCost(item), 0);

	const totalBudget = laborCosts + materialCosts + equipmentCosts;
	const contingencyPercentage = 0.1;
	const contingencyAmount = totalBudget * contingencyPercentage;
	const grandTotal = totalBudget + contingencyAmount;

	return {
		laborCosts,
		materialCosts,
		equipmentCosts,
		totalBudget,
		contingencyPercentage,
		contingencyAmount,
		grandTotal,
	};
}

/**
 * Approve a planning packet
 * @param id - Planning packet ID
 * @param data - Approval data
 * @param userId - ID of the user making the approval
 * @param userRole - Role of the user making the approval
 * @returns Updated planning packet
 */
export async function approvePlanningPacket(
	id: string,
	data: ApprovePlanningPacketInput,
	userId: string,
	userRole: string,
) {
	const planningPacket = await PlanningPacket.findById(id);

	if (!planningPacket) {
		throw new AppError("PLANNING_PACKET_NOT_FOUND", 404, "Planning packet not found");
	}

	// RBAC: Only gerente, residente can approve
	if (!hasAllowedRole(userRole, MANAGEMENT_ROLES)) {
		throw new AppError("FORBIDDEN", 403, "You do not have permission to approve planning packets");
	}

	// Can only approve if ready
	if (planningPacket.status !== "ready") {
		throw new AppError(
			"INVALID_OPERATION",
			400,
			"Can only approve planning packets in 'ready' status",
		);
	}

	const costBaseline = computeCostBaseline({
		materials: planningPacket.materials as unknown as Array<{ quantity?: number }>,
		tools: planningPacket.tools as unknown as Array<{
			quantity?: number;
			specifications?: string | null;
		}>,
		equipment: planningPacket.equipment as unknown as Array<{ quantity?: number }>,
		safetyElements: planningPacket.safetyElements as unknown as Array<{ quantity?: number }>,
		crewSize: planningPacket.crew.length,
	});

	const updatedPlanningPacket = await PlanningPacket.findByIdAndUpdate(
		id,
		{
			status: "approved",
			approvedAt: new Date(),
			approvedBy: userId,
			approvalNotes: data.notes,
			costBaselineSnapshot: {
				frozenAt: new Date(),
				frozenBy: userId,
				...costBaseline,
			},
			updatedBy: userId,
		},
		{ new: true, runValidators: true },
	)
		.populate("supervisorId", "name email role")
		.populate("hesResponsibleId", "name email role")
		.populate("crew.userId", "name email role")
		.populate("approvedBy", "name email")
		.populate("createdBy", "name email");

	createAuditLog({
		userId,
		entity: "PlanningPacket",
		entityId: id,
		action: "PLANNING_PACKET_APPROVED",
		after: {
			status: "approved",
			approvedBy: userId,
			notes: data.notes,
			costBaselineSnapshot: updatedPlanningPacket?.toObject().costBaselineSnapshot,
		},
	});

	return updatedPlanningPacket;
}

/**
 * Reopen a planning packet
 * @param id - Planning packet ID
 * @param data - Reopen data with reason
 * @param userId - ID of the user reopening the packet
 * @param userRole - Role of the user reopening the packet
 * @returns Updated planning packet
 */
export async function reopenPlanningPacket(
	id: string,
	data: ReopenPlanningPacketInput,
	userId: string,
	userRole: string,
) {
	const planningPacket = await PlanningPacket.findById(id);

	if (!planningPacket) {
		throw new AppError("PLANNING_PACKET_NOT_FOUND", 404, "Planning packet not found");
	}

	// RBAC: Only gerente, residente can reopen
	if (!hasAllowedRole(userRole, MANAGEMENT_ROLES)) {
		throw new AppError("FORBIDDEN", 403, "You do not have permission to reopen planning packets");
	}

	// Set status back to draft
	const updatedPacket = await PlanningPacket.findByIdAndUpdate(
		id,
		{
			status: "draft",
			reopenedAt: new Date(),
			reopenedBy: userId,
			reopenReason: data.reason,
			costBaselineSnapshot: undefined,
			updatedBy: userId,
		},
		{
			new: true,
			runValidators: true,
		},
	)
		.populate("supervisorId", "name email role")
		.populate("hesResponsibleId", "name email role")
		.populate("crew.userId", "name email role")
		.populate("approvedBy", "name email")
		.populate("createdBy", "name email");

	createAuditLog({
		userId,
		entity: "PlanningPacket",
		entityId: id,
		action: "PLANNING_PACKET_REOPENED",
		before: { status: planningPacket.status },
		after: { status: "draft", reason: data.reason },
	});

	return updatedPacket;
}

/**
 * Add a reference document to planning packet
 */
export async function addReferenceDocument(
	id: string,
	data: AddReferenceDocumentInput,
	userId: string,
) {
	const packet = await PlanningPacket.findById(id);
	if (!packet) {
		throw new AppError("PLANNING_PACKET_NOT_FOUND", 404, "Planning packet not found");
	}

	packet.supportDocuments.push({
		documentId: data.documentId,
		name: data.name,
		documentType: data.documentType,
		required: data.required,
		uploadedAt: new Date(),
	});
	packet.set("updatedBy", userId);

	await packet.save();

	createAuditLog({
		userId,
		entity: "PlanningPacket",
		entityId: id,
		action: "REFERENCE_DOCUMENT_ADDED",
		after: {
			documentType: data.documentType,
			name: data.name,
		},
	});

	return packet;
}

/**
 * List reference documents for a planning packet
 */
export async function listReferenceDocuments(id: string) {
	const packet = await PlanningPacket.findById(id);
	if (!packet) {
		throw new AppError("PLANNING_PACKET_NOT_FOUND", 404, "Planning packet not found");
	}
	return packet.supportDocuments;
}

interface ResourceWithQuantity {
	quantity?: number;
	[key: string]: unknown;
}

/**
 * Helper to merge resources by name/description key
 */
function mergeResources<T extends ResourceWithQuantity>(
	existing: T[],
	incoming: T[],
	nameKey: keyof T,
): T[] {
	const merged = [...existing];
	for (const item of incoming) {
		const keyVal = String(item[nameKey] || "")
			.toLowerCase()
			.trim();
		const idx = merged.findIndex(
			(x) =>
				String(x[nameKey] || "")
					.toLowerCase()
					.trim() === keyVal,
		);
		if (idx >= 0) {
			const existingItem = merged[idx];
			merged[idx] = {
				...existingItem,
				quantity: (existingItem.quantity || 0) + (item.quantity || 0),
			} as T;
		} else {
			merged.push(item);
		}
	}
	return merged;
}

interface DbKitItem {
	type: string;
	name: string;
	quantity?: number;
	description?: string;
	required?: boolean;
	unit?: string;
}

interface DbKit {
	_id: mongoose.Types.ObjectId | string;
	name: string;
	category?: string;
	version?: number | string;
	items: DbKitItem[];
}

function mapDbKit(dbKit: DbKit) {
	const items = Array.isArray(dbKit.items) ? dbKit.items : [];
	const kitSnapshot = {
		kitTemplateId: String(dbKit._id),
		name: dbKit.name,
		code: dbKit.category || "",
		version: String(dbKit.version || "1"),
		activityType: dbKit.category || "general",
		tools: items
			.filter((i) => i.type === "tool")
			.map((i) => ({
				name: i.name,
				quantity: i.quantity || 1,
				available: true,
				specifications: i.description || "",
			})),
		equipment: items
			.filter((i) => i.type === "equipment")
			.map((i) => ({
				name: i.name,
				quantity: i.quantity || 1,
				available: true,
				certificateRequired: i.required || false,
			})),
		minimumPpe: items.filter((i) => i.type === "ppe").map((i) => i.name),
	};

	const toolsToMerge = kitSnapshot.tools;
	const equipmentToMerge = kitSnapshot.equipment;
	const materialsToMerge = items
		.filter((i) => i.type === "material")
		.map((i) => ({
			description: i.name,
			quantity: i.quantity || 1,
			unit: i.unit || "unidad",
		}));
	const safetyElementsToMerge = items
		.filter((i) => i.type === "ppe")
		.map((i) => ({
			description: i.name,
			quantity: i.quantity || 1,
			unit: i.unit || "unidad",
		}));

	return {
		kitSnapshot,
		toolsToMerge,
		equipmentToMerge,
		materialsToMerge,
		safetyElementsToMerge,
	};
}

function mapStaticKit(staticKit: KitTemplate) {
	const kitSnapshot = {
		kitTemplateId: staticKit.id,
		name: staticKit.name,
		code: staticKit.id,
		version: "1",
		activityType: staticKit.type,
		tools: [] as Array<{ name: string; quantity: number; available: boolean }>,
		equipment: [] as Array<{
			name: string;
			quantity: number;
			available: boolean;
			certificateRequired: boolean;
		}>,
		minimumPpe: [] as string[],
	};

	const materialsToMerge = staticKit.materials.map((m) => ({
		description: m.name,
		quantity: m.quantity || 1,
		unit: m.unit || "unidad",
	}));

	return {
		kitSnapshot,
		toolsToMerge: [] as Array<{ name: string; quantity: number; available: boolean }>,
		equipmentToMerge: [] as Array<{
			name: string;
			quantity: number;
			available: boolean;
			certificateRequired: boolean;
		}>,
		materialsToMerge,
		safetyElementsToMerge: [] as Array<{ description: string; quantity: number; unit: string }>,
	};
}

/**
 * Apply a kit template to a planning packet
 * @param id - Planning packet ID
 * @param kitTemplateId - ID of the dynamic kit or static kit template
 * @param userId - ID of the user making the request
 * @param userRole - Role of the user making the request
 * @returns Updated planning packet
 */
export async function applyKitToPlanningPacket(
	id: string,
	kitTemplateId: string,
	userId: string,
	userRole: string,
) {
	const planningPacket = await PlanningPacket.findById(id);

	if (!planningPacket) {
		throw new AppError("PLANNING_PACKET_NOT_FOUND", 404, "Planning packet not found");
	}

	// RBAC: Only gerente, residente, supervisor can modify
	if (!hasAllowedRole(userRole, PLANNING_ACCESS_ROLES)) {
		throw new AppError("FORBIDDEN", 403, "You do not have permission to modify planning packets");
	}

	// Cannot update if already approved and frozen
	if (
		planningPacket.status === "approved" &&
		(planningPacket.toObject() as Record<string, unknown>).costBaselineSnapshot
	) {
		throw new AppError(
			"COST_BASELINE_FROZEN",
			400,
			"Cannot modify planning packet after approval. Cost baseline is frozen.",
		);
	}

	// 1. Try to load dynamic kit from MongoDB if it's a valid ObjectId
	let dbKit: DbKit | null = null;
	if (mongoose.Types.ObjectId.isValid(kitTemplateId)) {
		dbKit = (await Kit.findById(kitTemplateId)) as unknown as DbKit | null;
	}

	const { kitSnapshot, toolsToMerge, equipmentToMerge, materialsToMerge, safetyElementsToMerge } =
		dbKit
			? mapDbKit(dbKit)
			: (() => {
					const staticKit = getKitTemplate(kitTemplateId);
					if (!staticKit || "status" in staticKit) {
						throw new AppError(
							"KIT_TEMPLATE_NOT_FOUND",
							404,
							`Kit template not found: ${kitTemplateId}`,
						);
					}
					return mapStaticKit(staticKit);
				})();

	// Merge resources into the planning packet
	const updatedTools = mergeResources(planningPacket.tools || [], toolsToMerge, "name");
	const updatedEquipment = mergeResources(planningPacket.equipment || [], equipmentToMerge, "name");
	const updatedMaterials = mergeResources(
		planningPacket.materials || [],
		materialsToMerge,
		"description",
	);
	const updatedSafety = mergeResources(
		planningPacket.safetyElements || [],
		safetyElementsToMerge,
		"description",
	);

	planningPacket.kitTemplateId = kitTemplateId;
	planningPacket.kitSnapshot = kitSnapshot as typeof planningPacket.kitSnapshot;
	planningPacket.tools.splice(0, planningPacket.tools.length, ...updatedTools);
	planningPacket.equipment.splice(0, planningPacket.equipment.length, ...updatedEquipment);
	planningPacket.materials.splice(0, planningPacket.materials.length, ...updatedMaterials);
	planningPacket.safetyElements.splice(0, planningPacket.safetyElements.length, ...updatedSafety);

	// Recalculate status based on new resource plan
	planningPacket.status = resolvePlanningReadinessStatus(
		planningPacket as unknown as PlanningPacketReadinessView,
	);
	planningPacket.set("updatedBy", userId);

	await planningPacket.save();

	// Return fully populated packet
	return getPlanningPacketById(String(planningPacket._id));
}
