import type {
	CreateWorkRequestInput,
	ListWorkRequestsQuery,
	ScheduleVisitInput,
	WorkRequestStatus,
} from "@cermont/shared-types";
import { Types } from "mongoose";
import { AppError } from "../../common/errors";
import type { AuthClaims } from "../../common/utils/request";
import { Counter, ServiceCase, WorkRequest } from "../../models";

const WORK_REQUEST_STATUS_TRANSITIONS: Record<WorkRequestStatus, WorkRequestStatus[]> = {
	draft: ["submitted", "cancelled"],
	submitted: ["qualified", "visit_required", "cancelled"],
	qualified: ["proposal_pending", "cancelled"],
	visit_required: ["qualified", "proposal_pending", "cancelled"],
	proposal_pending: ["cancelled"],
	cancelled: [],
};

function buildWorkRequestCode(sequence: number, createdAt: Date): string {
	return `WR-${createdAt.getFullYear()}-${String(sequence).padStart(4, "0")}`;
}

type SearchPattern = { $regex: string; $options: "i" };
type SearchClause =
	| { shortDescription: SearchPattern }
	| { description: SearchPattern }
	| { requesterName: SearchPattern }
	| { clientName: SearchPattern };

interface WorkRequestQueryFilter {
	archived: boolean;
	requesterId?: string;
	status?: { $in: WorkRequestStatus[] };
	urgency?: string;
	clientId?: string;
	assignedTo?: string;
	$or?: SearchClause[];
}

/**
 * Create a new work request
 * @param data - Validated work request data
 * @param userId - ID of the user creating the request
 * @returns Created work request
 */
export async function createWorkRequest(data: CreateWorkRequestInput, userId: string) {
	const now = new Date();
	const sequence = await Counter.inc(`WR-${now.getFullYear()}`);
	const workRequest = await WorkRequest.create({
		...data,
		code: buildWorkRequestCode(sequence, now),
		status: "submitted",
		requesterId: userId,
		createdBy: userId,
		updatedBy: userId,
	});

	// Create linked service case for the 14-step workflow
	const scSequence = await Counter.inc(`SC-${now.getFullYear()}`);
	const scCode = `SC-${now.getFullYear()}-${String(scSequence).padStart(4, "0")}`;
	const serviceCase = await ServiceCase.create({
		code: scCode,
		clientName: data.clientName,
		currentStage: "intake",
		currentStepCode: "step_01_work_request",
		artifacts: {
			workRequest: {
				id: workRequest._id,
				code: workRequest.code,
				status: workRequest.status,
				updatedAt: now,
			},
		},
		nextActions: [
			{
				command: data.requiresSiteVisit ? "create_site_visit" : "create_proposal",
				label: data.requiresSiteVisit
					? "Registrar visita tecnica"
					: "Crear propuesta economica",
				requiredRole: "residente",
				route: data.requiresSiteVisit ? "/site-visits/new" : "/proposals/new",
			},
		],
		timeline: [
			{
				eventId: `wr_created_${workRequest._id}`,
				stage: "intake",
				command: "work_request_created",
				actorId: new Types.ObjectId(userId),
				actorRole: "requester",
				occurredAt: now,
				notes: `Solicitud ${workRequest.code} registrada`,
			},
		],
	});

	return { workRequest, serviceCase };
}

/**
 * Get work requests with filtering and pagination
 * @param query - Query parameters for filtering and pagination
 * @param userId - ID of the user making the request
 * @param userRole - Role of the user making the request
 * @returns Paginated list of work requests
 */
