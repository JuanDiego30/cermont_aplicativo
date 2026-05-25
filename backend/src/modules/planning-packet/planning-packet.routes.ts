/**
 * Planning Packet Routes — API Endpoints
 *
 * DOC-10 §4 compliance:
 * - RBAC: authorize exactly as specified
 * - Validation: validateBody, validateParams via Zod
 * - Authentication: authenticate on all routes
 * - Order: authenticate → authorize → validate → controller
 */

import {
	ApprovePlanningPacketSchema,
	CreatePlanningPacketSchema,
	PlanningPacketIdParamsSchema,
	PlanningPacketListQuerySchema,
	ReopenPlanningPacketSchema,
	UpdatePlanningPacketSchema,
	AddReferenceDocumentSchema,
} from "@cermont/shared-types";
import { Router } from "express";
import * as PlanningPacketController from "./planning-packet.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import { validateBody, validateParams, validateQuery } from "../../middlewares/validate";

const router = Router();

router.get(
	"/",
	authenticate,
	validateQuery(PlanningPacketListQuerySchema),
	PlanningPacketController.listPlanningPackets,
);

/**
 * GET /api/planning-packets/:id
 * Get planning packet by ID
 * Roles: Todos (all authenticated users)
 */
router.get(
	"/:id",
	authenticate,
	validateParams(PlanningPacketIdParamsSchema),
	PlanningPacketController.getPlanningPacket,
);

/**
 * POST /api/planning-packets
 * Create a new planning packet
 * Roles: GER, RES, SUP
 */
router.post(
	"/",
	authenticate,
	authorize("gerente", "residente", "supervisor"),
	validateBody(CreatePlanningPacketSchema),
	PlanningPacketController.createPlanningPacket,
);

/**
 * PATCH /api/planning-packets/:id
 * Update planning packet
 * Roles: GER, RES, SUP
 */
router.patch(
	"/:id",
	authenticate,
	authorize("gerente", "residente", "supervisor"),
	validateParams(PlanningPacketIdParamsSchema),
	validateBody(UpdatePlanningPacketSchema),
	PlanningPacketController.updatePlanningPacket,
);

/**
 * POST /api/planning-packets/:id/validate-readiness
 * Validate planning readiness
 * Roles: GER, RES, SUP, HES
 */
router.post(
	"/:id/validate-readiness",
	authenticate,
	authorize("gerente", "residente", "supervisor", "hes"),
	validateParams(PlanningPacketIdParamsSchema),
	PlanningPacketController.validatePlanningReadiness,
);

/**
 * POST /api/planning-packets/:id/approve
 * Approve planning packet
 * Roles: GER, RES
 */
router.post(
	"/:id/approve",
	authenticate,
	authorize("gerente", "residente"),
	validateParams(PlanningPacketIdParamsSchema),
	validateBody(ApprovePlanningPacketSchema),
	PlanningPacketController.approvePlanningPacket,
);

/**
 * POST /api/planning-packets/:id/reopen
 * Reopen planning packet
 * Roles: GER, RES
 */
router.post(
	"/:id/reopen",
	authenticate,
	authorize("gerente", "residente"),
	validateParams(PlanningPacketIdParamsSchema),
	validateBody(ReopenPlanningPacketSchema),
	PlanningPacketController.reopenPlanningPacket,
);

/**
 * POST /api/planning-packets/:id/reference-documents
 * Add a reference document (ATS, AST, PTW, procedure, etc.)
 * Roles: GER, RES, SUP
 */
router.post(
	"/:id/reference-documents",
	authenticate,
	authorize("gerente", "residente", "supervisor"),
	validateParams(PlanningPacketIdParamsSchema),
	validateBody(AddReferenceDocumentSchema),
	PlanningPacketController.addReferenceDocument,
);

/**
 * GET /api/planning-packets/:id/reference-documents
 * List reference documents
 * Roles: GER, RES, SUP, HES
 */
router.get(
	"/:id/reference-documents",
	authenticate,
	authorize("gerente", "residente", "supervisor", "hes"),
	validateParams(PlanningPacketIdParamsSchema),
	PlanningPacketController.listReferenceDocuments,
);

export default router;
