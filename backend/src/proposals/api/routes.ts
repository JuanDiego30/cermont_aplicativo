import {
	ApproveProposalSchema,
	ConvertProposalToOrderSchema,
	CreateProposalSchema,
	ListProposalsQuerySchema,
	ProposalIdSchema,
	ProposalOrderIdParamsSchema,
	RejectProposalSchema,
	UpdateProposalStatusSchema,
} from "@cermont/shared-types";
import { MANAGEMENT_ROLES } from "@cermont/shared-types/rbac";
import express from "express";
import { authenticate } from "../../_shared/middlewares/auth.middleware";
import { authorize } from "../../_shared/middlewares/authorize.middleware";
import { validateBody, validateParams, validateQuery } from "../../_shared/middlewares/validate";
import {
	approveProposal,
	convertProposalToOrder,
	createProposal,
	generateProposalPdf,
	getAllProposals,
	getProposalById,
	getProposalsByOrderId,
	rejectProposal,
	updateProposalStatus,
} from "./controller";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Create proposal
router.post(
	"/",
	authorize(...MANAGEMENT_ROLES),
	validateBody(CreateProposalSchema),
	createProposal,
);

// Get all proposals (with optional filters)
router.get(
	"/",
	authorize("manager", "resident_engineer", "administrator", "client"),
	validateQuery(ListProposalsQuerySchema),
	getAllProposals,
);

// Get proposals by order ID
router.get(
	"/order/:order_id",
	authorize("manager", "resident_engineer", "administrator", "client"),
	validateParams(ProposalOrderIdParamsSchema),
	getProposalsByOrderId,
);

// Get single proposal
router.get(
	"/:id",
	authorize("manager", "resident_engineer", "administrator", "client"),
	validateParams(ProposalIdSchema),
	getProposalById,
);

router.get(
	"/:id/pdf",
	authorize("manager", "resident_engineer", "administrator", "client"),
	validateParams(ProposalIdSchema),
	generateProposalPdf,
);

// Update proposal status
router.patch(
	"/:id/status",
	authorize(...MANAGEMENT_ROLES),
	validateParams(ProposalIdSchema),
	validateBody(UpdateProposalStatusSchema),
	updateProposalStatus,
);

// Approve proposal (convenience endpoint)
router.patch(
	"/:id/approve",
	authorize(...MANAGEMENT_ROLES),
	validateParams(ProposalIdSchema),
	validateBody(ApproveProposalSchema),
	approveProposal,
);

// Reject proposal (convenience endpoint)
router.patch(
	"/:id/reject",
	authorize(...MANAGEMENT_ROLES),
	validateParams(ProposalIdSchema),
	validateBody(RejectProposalSchema),
	rejectProposal,
);

/**
 * POST /api/proposals/:id/convert
 * Convert approved proposal to work order
 * Reference: DOC-10 Section 6
 */
router.post(
	"/:id/convert",
	authorize(...MANAGEMENT_ROLES),
	validateParams(ProposalIdSchema),
	validateBody(ConvertProposalToOrderSchema),
	convertProposalToOrder,
);

export default router;