export async function getWorkRequests(
	query: ListWorkRequestsQuery,
	userId: string,
	userRole: string,
) {
	const { page, limit, status, urgency, clientId, assignedTo, search } = query;

	// Build filter based on RBAC
	const filter: WorkRequestQueryFilter = { archived: false };

	// RBAC: Clients can only see their own requests
	if (userRole === "cliente") {
		filter.requesterId = userId;
	}

	// Apply query filters
	if (status?.length) {
		filter.status = { $in: status };
	}
	if (urgency) {
		filter.urgency = urgency;
	}
	if (clientId) {
		filter.clientId = clientId;
	}
	if (assignedTo) {
		filter.assignedTo = assignedTo;
	}
	if (search) {
		filter.$or = [
			{ shortDescription: { $regex: search, $options: "i" } },
			{ description: { $regex: search, $options: "i" } },
			{ requesterName: { $regex: search, $options: "i" } },
			{ clientName: { $regex: search, $options: "i" } },
		];
	}

	const workRequests = await WorkRequest.find(filter)
		.sort({ createdAt: -1 })
		.limit(limit)
		.skip((page - 1) * limit)
		.populate("createdBy", "name email");

	const total = await WorkRequest.countDocuments(filter);

	return {
		data: workRequests,
		pagination: {
			page,
			limit,
			total,
			totalPages: Math.ceil(total / limit),
		},
	};
}

/**
 * Get a work request by ID
 * @param id - Work request ID
 * @param userId - ID of the user making the request
 * @param userRole - Role of the user making the request
 * @returns Work request
 */
export async function getWorkRequestById(id: string, userId: string, userRole: string) {
	const workRequest = await WorkRequest.findById(id).populate("createdBy", "name email");

	if (!workRequest) {
		throw new AppError("WORK_REQUEST_NOT_FOUND", 404, "Work request not found");
	}

	// RBAC: Clients can only view their own requests
	if (userRole === "cliente" && workRequest.requesterId.toString() !== userId) {
		throw new AppError("FORBIDDEN", 403, "You can only view your own work requests");
	}

	return workRequest;
}

/**
 * Update a work request
 * @param id - Work request ID
 * @param data - Validated update data
 * @param userId - ID of the user making the update
 * @param userRole - Role of the user making the update
 * @returns Updated work request
 */
export async function updateWorkRequest(
	id: string,
	data: Partial<CreateWorkRequestInput>,
	userId: string,
	userRole: string,
) {
	const workRequest = await WorkRequest.findById(id);

	if (!workRequest) {
		throw new AppError("WORK_REQUEST_NOT_FOUND", 404, "Work request not found");
	}

	// RBAC: Clients can only update their own requests
	if (userRole === "cliente" && workRequest.requesterId.toString() !== userId) {
		throw new AppError("FORBIDDEN", 403, "You can only update your own work requests");
	}

	const updatedWorkRequest = await WorkRequest.findByIdAndUpdate(
		id,
		{ ...data, updatedBy: userId },
		{
			new: true,
			runValidators: true,
		},
	).populate("createdBy", "name email");

	return updatedWorkRequest;
}

/**
 * Update work request status
 * @param id - Work request ID
 * @param status - New status
 * @param userId - ID of the user making the update
 * @param userRole - Role of the user making the update
 * @returns Updated work request
 */
export async function updateWorkRequestStatus(
	id: string,
	status: WorkRequestStatus,
	userId: string,
	userRole: string,
) {
	const workRequest = await WorkRequest.findById(id);

	if (!workRequest) {
		throw new AppError("WORK_REQUEST_NOT_FOUND", 404, "Work request not found");
	}

	// RBAC: Only gerente, residente, HES can update status
	if (!["gerente", "residente", "hes"].includes(userRole)) {
		throw new AppError("FORBIDDEN", 403, "You do not have permission to update status");
	}

	const allowedTransitions = WORK_REQUEST_STATUS_TRANSITIONS[workRequest.status];
	if (!allowedTransitions.includes(status)) {
		throw new AppError(
			"INVALID_STATUS_TRANSITION",
			400,
			`Cannot transition from ${workRequest.status} to ${status}`,
		);
	}

	const updatedWorkRequest = await WorkRequest.findByIdAndUpdate(
		id,
		{ status, updatedBy: userId },
		{
			new: true,
			runValidators: true,
		},
	).populate("createdBy", "name email");

	return updatedWorkRequest;
}

/**
 * Delete (soft delete) a work request
 * @param id - Work request ID
 * @param userId - ID of the user making the deletion
 * @param userRole - Role of the user making the deletion
 * @returns Deleted work request
 */
