import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "@/lib/http/api-client";
import { enqueue } from "@/lib/offline/sync-queue";
import { useCreateReport, useUpdateReport } from "@/modules/reports/queries";

// Mock API client and offline store, enqueue
vi.mock("@/lib/http/api-client", () => ({
	apiClient: {
		post: vi.fn(),
		patch: vi.fn(),
		get: vi.fn(),
	},
	toApiUrl: vi.fn(),
	isOfflineLikeError: () => true,
}));

vi.mock("@/store/offline.store", () => ({
	useOfflineStore: {
		getState: () => ({ isOnline: false }),
	},
}));

vi.mock("@/lib/offline/sync-queue", () => ({
	enqueue: vi.fn().mockResolvedValue(undefined),
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
	Wrapper.displayName = "ReportsTestWrapper";
	return Wrapper;
};

describe("Reports Queries Offline", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("queues report creation when offline", async () => {
		vi.mocked(apiClient.post).mockRejectedValue(new TypeError("Failed to fetch"));

		const { result } = renderHook(() => useCreateReport(), { wrapper: createWrapper() });

		const mockInput = {
			orderId: "order-1",
			title: "Report 1",
			summary: "Summary of report",
		};

		const report = await result.current.mutateAsync(mockInput);

		expect(report).toBeDefined();
		expect(report._id).toContain("report-");
		expect(report.orderId).toBe("order-1");
		expect(report.status).toBe("draft");
		expect(report.title).toBe("Report 1");

		expect(enqueue).toHaveBeenCalledWith(
			expect.objectContaining({
				endpoint: "/reports",
				method: "POST",
				payload: expect.objectContaining({
					orderId: "order-1",
					title: "Report 1",
					summary: "Summary of report",
				}),
				dedupeKey: "reports:create:order-1",
			}),
		);
	});

	it("queues report status update when offline", async () => {
		vi.mocked(apiClient.patch).mockRejectedValue(new TypeError("Failed to fetch"));

		const { result } = renderHook(() => useUpdateReport("report-123"), {
			wrapper: createWrapper(),
		});

		const mockUpdate = {
			status: "pending_review" as const,
		};

		const report = await result.current.mutateAsync(mockUpdate);

		expect(report).toBeDefined();
		expect(report._id).toBe("report-123");
		expect(report.status).toBe("pending_review");

		expect(enqueue).toHaveBeenCalledWith(
			expect.objectContaining({
				endpoint: "/reports/report-123",
				method: "PATCH",
				payload: expect.objectContaining({
					status: "pending_review",
				}),
				dedupeKey: expect.stringContaining("reports:update:report-123:"),
			}),
		);
	});
});
