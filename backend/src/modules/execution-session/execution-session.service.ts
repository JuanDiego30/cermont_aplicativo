import {
	calculateExecutionBlockers,
	calculateExecutionNextActions,
	canCancelExecution,
	canCompleteExecution,
	canPauseExecution,
	canResumeExecution,
	canStartExecution,
	type ExecutionBlockerCode,
	type ExecutionGateContext,
	type ExecutionNextActionCode,
	type ExecutionReadModel,
	validateExecutionCommandIdempotency,
} from "@cermont/domain";
import type {
	AddExecutionEquipmentUsageCommand,
	AddExecutionEvidenceCommand,
	AddExecutionIncidentCommand,
	AddExecutionLaborEntryCommand,
	AddExecutionMaterialUsageCommand,
	AddExecutionObservationCommand,
	AddExecutionSignatureCommand,
	AddExecutionToolUsageCommand,
	CancelExecutionSessionCommand,
	CompleteExecutionSessionCommand,
	CreateExecutionSessionInput,
	ExecutionCommandResult,
	ExecutionOfflineCommand,
	ExecutionSessionListQuery,
	PauseExecutionSessionCommand,
	ResolveExecutionIncidentCommand,
	ResumeExecutionSessionCommand,
	StartExecutionSessionCommand,
	SubmitExecutionChecklistCommand,
	SubmitExecutionDynamicFormCommand,
} from "@cermont/shared-types";
import { Types } from "mongoose";
import {
	BadRequestError,
	ConflictError,
	NotFoundError,
	UnprocessableError,
} from "../../common/errors";
import type { AuthPayload } from "../../common/utils/request";
import {
	Counter,
	ExecutionSession,
	type ExecutionSessionDocument,
	Order,
	PlanningPacket,
	ServiceCase,
} from "../../models";
import { computeNextActions } from "../service-cases/service-case.service";

type PlanningCrewMemberProjection = {
	userId?: string;
};

type PlanningPacketProjection = {
	_id: string;
	workOrderId: string;
	status: string;
	crew?: PlanningCrewMemberProjection[];
};

type SearchPattern = { $regex: string; $options: "i" };
type SearchClause = { code: SearchPattern };

interface ExecutionSessionQueryFilter {
	workOrderId?: string;
	serviceCaseId?: string;
	status?: string;
	offlineSyncStatus?: string;
	$or?: SearchClause[];
}

const EXECUTION_START_READY_ORDER_STATUSES = [
	"assigned",
	"ready",
	"ready_for_execution",
	"execution_in_progress",
] as const satisfies readonly string[];

const EXECUTION_BLOCKER_MESSAGES: Record<ExecutionBlockerCode, string> = {
	planning_not_approved: "La planeacion no esta aprobada.",
	work_order_not_ready: "La orden de trabajo no esta lista para ejecutar.",
	execution_already_started: "La ejecucion ya fue iniciada.",
	execution_not_started: "La ejecucion aun no ha iniciado.",
	missing_required_checklist: "Faltan respuestas obligatorias de checklist.",
	missing_required_evidence: "Falta evidencia de campo.",
	missing_required_signature: "Falta una firma requerida.",
	missing_labor_entries: "Falta registrar mano de obra.",
	missing_material_usage: "Falta registrar consumo de materiales.",
	open_incident: "Hay incidentes criticos o altos sin resolver.",
	sync_pending: "Hay comandos offline pendientes de sincronizacion.",
	cancelled: "La ejecucion o la orden fue cancelada.",
	already_completed: "La ejecucion ya fue completada.",
};

const EXECUTION_NEXT_ACTIONS: Record<ExecutionNextActionCode, { label: string; route?: string }> = {
	start_execution: { label: "Iniciar ejecucion", route: "/execution" },
	complete_required_checklist: { label: "Completar checklist", route: "/execution" },
	capture_required_evidence: { label: "Cargar evidencias", route: "/evidences" },
	record_material_usage: { label: "Registrar materiales", route: "/execution" },
	record_labor_time: { label: "Registrar mano de obra", route: "/execution" },
	resolve_incident: { label: "Resolver incidentes", route: "/execution" },
	collect_signature: { label: "Recolectar firma", route: "/execution" },
	finish_execution: { label: "Finalizar ejecucion", route: "/execution" },
	sync_pending_commands: { label: "Sincronizar comandos offline", route: "/execution" },
	generate_technical_report: { label: "Generar informe tecnico", route: "/reports" },
};

