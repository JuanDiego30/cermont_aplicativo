/**
 * Client Signature Service Tests
 */

import { Types } from "mongoose";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	signatureCreate: vi.fn(),
	signatureFind: vi.fn(),
	signatureFindById: vi.fn(),
	signatureFindOne: vi.fn(),
	signatureFindByIdAndUpdate: vi.fn(),
	signatureCountDocuments: vi.fn(),
	counterInc: vi.fn(),
	saveFile: vi.fn(),
}));

vi.mock("../../src/models/ClientSignature", () => ({
	ClientSignatureModel: {
		create: mocks.signatureCreate,
		find: mocks.signatureFind,
		findById: mocks.signatureFindById,
		findOne: mocks.signatureFindOne,
		findByIdAndUpdate: mocks.signatureFindByIdAndUpdate,
		countDocuments: mocks.signatureCountDocuments,
	},
}));

vi.mock("../../src/models/Counter", () => ({
	Counter: { inc: mocks.counterInc },
}));

vi.mock("../../src/common/storage/local-storage", () => ({
	saveFile: mocks.saveFile,
}));

import * as ClientSignatureService from "../../src/modules/client-signature/client-signature.service";

const SIGNATURE_ID = "507f1f77bcf86cd799439011";
const CONTEXT_ID = "507f1f77bcf86cd799439021";
const USER_ID = "507f1f77bcf86cd799439031";

// Smallest valid PNG header followed by junk payload
const PNG_BASE64 = `data:image/png;base64,${Buffer.concat([
	Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
	Buffer.from("fake-png-body"),
]).toString("base64")}`;

function buildSignature(overrides: Record<string, unknown> = {}) {
	return {
		_id: new Types.ObjectId(SIGNATURE_ID),
		code: "SIG-2026-0001",
		clientName: "Representante SierraCol",
		contextType: "delivery_record",
		contextId: new Types.ObjectId(CONTEXT_ID),
		status: "captured",
		...overrides,
	};
}

beforeEach(() => {
	vi.clearAllMocks();
});

describe("ClientSignatureService", () => {
	describe("createSignature", () => {
		it("stores PNG, hash, and metadata", async () => {
			mocks.counterInc.mockResolvedValue(1);
			mocks.saveFile.mockResolvedValue("/uploads/signature-sig-2026-0001.png");
			const signature = buildSignature();
			mocks.signatureCreate.mockResolvedValue(signature);

			const result = await ClientSignatureService.createSignature(
				{
					clientName: "Representante SierraCol",
					contextType: "delivery_record",
					contextId: CONTEXT_ID,
					captureMethod: "canvas_touch",
					imageData: PNG_BASE64,
				},
				USER_ID,
			);

			expect(result).toBe(signature);
			expect(mocks.saveFile).toHaveBeenCalledWith(
				"signature-sig-2026-0001.png",
				expect.any(Buffer),
			);
			expect(mocks.signatureCreate).toHaveBeenCalledWith(
				expect.objectContaining({
					code: "SIG-2026-0001",
					imageHash: expect.stringMatching(/^[a-f0-9]{64}$/),
					status: "captured",
					signedBy: USER_ID,
				}),
			);
		});

		it("returns the existing signature for a repeated clientMutationId (idempotency)", async () => {
			const existing = buildSignature();
			mocks.signatureFindOne.mockResolvedValue(existing);

			const result = await ClientSignatureService.createSignature(
				{
					clientName: "Representante SierraCol",
					contextType: "delivery_record",
					contextId: CONTEXT_ID,
					captureMethod: "canvas_touch",
					imageData: PNG_BASE64,
					clientMutationId: "0f8fad5b-d9cb-469f-a165-70867728950e",
				},
				USER_ID,
			);

			expect(result).toBe(existing);
			expect(mocks.signatureCreate).not.toHaveBeenCalled();
		});

		it("rejects non-PNG payloads", async () => {
			await expect(
				ClientSignatureService.createSignature(
					{
						clientName: "X",
						contextType: "delivery_record",
						contextId: CONTEXT_ID,
						captureMethod: "canvas_mouse",
						imageData: Buffer.from("not a png").toString("base64"),
					},
					USER_ID,
				),
			).rejects.toMatchObject({ code: "SIGNATURE_IMAGE_NOT_PNG" });
		});
	});

	describe("verifySignature", () => {
		it("verifies a captured signature", async () => {
			mocks.signatureFindById.mockResolvedValue(buildSignature());
			mocks.signatureFindByIdAndUpdate.mockResolvedValue(buildSignature({ status: "verified" }));

			const result = await ClientSignatureService.verifySignature(SIGNATURE_ID, USER_ID);

			expect(result.status).toBe("verified");
		});

		it("rejects verifying an already rejected signature", async () => {
			mocks.signatureFindById.mockResolvedValue(buildSignature({ status: "rejected" }));

			await expect(
				ClientSignatureService.verifySignature(SIGNATURE_ID, USER_ID),
			).rejects.toMatchObject({ code: "INVALID_FSM_TRANSITION" });
		});
	});
});