export async function deleteWorkRequest(id: string, userId: string, userRole: string) {
	const workRequest = await WorkRequest.findById(id);

	if (!workRequest) {
		throw new AppError("WORK_REQUEST_NOT_FOUND", 404, "Work request not found");
	}

	// RBAC: Only gerente can delete
	if (userRole !== "gerente") {
		throw new AppError("FORBIDDEN", 403, "Only gerente can delete work requests");
	}

	// Soft delete by setting status to cancelled
	const deletedWorkRequest = await WorkRequest.findByIdAndUpdate(
		id,
		{ status: "cancelled", updatedBy: userId },
		{
			new: true,
			runValidators: true,
		},
	);

	return deletedWorkRequest;
}

/**
 * Create site visit for work request
 * @param workRequestId - Work request ID
 * @param data - Schedule visit input
 * @param userId - ID of the user creating the visit
 * @returns Created site visit
 */
export async function createSiteVisit(
	workRequestId: string,
	data: ScheduleVisitInput,
	userId: string,
) {
	const workRequest = await WorkRequest.findById(workRequestId);

	if (!workRequest) {
		throw new AppError("WORK_REQUEST_NOT_FOUND", 404, "Work request not found");
	}

	// Update the work request with visit information
	const visitUpdate: {
		scheduledAt: Date;
		technicianId: Types.ObjectId;
		technicianName: string;
		notes?: string;
		evidences: never[];
	} = {
		scheduledAt: new Date(data.scheduledAt),
		technicianId: new Types.ObjectId(data.technicianId),
		technicianName: data.technicianName,
		notes: data.notes,
		evidences: [],
	};

	// Set work request status to visit_required if not already qualified
	if (workRequest.status === "submitted" || workRequest.status === "qualified") {
		workRequest.status = "visit_required";
		workRequest.visit = {
			...visitUpdate,
		};
		workRequest.updatedBy = new Types.ObjectId(userId);
		await workRequest.save();
	} else {
		workRequest.visit = {
			...visitUpdate,
		};
		workRequest.updatedBy = new Types.ObjectId(userId);
		await workRequest.save();
	}

	// Create linked service case entry
	const now = new Date();
	const serviceCase = await ServiceCase.findOne({
		"artifacts.workRequest.id": workRequest._id,
	});

	if (serviceCase) {
		serviceCase.currentStage = "assessment";
		serviceCase.currentStepCode = "step_02_site_visit";
		serviceCase.artifacts.siteVisit = {
			id: workRequest._id,
			code: workRequest.code,
			status: "scheduled",
			updatedAt: now,
		};
		serviceCase.nextActions = [
			{
				command: "complete_site_visit",
				label: "Completar visita tecnica",
				requiredRole: "tecnico",
				route: `/site-visits/${workRequest._id}`,
			},
		];
		serviceCase.timeline.push({
			eventId: `visit_scheduled_${workRequest._id}`,
			stage: "assessment",
			command: "site_visit_scheduled",
			actorId: new Types.ObjectId(userId),
			actorRole: "supervisor",
			occurredAt: now,
			notes: `Visita programada para solicitud ${workRequest.code}`,
		});
		await serviceCase.save();
	}

	return { workRequest, serviceCase };
}

/**
 * List site visits for work request
 * @param workRequestId - Work request ID
 * @param user - Authenticated user
 * @returns Array of site visits (embedded in work request)
 */
export async function listSiteVisits(
	workRequestId: string,
	_user: AuthClaims,
): Promise<{ visits: { scheduledAt?: Date; technicianName?: string; status: string }[] }> {
	const workRequest = await WorkRequest.findById(workRequestId);

	if (!workRequest) {
		throw new AppError("WORK_REQUEST_NOT_FOUND", 404, "Work request not found");
	}

	// Return the visit information (embedded) or empty array
	const visits = workRequest.visit
		? [
				{
					scheduledAt: workRequest.visit.scheduledAt,
					technicianName: workRequest.visit.technicianName,
					status: "scheduled",
				},
			]
		: [];

	return { visits };
}