function toDate(value?: string): Date {
	return value ? new Date(value) : new Date();
}

function toObjectId(value: string | Types.ObjectId): Types.ObjectId {
	return value instanceof Types.ObjectId ? value : new Types.ObjectId(value);
}

function toObjectIdString(value: string | { toString(): string }): string {
	return value.toString();
}

function isExecutionReadyOrderStatus(status: string): boolean {
	return EXECUTION_START_READY_ORDER_STATUSES.some((readyStatus) => readyStatus === status);
}

function isHighOpenIncident(incident: { severity?: object | string; resolved?: object | boolean }) {
	const severity = typeof incident.severity === "string" ? incident.severity : "";
	const resolved = typeof incident.resolved === "boolean" ? incident.resolved : false;
	return !resolved && (severity === "high" || severity === "critical");
}

function buildReadModel(session: ExecutionSessionDocument): ExecutionReadModel {
	const openCriticalIncidentCount = session.incidents.filter((incident) =>
		isHighOpenIncident(incident),
	).length;
	const pendingSyncCount = session.offlineSyncStatus === "pending" ? 1 : 0;

	return {
		status: session.status as ExecutionReadModel["status"],
		checklistResponseCount: session.checklistResponses.length,
		evidenceCount: session.evidences.length + session.evidenceIds.length,
		signatureCount: session.signatures.length,
		laborEntryCount: session.laborEntries.length,
		materialUsageCount: session.materialsUsed.length,
		openCriticalIncidentCount,
		pendingSyncCount,
		clientMutationIds: session.clientMutationIds,
	};
}

function buildGateContext(orderStatus: string, planningStatus: string): ExecutionGateContext {
	return {
		workOrderStatus: orderStatus,
		planningStatus,
		orderCancelled: orderStatus === "cancelled",
	};
}

function mapBlockers(blockers: ExecutionBlockerCode[]) {
	return blockers.map((code) => ({
		code,
		message: EXECUTION_BLOCKER_MESSAGES[code],
		severity: code === "open_incident" ? "critical" : "blocking",
	}));
}

function mapNextActions(actions: ExecutionNextActionCode[]) {
	return actions.map((code) => ({
		code,
		label: EXECUTION_NEXT_ACTIONS[code].label,
		...(EXECUTION_NEXT_ACTIONS[code].route ? { route: EXECUTION_NEXT_ACTIONS[code].route } : {}),
	}));
}

async function findPlanningPacket(
	workOrderId: string,
	planningPacketId?: string,
): Promise<PlanningPacketProjection | null> {
	if (planningPacketId) {
		return PlanningPacket.findById(planningPacketId).lean<PlanningPacketProjection>();
	}

	return PlanningPacket.findOne({ workOrderId })
		.sort({ updatedAt: -1 })
		.lean<PlanningPacketProjection>();
}

async function findServiceCaseForExecution(workOrderId: string, serviceCaseId?: string) {
	if (serviceCaseId) {
		return ServiceCase.findById(serviceCaseId);
	}

	return ServiceCase.findOne({ "artifacts.workOrder.id": toObjectId(workOrderId) });
}

async function generateExecutionCode(): Promise<string> {
	const year = new Date().getFullYear();
	const sequence = await Counter.inc(`EX-${year}`);
	return `EX-${year}-${String(sequence).padStart(4, "0")}`;
}

function extractPlanningCrew(planningPacket: PlanningPacketProjection | null): string[] {
	return (
		planningPacket?.crew
			?.map((member) => member.userId)
			.filter((userId): userId is string => Boolean(userId)) ?? []
	);
}

