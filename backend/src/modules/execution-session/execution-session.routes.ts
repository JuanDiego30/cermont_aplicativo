import { INTERNAL_ROLES } from "@cermont/domain";
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
import * as ExecutionSessionController from "./execution-session.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import { validateBody, validateParams, validateQuery } from "../../middlewares/validate";

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
	authorize(...INTERNAL_ROLES),
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
	authorize(...INTERNAL_ROLES),
	validateParams(ExecutionSessionIdParamsSchema),
	validateBody(StartExecutionSessionCommandSchema),
	ExecutionSessionController.startExecutionSession,
);

router.post(
	"/:id/pause",
	authenticate,
	authorize(...INTERNAL_ROLES),
	validateParams(ExecutionSessionIdParamsSchema),
	validateBody(PauseExecutionSessionCommandSchema),
	ExecutionSessionController.pauseExecutionSession,
);

router.post(
	"/:id/resume",
	authenticate,
	authorize(...INTERNAL_ROLES),
	validateParams(ExecutionSessionIdParamsSchema),
	validateBody(ResumeExecutionSessionCommandSchema),
	ExecutionSessionController.resumeExecutionSession,
);

router.post(
	"/:id/complete",
	authenticate,
	authorize(...INTERNAL_ROLES),
	validateParams(ExecutionSessionIdParamsSchema),
	validateBody(CompleteExecutionSessionCommandSchema),
	ExecutionSessionController.completeExecutionSession,
);

router.post(
	"/:id/cancel",
	authenticate,
	authorize(...INTERNAL_ROLES),
	validateParams(ExecutionSessionIdParamsSchema),
	validateBody(CancelExecutionSessionCommandSchema),
	ExecutionSessionController.cancelExecutionSession,
);

router.post(
	"/:id/evidences",
	authenticate,
	authorize(...INTERNAL_ROLES),
	validateParams(ExecutionSessionIdParamsSchema),
	validateBody(AddExecutionEvidenceCommandSchema),
	ExecutionSessionController.addExecutionEvidence,
);

router.post(
	"/:id/materials",
	authenticate,
	authorize(...INTERNAL_ROLES),
	validateParams(ExecutionSessionIdParamsSchema),
	validateBody(AddExecutionMaterialUsageCommandSchema),
	ExecutionSessionController.addMaterialUsage,
);

router.post(
	"/:id/tools",
	authenticate,
	authorize(...INTERNAL_ROLES),
	validateParams(ExecutionSessionIdParamsSchema),
	validateBody(AddExecutionToolUsageCommandSchema),
	ExecutionSessionController.addToolUsage,
);

router.post(
	"/:id/equipment",
	authenticate,
	authorize(...INTERNAL_ROLES),
	validateParams(ExecutionSessionIdParamsSchema),
	validateBody(AddExecutionEquipmentUsageCommandSchema),
	ExecutionSessionController.addEquipmentUsage,
);

router.post(
	"/:id/labor",
	authenticate,
	authorize(...INTERNAL_ROLES),
	validateParams(ExecutionSessionIdParamsSchema),
	validateBody(AddExecutionLaborEntryCommandSchema),
	ExecutionSessionController.addLaborEntry,
);

router.post(
	"/:id/incidents",
	authenticate,
	authorize(...INTERNAL_ROLES),
	validateParams(ExecutionSessionIdParamsSchema),
	validateBody(AddExecutionIncidentCommandSchema),
	ExecutionSessionController.addIncident,
);

router.post(
	"/:id/incidents/:incidentId/resolve",
	authenticate,
	authorize(...INTERNAL_ROLES),
	validateParams(ExecutionIncidentIdParamsSchema),
	ExecutionSessionController.resolveIncident,
);

router.post(
	"/:id/observations",
	authenticate,
	authorize(...INTERNAL_ROLES),
	validateParams(ExecutionSessionIdParamsSchema),
	validateBody(AddExecutionObservationCommandSchema),
	ExecutionSessionController.addObservation,
);

router.post(
	"/:id/signatures",
	authenticate,
	authorize(...INTERNAL_ROLES),
	validateParams(ExecutionSessionIdParamsSchema),
	validateBody(AddExecutionSignatureCommandSchema),
	ExecutionSessionController.addSignature,
);

router.post(
	"/:id/checklist",
	authenticate,
	authorize(...INTERNAL_ROLES),
	validateParams(ExecutionSessionIdParamsSchema),
	validateBody(SubmitExecutionChecklistCommandSchema),
	ExecutionSessionController.submitChecklistResponse,
);

router.post(
	"/:id/dynamic-form",
	authenticate,
	authorize(...INTERNAL_ROLES),
	validateParams(ExecutionSessionIdParamsSchema),
	validateBody(SubmitExecutionDynamicFormCommandSchema),
	ExecutionSessionController.submitDynamicFormResponse,
);

router.post(
	"/:id/commands",
	authenticate,
	authorize(...INTERNAL_ROLES),
	validateParams(ExecutionSessionIdParamsSchema),
	validateBody(ExecutionSyncBatchSchema),
	ExecutionSessionController.syncExecutionCommands,
);

router.post(
	"/:id/sync",
	authenticate,
	authorize(...INTERNAL_ROLES),
	validateParams(ExecutionSessionIdParamsSchema),
	validateBody(ExecutionSyncBatchSchema),
	ExecutionSessionController.syncExecutionCommands,
);

export default router;
