import { Router } from "express";
import {
	bulkClosingEvidenceController,
	convertDocumentToTemplateController,
	getIngestionStatus,
	ingestDocumentController,
} from "./document-ingestion.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";

const router = Router({ mergeParams: true });

router.use(authenticate);

router.post(
	"/:documentId/ingest",
	authorize("gerente", "residente", "administrativo", "supervisor"),
	ingestDocumentController,
);

router.get(
	"/:documentId/ingest/status",
	authorize("gerente", "residente", "administrativo", "supervisor"),
	getIngestionStatus,
);

router.post(
	"/:documentId/convert-to-template",
	authorize("gerente", "residente", "administrativo"),
	convertDocumentToTemplateController,
);

router.post(
	"/bulk-closing-evidence",
	authorize("gerente", "residente", "administrativo", "supervisor"),
	bulkClosingEvidenceController,
);

export default router;
