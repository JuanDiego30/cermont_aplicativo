/**
 * Safety Analysis (AST) Routes — /api/asts
 *
 * Order: authenticate → authorize → validate → controller
 */

import { INTERNAL_ROLES, REPORTING_ACCESS_ROLES, TECHNICAL_EXECUTION_ROLES } from "@cermont/domain";
import {
	ASTIdParamsSchema,
	CreateASTSchema,
	ListASTQuerySchema,
	SignASTSchema,
	UpdateASTSchema,
} from "@cermont/shared-types";
import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import { validateBody, validateParams, validateQuery } from "../../middlewares/validate";
import * as SafetyAnalysisController from "./safety-analysis.controller";

const router = Router();

router.use(authenticate);

// GET /api/asts — list ASTs with filters
router.get(
	"/",
	authorize(...INTERNAL_ROLES),
	validateQuery(ListASTQuerySchema),
	SafetyAnalysisController.listASTs,
);

// GET /api/asts/:id — AST detail
router.get(
	"/:id",
	authorize(...INTERNAL_ROLES),
	validateParams(ASTIdParamsSchema),
	SafetyAnalysisController.getAST,
);

// POST /api/asts — create AST (técnico, supervisor, residente, HES)
router.post(
	"/",
	authorize(...TECHNICAL_EXECUTION_ROLES, "hes"),
	validateBody(CreateASTSchema),
	SafetyAnalysisController.createAST,
);

// PATCH /api/asts/:id — update draft AST
router.patch(
	"/:id",
	authorize(...TECHNICAL_EXECUTION_ROLES, "hes"),
	validateParams(ASTIdParamsSchema),
	validateBody(UpdateASTSchema),
	SafetyAnalysisController.updateAST,
);

// POST /api/asts/:id/transition — FSM transition (draft→reviewed→approved→completed)
router.post(
	"/:id/transition",
	authorize(...REPORTING_ACCESS_ROLES),
	validateParams(ASTIdParamsSchema),
	SafetyAnalysisController.transitionAST,
);

// POST /api/asts/:id/sign — sign as elaborated/reviewed/approved
router.post(
	"/:id/sign",
	authorize(...TECHNICAL_EXECUTION_ROLES, "hes"),
	validateParams(ASTIdParamsSchema),
	validateBody(SignASTSchema),
	SafetyAnalysisController.signAST,
);

export default router;