async function getSessionOrThrow(id: string): Promise<ExecutionSessionDocument> {
	const session = await ExecutionSession.findById(id);

	if (!session) {
		throw new NotFoundError("ExecutionSession", id);
	}

	return session;
}

async function refreshExecutionState(session: ExecutionSessionDocument): Promise<void> {
	const order = await Order.findById(session.workOrderId).lean();
	const planningPacket = await findPlanningPacket(
		toObjectIdString(session.workOrderId),
		session.planningPacketId ? toObjectIdString(session.planningPacketId) : undefined,
	);
	const context = buildGateContext(order?.status ?? "cancelled", planningPacket?.status ?? "draft");
	const readModel = buildReadModel(session);

	session.blockers = mapBlockers(calculateExecutionBlockers(readModel, context));
	session.nextActions = mapNextActions(calculateExecutionNextActions(readModel, context));
}

async function updateServiceCaseProjection(
	session: ExecutionSessionDocument,
	actor: AuthPayload,
	command: string,
	stage: "in_execution" | "technical_closure",
): Promise<void> {
	const serviceCase = await findServiceCaseForExecution(
		toObjectIdString(session.workOrderId),
		session.serviceCaseId ? toObjectIdString(session.serviceCaseId) : undefined,
	);

	if (!serviceCase) {
		return;
	}

	const now = new Date();
	serviceCase.set("artifacts.executionSession", {
		id: session._id,
		code: session.code,
		status: session.status,
		updatedAt: now,
	});
	serviceCase.currentStage = stage;
	serviceCase.nextActions = computeNextActions(stage);
	serviceCase.timeline.push({
		eventId: `${session.code}-${command}-${now.getTime()}`,
		stage,
		command,
		actorId: toObjectId(actor._id),
		actorRole: actor.role,
		occurredAt: now,
	});

	await serviceCase.save();

	if (!session.serviceCaseId) {
		session.serviceCaseId = serviceCase._id;
	}
}

function markCommandProcessed(session: ExecutionSessionDocument, clientMutationId: string): void {
	if (!validateExecutionCommandIdempotency(session.clientMutationIds, clientMutationId)) {
		session.clientMutationIds.push(clientMutationId);
	}
}

function assertCommandNotProcessed(
	session: ExecutionSessionDocument,
	clientMutationId: string,
): boolean {
	return validateExecutionCommandIdempotency(session.clientMutationIds, clientMutationId);
}

export async function listExecutionSessions(query: ExecutionSessionListQuery) {
	const { page, limit, workOrderId, serviceCaseId, status, offlineSyncStatus, search } = query;
	const filter: ExecutionSessionQueryFilter = {};

	if (workOrderId) {
		filter.workOrderId = workOrderId;
	}
	if (serviceCaseId) {
		filter.serviceCaseId = serviceCaseId;
	}
	if (status) {
		filter.status = status;
	}
	if (offlineSyncStatus) {
		filter.offlineSyncStatus = offlineSyncStatus;
	}
	if (search) {
		filter.$or = [{ code: { $regex: search, $options: "i" } }];
	}

	const [data, total] = await Promise.all([
		ExecutionSession.find(filter)
			.sort({ updatedAt: -1 })
			.skip((page - 1) * limit)
			.limit(limit),
		ExecutionSession.countDocuments(filter),
	]);

	return {
		data,
		pagination: {
			page,
			limit,
			total,
			totalPages: Math.ceil(total / limit),
		},
	};
}

export async function getExecutionSessionById(id: string) {
	return getSessionOrThrow(id);
}

export async function getExecutionSessionByWorkOrder(workOrderId: string) {
	const session = await ExecutionSession.findOne({
		workOrderId,
		status: { $ne: "cancelled" },
	}).sort({
		updatedAt: -1,
	});

	if (!session) {
		throw new NotFoundError("ExecutionSession", workOrderId);
	}

	return session;
}

