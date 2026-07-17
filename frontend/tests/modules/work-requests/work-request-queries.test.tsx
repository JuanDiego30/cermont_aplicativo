import type { CreateWorkRequestInput } from "@cermont/shared-types";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, test, vi } from "vitest";
import { apiClient } from "@/lib/http/api-client";
import { useCreateWorkRequest } from "@/modules/work-requests/queries";

vi.mock("@/lib/http/api-client", () => ({
	apiClient: { post: vi.fn() },
}));

const payload: CreateWorkRequestInput = {
	requesterName: "Ana Cliente",
	clientName: "Cliente Prueba",
	serviceSite: "Sede Norte",
	serviceType: "mantenimiento",
	sourceChannel: "portal_client",
	shortDescription: "Falla eléctrica",
	description: "La instalación presenta una falla eléctrica.",
	requiresSiteVisit: true,
	urgency: "medium",
	tags: [],
	classifications: [],
	initialEvidences: [],
	customFields: {},
};

describe("useCreateWorkRequest", () => {
	test("invalidates work requests and service cases after creating both records", async () => {
		vi.mocked(apiClient.post).mockResolvedValue({
			success: true,
			data: {
				workRequest: { _id: "work-request-1" },
				serviceCase: { _id: "service-case-1", code: "SC-2026-0001" },
			},
		});
		const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
		const invalidate = vi.spyOn(queryClient, "invalidateQueries").mockResolvedValue();
		const wrapper = ({ children }: { children: ReactNode }) => (
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		);
		const { result } = renderHook(() => useCreateWorkRequest(), { wrapper });

		await act(async () => {
			await result.current.mutateAsync(payload);
		});

		expect(invalidate).toHaveBeenCalledWith({ queryKey: ["work-requests"] });
		expect(invalidate).toHaveBeenCalledWith({ queryKey: ["service-cases"] });
	});
});
