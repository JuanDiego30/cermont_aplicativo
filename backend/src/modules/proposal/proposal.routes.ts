import { ALL_AUTHENTICATED_ROLES, FIELD_MANAGEMENT_ROLES } from "@cermont/domain";
import {
	ApproveProposalSchema,
	ConvertProposalToOrderSchema,
	CreateProposalSchema,
	ListProposalsQuerySchema,
	ProposalIdSchema,
	ProposalOrderIdParamsSchema,
	RegisterPurchaseOrderSchema,
	UpdateProposalStatusSchema,
} from "@cermont/shared-types";
import express from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import { validateBody, validateParams, validateQuery } from "../../middlewares/validate";
import {
	getByProposalId as getProposalPurchaseOrder,
	registerForProposal,
} from "../purchase-order/purchase-order.controller";
import {
	approveProposal,
	convertProposalToOrder,
	createProposal,
	getAllProposals,
	getProposalById,
	getProposalsByOrderId,
	rejectProposal,
	updateProposalStatus,
} from "./proposal.controller";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Create proposal
router.post(
	"/",
	authorize(...FIELD_MANAGEMENT_ROLES),
	validateBody(CreateProposalSchema),
	createProposal,
);

// Get all proposals (with optional filters)
router.get(
	"/",
	authorize(...ALL_AUTHENTICATED_ROLES),
	validateQuery(ListProposalsQuerySchema),
	getAllProposals,
);

// Get proposals by order ID
router.get(
	"/order/:order_id",
	authorize(...ALL_AUTHENTICATED_ROLES),
	validateParams(ProposalOrderIdParamsSchema),
	getProposalsByOrderId,
);

router.get(
	"/:id/po",
	authorize(...ALL_AUTHENTICATED_ROLES),
	validateParams(ProposalIdSchema),
	getProposalPurchaseOrder,
);

router.post(
	"/:id/po",
	authorize(...FIELD_MANAGEMENT_ROLES),
	validateParams(ProposalIdSchema),
	validateBody(RegisterPurchaseOrderSchema.omit({ proposalId: true })),
	registerForProposal,
);

// Get single proposal
router.get(
	"/:id",
	authorize(...ALL_AUTHENTICATED_ROLES),
	validateParams(ProposalIdSchema),
	getProposalById,
);

// Update proposal status
router.patch(
	"/:id/status",
	authorize(...FIELD_MANAGEMENT_ROLES),
	validateParams(ProposalIdSchema),
	validateBody(UpdateProposalStatusSchema),
	updateProposalStatus,
);

// Approve proposal (convenience endpoint)
router.patch(
	"/:id/approve",
	authorize("cliente"),
	validateParams(ProposalIdSchema),
	validateBody(ApproveProposalSchema),
	approveProposal,
);

// Reject proposal (convenience endpoint)
router.patch("/:id/reject", authorize("cliente"), validateParams(ProposalIdSchema), rejectProposal);

/**
 * POST /api/proposals/:id/convert
 * Convert approved proposal to work order
 * Reference: DOC-10 Section 6
 */
router.post(
	"/:id/convert",
	authorize(...FIELD_MANAGEMENT_ROLES),
	validateParams(ProposalIdSchema),
	validateBody(ConvertProposalToOrderSchema),
	convertProposalToOrder,
);

export default router;
