export type ExecutionSessionStatus =
	| "draft"
	| "ready"
	| "in_progress"
	| "paused"
	| "completed"
	| "cancelled"
	| "sync_pending"
	| "sync_failed";

export type ExecutionBlockerCode =
	| "planning_not_approved"
	| "work_order_not_ready"
	| "execution_already_started"
	| "execution_not_started"
	| "missing_required_checklist"
	| "missing_required_evidence"
	| "missing_required_signature"
	| "missing_labor_entries"
	| "missing_material_usage"
	| "open_incident"
	| "sync_pending"
	| "cancelled"
	| "already_completed";

export type ExecutionNextActionCode =
	| "start_execution"
	| "complete_required_checklist"
	| "capture_required_evidence"
	| "record_material_usage"
	| "record_labor_time"
	| "resolve_incident"
	| "collect_signature"
	| "finish_execution"
	| "sync_pending_commands"
	| "generate_technical_report";

export interface ExecutionReadModel {
	status: ExecutionSessionStatus;
	checklistResponseCount: number;
	evidenceCount: number;
	signatureCount: number;
	laborEntryCount: number;
	materialUsageCount: number;
	openCriticalIncidentCount: number;
	pendingSyncCount: number;
	clientMutationIds: readonly string[];
}

export interface ExecutionGateContext {
	workOrderStatus: string;
	planningStatus: string;
	orderCancelled: boolean;
}

export function canCreateExecutionSession(context: Pick<ExecutionGateContext, "orderCancelled">) {
	return !context.orderCancelled;
}

export function canStartExecution(session: ExecutionReadModel, context: ExecutionGateContext) {
	return calculateExecutionBlockers(session, context).every(
		(blocker) =>
			blocker !== "planning_not_approved" &&
			blocker !== "work_order_not_ready" &&
			blocker !== "execution_already_started" &&
			blocker !== "cancelled" &&
			blocker !== "already_completed",
	);
}

export function canPauseExecution(session: ExecutionReadModel) {
	return session.status === "in_progress";
}

export function canResumeExecution(session: ExecutionReadModel) {
	return session.status === "paused";
}

export function canCancelExecution(session: ExecutionReadModel) {
	return session.status !== "completed" && session.status !== "cancelled";
}

export function canCompleteExecution(session: ExecutionReadModel) {
	return calculateExecutionBlockers(session, {
		workOrderStatus: "ready_for_execution",
		planningStatus: "approved",
		orderCancelled: false,
	}).every(
		(blocker) =>
			blocker !== "execution_not_started" &&
			blocker !== "missing_required_evidence" &&
			blocker !== "missing_labor_entries" &&
			blocker !== "open_incident" &&
			blocker !== "cancelled" &&
			blocker !== "already_completed",
	);
}

export function calculateExecutionBlockers(
	session: ExecutionReadModel,
	context: ExecutionGateContext,
): ExecutionBlockerCode[] {
	const blockers: ExecutionBlockerCode[] = [];

	if (context.orderCancelled || session.status === "cancelled") {
		blockers.push("cancelled");
	}
	if (session.status === "completed") {
		blockers.push("already_completed");
	}
	if (context.planningStatus !== "approved") {
		blockers.push("planning_not_approved");
	}
	if (!["ready_for_execution", "assigned", "ready"].includes(context.workOrderStatus)) {
		blockers.push("work_order_not_ready");
	}
	if (session.status === "in_progress" || session.status === "paused") {
		blockers.push("execution_already_started");
	}
	if (session.status === "draft" || session.status === "ready") {
		blockers.push("execution_not_started");
	}
	if (session.evidenceCount === 0) {
		blockers.push("missing_required_evidence");
	}
	if (session.laborEntryCount === 0) {
		blockers.push("missing_labor_entries");
	}
	if (session.openCriticalIncidentCount > 0) {
		blockers.push("open_incident");
	}
	if (session.pendingSyncCount > 0 || session.status === "sync_pending") {
		blockers.push("sync_pending");
	}

	return blockers;
}

export function calculateExecutionNextActions(
	session: ExecutionReadModel,
	context: ExecutionGateContext,
): ExecutionNextActionCode[] {
	const blockers = new Set(calculateExecutionBlockers(session, context));

	if (session.status === "completed") {
		return ["generate_technical_report"];
	}
	if (blockers.has("sync_pending")) {
		return ["sync_pending_commands"];
	}
	if (session.status === "ready" || session.status === "draft") {
		return blockers.has("planning_not_approved") || blockers.has("work_order_not_ready")
			? []
			: ["start_execution"];
	}

	const actions: ExecutionNextActionCode[] = [];
	if (session.checklistResponseCount === 0) {
		actions.push("complete_required_checklist");
	}
	if (session.evidenceCount === 0) {
		actions.push("capture_required_evidence");
	}
	if (session.materialUsageCount === 0) {
		actions.push("record_material_usage");
	}
	if (session.laborEntryCount === 0) {
		actions.push("record_labor_time");
	}
	if (session.openCriticalIncidentCount > 0) {
		actions.push("resolve_incident");
	}
	if (session.signatureCount === 0) {
		actions.push("collect_signature");
	}
	actions.push("finish_execution");

	return actions;
}

export function validateExecutionCommandIdempotency(
	clientMutationIds: readonly string[],
	clientMutationId: string,
) {
	return clientMutationIds.includes(clientMutationId);
}

export function mergeMaterialUsage<T extends { usageId: string; quantityUsed: number }>(
	current: readonly T[],
	incoming: T,
): T[] {
	const existing = current.find((item) => item.usageId === incoming.usageId);
	if (!existing) {
		return [...current, incoming];
	}

	return current.map((item) =>
		item.usageId === incoming.usageId
			? { ...incoming, quantityUsed: item.quantityUsed + incoming.quantityUsed }
			: item,
	);
}

export function mergeLaborEntries<T extends { laborEntryId: string }>(
	current: readonly T[],
	incoming: T,
): T[] {
	return current.some((item) => item.laborEntryId === incoming.laborEntryId)
		? [...current]
		: [...current, incoming];
}

export function validateRequiredChecklistResponses(session: ExecutionReadModel) {
	return session.checklistResponseCount > 0;
}

export function validateRequiredEvidence(session: ExecutionReadModel) {
	return session.evidenceCount > 0;
}

export function validateRequiredSignatures(session: ExecutionReadModel) {
	return session.signatureCount > 0;
}
