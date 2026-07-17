import sharp from "sharp";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { saveFile } from "../../src/common/storage/local-storage";
import { scanWithClamAV } from "../../src/middlewares/uploadMiddleware";
import { Evidence, Order } from "../../src/models";
import { createAuditLog } from "../../src/modules/audit/audit.service";
import * as evidenceService from "../../src/modules/evidence/evidence.service";

vi.mock("sharp", () => ({
	default: vi.fn(),
}));

vi.mock("uuid", () => ({
	v4: vi.fn().mockReturnValue("abcd-efgh-ijkl"),
}));

vi.mock("../../src/models", () => ({
	Evidence: Object.assign(vi.fn(), {
		findById: vi.fn(),
		countDocuments: vi.fn(),
		find: vi.fn(),
		findOne: vi.fn(),
	}),
	Order: {
		findById: vi.fn(),
	},
	User: {
		find: vi.fn().mockResolvedValue([]),
	},
}));

vi.mock("../../src/common/storage/local-storage", () => ({
	saveFile: vi.fn(),
}));

vi.mock("../../src/middlewares/uploadMiddleware", async (importOriginal) => {
	const actual = await importOriginal<typeof import("../../src/middlewares/uploadMiddleware")>();
	return {
		...actual,
		scanWithClamAV: vi.fn(),
	};
});

vi.mock("../../src/modules/audit/audit.service", () => ({
	createAuditLog: vi.fn(),
}));

vi.mock("../../src/modules/order/order-crud.service", () => ({
	getOrderByIdWithAuth: vi.fn(),
}));

import { getOrderByIdWithAuth } from "../../src/modules/order/order-crud.service";

