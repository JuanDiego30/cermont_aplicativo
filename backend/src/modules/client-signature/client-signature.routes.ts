/**
 * Client Signature Routes — /api/signatures
 *
 * Order: authenticate → authorize → validate → controller
 */

import { INTERNAL_ROLES, MANAGEMENT_ROLES } from "@cermont/domain";
import {
	ClientSignatureIdParamsSchema,
	CreateClientSignatureSchema,
	ListClientSignaturesQuerySchema,
	RejectClientSignatureSchema,
} from "@cermont/shared-types";
import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import { validateBody, validateParams, validateQuery } from "../../middlewares/validate";
import * as ClientSignatureController from "./client-signature.controller";

const router = Router();

router.use(authenticate);

// GET /api/signatures — list with context/status filters
router.get(
	"/",
	authorize(...INTERNAL_ROLES),
	validateQuery(ListClientSignaturesQuerySchema),
	ClientSignatureController.listSignatures,
);

// GET /api/signatures/:id — signature detail + metadata
router.get(
	"/:id",
	authorize(...INTERNAL_ROLES),
	validateParams(ClientSignatureIdParamsSchema),
	ClientSignatureController.getSignature,
);

// POST /api/signatures — capture signature (técnico en campo o cliente en portal)
router.post(
	"/",
	authorize(...INTERNAL_ROLES, "cliente"),
	validateBody(CreateClientSignatureSchema.omit({ ipAddress: true, userAgent: true })),
	ClientSignatureController.createSignature,
);

// POST /api/signatures/:id/verify — mark as verified (gerencia/residente)
router.post(
	"/:id/verify",
	authorize(...MANAGEMENT_ROLES),
	validateParams(ClientSignatureIdParamsSchema),
	ClientSignatureController.verifySignature,
);

// POST /api/signatures/:id/reject — reject with structured reason
router.post(
	"/:id/reject",
	authorize(...MANAGEMENT_ROLES),
	validateParams(ClientSignatureIdParamsSchema),
	validateBody(RejectClientSignatureSchema),
	ClientSignatureController.rejectSignature,
);

export default router;
