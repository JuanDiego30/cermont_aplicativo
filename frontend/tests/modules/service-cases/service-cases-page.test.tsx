import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import type { ComponentProps, ReactNode } from "react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import ServiceCasesPage from "@/app/(dashboard)/service-cases/page";
import { apiClient } from "@/lib/http/api-client";

vi.mock("next/link", () => ({
	default: ({ children, href, ...props }: ComponentProps<"a"> & { children: ReactNode }) => (
		<a href={String(href)} {...props}>
			{children}
		</a>
	),
}));

vi.mock("@/lib/http/api-client", () => ({
	apiClient: {
		get: vi.fn(),
	},
}));

function renderWithQueryClient(children: ReactNode) {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				retry: false,
			},
		},
	});

	return render(<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>);
}

describe("Service cases page", () => {
	beforeEach(() => {
		vi.mocked(apiClient.get).mockReset();
	});

	test("renders the service case cockpit entrypoint from the canonical paginated envelope", async () => {
		vi.mocked(apiClient.get).mockResolvedValue({
			success: true,
			data: [
				{
					_id: "sc-1",
					code: "SC-2026-0001",
					clientName: "Cliente Cermont",
					currentStage: "planning",
					currentStepCode: "step_05_planning",
					blockers: [],
				},
			],
			pagination: {
				page: 1,
				limit: 50,
				total: 1,
				totalPages: 1,
			},
		});

		renderWithQueryClient(<ServiceCasesPage />);

		expect(await screen.findByText("Cliente Cermont")).toBeTruthy();
		expect(apiClient.get).toHaveBeenCalledWith("/service-cases?limit=50");
	});
});
