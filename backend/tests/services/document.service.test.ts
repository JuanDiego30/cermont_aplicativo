import { Types } from "mongoose";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	documentFindById: vi.fn(),
	createAuditLog: vi.fn(),
	unlink: vi.fn(),
}));

vi.mock("node:fs/promises", () => ({
	default: {
		unlink: mocks.unlink,
	},
	unlink: mocks.unlink,
}));

vi.mock("../../src/models/Document", () => ({
	Document: {
		findById: mocks.documentFindById,
		find: vi.fn().mockReturnValue({
			sort: vi.fn().mockReturnThis(),
			lean: vi.fn().mockResolvedValue([]),
		}),
	},
}));

vi.mock("../../src/modules/audit/audit.service", () => ({
	createAuditLog: mocks.createAuditLog,
}));

vi.mock("../../src/common/utils/logger", () => ({
	createLogger: () => ({
		info: vi.fn(),
		warn: vi.fn(),
		error: vi.fn(),
		debug: vi.fn(),
	}),
}));

import {
	archiveDocument,
	associateDocument,
	deleteDocument,
	findAllDocuments,
	getDocumentAssociations,
} from "../../src/modules/documents/document.service";

const USER_ID = "507f1f77bcf86cd799439031";
const DOCUMENT_ID = "507f1f77bcf86cd799439041";
const ORDER_ID = "507f1f77bcf86cd799439051";
const SERVICE_CASE_ID = "507f1f77bcf86cd799439061";

function buildDocumentDoc() {
	return {
		_id: new Types.ObjectId(DOCUMENT_ID),
		title: "AST vigente",
		file_url: "C:/uploads/ast-vigente.pdf",
		purpose: "library" as const,
		lifecycleStatus: "active" as const,
		archivedAt: undefined as Date | undefined,
		archivedBy: undefined as Types.ObjectId | undefined,
		archiveReason: undefined as string | undefined,
		retentionUntil: undefined as Date | undefined,
		deletedAt: undefined as Date | undefined,
		deletedBy: undefined as Types.ObjectId | undefined,
		deleteReason: undefined as string | undefined,
		associations: [] as Array<{
			orderId?: Types.ObjectId;
			serviceCaseId?: Types.ObjectId;
			purpose: "library" | "template_source" | "closing_evidence" | "support_document";
			targetStepCode?: string;
			requirementKey?: string;
			linkedEntityType?: string;
			linkedEntityId?: Types.ObjectId;
			createdBy: Types.ObjectId;
			createdAt: Date;
		}>,
		order_id: undefined as Types.ObjectId | undefined,
		targetStepCode: undefined as string | undefined,
		linkedEntityType: undefined as string | undefined,
		linkedEntityId: undefined as Types.ObjectId | undefined,
		save: vi.fn().mockResolvedValue(undefined),
	};
}

