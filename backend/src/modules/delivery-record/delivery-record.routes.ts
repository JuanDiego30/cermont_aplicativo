import { ADMIN_PLUS_RESIDENTE, INTERNAL_ROLES, MANAGEMENT_ROLES } from "@cermont/domain";
import {
	CreateDeliveryRecordV2Schema,
	DeliveryRecordIdParamsSchema,
	ListDeliveryRecordsQuerySchema,
	RejectDeliveryRecordSchema,
	SendDeliveryRecordSchema,
	SignDeliveryRecordSchema,
	TechnicalReportIdParamsSchema,
} from "@cermont/shared-types";
import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import { validateBody, validateParams, validateQuery } from "../../middlewares/validate";
import * as WorkflowController from "../order/administrative-workflow.controller";

const router = Router();

router.use(authenticate);

router.get(
	"/",
	authorize(...INTERNAL_ROLES),
	validateQuery(ListDeliveryRecordsQuerySchema),
	WorkflowController.listDeliveryRecords,
);

router.post(
	"/from-technical-report/:id",
	authorize(...ADMIN_PLUS_RESIDENTE),
	validateParams(TechnicalReportIdParamsSchema),
	validateBody(CreateDeliveryRecordV2Schema),
	WorkflowController.createDeliveryRecordFromTechnicalReport,
);

router.get(
	"/:id",
	authorize(...INTERNAL_ROLES),
	validateParams(DeliveryRecordIdParamsSchema),
	WorkflowController.getDeliveryRecord,
);

router.post(
	"/:id/send",
	authorize(...ADMIN_PLUS_RESIDENTE),
	validateParams(DeliveryRecordIdParamsSchema),
	validateBody(SendDeliveryRecordSchema),
	WorkflowController.sendDeliveryRecord,
);

router.post(
	"/:id/sign",
	authorize("gerente", "residente", "administrativo", "cliente"),
	validateParams(DeliveryRecordIdParamsSchema),
	validateBody(SignDeliveryRecordSchema),
	WorkflowController.signDeliveryRecord,
);

router.post(
	"/:id/reject",
	authorize("gerente", "residente", "cliente"),
	validateParams(DeliveryRecordIdParamsSchema),
	validateBody(RejectDeliveryRecordSchema),
	WorkflowController.rejectDeliveryRecord,
);

router.post(
	"/:id/cancel",
	authorize(...MANAGEMENT_ROLES),
	validateParams(DeliveryRecordIdParamsSchema),
	WorkflowController.cancelDeliveryRecord,
);

router.post(
	"/:id/archive",
	authorize(...MANAGEMENT_ROLES),
	validateParams(DeliveryRecordIdParamsSchema),
	WorkflowController.cancelDeliveryRecord,
);

export default router;
