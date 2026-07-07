/**
 * Client CRM Routes — /api/clients
 *
 * Order: authenticate → authorize → validate → controller
 */

import { CERMONT_ROLES, INTERNAL_ROLES, MANAGEMENT_ROLES } from "@cermont/domain";
import {
	ClientIdParamsSchema,
	CreateClientSchema,
	ListClientsQuerySchema,
	UpdateClientSchema,
} from "@cermont/shared-types";
import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import { validateBody, validateParams, validateQuery } from "../../middlewares/validate";
import * as ClientController from "./client.controller";

const router = Router();

router.use(authenticate);

// GET /api/clients — list with search and pagination
router.get(
	"/",
	authorize(...INTERNAL_ROLES),
	validateQuery(ListClientsQuerySchema),
	ClientController.listClients,
);

// GET /api/clients/:id — client detail
router.get(
	"/:id",
	authorize(...INTERNAL_ROLES),
	validateParams(ClientIdParamsSchema),
	ClientController.getClient,
);

// GET /api/clients/:id/history — cross-module interaction history
router.get(
	"/:id/history",
	authorize(...INTERNAL_ROLES),
	validateParams(ClientIdParamsSchema),
	ClientController.getClientHistory,
);

// POST /api/clients — create client
router.post(
	"/",
	authorize(...MANAGEMENT_ROLES),
	validateBody(CreateClientSchema),
	ClientController.createClient,
);

// PATCH /api/clients/:id — update client
router.patch(
	"/:id",
	authorize(...MANAGEMENT_ROLES),
	validateParams(ClientIdParamsSchema),
	validateBody(UpdateClientSchema),
	ClientController.updateClient,
);

// DELETE /api/clients/:id — deactivate (soft delete)
router.delete(
	"/:id",
	authorize(CERMONT_ROLES.GERENTE),
	validateParams(ClientIdParamsSchema),
	ClientController.deactivateClient,
);

export default router;
