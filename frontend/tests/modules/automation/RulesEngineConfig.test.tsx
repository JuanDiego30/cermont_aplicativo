import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "@/lib/http/api-client";
import { RulesEngineConfig } from "@/modules/automation";

vi.mock("@/lib/http/api-client", () => ({
	apiClient: { get: vi.fn(), post: vi.fn(), patch: vi.fn() },
}));

describe("RulesEngineConfig", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("renders the configurable rule builder and a real empty state", async () => {
		vi.mocked(apiClient.get).mockResolvedValue({ success: true, data: [] });
		const queryClient = new QueryClient({
			defaultOptions: { queries: { retry: false } },
		});

		render(
			<QueryClientProvider client={queryClient}>
				<RulesEngineConfig />
			</QueryClientProvider>,
		);

		expect(
			screen.getByRole("heading", { name: "Automatizaciones operativas" }),
		).toBeInTheDocument();
		expect(await screen.findByText(/No hay reglas configuradas/)).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /Crear regla/ })).toBeDisabled();
	});

	it("shows open operational actions and resolves them through the API", async () => {
		vi.mocked(apiClient.get).mockImplementation(async (path: string) => {
			if (path.includes("/actions")) {
				return {
					success: true,
					data: [
						{
							_id: "507f1f77bcf86cd799439020",
							ruleId: "507f1f77bcf86cd799439011",
							executionId: "507f1f77bcf86cd799439012",
							entityType: "Order",
							entityId: "507f1f77bcf86cd799439013",
							type: "block_transition",
							title: "Transición bloqueada",
							reason: "Falta evidencia de cierre",
							priority: "critical",
							status: "open",
							createdAt: "2026-06-30T12:00:00.000Z",
						},
					],
				};
			}
			return { success: true, data: [] };
		});
		vi.mocked(apiClient.patch).mockResolvedValue({
			success: true,
			data: {
				_id: "507f1f77bcf86cd799439020",
				status: "resolved",
			},
		});
		const queryClient = new QueryClient({
			defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
		});

		render(
			<QueryClientProvider client={queryClient}>
				<RulesEngineConfig />
			</QueryClientProvider>,
		);

		expect(await screen.findByText("Falta evidencia de cierre")).toBeInTheDocument();
		fireEvent.click(screen.getByRole("button", { name: "Resolver acción" }));

		await waitFor(() =>
			expect(apiClient.patch).toHaveBeenCalledWith(
				"/automation-rules/actions/507f1f77bcf86cd799439020/resolve",
				{},
			),
		);
	});
});
