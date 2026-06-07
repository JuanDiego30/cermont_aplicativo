import type { FileAssetRef } from "@cermont/shared-types";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ImageUploadField } from "@/modules/files/ui/ImageUploadField";

const uploadFileMock = vi.hoisted(() => vi.fn());

vi.mock("@/modules/files/api/files.api", () => ({
	uploadFile: uploadFileMock,
}));

function renderWithQueryClient(children: ReactNode) {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: { retry: false },
			mutations: { retry: false },
		},
	});
	return render(<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>);
}

const uploadedRef = {
	id: "file-resource-1",
	originalName: "inspection-camera.jpg",
	storedName: "stored-camera.jpg",
	mimeType: "image/jpeg",
	sizeBytes: 128,
	url: "/uploads/stored-camera.jpg",
	storageKey: "stored-camera.jpg",
	uploadedBy: "user-1",
	uploadedAt: "2026-06-03T12:00:00.000Z",
	entityType: "equipment",
	entityId: "507f1f77bcf86cd799439011",
	category: "equipment_image",
	syncStatus: "synced",
} satisfies FileAssetRef;

describe("ImageUploadField", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		uploadFileMock.mockResolvedValue(uploadedRef);
	});

	it("uploads a selected image and renders the persisted preview", async () => {
		const onSuccess = vi.fn();
		renderWithQueryClient(
			<ImageUploadField
				entityType="equipment"
				entityId="507f1f77bcf86cd799439011"
				category="equipment_image"
				label="Upload equipment photo"
				stripExif={false}
				onSuccess={onSuccess}
			/>,
		);

		const file = new File(["camera-bytes"], "inspection-camera.jpg", { type: "image/jpeg" });
		fireEvent.change(screen.getByLabelText("Upload equipment photo"), {
			target: { files: [file] },
		});

		await waitFor(() => {
			expect(uploadFileMock).toHaveBeenCalledWith({
				file,
				category: "equipment_image",
				entityType: "equipment",
				entityId: "507f1f77bcf86cd799439011",
			});
		});
		await waitFor(() => expect(onSuccess).toHaveBeenCalledWith(uploadedRef));
		expect(screen.getByRole("img", { name: "inspection-camera.jpg" })).toBeTruthy();
	});
});
