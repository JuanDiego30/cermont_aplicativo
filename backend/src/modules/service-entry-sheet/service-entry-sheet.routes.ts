import { ADMIN_PLUS_RESIDENTE, INTERNAL_ROLES, MANAGEMENT_ROLES } from "@cermont/domain";
import {
	ApproveServiceEntrySheetSchema,
	CreateOrderServiceEntrySheetSchema,
	ListServiceEntrySheetsQuerySchema,
	ObjectIdSchema,
	RejectServiceEntrySheetSchema,
	ServiceEntrySheetIdParamsSchema,
	SubmitServiceEntrySheetSchema,
} from "@cermont/shared-types";
import { Router } from "express";
import { z } from "zod";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import { validateBody, validateParams, validateQuery } from "../../middlewares/validate";
import * as WorkflowController from "../order/administrative-workflow.controller";

const router = Router();
const DeliveryRecordIdParamsSchema = z.object({ id: ObjectIdSchema }).strict();

router.use(authenticate);

router.get(
	"/",
	authorize(...INTERNAL_ROLES),
	validateQuery(ListServiceEntrySheetsQuerySchema),
	WorkflowController.listServiceEntrySheets,
);

router.post(
	"/from-delivery-record/:id",
	authorize(...ADMIN_PLUS_RESIDENTE),
	validateParams(DeliveryRecordIdParamsSchema),
	validateBody(CreateOrderServiceEntrySheetSchema),
	WorkflowController.createServiceEntrySheetFromDeliveryRecord,
);

router.get(
	"/:id",
	authorize(...INTERNAL_ROLES),
	validateParams(ServiceEntrySheetIdParamsSchema),
	WorkflowController.getServiceEntrySheet,
);

router.post(
	"/:id/submit",
	authorize(...ADMIN_PLUS_RESIDENTE),
	validateParams(ServiceEntrySheetIdParamsSchema),
	validateBody(SubmitServiceEntrySheetSchema),
	WorkflowController.submitServiceEntrySheet,
);

router.post(
	"/:id/approve",
	authorize(...MANAGEMENT_ROLES),
	validateParams(ServiceEntrySheetIdParamsSchema),
	validateBody(ApproveServiceEntrySheetSchema),
	WorkflowController.approveServiceEntrySheet,
);

router.post(
	"/:id/reject",
	authorize(...MANAGEMENT_ROLES),
	validateParams(ServiceEntrySheetIdParamsSchema),
	validateBody(RejectServiceEntrySheetSchema),
	WorkflowController.rejectServiceEntrySheet,
);

router.post(
	"/:id/cancel",
	authorize(...ADMIN_PLUS_RESIDENTE),
	validateParams(ServiceEntrySheetIdParamsSchema),
	WorkflowController.cancelServiceEntrySheet,
);

router.post(
	"/:id/archive",
	authorize(...ADMIN_PLUS_RESIDENTE),
	validateParams(ServiceEntrySheetIdParamsSchema),
	WorkflowController.cancelServiceEntrySheet,
);

router.post(
	"/:id/mark-external-submitted",
	authorize(...ADMIN_PLUS_RESIDENTE),
	validateParams(ServiceEntrySheetIdParamsSchema),
	validateBody(SubmitServiceEntrySheetSchema),
	WorkflowController.submitServiceEntrySheet,
);

router.post(
	"/:id/sync-ariba",
	authorize(...ADMIN_PLUS_RESIDENTE),
	validateParams(ServiceEntrySheetIdParamsSchema),
	validateBody(SubmitServiceEntrySheetSchema),
	WorkflowController.submitServiceEntrySheet,
);

export default router;
