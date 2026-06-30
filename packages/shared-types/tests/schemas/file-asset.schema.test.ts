/**
 * Tests for the FileAsset contract — the SSOT for file/image metadata
 * across kits, tools, evidences, delivery records, and technical reports.
 *
 * These tests guard the contract that FASE 5-7 (Mongoose models, upload
 * endpoints, frontend UI) will depend on.
 */

import { describe, expect, it } from "vitest";
import {
	ALLOWED_FILE_MIME_TYPES,
	FileAssetCategory,
	FileAssetCategoryPresets,
	FileAssetEntityType,
	FileAssetRefSchema,
	FileAssetSyncStatus,
	FileAssetUploadInputFormSchema,
	FileAssetUploadInputSchema,
	FileAssetUploadResponseSchema,
} from "../../src/schemas/file-asset.schema";

const validRef = {
	id: "fa_01HXY123ABC",
	originalName: "kit-principal.jpg",
	storedName: "fa_01HXY123ABC.jpg",
	mimeType: "image/jpeg",
	sizeBytes: 245_812,
	url: "/api/files/fa_01HXY123ABC",
	thumbnailUrl: "/api/files/fa_01HXY123ABC/thumbnail",
	storageKey: "kits/2026/06/fa_01HXY123ABC.jpg",
	checksum: "sha256:9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
	width: 1920,
	height: 1080,
	uploadedBy: "user_01HXY789",
	uploadedAt: "2026-06-01T15:00:00.000Z",
	entityType: "kit",
	entityId: "kit_01HXY456",
	category: "kit_image",
	description: "Vista frontal del kit típico de mantenimiento eléctrico",
	tags: ["mantenimiento", "electrico"],
	offlineLocalId: "local_abc123",
	syncStatus: "synced",
	kind: "image",
	source: "upload",
	status: "active",
	isPrimary: true,
	metadata: { workflowPhase: "planning", sequence: 1 },
};