export async function createExecutionSession(
	data: CreateExecutionSessionInput,
	actor: AuthPayload,
) {
	const order = await Order.findById(data.workOrderId);

	if (!order) {
		throw new NotFoundError("Order", data.workOrderId);
	}
	if (order.status === "cancelled") {
		throw new UnprocessableError("Cancelled work orders cannot enter execution", "ORDER_CANCELLED");
	}

	const existing = await ExecutionSession.findOne({
		workOrderId: data.workOrderId,
		status: { $ne: "cancelled" },
	});

	if (existing) {
		return existing;
	}

	const planningPacket = await findPlanningPacket(data.workOrderId, data.planningPacketId);
	const serviceCase = await findServiceCaseForExecution(data.workOrderId, data.serviceCaseId);
	const planningCrew = extractPlanningCrew(planningPacket);
	const assignedCrew = data.assignedCrew.length > 0 ? data.assignedCrew : planningCrew;
	const now = new Date();
	const code = await generateExecutionCode();
	const initialStatus = planningPacket?.status === "approved" ? "ready" : "draft";

	const session = await ExecutionSession.create({
		code,
		workOrderId: data.workOrderId,
		planningPacketId: planningPacket?._id,
		serviceCaseId: serviceCase?._id,
		status: initialStatus,
		assignedCrew,
		clientMutationIds: data.clientMutationId ? [data.clientMutationId] : [],
		createdBy: actor._id,
		lastSyncedAt: now,
	});

	if (initialStatus === "ready" && !isExecutionReadyOrderStatus(order.status)) {
		order.status = "ready_for_execution";
		await order.save();
	}

	await refreshExecutionState(session);
	await updateServiceCaseProjection(session, actor, "create_execution_session", "in_execution");
	await session.save();

	return session;
}

export async function startExecutionSession(
	id: string,
	command: StartExecutionSessionCommand,
	actor: AuthPayload,
) {
	const session = await getSessionOrThrow(id);
	if (assertCommandNotProcessed(session, command.clientMutationId)) {
		return session;
	}

	const order = await Order.findById(session.workOrderId);
	const planningPacket = await findPlanningPacket(
		toObjectIdString(session.workOrderId),
		session.planningPacketId ? toObjectIdString(session.planningPacketId) : undefined,
	);

	if (!order) {
		throw new NotFoundError("Order", toObjectIdString(session.workOrderId));
	}

	const context = buildGateContext(order.status, planningPacket?.status ?? "draft");
	if (!canStartExecution(buildReadModel(session), context)) {
		throw new UnprocessableError("Execution cannot start until planning and order gates pass");
	}

	const startedAt = toDate(command.startedAt);
	session.status = "in_progress";
	session.startedAt = startedAt;
	session.startedBy = toObjectId(actor._id);
	session.offlineSyncStatus = "synced";
	session.lastSyncedAt = new Date();
	if (command.startGps) {
		session.gpsPoints.push({
			...command.startGps,
			capturedAt: new Date(command.startGps.capturedAt),
		});
	}
	markCommandProcessed(session, command.clientMutationId);

	order.status = "execution_in_progress";
	if (!order.startedAt) {
		order.startedAt = startedAt;
	}
	await order.save();

	await refreshExecutionState(session);
	await updateServiceCaseProjection(session, actor, "start_execution", "in_execution");
	await session.save();

	return session;
}

export async function pauseExecutionSession(
	id: string,
	command: PauseExecutionSessionCommand,
	actor: AuthPayload,
) {
	const session = await getSessionOrThrow(id);
	if (assertCommandNotProcessed(session, command.clientMutationId)) {
		return session;
	}
	if (!canPauseExecution(buildReadModel(session))) {
		throw new ConflictError("Only in-progress executions can be paused");
	}

	session.status = "paused";
	session.pausedAt = new Date();
	session.offlineSyncStatus = "synced";
	session.lastSyncedAt = new Date();
	markCommandProcessed(session, command.clientMutationId);
	await refreshExecutionState(session);
	await updateServiceCaseProjection(session, actor, "pause_execution", "in_execution");
	await session.save();

	return session;
}

