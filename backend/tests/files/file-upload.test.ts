import { Readable } from "node:stream";
import { Types } from "mongoose";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createFileAssetFromUpload } from "../../src/modules/files/files.service";

const mocks = vi.hoisted(() => ({
	auditCreate: vi.fn(),
	fileAssetCreate: vi.fn(),
	fileAssetDeleteOne: vi.fn(),
	fileAssetFindOne: vi.fn(),
	resourceExists: vi.fn(),
	resourceUpdateOne: vi.fn(),
	vehicleExists: vi.fn(),
	vehicleUpdateOne: vi.fn(),
	orderExists: vi.fn(),
	orderUpdateOne: vi.fn(),
	checklistExists: vi.fn(),
	checklistUpdateOne: vi.fn(),
}));

vi.mock("../../src/models/FileAsset", () => ({
	FileAsset: {
		create: mocks.fileAssetCreate,
		deleteOne: mocks.fileAssetDeleteOne,
		findOne: mocks.fileAssetFindOne,
	},
}));

vi.mock("../../src/models/Resource", () => ({
	Resource: {
		exists: mocks.resourceExists,
		updateOne: mocks.resourceUpdateOne,
	},
}));

vi.mock("../../src/models/Vehicle", () => ({
	VehicleModel: {
		exists: mocks.vehicleExists,
		updateOne: mocks.vehicleUpdateOne,
	},
}));

vi.mock("../../src/models/Order", () => ({
	Order: {
		exists: mocks.orderExists,
		updateOne: mocks.orderUpdateOne,
	},
}));

vi.mock("../../src/models/Checklist", () => ({
	Checklist: {
		exists: mocks.checklistExists,
		updateOne: mocks.checklistUpdateOne,
	},
}));

vi.mock("../../src/modules/audit/audit.service", () => ({
	createAuditLog: mocks.auditCreate,
}));

function makeUploadedFile(): Express.Multer.File {
	const buffer = Buffer.from("not-a-real-image-but-valid-service-bytes");
	return {
		fieldname: "file",
		originalname: "inspection-camera.jpg",
		encoding: "7bit",
		mimetype: "image/jpeg",
		size: buffer.length,
		stream: Readable.from(buffer),
		destination: "",
		filename: "stored-camera.jpg",
		path: "C:/tmp/stored-camera.jpg",
		buffer,
	};
}

