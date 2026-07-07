import {
	AddExecutionEquipmentUsageCommandSchema,
	AddExecutionEvidenceCommandSchema,
	AddExecutionIncidentCommandSchema,
	AddExecutionLaborEntryCommandSchema,
	AddExecutionMaterialUsageCommandSchema,
	AddExecutionObservationCommandSchema,
	AddExecutionSignatureCommandSchema,
	AddExecutionToolUsageCommandSchema,
	CancelExecutionSessionCommandSchema,
	CompleteExecutionSessionCommandSchema,
	CreateExecutionSessionSchema,
	CreateOrderExecutionSessionSchema,
	ExecutionIncidentIdParamsSchema,
	ExecutionSessionIdParamsSchema,
	ExecutionSessionListQuerySchema,
	ExecutionSyncBatchSchema,
	OrderExecutionSessionParamsSchema,
	PauseExecutionSessionCommandSchema,
	PreflightChecklistSchema,
	ResolveExecutionIncidentCommandSchema,
	ResumeExecutionSessionCommandSchema,
	StartExecutionSessionCommandSchema,
	SubmitExecutionChecklistCommandSchema,
	SubmitExecutionDynamicFormCommandSchema,
} from "@cermont/shared-types";
import type { Request, Response } from "express";
import { requireUser } from "../../common/utils/request";
import * as ExecutionSessionService from "./execution-session.service";

export async function listExecutionSessions(req: Request, res: Response): Promise<void> {
	requireUser(req);
	const query = ExecutionSessionListQuerySchema.parse(req.query);
	const result = await ExecutionSessionService.listExecutionSessions(query);

	res.status(200).json({ success: true, data: result.data, pagination: result.pagination });
}

export async function getExecutionSession(req: Request, res: Response): Promise<void> {
	requireUser(req);
	const { id } = ExecutionSessionIdParamsSchema.parse(req.params);
	const session = await ExecutionSessionService.getExecutionSessionById(id);

	res.status(200).json({ success: true, data: session });
}

export async function getExecutionSessionByOrder(req: Request, res: Response): Promise<void> {
	requireUser(req);
	const { id } = OrderExecutionSessionParamsSchema.parse(req.params);
	const session = await ExecutionSessionService.getExecutionSessionByWorkOrder(id);

	res.status(200).json({ success: true, data: session });
}

export async function createExecutionSession(req: Request, res: Response): Promise<void> {
	const actor = requireUser(req);
	const data = CreateExecutionSessionSchema.parse(req.body);
	const session = await ExecutionSessionService.createExecutionSession(data, actor);

	res.status(201).json({ success: true, data: session });
}

export async function submitPreflightChecklist(req: Request, res: Response): Promise<void> {
	const actor = requireUser(req);
	const { id } = ExecutionSessionIdParamsSchema.parse(req.params);
	const preflight = PreflightChecklistSchema.parse(req.body);
	const result = await ExecutionSessionService.submitPreflightChecklist(id, preflight, actor);

	res.status(200).json({
		success: true,
		data: result.session,
		meta: { preflight: result.preflight },
	});
}

export async function createExecutionSessionForOrder(req: Request, res: Response): Promise<void> {
	const actor = requireUser(req);
	const { id } = OrderExecutionSessionParamsSchema.parse(req.params);
	const body = CreateOrderExecutionSessionSchema.parse(req.body);
	const data = CreateExecutionSessionSchema.parse({ ...body, workOrderId: id });
	const session = await ExecutionSessionService.createExecutionSession(data, actor);

	res.status(201).json({ success: true, data: session });
}

export async function startExecutionSession(req: Request, res: Response): Promise<void> {
	const actor = requireUser(req);
	const { id } = ExecutionSessionIdParamsSchema.parse(req.params);
	const command = StartExecutionSessionCommandSchema.parse(req.body);
	const session = await ExecutionSessionService.startExecutionSession(id, command, actor);

	res.status(200).json({ success: true, data: session });
}

export async function pauseExecutionSession(req: Request, res: Response): Promise<void> {
	const actor = requireUser(req);
	const { id } = ExecutionSessionIdParamsSchema.parse(req.params);
	const command = PauseExecutionSessionCommandSchema.parse(req.body);
	const session = await ExecutionSessionService.pauseExecutionSession(id, command, actor);

	res.status(200).json({ success: true, data: session });
}

export async function resumeExecutionSession(req: Request, res: Response): Promise<void> {
	const actor = requireUser(req);
	const { id } = ExecutionSessionIdParamsSchema.parse(req.params);
	const command = ResumeExecutionSessionCommandSchema.parse(req.body);
	const session = await ExecutionSessionService.resumeExecutionSession(id, command, actor);

	res.status(200).json({ success: true, data: session });
}

export async function completeExecutionSession(req: Request, res: Response): Promise<void> {
	const actor = requireUser(req);
	const { id } = ExecutionSessionIdParamsSchema.parse(req.params);
	const command = CompleteExecutionSessionCommandSchema.parse(req.body);
	const session = await ExecutionSessionService.completeExecutionSession(id, command, actor);

	res.status(200).json({ success: true, data: session });
}

