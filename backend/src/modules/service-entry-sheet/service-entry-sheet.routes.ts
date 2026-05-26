import { INTERNAL_ROLES } from "@cermont/domain";
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
	authorize("gerente", "residente", "administrativo"),
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
	authorize("gerente", "residente", "administrativo"),
	validateParams(ServiceEntrySheetIdParamsSchema),
	validateBody(SubmitServiceEntrySheetSchema),
	WorkflowController.submitServiceEntrySheet,
);

router.post(
	"/:id/approve",
	authorize("gerente", "residente"),
	validateParams(ServiceEntrySheetIdParamsSchema),
	validateBody(ApproveServiceEntrySheetSchema),
	WorkflowController.approveServiceEntrySheet,
);

router.post(
	"/:id/reject",
	authorize("gerente", "residente"),
	validateParams(ServiceEntrySheetIdParamsSchema),
	validateBody(RejectServiceEntrySheetSchema),
	WorkflowController.rejectServiceEntrySheet,
);

router.post(
	"/:id/cancel",
	authorize("gerente", "residente", "administrativo"),
	validateParams(ServiceEntrySheetIdParamsSchema),
	WorkflowController.cancelServiceEntrySheet,
);

router.post(
	"/:id/archive",
	authorize("gerente", "residente", "administrativo"),
	validateParams(ServiceEntrySheetIdParamsSchema),
	WorkflowController.cancelServiceEntrySheet,
);

router.post(
	"/:id/mark-external-submitted",
	authorize("gerente", "residente", "administrativo"),
	validateParams(ServiceEntrySheetIdParamsSchema),
	validateBody(SubmitServiceEntrySheetSchema),
	WorkflowController.submitServiceEntrySheet,
);

router.post(
	"/:id/sync-ariba",
	authorize("gerente", "residente", "administrativo"),
	validateParams(ServiceEntrySheetIdParamsSchema),
	validateBody(SubmitServiceEntrySheetSchema),
	WorkflowController.submitServiceEntrySheet,
);

export default router;