export async function resumeExecutionSession(
	id: string,
	command: ResumeExecutionSessionCommand,
	actor: AuthPayload,
) {
	const session = await getSessionOrThrow(id);
	if (assertCommandNotProcessed(session, command.clientMutationId)) {
		return session;
	}
	if (!canResumeExecution(buildReadModel(session))) {
		throw new ConflictError("Only paused executions can be resumed");
	}

	session.status = "in_progress";
	session.resumedAt = toDate(command.resumedAt);
	session.offlineSyncStatus = "synced";
	session.lastSyncedAt = new Date();
	markCommandProcessed(session, command.clientMutationId);
	await refreshExecutionState(session);
	await updateServiceCaseProjection(session, actor, "resume_execution", "in_execution");
	await session.save();

	return session;
}

export async function completeExecutionSession(
	id: string,
	command: CompleteExecutionSessionCommand,
	actor: AuthPayload,
) {
	const session = await getSessionOrThrow(id);
	if (assertCommandNotProcessed(session, command.clientMutationId)) {
		return session;
	}
	if (!canCompleteExecution(buildReadModel(session))) {
		throw new UnprocessableError(
			"Execution cannot be completed until required evidence, labor and incidents are resolved",
		);
	}

	const completedAt = toDate(command.completedAt);
	session.status = "completed";
	session.completedAt = completedAt;
	session.completedBy = toObjectId(actor._id);
	session.offlineSyncStatus = "synced";
	session.lastSyncedAt = new Date();
	if (command.endGps) {
		session.gpsPoints.push({ ...command.endGps, capturedAt: new Date(command.endGps.capturedAt) });
	}
	markCommandProcessed(session, command.clientMutationId);

	const order = await Order.findById(session.workOrderId);
	if (order) {
		order.status = "execution_completed";
		order.completedAt = completedAt;
		await order.save();
	}

	await refreshExecutionState(session);
	await updateServiceCaseProjection(session, actor, "complete_execution", "technical_closure");
	await session.save();

	return session;
}

export async function cancelExecutionSession(
	id: string,
	command: CancelExecutionSessionCommand,
	actor: AuthPayload,
) {
	const session = await getSessionOrThrow(id);
	if (assertCommandNotProcessed(session, command.clientMutationId)) {
		return session;
	}
	if (!canCancelExecution(buildReadModel(session))) {
		throw new ConflictError("Completed or cancelled executions cannot be cancelled");
	}

	session.status = "cancelled";
	session.cancelledAt = new Date();
	session.cancellationReason = command.cancellationReason;
	session.offlineSyncStatus = "synced";
	session.lastSyncedAt = new Date();
	markCommandProcessed(session, command.clientMutationId);
	await refreshExecutionState(session);
	await updateServiceCaseProjection(session, actor, "cancel_execution", "in_execution");
	await session.save();

	return session;
}

export async function addExecutionEvidence(
	id: string,
	command: AddExecutionEvidenceCommand,
	_actor: AuthPayload,
) {
	const session = await getSessionOrThrow(id);
	if (assertCommandNotProcessed(session, command.clientMutationId)) {
		return session;
	}

	const evidence = {
		evidenceId: toObjectId(command.evidence.evidenceId),
		type: command.evidence.type,
		phase: command.evidence.phase,
		uploadedBy: toObjectId(command.evidence.uploadedBy),
		uploadedAt: new Date(),
		...(command.evidence.documentId ? { documentId: toObjectId(command.evidence.documentId) } : {}),
		...(command.evidence.description ? { description: command.evidence.description } : {}),
		...(command.evidence.fieldRef ? { fieldRef: command.evidence.fieldRef } : {}),
		...(command.evidence.incidentId ? { incidentId: command.evidence.incidentId } : {}),
		...(command.evidence.materialUsageId
			? { materialUsageId: command.evidence.materialUsageId }
			: {}),
		...(command.evidence.gpsPoint
			? {
					gpsPoint: {
						...command.evidence.gpsPoint,
						capturedAt: new Date(command.evidence.gpsPoint.capturedAt),
					},
				}
			: {}),
	};

	session.evidenceIds.push(evidence.evidenceId);
	session.evidences.push(evidence);
	markCommandProcessed(session, command.clientMutationId);
	await refreshExecutionState(session);
	await session.save();

	return session;
}