export async function cancelExecutionSession(req: Request, res: Response): Promise<void> {
	const actor = requireUser(req);
	const { id } = ExecutionSessionIdParamsSchema.parse(req.params);
	const command = CancelExecutionSessionCommandSchema.parse(req.body);
	const session = await ExecutionSessionService.cancelExecutionSession(id, command, actor);

	res.status(200).json({ success: true, data: session });
}

export async function addExecutionEvidence(req: Request, res: Response): Promise<void> {
	const actor = requireUser(req);
	const { id } = ExecutionSessionIdParamsSchema.parse(req.params);
	const command = AddExecutionEvidenceCommandSchema.parse(req.body);
	const session = await ExecutionSessionService.addExecutionEvidence(id, command, actor);

	res.status(200).json({ success: true, data: session });
}

export async function addMaterialUsage(req: Request, res: Response): Promise<void> {
	const actor = requireUser(req);
	const { id } = ExecutionSessionIdParamsSchema.parse(req.params);
	const command = AddExecutionMaterialUsageCommandSchema.parse(req.body);
	const session = await ExecutionSessionService.addMaterialUsage(id, command, actor);

	res.status(200).json({ success: true, data: session });
}

export async function addToolUsage(req: Request, res: Response): Promise<void> {
	const actor = requireUser(req);
	const { id } = ExecutionSessionIdParamsSchema.parse(req.params);
	const command = AddExecutionToolUsageCommandSchema.parse(req.body);
	const session = await ExecutionSessionService.addToolUsage(id, command, actor);

	res.status(200).json({ success: true, data: session });
}

export async function addEquipmentUsage(req: Request, res: Response): Promise<void> {
	const actor = requireUser(req);
	const { id } = ExecutionSessionIdParamsSchema.parse(req.params);
	const command = AddExecutionEquipmentUsageCommandSchema.parse(req.body);
	const session = await ExecutionSessionService.addEquipmentUsage(id, command, actor);

	res.status(200).json({ success: true, data: session });
}

export async function addLaborEntry(req: Request, res: Response): Promise<void> {
	const actor = requireUser(req);
	const { id } = ExecutionSessionIdParamsSchema.parse(req.params);
	const command = AddExecutionLaborEntryCommandSchema.parse(req.body);
	const session = await ExecutionSessionService.addLaborEntry(id, command, actor);

	res.status(200).json({ success: true, data: session });
}

export async function addIncident(req: Request, res: Response): Promise<void> {
	const actor = requireUser(req);
	const { id } = ExecutionSessionIdParamsSchema.parse(req.params);
	const command = AddExecutionIncidentCommandSchema.parse(req.body);
	const session = await ExecutionSessionService.addIncident(id, command, actor);

	res.status(200).json({ success: true, data: session });
}

export async function resolveIncident(req: Request, res: Response): Promise<void> {
	const actor = requireUser(req);
	const { id, incidentId } = ExecutionIncidentIdParamsSchema.parse(req.params);
	const command = ResolveExecutionIncidentCommandSchema.parse({ ...req.body, incidentId });
	const session = await ExecutionSessionService.resolveIncident(id, command, actor);

	res.status(200).json({ success: true, data: session });
}

export async function addObservation(req: Request, res: Response): Promise<void> {
	const actor = requireUser(req);
	const { id } = ExecutionSessionIdParamsSchema.parse(req.params);
	const command = AddExecutionObservationCommandSchema.parse(req.body);
	const session = await ExecutionSessionService.addObservation(id, command, actor);

	res.status(200).json({ success: true, data: session });
}

export async function addSignature(req: Request, res: Response): Promise<void> {
	const actor = requireUser(req);
	const { id } = ExecutionSessionIdParamsSchema.parse(req.params);
	const command = AddExecutionSignatureCommandSchema.parse(req.body);
	const session = await ExecutionSessionService.addSignature(id, command, actor);

	res.status(200).json({ success: true, data: session });
}

export async function submitChecklistResponse(req: Request, res: Response): Promise<void> {
	const actor = requireUser(req);
	const { id } = ExecutionSessionIdParamsSchema.parse(req.params);
	const command = SubmitExecutionChecklistCommandSchema.parse(req.body);
	const session = await ExecutionSessionService.submitChecklistResponse(id, command, actor);

	res.status(200).json({ success: true, data: session });
}

export async function submitDynamicFormResponse(req: Request, res: Response): Promise<void> {
	const actor = requireUser(req);
	const { id } = ExecutionSessionIdParamsSchema.parse(req.params);
	const command = SubmitExecutionDynamicFormCommandSchema.parse(req.body);
	const session = await ExecutionSessionService.submitDynamicFormResponse(id, command, actor);

	res.status(200).json({ success: true, data: session });
}

export async function syncExecutionCommands(req: Request, res: Response): Promise<void> {
	const actor = requireUser(req);
	const { id } = ExecutionSessionIdParamsSchema.parse(req.params);
	const { commands } = ExecutionSyncBatchSchema.parse(req.body);
	const results = await ExecutionSessionService.syncExecutionCommands(id, commands, actor);

	res.status(200).json({ success: true, data: results });
}
