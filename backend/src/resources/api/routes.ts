import {
	CreateResourceSchema,
	PaginationQuerySchema,
	ResourceIdSchema,
	UpdateResourceSchema,
	UpdateResourceStatusSchema,
} from "@cermont/shared-types";
import express from "express";
import { authenticate } from "../../_shared/middlewares/auth.middleware";
import {
	authorize,
	authorizeAllAuthenticated,
} from "../../_shared/middlewares/authorize.middleware";
import { validateBody, validateParams, validateQuery } from "../../_shared/middlewares/validate";
import {
	createResource,
	deleteResource,
	getAllResources,
	getResourceById,
	updateResource,
	updateResourceStatus,
} from "./controller";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// --- Resource Routes ---

// Create resource - gerente, residente, supervisor
router.post(
	"/",
	authorize("manager", "resident_engineer", "supervisor"),
	validateBody(CreateResourceSchema),
	createResource,
);

// Get all resources (with optional filters) - all authenticated
router.get("/", authorizeAllAuthenticated(), validateQuery(PaginationQuerySchema), getAllResources);

// Get single resource - all authenticated
router.get("/:id", authorizeAllAuthenticated(), validateParams(ResourceIdSchema), getResourceById);

// Update resource - gerente, residente, supervisor
router.patch(
	"/:id",
	authorize("manager", "resident_engineer", "supervisor"),
	validateParams(ResourceIdSchema),
	validateBody(UpdateResourceSchema),
	updateResource,
);

// Update resource status - gerente, residente, supervisor
router.patch(
	"/:id/status",
	authorize("manager", "resident_engineer", "supervisor"),
	validateParams(ResourceIdSchema),
	validateBody(UpdateResourceStatusSchema),
	updateResourceStatus,
);

// Delete resource - only gerente
router.delete("/:id", authorize("manager"), validateParams(ResourceIdSchema), deleteResource);

export default router;