export async function addMaterialUsage(
	id: string,
	command: AddExecutionMaterialUsageCommand,
	_actor: AuthPayload,
) {
	const session = await getSessionOrThrow(id);
	if (assertCommandNotProcessed(session, command.clientMutationId)) {
		return session;
	}

	session.materialsUsed.push({
		...command.material,
		recordedAt: new Date(command.material.recordedAt),
	});
	markCommandProcessed(session, command.clientMutationId);
	await refreshExecutionState(session);
	await session.save();

	return session;
}

export async function addToolUsage(
	id: string,
	command: AddExecutionToolUsageCommand,
	_actor: AuthPayload,
) {
	const session = await getSessionOrThrow(id);
	if (assertCommandNotProcessed(session, command.clientMutationId)) {
		return session;
	}

	session.toolsUsed.push({
		...command.tool,
		recordedAt: new Date(command.tool.recordedAt),
	});
	markCommandProcessed(session, command.clientMutationId);
	await session.save();

	return session;
}

export async function addEquipmentUsage(
	id: string,
	command: AddExecutionEquipmentUsageCommand,
	_actor: AuthPayload,
) {
	const session = await getSessionOrThrow(id);
	if (assertCommandNotProcessed(session, command.clientMutationId)) {
		return session;
	}

	if (command.equipment.endedAt) {
		session.equipmentUsed.push({
			...command.equipment,
			startedAt: new Date(command.equipment.startedAt),
			endedAt: new Date(command.equipment.endedAt),
			recordedAt: new Date(command.equipment.recordedAt),
		});
	} else {
		session.equipmentUsed.push({
			...command.equipment,
			startedAt: new Date(command.equipment.startedAt),
			recordedAt: new Date(command.equipment.recordedAt),
		});
	}
	markCommandProcessed(session, command.clientMutationId);
	await session.save();

	return session;
}

export async function addLaborEntry(
	id: string,
	command: AddExecutionLaborEntryCommand,
	_actor: AuthPayload,
) {
	const session = await getSessionOrThrow(id);
	if (assertCommandNotProcessed(session, command.clientMutationId)) {
		return session;
	}

	session.laborEntries.push({
		...command.labor,
		startedAt: new Date(command.labor.startedAt),
		endedAt: new Date(command.labor.endedAt),
	});
	markCommandProcessed(session, command.clientMutationId);
	await refreshExecutionState(session);
	await session.save();

	return session;
}

export async function addIncident(
	id: string,
	command: AddExecutionIncidentCommand,
	_actor: AuthPayload,
) {
	const session = await getSessionOrThrow(id);
	if (assertCommandNotProcessed(session, command.clientMutationId)) {
		return session;
	}

	session.incidents.push({
		...command.incident,
		occurredAt: new Date(command.incident.occurredAt),
		resolved: false,
	});
	markCommandProcessed(session, command.clientMutationId);
	await refreshExecutionState(session);
	await session.save();

	return session;
}

export async function resolveIncident(
	id: string,
	command: ResolveExecutionIncidentCommand,
	actor: AuthPayload,
) {
	const session = await getSessionOrThrow(id);
	if (assertCommandNotProcessed(session, command.clientMutationId)) {
		return session;
	}

	const incident = session.incidents.find(
		(item) => typeof item.incidentId === "string" && item.incidentId === command.incidentId,
	);
	if (!incident) {
		throw new NotFoundError("ExecutionIncident", command.incidentId);
	}

	incident.resolved = true;
	incident.resolvedAt = new Date();
	incident.resolvedBy = toObjectId(actor._id);
	incident.actionTaken = command.actionTaken;
	markCommandProcessed(session, command.clientMutationId);
	await refreshExecutionState(session);
	await session.save();

	return session;
}