describe("DocumentService", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("associates an existing library document to a service case and step without re-uploading", async () => {
		const document = buildDocumentDoc();
		mocks.documentFindById.mockResolvedValue(document);

		const result = await associateDocument(
			DOCUMENT_ID,
			{
				orderId: ORDER_ID,
				serviceCaseId: SERVICE_CASE_ID,
				purpose: "support_document",
				targetStepCode: "step_05_planning",
				linkedEntityType: "service_case",
				linkedEntityId: SERVICE_CASE_ID,
			},
			USER_ID,
		);

		expect(result.associations).toHaveLength(1);
		expect(result.associations[0]).toMatchObject({
			purpose: "support_document",
			targetStepCode: "step_05_planning",
			linkedEntityType: "service_case",
		});
		expect(result.order_id?.toString()).toBe(ORDER_ID);
		expect(result.linkedEntityId?.toString()).toBe(SERVICE_CASE_ID);
		expect(document.save).toHaveBeenCalledTimes(1);
	});

	it("returns serialized document associations for auditability", async () => {
		const createdAt = new Date("2026-05-23T11:00:00.000Z");
		const document = buildDocumentDoc();
		document.associations.push({
			orderId: new Types.ObjectId(ORDER_ID),
			serviceCaseId: new Types.ObjectId(SERVICE_CASE_ID),
			purpose: "support_document",
			targetStepCode: "step_05_planning",
			linkedEntityType: "service_case",
			linkedEntityId: new Types.ObjectId(SERVICE_CASE_ID),
			createdBy: new Types.ObjectId(USER_ID),
			createdAt,
		});
		mocks.documentFindById.mockResolvedValue(document);

		const result = await getDocumentAssociations(DOCUMENT_ID);

		expect(result).toEqual([
			{
				orderId: ORDER_ID,
				serviceCaseId: SERVICE_CASE_ID,
				purpose: "support_document",
				targetStepCode: "step_05_planning",
				linkedEntityType: "service_case",
				linkedEntityId: SERVICE_CASE_ID,
				createdBy: USER_ID,
				createdAt: createdAt.toISOString(),
			},
		]);
	});

	it("does not create duplicate associations when same params are re-submitted", async () => {
		const createdAt = new Date("2026-05-23T11:00:00.000Z");
		const document = buildDocumentDoc();
		document.associations.push({
			orderId: new Types.ObjectId(ORDER_ID),
			serviceCaseId: new Types.ObjectId(SERVICE_CASE_ID),
			purpose: "support_document" as const,
			targetStepCode: "step_05_planning",
			linkedEntityType: "service_case",
			linkedEntityId: new Types.ObjectId(SERVICE_CASE_ID),
			createdBy: new Types.ObjectId(USER_ID),
			createdAt,
		});
		mocks.documentFindById.mockResolvedValue(document);

		// Attempt same association again
		const result = await associateDocument(
			DOCUMENT_ID,
			{
				orderId: ORDER_ID,
				serviceCaseId: SERVICE_CASE_ID,
				purpose: "support_document",
				targetStepCode: "step_05_planning",
				linkedEntityType: "service_case",
				linkedEntityId: SERVICE_CASE_ID,
			},
			USER_ID,
		);

		// Should still have only 1 association (no duplicate)
		expect(result.associations).toHaveLength(1);
	});

	it("finds documents by serviceCaseId filter", async () => {
		const docs = await findAllDocuments({ serviceCaseId: SERVICE_CASE_ID });
		expect(Array.isArray(docs)).toBe(true);
	});

	it("finds documents by stepCode filter", async () => {
		const docs = await findAllDocuments({ stepCode: "step_10_ses_submission" });
		expect(Array.isArray(docs)).toBe(true);
	});

	it("finds documents by purpose filter", async () => {
		const docs = await findAllDocuments({ purpose: "support_document" });
		expect(Array.isArray(docs)).toBe(true);
	});

	it("archives a document explicitly with retention metadata", async () => {
		const document = buildDocumentDoc();
		mocks.documentFindById.mockResolvedValue(document);

		const result = await archiveDocument(DOCUMENT_ID, USER_ID, "policy retention");

		expect(result.lifecycleStatus).toBe("archived");
		expect(result.archivedBy?.toString()).toBe(USER_ID);
		expect(result.archiveReason).toBe("policy retention");
		expect(result.retentionUntil).toBeInstanceOf(Date);
		expect(document.save).toHaveBeenCalledTimes(1);
		expect(mocks.createAuditLog).toHaveBeenCalledWith(
			expect.objectContaining({
				action: "DOCUMENT_ARCHIVED",
				entity: "Document",
				entityId: DOCUMENT_ID,
				userId: USER_ID,
			}),
		);
	});

	it("archives critical closing evidence instead of physically deleting it", async () => {
		const document = buildDocumentDoc();
		document.purpose = "closing_evidence";
		mocks.documentFindById.mockResolvedValue(document);

		const result = await deleteDocument(DOCUMENT_ID, USER_ID, "requested by manager");

		expect(result.status).toBe("archived");
		expect(document.lifecycleStatus).toBe("archived");
		expect(document.archivedBy?.toString()).toBe(USER_ID);
		expect(document.archiveReason).toBe("requested by manager");
		expect(document.retentionUntil).toBeInstanceOf(Date);
		expect(document.save).toHaveBeenCalledTimes(1);
		expect(mocks.createAuditLog).toHaveBeenCalledWith(
			expect.objectContaining({
				action: "DOCUMENT_ARCHIVED",
				entity: "Document",
				entityId: DOCUMENT_ID,
				userId: USER_ID,
			}),
		);
	});

	it("soft deletes non-critical documents and preserves the physical file", async () => {
		const document = buildDocumentDoc();
		mocks.documentFindById.mockResolvedValue(document);

		const result = await deleteDocument(DOCUMENT_ID, USER_ID, "cleanup");

		expect(result).toEqual({ status: "deleted", documentId: DOCUMENT_ID });
		expect(document.lifecycleStatus).toBe("deleted");
		expect(document.deletedAt).toBeInstanceOf(Date);
		expect(document.deletedBy?.toString()).toBe(USER_ID);
		expect(document.deleteReason).toBe("cleanup");
		expect(document.save).toHaveBeenCalledTimes(1);
		expect(mocks.unlink).not.toHaveBeenCalled();
		expect(mocks.createAuditLog).toHaveBeenCalledWith(
			expect.objectContaining({
				action: "DOCUMENT_DELETED",
				entity: "Document",
				entityId: DOCUMENT_ID,
				userId: USER_ID,
				metadata: expect.objectContaining({
					reason: "cleanup",
					physicalFilePreserved: true,
				}),
			}),
		);
	});
});