describe("EvidenceService", () => {
	const orderId = "507f1f77bcf86cd799439011";
	const userId = "507f1f77bcf86cd799439099";
	const fileBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xdb, 0x00, 0x43, 0x00, 0x08]);
	const compressedBuffer = Buffer.from("compressed-webp-buffer");
	const uploadedAt = new Date("2026-01-01T10:00:00.000Z");
	const capturedAt = new Date("2026-01-01T09:30:00.000Z");

	beforeEach(() => {
		vi.clearAllMocks();
		vi.spyOn(Date, "now").mockReturnValue(1700000000000);
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	function mockSharpPipeline() {
		const toBuffer = vi.fn().mockResolvedValue(compressedBuffer);
		const webp = vi.fn().mockReturnValue({ toBuffer });
		const mockInstance = { webp };
		vi.mocked(sharp).mockImplementation(() => mockInstance as unknown as ReturnType<typeof sharp>);

		return { webp, toBuffer };
	}

	function mockEvidenceDocument(overrides: Record<string, unknown> = {}) {
		const doc = {
			_id: "evidence-id-1",
			orderId,
			type: "before",
			url: "https://cdn.example.com/evidence.webp",
			filename: "abcd-efgh-ijkl.webp",
			mimeType: "image/webp",
			sizeBytes: compressedBuffer.length,
			description: "Initial description",
			gpsLocation: undefined,
			capturedAt,
			uploadedAt,
			uploadedBy: userId,
			idempotencyKey: undefined,
			createdAt: uploadedAt,
			updatedAt: uploadedAt,
			deletedAt: undefined,
			save: vi.fn().mockResolvedValue(undefined),
			...overrides,
		};

		vi.mocked(Evidence).mockImplementation(function evidenceModelMock() {
			return doc as unknown as ReturnType<typeof Evidence>;
		});
		return doc;
	}

	describe("createEvidence", () => {
		it("creates, compresses, persists, and audits evidence", async () => {
			const sharpChain = mockSharpPipeline();
			const evidenceDoc = mockEvidenceDocument();

			const mockOrderQuery = { lean: vi.fn().mockResolvedValue({ status: "assigned" }) };
			vi.mocked(Order.findById).mockReturnValue(
				mockOrderQuery as unknown as ReturnType<typeof Order.findById>,
			);
			vi.mocked(scanWithClamAV).mockResolvedValue(true);
			vi.mocked(saveFile).mockResolvedValue("https://cdn.example.com/evidence.webp");

			const result = await evidenceService.createEvidence(orderId, "before", fileBuffer, userId, {
				description: "Initial description",
				capturedAt,
			});

			expect(Order.findById).toHaveBeenCalledWith(orderId);
			expect(scanWithClamAV).toHaveBeenCalledWith(fileBuffer, `evidence-${orderId}-before`);
			expect(sharp).toHaveBeenCalledWith(fileBuffer);
			expect(sharpChain.webp).toHaveBeenCalledWith({ quality: 80 });
			expect(sharpChain.toBuffer).toHaveBeenCalled();
			expect(saveFile).toHaveBeenCalledWith("abcd-efgh-ijkl.webp", compressedBuffer);
			expect(Evidence).toHaveBeenCalledWith(
				expect.objectContaining({
					orderId,
					type: "before",
					filename: "abcd-efgh-ijkl.webp",
					url: "https://cdn.example.com/evidence.webp",
					mimeType: "image/webp",
					sizeBytes: compressedBuffer.length,
					description: "Initial description",
					capturedAt,
					idempotencyKey: undefined,
					uploadedBy: userId,
				}),
			);
			expect(evidenceDoc.save).toHaveBeenCalled();
			expect(createAuditLog).toHaveBeenCalledWith(
				expect.objectContaining({
					action: "EVIDENCE_UPLOADED",
					entity: "Evidence",
					userId,
					metadata: expect.objectContaining({
						orderId,
						type: "before",
						sizeBytes: compressedBuffer.length,
					}),
				}),
			);
			expect(result).toEqual(
				expect.objectContaining({
					_id: "evidence-id-1",
					orderId,
					type: "before",
					url: "https://cdn.example.com/evidence.webp",
					filename: "abcd-efgh-ijkl.webp",
					mimeType: "image/webp",
					sizeBytes: compressedBuffer.length,
					uploadedBy: userId,
				}),
			);
		});

		it("rejects uploads when the order is missing", async () => {
			vi.mocked(Order.findById).mockReturnValue({
				lean: vi.fn().mockResolvedValue(null),
			} as unknown as ReturnType<typeof Order.findById>);

			await expect(
				evidenceService.createEvidence(orderId, "before", fileBuffer, userId, {
					capturedAt,
				}),
			).rejects.toThrow();
		});

		it("rejects uploads when the order state is invalid", async () => {
			vi.mocked(Order.findById).mockReturnValue({
				lean: vi.fn().mockResolvedValue({ status: "cancelled" }),
			} as unknown as ReturnType<typeof Order.findById>);

			await expect(
				evidenceService.createEvidence(orderId, "before", fileBuffer, userId, {
					capturedAt,
				}),
			).rejects.toThrow("Cannot upload evidence for order in cancelled state");
		});

		it("rejects non-image bytes before malware scan and image processing", async () => {
			vi.mocked(Order.findById).mockReturnValue({
				lean: vi.fn().mockResolvedValue({ status: "assigned" }),
			} as unknown as ReturnType<typeof Order.findById>);

			await expect(
				evidenceService.createEvidence(orderId, "before", Buffer.from("not an image"), userId, {
					capturedAt,
				}),
			).rejects.toThrow("Invalid file type. Must be PNG, JPEG, WebP, or GIF");

			expect(scanWithClamAV).not.toHaveBeenCalled();
			expect(sharp).not.toHaveBeenCalled();
			expect(saveFile).not.toHaveBeenCalled();
			expect(Evidence).not.toHaveBeenCalled();
		});

		it("rejects infected files before image processing", async () => {
			vi.mocked(Order.findById).mockReturnValue({
				lean: vi.fn().mockResolvedValue({ status: "assigned" }),
			} as unknown as ReturnType<typeof Order.findById>);
			vi.mocked(scanWithClamAV).mockResolvedValue(false);

			await expect(
				evidenceService.createEvidence(orderId, "before", fileBuffer, userId, {
					capturedAt,
				}),
			).rejects.toThrow("Malware detected in uploaded evidence file");

			expect(sharp).not.toHaveBeenCalled();
			expect(saveFile).not.toHaveBeenCalled();
			expect(Evidence).not.toHaveBeenCalled();
		});

		it("returns the existing evidence when the idempotency key already exists", async () => {
			const existingDoc = mockEvidenceDocument({ idempotencyKey: "idem-evidence-1" });
			const evidenceFindOneMock = vi.fn().mockImplementation((query: Record<string, unknown>) => {
				const result =
					typeof query === "object" && query !== null && "idempotencyKey" in query
						? existingDoc
						: null;
				return { lean: vi.fn().mockResolvedValue(result) };
			});
			vi.mocked(Evidence.findOne).mockImplementation(
				evidenceFindOneMock as unknown as typeof Evidence.findOne,
			);

			const result = await evidenceService.createEvidence(
				orderId,
				"before",
				fileBuffer,
				userId,
				{
					capturedAt,
				},
				{
					idempotencyKey: "idem-evidence-1",
				},
			);

			expect(result._id).toBe("evidence-id-1");
			expect(Order.findById).toHaveBeenCalledWith(orderId);
			expect(scanWithClamAV).not.toHaveBeenCalled();
			expect(saveFile).not.toHaveBeenCalled();
			expect(Evidence).not.toHaveBeenCalled();
		});
	});

	describe("getEvidencesByOrderId", () => {
		const actor = { _id: userId, role: "tecnico" };

		it("returns paginated evidences for an order when user has access", async () => {
			vi.mocked(getOrderByIdWithAuth).mockResolvedValue({
				_id: orderId,
				status: "in_progress",
			} as unknown as Awaited<ReturnType<typeof getOrderByIdWithAuth>>);

			const findChain = {
				skip: vi.fn().mockReturnThis(),
				limit: vi.fn().mockReturnThis(),
				sort: vi.fn().mockReturnValue({
					lean: vi.fn().mockResolvedValue([
						{
							_id: "evidence-1",
							orderId,
							type: "before",
							url: "https://cdn.example.com/1.webp",
							filename: "one.webp",
							mimeType: "image/webp",
							sizeBytes: 111,
							description: "One",
							gpsLocation: undefined,
							capturedAt,
							uploadedAt,
							uploadedBy: userId,
							createdAt: uploadedAt,
							updatedAt: uploadedAt,
						},
					]),
				}),
			};

			vi.mocked(Evidence.countDocuments).mockResolvedValue(1);
			vi.mocked(Evidence.find).mockReturnValue(
				findChain as unknown as ReturnType<typeof Evidence.find>,
			);

			const result = await evidenceService.getEvidencesByOrderId(orderId, actor, 2, 10);

			expect(getOrderByIdWithAuth).toHaveBeenCalledWith(orderId, actor);
			expect(Evidence.countDocuments).toHaveBeenCalledWith({ orderId });
			expect(Evidence.find).toHaveBeenCalledWith({ orderId });
			expect(findChain.skip).toHaveBeenCalledWith(10);
			expect(findChain.limit).toHaveBeenCalledWith(10);
			expect(findChain.sort).toHaveBeenCalledWith({ createdAt: -1 });
			expect(result).toEqual({
				evidences: [
					expect.objectContaining({
						_id: "evidence-1",
						orderId,
						type: "before",
						uploadedBy: userId,
					}),
				],
				total: 1,
				page: 2,
				limit: 10,
				pages: 1,
			});
		});

		it("rejects when user does not have access to the order", async () => {
			const { ForbiddenError } = await import("../../src/common/errors/AppError");
			vi.mocked(getOrderByIdWithAuth).mockRejectedValue(
				new ForbiddenError("You do not have access to this order"),
			);

			await expect(evidenceService.getEvidencesByOrderId(orderId, actor, 1, 20)).rejects.toThrow(
				"You do not have access to this order",
			);

			expect(getOrderByIdWithAuth).toHaveBeenCalledWith(orderId, actor);
		});

		it("rejects when the order does not exist", async () => {
			const { NotFoundError } = await import("../../src/common/errors/AppError");
			vi.mocked(getOrderByIdWithAuth).mockRejectedValue(new NotFoundError("Order", orderId));

			await expect(evidenceService.getEvidencesByOrderId(orderId, actor)).rejects.toThrow();

			expect(getOrderByIdWithAuth).toHaveBeenCalledWith(orderId, actor);
		});
	});

	describe("getEvidenceById", () => {
		const actor = { _id: userId, role: "tecnico" };

		it("returns a formatted evidence document", async () => {
			vi.mocked(Evidence.findById).mockReturnValue({
				lean: vi.fn().mockResolvedValue({
					_id: "evidence-1",
					orderId,
					type: "after",
					url: "https://cdn.example.com/after.webp",
					filename: "after.webp",
					mimeType: "image/webp",
					sizeBytes: 222,
					description: "After",
					gpsLocation: undefined,
					capturedAt,
					uploadedAt,
					uploadedBy: userId,
					createdAt: uploadedAt,
					updatedAt: uploadedAt,
				}),
			} as unknown as ReturnType<typeof Evidence.findById>);
			vi.mocked(getOrderByIdWithAuth).mockResolvedValue({
				_id: orderId,
				status: "in_progress",
			} as unknown as Awaited<ReturnType<typeof getOrderByIdWithAuth>>);

			await expect(evidenceService.getEvidenceById("evidence-1", actor)).resolves.toEqual(
				expect.objectContaining({
					_id: "evidence-1",
					orderId,
					type: "after",
					uploadedBy: userId,
				}),
			);
			expect(getOrderByIdWithAuth).toHaveBeenCalledWith(orderId, actor);
		});

		it("throws when evidence is missing", async () => {
			vi.mocked(Evidence.findById).mockReturnValue({
				lean: vi.fn().mockResolvedValue(null),
			} as unknown as ReturnType<typeof Evidence.findById>);

			await expect(evidenceService.getEvidenceById("missing-id", actor)).rejects.toThrow();
			expect(getOrderByIdWithAuth).not.toHaveBeenCalled();
		});

		it("rejects when the actor cannot access the evidence order", async () => {
			const { ForbiddenError } = await import("../../src/common/errors/AppError");
			vi.mocked(Evidence.findById).mockReturnValue({
				lean: vi.fn().mockResolvedValue({
					_id: "evidence-private",
					orderId,
					type: "after",
					url: "https://cdn.example.com/after.webp",
					filename: "after.webp",
					mimeType: "image/webp",
					sizeBytes: 222,
					capturedAt,
					uploadedAt,
					uploadedBy: userId,
					createdAt: uploadedAt,
					updatedAt: uploadedAt,
				}),
			} as unknown as ReturnType<typeof Evidence.findById>);
			vi.mocked(getOrderByIdWithAuth).mockRejectedValue(
				new ForbiddenError("You do not have access to this order"),
			);

			await expect(evidenceService.getEvidenceById("evidence-private", actor)).rejects.toThrow(
				"You do not have access to this order",
			);
			expect(getOrderByIdWithAuth).toHaveBeenCalledWith(orderId, actor);
		});
	});

	describe("deleteEvidence", () => {
		it("soft deletes evidence and writes an audit log", async () => {
			const evidenceDoc = mockEvidenceDocument({ type: "signature" });
			vi.mocked(Evidence.findById).mockResolvedValue(
				evidenceDoc as unknown as Awaited<ReturnType<typeof Evidence.findById>>,
			);

			const result = await evidenceService.deleteEvidence("evidence-id-1", userId);

			expect(Evidence.findById).toHaveBeenCalledWith("evidence-id-1");
			expect(evidenceDoc.deletedAt).toBeInstanceOf(Date);
			expect(evidenceDoc.save).toHaveBeenCalled();
			expect(createAuditLog).toHaveBeenCalledWith(
				expect.objectContaining({
					action: "EVIDENCE_DELETED",
					entity: "Evidence",
					userId,
					metadata: expect.objectContaining({
						orderId,
						filename: "abcd-efgh-ijkl.webp",
					}),
				}),
			);
			expect(result).toEqual(
				expect.objectContaining({
					_id: "evidence-id-1",
					type: "signature",
					uploadedBy: userId,
				}),
			);
		});

		it("throws when the evidence does not exist", async () => {
			vi.mocked(Evidence.findById).mockResolvedValue(null);

			await expect(evidenceService.deleteEvidence("missing-id", userId)).rejects.toThrow();
		});
	});

	describe("verifyEvidence", () => {
		it("verifies evidence and writes an audit log when user has authorized role", async () => {
			const evidenceDoc = mockEvidenceDocument();
			vi.mocked(Evidence.findById).mockResolvedValue(
				evidenceDoc as unknown as Awaited<ReturnType<typeof Evidence.findById>>,
			);
			vi.mocked(getOrderByIdWithAuth).mockResolvedValue(undefined);

			const verifierId = "507f1f77bcf86cd799439088";
			const result = await evidenceService.verifyEvidence(
				"evidence-id-1",
				verifierId,
				"gerente",
				true,
				"approved",
				{ _id: verifierId, role: "gerente" },
			);

			expect(Evidence.findById).toHaveBeenCalledWith("evidence-id-1");
			expect(evidenceDoc.verifiedAt).toBeInstanceOf(Date);
			expect(evidenceDoc.save).toHaveBeenCalled();
			expect(createAuditLog).toHaveBeenCalledWith(
				expect.objectContaining({
					action: "EVIDENCE_VERIFIED",
					entity: "Evidence",
					userId: verifierId,
					metadata: expect.objectContaining({
						orderId,
						filename: "abcd-efgh-ijkl.webp",
					}),
				}),
			);
			expect(result).toEqual(
				expect.objectContaining({
					_id: "evidence-id-1",
					uploadedBy: userId,
				}),
			);
		});

		it("allows supervisor role to verify", async () => {
			const evidenceDoc = mockEvidenceDocument();
			vi.mocked(Evidence.findById).mockResolvedValue(
				evidenceDoc as unknown as Awaited<ReturnType<typeof Evidence.findById>>,
			);

			await expect(
				evidenceService.verifyEvidence("evidence-id-1", userId, "supervisor", true, ""),
			).resolves.toBeDefined();
		});

		it("rejects verification from unauthorized role", async () => {
			await expect(
				evidenceService.verifyEvidence("evidence-id-1", userId, "operador", true, ""),
			).rejects.toThrow("You do not have permission to verify evidence");
		});

		it("throws when evidence does not exist", async () => {
			vi.mocked(Evidence.findById).mockResolvedValue(null);

			await expect(
				evidenceService.verifyEvidence("missing-id", userId, "gerente", true, ""),
			).rejects.toThrow();
		});

		it("marks evidence as rejected with comment when not approved", async () => {
			const evidenceDoc = mockEvidenceDocument();
			vi.mocked(Evidence.findById).mockResolvedValue(
				evidenceDoc as unknown as Awaited<ReturnType<typeof Evidence.findById>>,
			);

			const result = await evidenceService.verifyEvidence(
				"evidence-id-1",
				userId,
				"gerente",
				false,
				"Foto borrosa, repetir",
			);

			expect(evidenceDoc.verificationStatus).toBe("rejected");
			expect(evidenceDoc.verificationComment).toBe("Foto borrosa, repetir");
			expect(createAuditLog).toHaveBeenCalledWith(
				expect.objectContaining({ action: "EVIDENCE_REJECTED" }),
			);
			expect(result).toEqual(expect.objectContaining({ verificationStatus: "rejected" }));
		});
	});
});
