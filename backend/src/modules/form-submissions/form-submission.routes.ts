import { INTERNAL_ROLES } from "@cermont/domain";
import { CreateFormSubmissionSchema, FormSubmissionIdParamsSchema } from "@cermont/shared-types";
import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import { validateBody, validateParams } from "../../middlewares/validate";
import * as FormSubmissionController from "./form-submission.controller";

const router = Router();

/**
 * POST /api/form-submissions
 * Create a new CERMONT operational form submission
 */
router.post(
	"/",
	authenticate,
	authorize(...INTERNAL_ROLES),
	validateBody(CreateFormSubmissionSchema),
	FormSubmissionController.createSubmission,
);

/**
 * GET /api/form-submissions
 * List submissions (filterable by serviceCaseId, templateId, stepCode, status)
 */
router.get(
	"/",
	authenticate,
	authorize(...INTERNAL_ROLES),
	FormSubmissionController.listSubmissions,
);

/**
 * GET /api/form-submissions/:id
 * Get a single form submission by ID
 */
router.get(
	"/:id",
	authenticate,
	authorize(...INTERNAL_ROLES),
	FormSubmissionController.getSubmission,
);

/**
 * PATCH /api/form-submissions/:id/archive
 * Archive a form submission
 */
router.patch(
	"/:id/archive",
	authenticate,
	authorize(...INTERNAL_ROLES),
	validateParams(FormSubmissionIdParamsSchema),
	FormSubmissionController.archiveSubmission,
);

export default router;
