import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "@/lib/http/api-client";
import { enqueue } from "@/lib/offline/sync-queue";
import { useUpdateOrderStatus } from "@/modules/orders/queries";

// Mock API client and offline store, enqueue
vi.mock("@/lib/http/api-client", () => ({
	apiClient: {
		patch: vi.fn(),
		get: vi.fn(),
	},
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
	Wrapper.displayName = "OrdersTestWrapper";
	return Wrapper;
};

describe("Orders Queries Offline", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("queues order status update when offline", async () => {
		vi.mocked(apiClient.patch).mockRejectedValue(new TypeError("Failed to fetch"));

		const { result } = renderHook(() => useUpdateOrderStatus("order-123"), {
			wrapper: createWrapper(),
		});

		const order = await result.current.mutateAsync({ status: "closed" });

		expect(order).toBeDefined();
		expect(order._id).toBe("order-123");
		expect(order.status).toBe("closed");

		expect(enqueue).toHaveBeenCalledWith(
			expect.objectContaining({
				endpoint: "/orders/order-123/status",
				method: "PATCH",
				payload: expect.objectContaining({
					status: "closed",
				}),
				dedupeKey: "orders:status:order-123:closed",
			}),
		);
	});
});
