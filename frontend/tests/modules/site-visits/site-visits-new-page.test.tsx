import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ComponentProps, ReactNode } from "react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { apiClient } from "@/lib/http/api-client";
import SiteVisitNewPage from "@/app/(dashboard)/site-visits/new/page";

const routerPush = vi.fn();
const mockCasesList = {
	data: [
		{
			_id: "507f1f77bcf86cd799439011",
			code: "SC-2026-0001",
			clientName: "Cermont Cliente",
			currentStepCode: "step_01_work_request",
			currentStage: "intake",
			status: "active",
		},
	],
	success: true,
};

const mockStepContext = {
	data: {
		serviceCaseId: "507f1f77bcf86cd799439011",
		currentStepCode: "step_02_site_visit",
		currentStepLabel: "Visita técnica",
		canonical: { clientName: "Cermont Cliente", location: "" },
		inheritedFields: [],
		overrides: [],
		blockers: [],
		allowedActions: [],
		requiredFields: [],
		linkedEntityIds: { workRequestId: "507f1f77bcf86cd799439001" },
		generatedAt: new Date().toISOString(),
	},
	success: true,
};

const mockWorkflow = {
	data: {
		serviceCaseId: "507f1f77bcf86cd799439011",
		currentStepCode: "step_02_site_visit",
		currentStage: "assessment",
		canAdvance: true,
	},
	success: true,
};

vi.mock("next/link", () => ({
	default: ({ children, href, ...props }: ComponentProps<"a"> & { children: ReactNode }) => (
		<a href={String(href)} {...props}>
			{children}
		</a>
	),
}));

vi.mock("next/navigation", () => ({
	useRouter: () => ({
		push: routerPush,
	}),
	useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/lib/offline/connectivity", () => ({
	useConnectivity: () => ({ isOnline: true }),
}));

vi.mock("@/lib/http/api-client", () => ({
	apiClient: {
		post: vi.fn(),
		get: vi.fn(),
	},
}));

vi.mock("@/modules/service-cases/queries", () => ({
	useServiceCaseList: () => ({
		data: mockCasesList,
		isLoading: false,
	}),
	useServiceCase: () => ({
		data: mockWorkflow,
		isLoading: false,
	}),
	SERVICE_CASE_KEYS: {
		all: ["service-cases"],
		list: () => ["service-cases", "list"],
		detail: (id: string) => ["service-cases", id],
	},
}));

// Mock step-context queries
vi.mock("@/modules/workflow/step-context-queries", () => ({
	useStepContext: () => ({
		data: mockStepContext.data,
		isLoading: false,
	}),
	STEP_CONTEXT_KEYS: {
		all: ["step-context"],
		detail: (id: string) => ["step-context", id],
	},
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

describe.skip("Site visit creation page", () => {
	beforeEach(() => {
		routerPush.mockReset();
		vi.clearAllMocks();
	});

	test("creates a site visit through the canonical site-visits endpoint", async () => {
		vi.mocked(apiClient.post).mockResolvedValue({
			success: true,
			data: { _id: "507f1f77bcf86cd799439011" },
		});

		renderWithQueryClient(<SiteVisitNewPage />);

		// Step 1: Select case from the available list
		await waitFor(() => {
			expect(screen.getByText("Seleccionar →")).toBeDefined();
		});
		fireEvent.click(screen.getByText("Seleccionar →"));

		// Step 2: Form should now be visible with case pre-selected
		await waitFor(() => {
			expect(screen.getByLabelText("Nombre del cliente")).toBeVisible();
		});

		// Fill in site-visit-specific fields
		fireEvent.change(screen.getByLabelText("Fecha de visita"), {
			target: { value: "2026-05-22T08:30" },
		});
		fireEvent.change(screen.getByLabelText("ID del responsable técnico"), {
			target: { value: "507f1f77bcf86cd799439004" },
		});
		fireEvent.change(screen.getByLabelText("Nombre del responsable"), {
			target: { value: "Supervisor Cermont" },
		});
		fireEvent.change(screen.getByLabelText("Requerimientos técnicos"), {
			target: { value: "Inspección de acceso y mediciones iniciales" },
		});

		fireEvent.click(screen.getByRole("button", { name: "Crear visita" }));

		await waitFor(() =>
			expect(apiClient.post).toHaveBeenCalledWith(
				"/site-visits",
				expect.objectContaining({
					serviceCaseId: "507f1f77bcf86cd799439011",
					clientName: "Cermont Cliente",
					visitDate: "2026-05-22T13:30:00.000Z",
					responsibleUserId: "507f1f77bcf86cd799439004",
					responsibleName: "Supervisor Cermont",
					requirements: "Inspección de acceso y mediciones iniciales",
				}),
			),
		);
		expect(routerPush).toHaveBeenCalledWith("/site-visits/507f1f77bcf86cd799439011");
	});
});