describe("FileAsset contract", () => {
	describe("FileAssetRefSchema", () => {
		it("accepts a complete valid reference", () => {
			const parsed = FileAssetRefSchema.parse(validRef);
			expect(parsed.id).toBe(validRef.id);
			expect(parsed.category).toBe("kit_image");
			expect(parsed.entityType).toBe("kit");
		});

		it("rejects an empty id", () => {
			expect(() => FileAssetRefSchema.parse({ ...validRef, id: "" })).toThrow();
		});

		it("rejects a non-positive sizeBytes", () => {
			expect(() => FileAssetRefSchema.parse({ ...validRef, sizeBytes: -1 })).toThrow();
		});

		it("rejects a non-positive width when present", () => {
			expect(() => FileAssetRefSchema.parse({ ...validRef, width: 0 })).toThrow();
		});

		it("rejects more than 20 tags", () => {
			const tooMany = Array.from({ length: 21 }, (_, i) => `tag-${i}`);
			expect(() => FileAssetRefSchema.parse({ ...validRef, tags: tooMany })).toThrow();
		});

		it("accepts references without optional fields", () => {
			const minimal = {
				id: "fa_x",
				originalName: "x.png",
				storedName: "x.png",
				mimeType: "image/png",
				sizeBytes: 100,
				url: "/api/files/x",
				storageKey: "x",
				uploadedBy: "u",
				uploadedAt: "2026-06-01T15:00:00.000Z",
				entityType: "kit" as const,
				entityId: "k1",
				category: "kit_image" as const,
			};
			expect(() => FileAssetRefSchema.parse(minimal)).not.toThrow();
		});

		it("rejects an unknown category", () => {
			expect(() => FileAssetRefSchema.parse({ ...validRef, category: "random_thing" })).toThrow();
		});

		it("rejects an unknown entityType", () => {
			expect(() =>
				FileAssetRefSchema.parse({ ...validRef, entityType: "random_entity" }),
			).toThrow();
		});

		it("rejects an unknown syncStatus", () => {
			expect(() =>
				FileAssetRefSchema.parse({ ...validRef, syncStatus: "uploading_now" }),
			).toThrow();
		});
	});

	describe("FileAssetUploadInputSchema", () => {
		it("requires category, entityType, and entityId", () => {
			const input = {
				category: "evidence_photo",
				entityType: "evidence",
				entityId: "ev_01",
			};
			expect(() => FileAssetUploadInputSchema.parse(input)).not.toThrow();
		});

		it("accepts optional description, tags, and offlineLocalId", () => {
			const input = {
				category: "evidence_photo",
				entityType: "evidence",
				entityId: "ev_01",
				description: "Foto del antes",
				tags: ["antes"],
				offlineLocalId: "local_xyz",
			};
			const parsed = FileAssetUploadInputSchema.parse(input);
			expect(parsed.offlineLocalId).toBe("local_xyz");
		});
	});

	describe("FileAssetUploadInputFormSchema", () => {
		it("parses false primary flags and scalar metadata from multipart strings", () => {
			const parsed = FileAssetUploadInputFormSchema.parse({
				category: "vehicle_image",
				entityType: "vehicle",
				entityId: "507f1f77bcf86cd799439011",
				isPrimary: "false",
				metadata: '{"angle":"front","sequence":1}',
			});

			expect(parsed.isPrimary).toBe(false);
			expect(parsed.metadata).toEqual({ angle: "front", sequence: 1 });
		});
	});

	describe("FileAssetUploadResponseSchema", () => {
		it("wraps a FileAssetRef in the standard success envelope", () => {
			const response = {
				success: true as const,
				data: validRef,
			};
			const parsed = FileAssetUploadResponseSchema.parse(response);
			expect(parsed.success).toBe(true);
			expect(parsed.data.id).toBe(validRef.id);
		});

		it("rejects an envelope with success=false (use a different schema for errors)", () => {
			expect(() =>
				FileAssetUploadResponseSchema.parse({
					success: false,
					data: validRef,
				}),
			).toThrow();
		});
	});

	describe("Category taxonomy", () => {
		it("supports vehicle photos through the canonical file engine", () => {
			expect(FileAssetEntityType.options).toContain("vehicle");
			expect(FileAssetCategory.options).toContain("vehicle_image");
			expect(FileAssetCategoryPresets.vehicle).toBe("vehicle_image");
		});

		it("exposes the canonical Phase 42 file categories", () => {
			const values = FileAssetCategory.options;
			expect(values).toContain("kit_image");
			expect(values).toContain("tool_image");
			expect(values).toContain("equipment_image");
			expect(values).toContain("material_image");
			expect(values).toContain("safety_item_image");
			expect(values).toContain("evidence_photo");
			expect(values).toContain("before_photo");
			expect(values).toContain("after_photo");
			expect(values).toContain("delivery_record_attachment");
			expect(values).toContain("signature_image");
			expect(values).toContain("signed_document");
			expect(values).toContain("technical_report_attachment");
			expect(values).toContain("planning_attachment");
			expect(values).toContain("cctv_photo");
			expect(values).toContain("life_line_photo");
		});

		it("exposes the canonical sync status enum", () => {
			expect(FileAssetSyncStatus.options).toEqual(["synced", "pending", "failed"]);
		});

		it("exposes the entity type enum covering the main models", () => {
			const values = FileAssetEntityType.options;
			expect(values).toContain("kit");
			expect(values).toContain("tool");
			expect(values).toContain("equipment");
			expect(values).toContain("safety_item");
			expect(values).toContain("evidence");
			expect(values).toContain("delivery_record");
			expect(values).toContain("technical_report");
			expect(values).toEqual(
				expect.arrayContaining([
					"vehicle",
					"tool",
					"evidence",
					"document",
					"work_order",
					"service_case",
					"execution_session",
					"checklist_execution",
					"checklist_item",
					"report",
				]),
			);
		});
	});

	describe("ALLOWED_FILE_MIME_TYPES", () => {
		it("permits the common image formats and PDF", () => {
			expect(ALLOWED_FILE_MIME_TYPES).toContain("image/jpeg");
			expect(ALLOWED_FILE_MIME_TYPES).toContain("image/png");
			expect(ALLOWED_FILE_MIME_TYPES).toContain("image/webp");
			expect(ALLOWED_FILE_MIME_TYPES).toContain("application/pdf");
		});

		it("does not permit arbitrary binary types", () => {
			expect(ALLOWED_FILE_MIME_TYPES).not.toContain("application/octet-stream");
			expect(ALLOWED_FILE_MIME_TYPES).not.toContain("text/html");
		});
	});

	describe("FileAssetCategoryPresets", () => {
		it("maps common call sites to the canonical category strings", () => {
			expect(FileAssetCategoryPresets.kit).toBe("kit_image");
			expect(FileAssetCategoryPresets.tool).toBe("tool_image");
			expect(FileAssetCategoryPresets.evidence).toBe("evidence_photo");
			expect(FileAssetCategoryPresets.before).toBe("before_photo");
			expect(FileAssetCategoryPresets.after).toBe("after_photo");
			expect(FileAssetCategoryPresets.signature).toBe("signature_image");
			expect(FileAssetCategoryPresets.delivery).toBe("delivery_record_attachment");
			expect(FileAssetCategoryPresets.report).toBe("technical_report_attachment");
			expect(FileAssetCategoryPresets.planning).toBe("planning_attachment");
			expect(FileAssetCategoryPresets.checklist).toBe("checklist_evidence");
		});
	});
});
