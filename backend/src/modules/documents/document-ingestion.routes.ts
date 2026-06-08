import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import {
	bulkClosingEvidenceController,
	convertDocumentToTemplateController,
	getIngestionStatus,
	ingestDocumentController,
} from "./document-ingestion.controller";

const router = Router({ mergeParams: true });

router.use(authenticate);

router.post(
	"/:documentId/ingest",
	authorize("gerente", "residente", "administrativo", "supervisor"),
	// No body validation needed — ingest uses document ID from params only
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
	// No body validation needed — convert uses document ID from params only
	convertDocumentToTemplateController,
);

router.post(
	"/bulk-closing-evidence",
	authorize("gerente", "residente", "administrativo", "supervisor"),
	// No body validation needed — bulk closing uses internal context
	bulkClosingEvidenceController,
);

export default router;
