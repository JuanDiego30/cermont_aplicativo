import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "@/lib/http/api-client";
import { useOfflineEvidence } from "@/modules/evidences/hooks/useOfflineEvidence";

const mocks = vi.hoisted(() => ({
	enqueueMock: vi.fn().mockResolvedValue(undefined),
	postMock: vi.fn(),
}));

vi.mock("@/lib/http/api-client", () => ({
	apiClient: {
		post: mocks.postMock,
	},
}));

vi.mock("@/lib/offline/sync-queue", () => ({
	enqueue: mocks.enqueueMock,
}));

const createWrapper = () => {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: { retry: false },
			mutations: { retry: false },
		},
	});

	const Wrapper = ({ children }: { children: ReactNode }) => (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	);

	Wrapper.displayName = "OfflineEvidenceTestWrapper";
	return Wrapper;
};

describe("useOfflineEvidence", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("queues evidence uploads when the network fails", async () => {
		vi.mocked(apiClient.post).mockRejectedValue(new TypeError("Failed to fetch"));

		const file = new File(["evidence-bytes"], "photo.jpg", { type: "image/jpeg" });
		const { result } = renderHook(() => useOfflineEvidence(), { wrapper: createWrapper() });

		await expect(
			result.current.mutateAsync({
				orderId: "order-1",
				type: "before",
				description: "Frontal",
				capturedAt: "2026-01-01T10:00:00.000Z",
				file,
			}),
		).resolves.toBeNull();

		await waitFor(() => {
			expect(mocks.enqueueMock).toHaveBeenCalledTimes(1);
		});

		const queuedEntry = vi.mocked(mocks.enqueueMock).mock.calls[0][0];
		expect(queuedEntry).toMatchObject({
			endpoint: "/evidences",
			method: "POST",
			payload: expect.objectContaining({
				orderId: "order-1",
				type: "before",
				description: "Frontal",
				capturedAt: "2026-01-01T10:00:00.000Z",
				fileName: "photo.jpg",
				fileType: "image/jpeg",
			}),
			dedupeKey:
				"evidences:create:order-1:before:photo.jpg:image/jpeg:2026-01-01T10:00:00.000Z:Frontal",
		});

		expect(typeof queuedEntry.payload.fileBase64).toBe("string");
		expect((queuedEntry.payload.fileBase64 as string).length).toBeGreaterThan(0);
		expect(apiClient.post).toHaveBeenCalledWith("/evidences", expect.any(FormData));
	});
});
