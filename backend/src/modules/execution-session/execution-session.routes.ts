import { FIELD_EXECUTION_ACCESS_ROLES, INTERNAL_ROLES, MANAGEMENT_ROLES } from "@cermont/domain";
import {
	AddExecutionEquipmentUsageCommandSchema,
	AddExecutionEvidenceCommandSchema,
	AddExecutionIncidentCommandSchema,
	AddExecutionLaborEntryCommandSchema,
	AddExecutionMaterialUsageCommandSchema,
	AddExecutionObservationCommandSchema,
	AddExecutionSignatureCommandSchema,
	AddExecutionToolUsageCommandSchema,
	CancelExecutionSessionCommandSchema,
	CompleteExecutionSessionCommandSchema,
	CreateExecutionSessionSchema,
	ExecutionIncidentIdParamsSchema,
	ExecutionSessionIdParamsSchema,
	ExecutionSessionListQuerySchema,
	ExecutionSyncBatchSchema,
	PauseExecutionSessionCommandSchema,
	ResumeExecutionSessionCommandSchema,
	StartExecutionSessionCommandSchema,
	SubmitExecutionChecklistCommandSchema,
	SubmitExecutionDynamicFormCommandSchema,
} from "@cermont/shared-types";
import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import { validateBody, validateParams, validateQuery } from "../../middlewares/validate";
import * as ExecutionSessionController from "./execution-session.controller";

const router = Router();

router.get(
	"/",
	authenticate,
	authorize(...INTERNAL_ROLES),
	validateQuery(ExecutionSessionListQuerySchema),
	ExecutionSessionController.listExecutionSessions,
);

router.post(
	"/",
	authenticate,
	authorize(...FIELD_EXECUTION_ACCESS_ROLES),
	validateBody(CreateExecutionSessionSchema),
	ExecutionSessionController.createExecutionSession,
);

router.get(
	"/:id",
	authenticate,
	authorize(...INTERNAL_ROLES),
	validateParams(ExecutionSessionIdParamsSchema),
	ExecutionSessionController.getExecutionSession,
);

router.post(
	"/:id/start",
	authenticate,
	authorize(...FIELD_EXECUTION_ACCESS_ROLES),
	validateParams(ExecutionSessionIdParamsSchema),
	validateBody(StartExecutionSessionCommandSchema),
	ExecutionSessionController.startExecutionSession,
);

router.post(
	"/:id/pause",
	authenticate,
	authorize(...FIELD_EXECUTION_ACCESS_ROLES),
	validateParams(ExecutionSessionIdParamsSchema),
	validateBody(PauseExecutionSessionCommandSchema),
	ExecutionSessionController.pauseExecutionSession,
);

router.post(
	"/:id/resume",
	authenticate,
	authorize(...FIELD_EXECUTION_ACCESS_ROLES),
	validateParams(ExecutionSessionIdParamsSchema),
	validateBody(ResumeExecutionSessionCommandSchema),
	ExecutionSessionController.resumeExecutionSession,
);

router.post(
	"/:id/complete",
	authenticate,
	authorize(...FIELD_EXECUTION_ACCESS_ROLES),
	validateParams(ExecutionSessionIdParamsSchema),
	validateBody(CompleteExecutionSessionCommandSchema),
	ExecutionSessionController.completeExecutionSession,
);

// Cancel requires management — do not allow field technicians to cancel
router.post(
	"/:id/cancel",
	authenticate,
	authorize(...MANAGEMENT_ROLES),
	validateParams(ExecutionSessionIdParamsSchema),
	validateBody(CancelExecutionSessionCommandSchema),
	ExecutionSessionController.cancelExecutionSession,
);

router.post(
	"/:id/evidences",
	authenticate,
	authorize(...FIELD_EXECUTION_ACCESS_ROLES),
	validateParams(ExecutionSessionIdParamsSchema),
	validateBody(AddExecutionEvidenceCommandSchema),
	ExecutionSessionController.addExecutionEvidence,
);

