import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import type { ComponentProps, ReactNode } from "react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import ServiceCasesPage from "@/app/(dashboard)/service-cases/page";
import { apiClient } from "@/lib/http/api-client";

const localRepositoryMocks = vi.hoisted(() => ({
	readServiceCaseListSnapshot: vi.fn(),
	saveServiceCaseListSnapshot: vi.fn(),
	readServiceCaseDetailSnapshot: vi.fn(),
	saveServiceCaseDetailSnapshot: vi.fn(),
}));

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
	isOfflineLikeError: (error: Error) => error instanceof TypeError,
}));

vi.mock("@/lib/offline/local-repositories", () => ({
	readServiceCaseListSnapshot: localRepositoryMocks.readServiceCaseListSnapshot,
	saveServiceCaseListSnapshot: localRepositoryMocks.saveServiceCaseListSnapshot,
	readServiceCaseDetailSnapshot: localRepositoryMocks.readServiceCaseDetailSnapshot,
	saveServiceCaseDetailSnapshot: localRepositoryMocks.saveServiceCaseDetailSnapshot,
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
		localRepositoryMocks.readServiceCaseListSnapshot.mockReset();
		localRepositoryMocks.saveServiceCaseListSnapshot.mockReset();
		localRepositoryMocks.readServiceCaseDetailSnapshot.mockReset();
		localRepositoryMocks.saveServiceCaseDetailSnapshot.mockReset();
		localRepositoryMocks.readServiceCaseListSnapshot.mockResolvedValue({ status: "missing" });
		localRepositoryMocks.saveServiceCaseListSnapshot.mockResolvedValue(undefined);
	});

	test("renders the service case cockpit entrypoint from the canonical paginated envelope", async () => {
		vi.mocked(apiClient.get).mockResolvedValue({
			success: true,
			data: [
				{
					_id: "sc-1",
					code: "SC-2026-0001",
					clientName: "ACME Energy",
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

		expect(await screen.findByText("ACME Energy")).toBeTruthy();
		expect(screen.getByText(/14 pasos/)).toBeTruthy();
		expect(screen.getByText((content: string) => content.includes("Paso 5"))).toBeTruthy();
		expect(screen.getByText("Continuar siguiente paso")).toBeTruthy();
		expect(apiClient.get).toHaveBeenCalledWith("/service-cases?limit=50");
		expect(localRepositoryMocks.saveServiceCaseListSnapshot).toHaveBeenCalledWith(
			expect.objectContaining({
				items: expect.arrayContaining([expect.objectContaining({ _id: "sc-1" })]),
				total: 1,
				page: 1,
				limit: 50,
				pages: 1,
			}),
		);
	});

	test("keeps the service cases module rendered offline when no local data exists", async () => {
		vi.mocked(apiClient.get).mockRejectedValue(new TypeError("Failed to fetch"));

		renderWithQueryClient(<ServiceCasesPage />);

		expect(await screen.findByText("Sin casos guardados localmente")).toBeTruthy();
		expect(screen.getByRole("heading", { name: "Casos de Servicio" })).toBeTruthy();
		expect(screen.queryByText("Sin conexión")).toBeFalsy();
		expect(localRepositoryMocks.readServiceCaseListSnapshot).toHaveBeenCalled();
	});
});