describe("files.service", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("persists an equipment image and appends the FileAssetRef to the resource parent", async () => {
		const entityId = new Types.ObjectId();
		const userId = new Types.ObjectId();
		mocks.resourceExists.mockResolvedValue({ _id: entityId });
		mocks.fileAssetFindOne.mockResolvedValue(false);
		mocks.fileAssetCreate.mockImplementation(async (input) => ({
			...input,
			_id: new Types.ObjectId(),
			uploadedAt: new Date("2026-06-03T12:00:00.000Z"),
		}));
		mocks.resourceUpdateOne.mockResolvedValue({ modifiedCount: 1 });
		mocks.auditCreate.mockResolvedValue({ id: "audit-1" });

		const result = await createFileAssetFromUpload(
			{
				category: "equipment_image",
				entityType: "equipment",
				entityId: entityId.toString(),
				description: "Equipment front view",
				tags: ["field"],
			},
			makeUploadedFile(),
			userId.toString(),
			"supervisor@cermont.test",
		);

		expect(result.ref.entityType).toBe("equipment");
		expect(result.ref.category).toBe("equipment_image");
		expect(result.ref.url).toBe(`/api/files/${result.ref.id}/content`);
		expect(result.publicUrl).toBe(`/api/files/${result.ref.id}/content`);
		expect(mocks.fileAssetCreate).toHaveBeenCalledWith(
			expect.objectContaining({
				id: result.ref.id,
				url: `/api/files/${result.ref.id}/content`,
				storageKey: "stored-camera.jpg",
			}),
		);
		expect(mocks.resourceExists).toHaveBeenCalledWith({ _id: entityId });
		expect(mocks.resourceUpdateOne).toHaveBeenCalledWith(
			{ _id: entityId },
			{ $push: { fileAssets: expect.objectContaining({ id: result.ref.id }) } },
		);
		expect(mocks.auditCreate).toHaveBeenCalledWith(
			expect.objectContaining({
				action: "FILE_ASSET_UPLOADED",
				entity: "FileAsset",
				entityId: result.ref.id,
			}),
		);
	});

	it("persists a tool image against the Resource parent used by /resources", async () => {
		const entityId = new Types.ObjectId();
		const userId = new Types.ObjectId();
		mocks.resourceExists.mockResolvedValue({ _id: entityId });
		mocks.fileAssetFindOne.mockResolvedValue(false);
		mocks.fileAssetCreate.mockImplementation(async (input) => ({
			...input,
			_id: new Types.ObjectId(),
			uploadedAt: new Date("2026-06-03T12:00:00.000Z"),
		}));
		mocks.resourceUpdateOne.mockResolvedValue({ modifiedCount: 1 });
		mocks.auditCreate.mockResolvedValue({ id: "audit-2" });

		const result = await createFileAssetFromUpload(
			{
				category: "tool_image",
				entityType: "tool",
				entityId: entityId.toString(),
				description: "Tool front view",
				tags: ["field"],
			},
			makeUploadedFile(),
			userId.toString(),
			"supervisor@cermont.test",
		);

		expect(result.ref.entityType).toBe("tool");
		expect(result.ref.category).toBe("tool_image");
		expect(result.ref.url).toBe(`/api/files/${result.ref.id}/content`);
		expect(mocks.resourceExists).toHaveBeenCalledWith({ _id: entityId });
		expect(mocks.resourceUpdateOne).toHaveBeenCalledWith(
			{ _id: entityId },
			{ $push: { fileAssets: expect.objectContaining({ id: result.ref.id }) } },
		);
	});

	it("persists a vehicle image and appends its ref to the vehicle parent", async () => {
		const entityId = new Types.ObjectId();
		const userId = new Types.ObjectId();
		mocks.vehicleExists.mockResolvedValue({ _id: entityId });
		mocks.fileAssetFindOne.mockResolvedValue(false);
		mocks.fileAssetCreate.mockImplementation(async (input) => ({
			...input,
			_id: new Types.ObjectId(),
			uploadedAt: new Date("2026-06-29T12:00:00.000Z"),
		}));
		mocks.vehicleUpdateOne.mockResolvedValue({ modifiedCount: 1 });
		mocks.auditCreate.mockResolvedValue({ id: "audit-vehicle" });

		const result = await createFileAssetFromUpload(
			{
				category: "vehicle_image",
				entityType: "vehicle",
				entityId: entityId.toString(),
				description: "Vehicle front view",
			},
			makeUploadedFile(),
			userId.toString(),
			"supervisor@cermont.test",
		);

		expect(result.ref.entityType).toBe("vehicle");
		expect(result.ref.category).toBe("vehicle_image");
		expect(mocks.vehicleExists).toHaveBeenCalledWith({ _id: entityId });
		expect(mocks.vehicleUpdateOne).toHaveBeenCalledWith(
			{ _id: entityId },
			{ $push: { fileAssets: expect.objectContaining({ id: result.ref.id }) } },
		);
	});

	it("rejects a MIME type outside the canonical allowlist", async () => {
		const file = { ...makeUploadedFile(), mimetype: "text/html" };

		await expect(
			createFileAssetFromUpload(
				{
					category: "evidence_photo",
					entityType: "evidence",
					entityId: new Types.ObjectId().toString(),
				},
				file,
				new Types.ObjectId().toString(),
			),
		).rejects.toMatchObject({ code: "INVALID_FILE_TYPE" });
	});

	it("supports work-order and checklist-execution parent adapters", async () => {
		const userId = new Types.ObjectId();
		mocks.fileAssetFindOne.mockResolvedValue(false);
		mocks.fileAssetCreate.mockImplementation(async (input) => ({
			...input,
			_id: new Types.ObjectId(),
			uploadedAt: new Date("2026-06-29T12:00:00.000Z"),
		}));
		mocks.auditCreate.mockResolvedValue({ id: "audit-parent-adapter" });
		mocks.orderExists.mockResolvedValue(true);
		mocks.checklistExists.mockResolvedValue(true);

		const workOrderId = new Types.ObjectId();
		await createFileAssetFromUpload(
			{
				category: "signed_document",
				entityType: "work_order",
				entityId: workOrderId.toString(),
			},
			{ ...makeUploadedFile(), mimetype: "application/pdf", originalname: "permit.pdf" },
			userId.toString(),
		);
		expect(mocks.orderUpdateOne).toHaveBeenCalledWith(
			{ _id: workOrderId },
			{ $push: { fileAssets: expect.objectContaining({ entityType: "work_order" }) } },
		);

		const checklistId = new Types.ObjectId();
		await createFileAssetFromUpload(
			{
				category: "checklist_evidence",
				entityType: "checklist_execution",
				entityId: checklistId.toString(),
			},
			makeUploadedFile(),
			userId.toString(),
		);
		expect(mocks.checklistUpdateOne).toHaveBeenCalledWith(
			{ _id: checklistId },
			{ $push: { fileAssets: expect.objectContaining({ entityType: "checklist_execution" }) } },
		);
	});

	it("scopes offline idempotency to owner, entity and uploader", async () => {
		const entityId = new Types.ObjectId();
		const userId = new Types.ObjectId();
		mocks.vehicleExists.mockResolvedValue(true);
		mocks.fileAssetFindOne.mockResolvedValue(false);
		mocks.fileAssetCreate.mockImplementation(async (input) => ({
			...input,
			_id: new Types.ObjectId(),
			uploadedAt: new Date("2026-06-29T12:00:00.000Z"),
		}));

		await createFileAssetFromUpload(
			{
				category: "vehicle_image",
				entityType: "vehicle",
				entityId: entityId.toString(),
				offlineLocalId: "offline-shared-name",
			},
			makeUploadedFile(),
			userId.toString(),
		);

		expect(mocks.fileAssetFindOne).toHaveBeenCalledWith(
			expect.objectContaining({
				offlineLocalId: "offline-shared-name",
				entityType: "vehicle",
				entityId,
				uploadedBy: userId,
			}),
		);
	});

	it("resolves authorized content from private storage metadata", async () => {
		const { resolveFileAssetContent } = await import("../../src/modules/files/files.service");
		const entityId = new Types.ObjectId();
		const storedName = "stored-camera.jpg";
		mocks.fileAssetFindOne.mockResolvedValue({
			id: "file-content-1",
			originalName: "inspection-camera.jpg",
			storedName,
			mimeType: "image/jpeg",
			storageKey: storedName,
			entityType: "equipment",
			entityId,
			deletedAt: null,
		});

		mocks.auditCreate.mockResolvedValue({ id: "audit-download" });
		const userId = new Types.ObjectId().toString();
		const content = await resolveFileAssetContent("file-content-1", userId);

		expect(content.absolutePath.endsWith(storedName)).toBe(true);
		expect(content.mimeType).toBe("image/jpeg");
		expect(content.downloadName).toBe("inspection-camera.jpg");
		expect(mocks.fileAssetFindOne).toHaveBeenCalledWith({
			id: "file-content-1",
			deletedAt: null,
		});
		expect(mocks.auditCreate).toHaveBeenCalledWith(
			expect.objectContaining({
				action: "FILE_ASSET_DOWNLOADED",
				entity: "FileAsset",
				userId,
				entityId: "file-content-1",
			}),
		);
	});
});