router.post(
	"/:id/materials",
	authenticate,
	authorize(...FIELD_EXECUTION_ACCESS_ROLES),
	validateParams(ExecutionSessionIdParamsSchema),
	validateBody(AddExecutionMaterialUsageCommandSchema),
	ExecutionSessionController.addMaterialUsage,
);

router.post(
	"/:id/tools",
	authenticate,
	authorize(...FIELD_EXECUTION_ACCESS_ROLES),
	validateParams(ExecutionSessionIdParamsSchema),
	validateBody(AddExecutionToolUsageCommandSchema),
	ExecutionSessionController.addToolUsage,
);

router.post(
	"/:id/equipment",
	authenticate,
	authorize(...FIELD_EXECUTION_ACCESS_ROLES),
	validateParams(ExecutionSessionIdParamsSchema),
	validateBody(AddExecutionEquipmentUsageCommandSchema),
	ExecutionSessionController.addEquipmentUsage,
);

router.post(
	"/:id/labor",
	authenticate,
	authorize(...FIELD_EXECUTION_ACCESS_ROLES),
	validateParams(ExecutionSessionIdParamsSchema),
	validateBody(AddExecutionLaborEntryCommandSchema),
	ExecutionSessionController.addLaborEntry,
);

router.post(
	"/:id/incidents",
	authenticate,
	authorize(...FIELD_EXECUTION_ACCESS_ROLES),
	validateParams(ExecutionSessionIdParamsSchema),
	validateBody(AddExecutionIncidentCommandSchema),
	ExecutionSessionController.addIncident,
);

router.post(
	"/:id/incidents/:incidentId/resolve",
	authenticate,
	authorize(...FIELD_EXECUTION_ACCESS_ROLES),
	validateParams(ExecutionIncidentIdParamsSchema),
	ExecutionSessionController.resolveIncident,
);

router.post(
	"/:id/observations",
	authenticate,
	authorize(...FIELD_EXECUTION_ACCESS_ROLES),
	validateParams(ExecutionSessionIdParamsSchema),
	validateBody(AddExecutionObservationCommandSchema),
	ExecutionSessionController.addObservation,
);

router.post(
	"/:id/signatures",
	authenticate,
	authorize(...FIELD_EXECUTION_ACCESS_ROLES),
	validateParams(ExecutionSessionIdParamsSchema),
	validateBody(AddExecutionSignatureCommandSchema),
	ExecutionSessionController.addSignature,
);

router.post(
	"/:id/checklist",
	authenticate,
	authorize(...FIELD_EXECUTION_ACCESS_ROLES),
	validateParams(ExecutionSessionIdParamsSchema),
	validateBody(SubmitExecutionChecklistCommandSchema),
	ExecutionSessionController.submitChecklistResponse,
);

router.post(
	"/:id/dynamic-form",
	authenticate,
	authorize(...FIELD_EXECUTION_ACCESS_ROLES),
	validateParams(ExecutionSessionIdParamsSchema),
	validateBody(SubmitExecutionDynamicFormCommandSchema),
	ExecutionSessionController.submitDynamicFormResponse,
);

// Offline sync commands — field roles only (they are the ones syncing field data)
router.post(
	"/:id/commands",
	authenticate,
	authorize(...FIELD_EXECUTION_ACCESS_ROLES),
	validateParams(ExecutionSessionIdParamsSchema),
	validateBody(ExecutionSyncBatchSchema),
	ExecutionSessionController.syncExecutionCommands,
);

router.post(
	"/:id/sync",
	authenticate,
	authorize(...FIELD_EXECUTION_ACCESS_ROLES),
	validateParams(ExecutionSessionIdParamsSchema),
	validateBody(ExecutionSyncBatchSchema),
	ExecutionSessionController.syncExecutionCommands,
);

export default router;
