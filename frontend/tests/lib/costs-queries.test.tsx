/**
 * Costs Module Tests
 *
 * Tests costs queries and hooks:
 * - useCosts: Fetches costs list
 * - useCost: Fetches single cost detail
 * - useCostSummary: Fetches cost summary for order
 * - useCreateCost: Creates new cost entry
 * - useUpdateCost: Updates existing cost
 * - useDeleteCost: Deletes cost entry
 *
 * Uses vitest mocks for API client.
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "@/lib/http/api-client";
import {
	COSTS_KEYS,
	useCost,
	useCostSummary,
	useCosts,
	useCreateCost,
	useDeleteCost,
	useUpdateCost,
} from "@/modules/costs/queries";

// Mock API client
vi.mock("@/lib/http/api-client", () => ({
	apiClient: {
		get: vi.fn(),
		post: vi.fn(),
		patch: vi.fn(),
		delete: vi.fn(),
	},
}));

vi.mock("@/lib/constants/query-config", () => ({
	CACHE_CONFIG: {
		LIST: 30000,
		REALTIME: 5000,
		STATIC: 60000,
	},
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
	Wrapper.displayName = "CostsTestWrapper";
	return Wrapper;
};

describe("Costs Queries", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("useCosts", () => {
		it("should fetch costs list", async () => {
			const mockCosts = [
				{ _id: "1", orderId: "order-1", category: "materials", amount: 100 },
				{ _id: "2", orderId: "order-2", category: "labor", amount: 200 },
			];

			vi.mocked(apiClient.get).mockResolvedValue({ success: true, data: mockCosts, total: 2 });

			const { result } = renderHook(() => useCosts({ orderId: "order-1" }), {
				wrapper: createWrapper(),
			});

			await waitFor(() => expect(result.current.isSuccess).toBe(true));

			expect(result.current.data).toHaveLength(2);
			expect(apiClient.get).toHaveBeenCalledWith("/costs/order/order-1?orderId=order-1");
		});

		it("should fetch costs with filters", async () => {
			vi.mocked(apiClient.get).mockResolvedValue({ success: true, data: [], total: 0 });

			renderHook(() => useCosts({ status: "active", orderId: "order-1" }), {
				wrapper: createWrapper(),
			});

			await waitFor(() =>
				expect(apiClient.get).toHaveBeenCalledWith(
					"/costs/order/order-1?status=active&orderId=order-1",
				),
			);
		});

		it("should return empty array on error", async () => {
			vi.mocked(apiClient.get).mockResolvedValue({ success: false, data: null });

			const { result } = renderHook(() => useCosts({ orderId: "order-1" }), {
				wrapper: createWrapper(),
			});

			await waitFor(() => expect(result.current.isSuccess).toBe(true));

			expect(result.current.data).toEqual([]);
		});
	});

	describe("useCost", () => {
		it("should fetch single cost detail", async () => {
			const mockCost = { _id: "1", category: "materials", amount: 150 };

			vi.mocked(apiClient.get).mockResolvedValue({ success: true, data: mockCost });

			const { result } = renderHook(() => useCost("1"), { wrapper: createWrapper() });

			await waitFor(() => expect(result.current.isSuccess).toBe(true));

			expect(result.current.data).toEqual(mockCost);
			expect(apiClient.get).toHaveBeenCalledWith("/costs/1");
		});

		it("should throw error when API returns failure", async () => {
			vi.mocked(apiClient.get).mockResolvedValue({ success: false, message: "Not found" });

			const { result } = renderHook(() => useCost("nonexistent"), { wrapper: createWrapper() });

			await waitFor(() => expect(result.current.isError).toBe(true));
		});

		it("should not fetch when id is empty", async () => {
			const { result } = renderHook(() => useCost(""), { wrapper: createWrapper() });

			expect(result.current.isLoading).toBe(false);
			expect(result.current.data).toBeUndefined();
			expect(apiClient.get).not.toHaveBeenCalled();
		});
	});

	describe("useCostSummary", () => {
		it("should fetch cost summary for order", async () => {
			const expectedSummary = [{ amount: 500, type: "total" }];

			vi.mocked(apiClient.get).mockResolvedValue({
				success: true,
				data: [{ category: "total", total: 500 }],
			});

			const { result } = renderHook(() => useCostSummary("order-1"), { wrapper: createWrapper() });

			await waitFor(() => expect(result.current.isSuccess).toBe(true));

			expect(result.current.data).toEqual(expectedSummary);
			expect(apiClient.get).toHaveBeenCalledWith("/costs/order/order-1");
		});

		it("should not fetch when orderId is empty", async () => {
			const { result } = renderHook(() => useCostSummary(""), { wrapper: createWrapper() });

			expect(result.current.isLoading).toBe(false);
			expect(apiClient.get).not.toHaveBeenCalled();
		});
	});

	describe("useCreateCost", () => {
		it("should create a new cost", async () => {
			const newCost = {
				orderId: "order-1",
				category: "materials" as const,
				description: "Test material",
				estimatedAmount: 300,
				actualAmount: 300,
				taxAmount: 0,
				taxRate: 0,
				currency: "COP",
				supportEvidenceIds: ["507f1f77bcf86cd799439011"],
				supportDocumentIds: [],
			};

			vi.mocked(apiClient.post).mockResolvedValue({
				_id: "3",
				...newCost,
				recordedBy: "user-1",
				recordedAt: new Date().toISOString(),
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				status: "active",
				variance: 0,
				variancePercent: { status: "present", value: 0 },
				dataState: "ESTIMATED_AND_ACTUAL",
			});

			const { result } = renderHook(() => useCreateCost(), { wrapper: createWrapper() });

			result.current.mutate(newCost);

			await waitFor(() => expect(result.current.isSuccess).toBe(true));

			expect(apiClient.post).toHaveBeenCalledWith("/costs", newCost);
		});
	});

	describe("useUpdateCost", () => {
		it("should update an existing cost", async () => {
			const updatedCost = { description: "Updated material" };
			vi.mocked(apiClient.patch).mockResolvedValue({ _id: "1", ...updatedCost });

			const { result } = renderHook(() => useUpdateCost("1"), { wrapper: createWrapper() });

			result.current.mutate(updatedCost);

			await waitFor(() => expect(result.current.isSuccess).toBe(true));

			expect(apiClient.patch).toHaveBeenCalledWith("/costs/1", updatedCost);
		});
	});

	describe("useDeleteCost", () => {
		it("should delete a cost", async () => {
			vi.mocked(apiClient.delete).mockResolvedValue({ success: true });

			const { result } = renderHook(() => useDeleteCost(), { wrapper: createWrapper() });

			result.current.mutate("1");

			await waitFor(() => expect(result.current.isSuccess).toBe(true));

			expect(apiClient.delete).toHaveBeenCalledWith("/costs/1");
		});
	});

	describe("COSTS_KEYS", () => {
		it("should generate unique query keys", () => {
			const listKey = COSTS_KEYS.list({ status: "active" });
			const detailKey = COSTS_KEYS.detail("1");
			const summaryKey = COSTS_KEYS.summary("order-1");

			expect(listKey).not.toEqual(detailKey);
			expect(detailKey).not.toEqual(summaryKey);
			expect(listKey).toContain("list");
			expect(detailKey).toContain("detail");
			expect(summaryKey).toContain("summary");
		});
	});
});
