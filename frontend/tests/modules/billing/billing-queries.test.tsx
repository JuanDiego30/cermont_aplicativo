import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { apiClient } from "@/lib/http/api-client";
import { useOrderDeliveryRecord, useServiceEntrySheetsList } from "@/modules/billing/queries";

vi.mock("@/lib/http/api-client", () => ({
	apiClient: {
		delete: vi.fn(),
		get: vi.fn(),
		patch: vi.fn(),
		post: vi.fn(),
		put: vi.fn(),
	},
}));

function createWrapper() {
	const queryClient = new QueryClient({
		defaultOptions: {
			mutations: { retry: false },
			queries: { retry: false },
		},
	});

	const Wrapper = ({ children }: { children: ReactNode }) => (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	);
	Wrapper.displayName = "BillingQueriesWrapper";
	return Wrapper;
}

describe("billing queries", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	test("builds order-filtered SES list queries with repeated status params", async () => {
		vi.mocked(apiClient.get).mockResolvedValue({
			success: true,
			data: [
				{
					_id: "ses-1",
					code: "SES-2026-0001",
					workOrderId: "order-1",
					clientId: "client-1",
					clientName: "Cliente Demo",
					amount: 120000,
					currency: "COP",
					taxAmount: 0,
					totalAmount: 120000,
					serviceLines: [],
					status: "approved",
					attachments: [],
					commandHistory: [],
					createdBy: "user-1",
					createdAt: "2026-05-27T12:00:00.000Z",
					updatedAt: "2026-05-27T12:00:00.000Z",
				},
			],
			meta: {
				total: 1,
				page: 1,
				limit: 10,
				pages: 1,
			},
		});

		const { result } = renderHook(
			() =>
				useServiceEntrySheetsList({
					workOrderId: "order-1",
					status: ["submitted", "approved"],
					limit: 10,
				}),
			{
				wrapper: createWrapper(),
			},
		);

		await waitFor(() => expect(result.current.isSuccess).toBe(true));

		expect(apiClient.get).toHaveBeenCalledWith(
			"/service-entry-sheets?status=submitted&status=approved&workOrderId=order-1&limit=10",
		);
		expect(result.current.data).toMatchObject({
			items: [{ _id: "ses-1", workOrderId: "order-1", status: "approved" }],
			total: 1,
		});
	});

	test("unwraps the order delivery-record read model without forcing a detail id", async () => {
		vi.mocked(apiClient.get).mockResolvedValue({
			success: true,
			data: {
				workOrderId: "order-1",
				status: "not_created",
				message: "No hay acta de entrega.",
			},
		});

		const { result } = renderHook(() => useOrderDeliveryRecord("order-1"), {
			wrapper: createWrapper(),
		});

		await waitFor(() => expect(result.current.isSuccess).toBe(true));

		expect(apiClient.get).toHaveBeenCalledWith("/orders/order-1/delivery-record");
		expect(result.current.data).toEqual({
			workOrderId: "order-1",
			status: "not_created",
			message: "No hay acta de entrega.",
		});
	});
});
