import {
	ADMIN_PLUS_RESIDENTE,
	CERMONT_ROLES,
	INTERNAL_ROLES,
	MANAGEMENT_ROLES,
} from "@cermont/domain";
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
import * as DeliveryRecordController from "./delivery-record.controller";

const router = Router();

router.use(authenticate);

router.get(
	"/",
	authorize(...INTERNAL_ROLES),
	validateQuery(ListDeliveryRecordsQuerySchema),
	DeliveryRecordController.listDeliveryRecords,
);

router.post(
	"/from-technical-report/:id",
	authorize(...ADMIN_PLUS_RESIDENTE),
	validateParams(TechnicalReportIdParamsSchema),
	validateBody(CreateDeliveryRecordV2Schema),
	DeliveryRecordController.createDeliveryRecordFromTechnicalReport,
);

router.get(
	"/:id",
	authorize(...INTERNAL_ROLES),
	validateParams(DeliveryRecordIdParamsSchema),
	DeliveryRecordController.getDeliveryRecord,
);

router.post(
	"/:id/send",
	authorize(...ADMIN_PLUS_RESIDENTE),
	validateParams(DeliveryRecordIdParamsSchema),
	validateBody(SendDeliveryRecordSchema),
	DeliveryRecordController.sendDeliveryRecord,
);

router.post(
	"/:id/sign",
	authorize(
		CERMONT_ROLES.GERENTE,
		CERMONT_ROLES.RESIDENTE,
		CERMONT_ROLES.ADMINISTRATIVO,
		CERMONT_ROLES.CLIENTE,
	),
	validateParams(DeliveryRecordIdParamsSchema),
	validateBody(SignDeliveryRecordSchema),
	DeliveryRecordController.signDeliveryRecord,
);

router.post(
	"/:id/reject",
	authorize(CERMONT_ROLES.GERENTE, CERMONT_ROLES.RESIDENTE, CERMONT_ROLES.CLIENTE),
	validateParams(DeliveryRecordIdParamsSchema),
	validateBody(RejectDeliveryRecordSchema),
	DeliveryRecordController.rejectDeliveryRecord,
);

router.post(
	"/:id/cancel",
	authorize(...MANAGEMENT_ROLES),
	validateParams(DeliveryRecordIdParamsSchema),
	DeliveryRecordController.cancelDeliveryRecord,
);

router.post(
	"/:id/archive",
	authorize(...MANAGEMENT_ROLES),
	validateParams(DeliveryRecordIdParamsSchema),
	DeliveryRecordController.cancelDeliveryRecord,
);

export default router;