export async function addObservation(
	id: string,
	command: AddExecutionObservationCommand,
	_actor: AuthPayload,
) {
	const session = await getSessionOrThrow(id);
	if (assertCommandNotProcessed(session, command.clientMutationId)) {
		return session;
	}

	session.observations.push({
		...command.observation,
		createdAt: new Date(command.observation.createdAt),
	});
	markCommandProcessed(session, command.clientMutationId);
	await session.save();

	return session;
}

export async function addSignature(
	id: string,
	command: AddExecutionSignatureCommand,
	_actor: AuthPayload,
) {
	const session = await getSessionOrThrow(id);
	if (assertCommandNotProcessed(session, command.clientMutationId)) {
		return session;
	}

	session.signatures.push({
		...command.signature,
		signedAt: new Date(command.signature.signedAt),
	});
	markCommandProcessed(session, command.clientMutationId);
	await refreshExecutionState(session);
	await session.save();

	return session;
}

export async function submitChecklistResponse(
	id: string,
	command: SubmitExecutionChecklistCommand,
	_actor: AuthPayload,
) {
	const session = await getSessionOrThrow(id);
	if (assertCommandNotProcessed(session, command.clientMutationId)) {
		return session;
	}

	session.checklistResponses.push({
		...command.response,
		answeredAt: new Date(command.response.answeredAt),
	});
	markCommandProcessed(session, command.clientMutationId);
	await refreshExecutionState(session);
	await session.save();

	return session;
}

export async function submitDynamicFormResponse(
	id: string,
	command: SubmitExecutionDynamicFormCommand,
	_actor: AuthPayload,
) {
	const session = await getSessionOrThrow(id);
	if (assertCommandNotProcessed(session, command.clientMutationId)) {
		return session;
	}

	session.dynamicFormResponses.push({
		...command.response,
		answeredAt: new Date(command.response.answeredAt),
	});
	markCommandProcessed(session, command.clientMutationId);
	await session.save();

	return session;
}

export async function processExecutionCommand(
	id: string,
	command: ExecutionOfflineCommand,
	actor: AuthPayload,
): Promise<ExecutionCommandResult> {
	const session = await getSessionOrThrow(id);
	if (assertCommandNotProcessed(session, command.clientMutationId)) {
		return {
			clientMutationId: command.clientMutationId,
			commandType: command.commandType,
			status: "deduplicated",
		};
	}

	switch (command.commandType) {
		case "start_execution":
			await startExecutionSession(id, command, actor);
			break;
		case "pause_execution":
			await pauseExecutionSession(id, command, actor);
			break;
		case "resume_execution":
			await resumeExecutionSession(id, command, actor);
			break;
		case "complete_execution":
			await completeExecutionSession(id, command, actor);
			break;
		case "cancel_execution":
			await cancelExecutionSession(id, command, actor);
			break;
		case "add_evidence":
			await addExecutionEvidence(id, command, actor);
			break;
		case "add_material_usage":
			await addMaterialUsage(id, command, actor);
			break;
		case "add_tool_usage":
			await addToolUsage(id, command, actor);
			break;
		case "add_equipment_usage":
			await addEquipmentUsage(id, command, actor);
			break;
		case "add_labor_entry":
			await addLaborEntry(id, command, actor);
			break;
		case "add_incident":
			await addIncident(id, command, actor);
			break;
		case "resolve_incident":
			await resolveIncident(id, command, actor);
			break;
		case "add_observation":
			await addObservation(id, command, actor);
			break;
		case "add_signature":
			await addSignature(id, command, actor);
			break;
		case "submit_checklist":
			await submitChecklistResponse(id, command, actor);
			break;
		case "submit_dynamic_form":
			await submitDynamicFormResponse(id, command, actor);
			break;
		default:
			throw new BadRequestError("Unsupported execution command");
	}

	return {
		clientMutationId: command.clientMutationId,
		commandType: command.commandType,
		status: "processed",
	};
}

export async function syncExecutionCommands(
	id: string,
	commands: ExecutionOfflineCommand[],
	actor: AuthPayload,
) {
	const results: ExecutionCommandResult[] = [];

	for (const command of commands) {
		results.push(await processExecutionCommand(id, command, actor));
	}

	return results;
}
