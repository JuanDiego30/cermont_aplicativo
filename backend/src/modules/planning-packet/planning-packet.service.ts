import type {
	CreatePlanningPacketInput,
	PlanningPacketStatus,
	UpdatePlanningPacketInput,
} from "@cermont/shared-types";
import { AppError } from "../../common/errors";
import { PlanningPacket } from "../../models/PlanningPacket";

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
		.populate("createdBy", "name email");
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
	userRole: string,
) {
	const planningPacket = await PlanningPacket.findById(id);

	if (!planningPacket) {
		throw new AppError("PLANNING_PACKET_NOT_FOUND", 404, "Planning packet not found");
	}

	// RBAC: Only gerente, residente, supervisor can update
	if (!["gerente", "residente", "supervisor"].includes(userRole)) {
		throw new AppError("FORBIDDEN", 403, "You do not have permission to update planning packets");
	}

	// Cannot update if already approved
	if (planningPacket.status === "approved") {
		throw new AppError("INVALID_OPERATION", 400, "Cannot update an approved planning packet");
	}

	const updatedPacket = await PlanningPacket.findByIdAndUpdate(id, data, {
		new: true,
		runValidators: true,
	})
		.populate("supervisorId", "name email role")
		.populate("hesResponsibleId", "name email role")
		.populate("crew.userId", "name email role")
		.populate("approvedBy", "name email")
		.populate("createdBy", "name email");

	return updatedPacket;
}

/**
 * Validate planning readiness
 * @param id - Planning packet ID
 * @param userId - ID of the user making the validation
 * @param userRole - Role of the user making the validation
 * @returns Updated planning packet with readiness status
 */
export async function validatePlanningReadiness(id: string, userRole: string) {
	const planningPacket = await PlanningPacket.findById(id);

	if (!planningPacket) {
		throw new AppError("PLANNING_PACKET_NOT_FOUND", 404, "Planning packet not found");
	}

	// RBAC: Only gerente, residente, supervisor, HES can validate
	if (!["gerente", "residente", "supervisor", "hes"].includes(userRole)) {
		throw new AppError(
			"FORBIDDEN",
			403,
			"You do not have permission to validate planning readiness",
		);
	}

	// Check readiness criteria
	const allChecklistItemsChecked = planningPacket.readinessChecklist.every((item) => item.checked);
	const noUnresolvedBlockers = planningPacket.blockers.length === 0;
	const hasCrew = planningPacket.crew.length > 0;
	const hasSchedule = planningPacket.schedule !== null;

	// Check required reference documents (ATS, AST, PTW)
	const hasRequiredATS = !planningPacket.astRequired || planningPacket.supportDocuments.some(
		(doc) => (doc.documentType === "ats" || doc.documentType === "ast") && doc.required,
	);
	const hasRequiredPTW = !planningPacket.ptwRequired || planningPacket.supportDocuments.some(
		(doc) => doc.documentType === "ptw" && doc.required,
	);
	const hasRequiredReferenceDocs = hasRequiredATS && hasRequiredPTW;

	let newStatus = planningPacket.status;
	if (allChecklistItemsChecked && noUnresolvedBlockers && hasCrew && hasSchedule && hasRequiredReferenceDocs) {
		newStatus = "ready";
	} else {
		newStatus = "incomplete";
	}

	const updatedPacket = await PlanningPacket.findByIdAndUpdate(
		id,
		{ status: newStatus },
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

	return updatedPacket;
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
	_data: UpdatePlanningPacketInput,
	userId: string,
	userRole: string,
) {
	const planningPacket = await PlanningPacket.findById(id);

	if (!planningPacket) {
		throw new AppError("PLANNING_PACKET_NOT_FOUND", 404, "Planning packet not found");
	}

	// RBAC: Only gerente, residente can approve
	if (!["gerente", "residente"].includes(userRole)) {
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

	const updatedPlanningPacket = await PlanningPacket.findByIdAndUpdate(
		id,
		{
			status: "approved",
			approvedAt: new Date(),
			approvedBy: userId,
		},
		{ new: true, runValidators: true },
	)
		.populate("supervisorId", "name email role")
		.populate("hesResponsibleId", "name email role")
		.populate("crew.userId", "name email role")
		.populate("approvedBy", "name email")
		.populate("createdBy", "name email");

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
	_data: UpdatePlanningPacketInput,
	userId: string,
	userRole: string,
) {
	const planningPacket = await PlanningPacket.findById(id);

	if (!planningPacket) {
		throw new AppError("PLANNING_PACKET_NOT_FOUND", 404, "Planning packet not found");
	}

	// RBAC: Only gerente, residente can reopen
	if (!["gerente", "residente"].includes(userRole)) {
		throw new AppError("FORBIDDEN", 403, "You do not have permission to reopen planning packets");
	}

	// Set status back to draft
	const updatedPacket = await PlanningPacket.findByIdAndUpdate(
		id,
		{
			status: "draft",
			reopenedAt: new Date(),
			reopenedBy: userId,
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

	return updatedPacket;
}

/**
 * Add a reference document to planning packet
 */
export async function addReferenceDocument(
	id: string,
	data: { documentId: string; documentType: string; name: string; required: boolean },
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

	await packet.save();
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
