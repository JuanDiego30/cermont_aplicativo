import { EVIDENCE_ACCESS_ROLES, INTERNAL_ROLES, MANAGEMENT_ROLES } from "@cermont/domain";
import {
	AddEvidenceCollectionItemSchema,
	CreateEvidenceCollectionSchema,
	EvidenceCollectionByEntityParamsSchema,
	EvidenceCollectionIdParamsSchema,
	EvidenceCollectionItemParamsSchema,
	EvidenceCollectionListQuerySchema,
} from "@cermont/shared-types";
import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import { validateBody, validateParams, validateQuery } from "../../middlewares/validate";
import * as EvidenceCollectionController from "./evidence-collection.controller";

const router = Router();

router.use(authenticate);

router.get(
	"/by-entity/:entityType/:entityId",
	authorize(...INTERNAL_ROLES),
	validateParams(EvidenceCollectionByEntityParamsSchema),
	EvidenceCollectionController.getByEntity,
);
router.get(
	"/",
	authorize(...INTERNAL_ROLES),
	validateQuery(EvidenceCollectionListQuerySchema),
	EvidenceCollectionController.getAll,
);
router.post(
	"/",
	authorize(...EVIDENCE_ACCESS_ROLES),
	validateBody(CreateEvidenceCollectionSchema),
	EvidenceCollectionController.create,
);
router.get(
	"/:id",
	authorize(...INTERNAL_ROLES),
	validateParams(EvidenceCollectionIdParamsSchema),
	EvidenceCollectionController.getById,
);
router.post(
	"/:id/items",
	authorize(...EVIDENCE_ACCESS_ROLES),
	validateParams(EvidenceCollectionIdParamsSchema),
	validateBody(AddEvidenceCollectionItemSchema),
	EvidenceCollectionController.addItem,
);
router.delete(
	"/:id/items/:itemId",
	authorize(...MANAGEMENT_ROLES),
	validateParams(EvidenceCollectionItemParamsSchema),
	EvidenceCollectionController.removeItem,
);

export default router;
