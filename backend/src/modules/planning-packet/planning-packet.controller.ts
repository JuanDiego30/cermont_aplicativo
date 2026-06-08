import {
	AddReferenceDocumentSchema,
	ApplyPlanningKitSchema,
	ApprovePlanningPacketSchema,
	CreatePlanningPacketSchema,
	PlanningPacketIdParamsSchema,
	PlanningPacketListQuerySchema,
	ReopenPlanningPacketSchema,
	UpdatePlanningPacketSchema,
} from "@cermont/shared-types";
import type { Request, Response } from "express";
import { requireUser } from "../../common/utils/request";
import * as PlanningPacketService from "./planning-packet.service";

export async function listPlanningPackets(req: Request, res: Response) {
	requireUser(req);
	const query = PlanningPacketListQuerySchema.parse(req.query);
	const planningPackets = await PlanningPacketService.listPlanningPackets(query);

	res.status(200).json({ success: true, data: planningPackets });
}

/**
 * Create a new planning packet
 * POST /api/planning-packets
 * Roles: GER, RES, SUP
 */
export async function createPlanningPacket(req: Request, res: Response) {
	const user = requireUser(req);
	const userId = String(user._id);
	const data = CreatePlanningPacketSchema.parse(req.body);

	const planningPacket = await PlanningPacketService.createPlanningPacket(data, userId);

	res.status(201).json({ success: true, data: planningPacket });
}

/**
 * Get planning packet by ID
 * GET /api/planning-packets/:id
 * Roles: Todos (all authenticated users)
 */
export async function getPlanningPacket(req: Request, res: Response) {
	requireUser(req);
	const { id } = PlanningPacketIdParamsSchema.parse(req.params);

	const planningPacket = await PlanningPacketService.getPlanningPacketById(id);

	res.status(200).json({ success: true, data: planningPacket });
}

/**
 * Get planning packet by work order ID
 * GET /api/orders/:orderId/planning-packet
 * Roles: Todos (all authenticated users)
 */
export async function getPlanningPacketByWorkOrder(req: Request, res: Response) {
	requireUser(req);
	const { orderId } = req.params;

	const planningPacket = await PlanningPacketService.getPlanningPacketByWorkOrderId(
		String(orderId),
	);

	if (!planningPacket) {
		return res.status(404).json({
			success: false,
			error: {
				code: "PLANNING_PACKET_NOT_FOUND",
				message: "Planning packet not found for this work order",
			},
		});
	}

	res.status(200).json({ success: true, data: planningPacket });
}

/**
 * Update planning packet
 * PATCH /api/planning-packets/:id
 * Roles: GER, RES, SUP
 */
export async function updatePlanningPacket(req: Request, res: Response) {
	const user = requireUser(req);
	const userId = String(user._id);
	const userRole = user.role;
	const { id } = PlanningPacketIdParamsSchema.parse(req.params);
	const data = UpdatePlanningPacketSchema.partial().parse(req.body);

	const planningPacket = await PlanningPacketService.updatePlanningPacket(
		id,
		data,
		userId,
		userRole,
	);

	res.status(200).json({ success: true, data: planningPacket });
}

/**
 * Validate planning readiness
 * POST /api/planning-packets/:id/validate-readiness
 * Roles: GER, RES, SUP, HES
 */
export async function validatePlanningReadiness(req: Request, res: Response) {
	const user = requireUser(req);
	const userId = String(user._id);
	const userRole = user.role;
	const { id } = PlanningPacketIdParamsSchema.parse(req.params);

	const planningPacket = await PlanningPacketService.validatePlanningReadiness(
		id,
		userId,
		userRole,
	);

	res.status(200).json({ success: true, data: planningPacket });
}

/**
 * Approve planning packet
 * POST /api/planning-packets/:id/approve
 * Roles: GER, RES
 */
export async function approvePlanningPacket(req: Request, res: Response) {
	const user = requireUser(req);
	const userId = String(user._id);
	const userRole = user.role;
	const { id } = PlanningPacketIdParamsSchema.parse(req.params);
	const data = ApprovePlanningPacketSchema.parse(req.body);
	const planningPacket = await PlanningPacketService.approvePlanningPacket(
		id,
		data,
		userId,
		userRole,
	);

	res.status(200).json({ success: true, data: planningPacket });
}

/**
 * Reopen planning packet
 * POST /api/planning-packets/:id/reopen
 * Roles: GER, RES
 */
export async function reopenPlanningPacket(req: Request, res: Response) {
	const user = requireUser(req);
	const userId = String(user._id);
	const userRole = user.role;
	const { id } = PlanningPacketIdParamsSchema.parse(req.params);
	const data = ReopenPlanningPacketSchema.parse(req.body);

	const planningPacket = await PlanningPacketService.reopenPlanningPacket(
		id,
		data,
		userId,
		userRole,
	);

	res.status(200).json({ success: true, data: planningPacket });
}

/**
 * Add a reference document to a planning packet
 * POST /api/planning-packets/:id/reference-documents
 * Roles: GER, RES, SUP
 */
export async function addReferenceDocument(req: Request, res: Response) {
	const user = requireUser(req);
	const id = req.params.id as string;
	const data = AddReferenceDocumentSchema.parse(req.body);

	const packet = await PlanningPacketService.addReferenceDocument(id, data, String(user._id));
	res.status(200).json({ success: true, data: packet });
}

/**
 * List reference documents for a planning packet
 * GET /api/planning-packets/:id/reference-documents
 * Roles: GER, RES, SUP, HES
 */
export async function listReferenceDocuments(req: Request, res: Response) {
	const id = req.params.id as string;
	const docs = await PlanningPacketService.listReferenceDocuments(id);
	res.status(200).json({ success: true, data: docs });
}

/**
 * Apply a typical kit to planning packet
 * POST /api/planning-packets/:id/apply-kit
 * Roles: GER, RES, SUP
 */
export async function applyPlanningKit(req: Request, res: Response) {
	const user = requireUser(req);
	const userId = String(user._id);
	const userRole = user.role;
	const { id } = PlanningPacketIdParamsSchema.parse(req.params);
	const { kitTemplateId } = ApplyPlanningKitSchema.parse(req.body);

	const planningPacket = await PlanningPacketService.applyKitToPlanningPacket(
		id,
		kitTemplateId,
		userId,
		userRole,
	);

	res.status(200).json({ success: true, data: planningPacket });
}
