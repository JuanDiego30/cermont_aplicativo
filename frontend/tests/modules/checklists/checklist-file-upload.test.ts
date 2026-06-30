import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "@/lib/http/api-client";
import { uploadFile } from "@/modules/files/api/files.api";

vi.mock("@/lib/http/api-client", () => ({
	apiClient: {
		post: vi.fn(),
	},
}));

describe("checklist FileAsset upload", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("serializa el item de checklist en metadata del FileAsset", async () => {
		vi.mocked(apiClient.post).mockResolvedValue({
			success: true,
			data: {
				id: "file-1",
				originalName: "ats.jpg",
				storedName: "stored.jpg",
				mimeType: "image/jpeg",
				sizeBytes: 100,
				url: "/api/files/file-1/content",
				storageKey: "stored.jpg",
				uploadedBy: "user-1",
				uploadedAt: "2026-06-29T10:00:00.000Z",
				entityType: "checklist_item",
				entityId: "checklist-1",
				category: "checklist_evidence",
			},
		});

		await uploadFile({
			file: new File(["photo"], "ats.jpg", { type: "image/jpeg" }),
			category: "checklist_evidence",
			entityType: "checklist_item",
			entityId: "checklist-1",
			metadata: { checklistItemId: "ats-1" },
		});

		const [, body] = vi.mocked(apiClient.post).mock.calls[0] ?? [];
		expect(body).toBeInstanceOf(FormData);
		expect((body as FormData).get("metadata")).toBe('{"checklistItemId":"ats-1"}');
	});
});
