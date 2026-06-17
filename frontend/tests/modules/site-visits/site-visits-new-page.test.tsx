import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ComponentProps, ReactNode } from "react";
import { describe, expect, test, vi } from "vitest";
import SiteVisitNewPage from "@/app/(dashboard)/site-visits/new/page";

const routerPush = vi.fn();

vi.mock("@/modules/site-visits/queries", () => ({
	useCreateSiteVisit: () => ({
		mutate: () => {},
		isPending: false,
		isError: false,
	}),
}));

const mockCasesListResult = {
	items: [
		{
			_id: "507f1f77bcf86cd799439011",
			code: "SC-2026-0001",
			clientName: "Cermont Cliente",
			currentStepCode: "step_01_work_request",
			currentStage: "intake",
			status: "active",
		},
	],
	total: 1,
	page: 1,
	limit: 50,
	pages: 1,
	source: { status: "online" as const, updatedAt: new Date().toISOString() },
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
		data: mockCasesListResult,
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

describe("Site visit creation page", () => {
	test("renders case selector then transitions to form on case selection", async () => {
		renderWithQueryClient(<SiteVisitNewPage />);

		// Step 1: Case selector is visible
		await waitFor(() => {
			expect(screen.getByText("Cermont Cliente")).toBeInTheDocument();
		});
		expect(screen.getByText("Seleccionar →")).toBeInTheDocument();

		// Step 2: Select a case
		fireEvent.click(screen.getByText("Seleccionar →"));

		// Step 3: Form should appear with inherited data
		await waitFor(() => {
			expect(screen.getByLabelText("Nombre del cliente")).toBeInTheDocument();
		});
		expect(screen.getByLabelText("Caso de servicio")).toHaveValue("507f1f77bcf86cd799439011");
		expect(screen.getByLabelText("Nombre del cliente")).toHaveValue("Cermont Cliente");
		expect(screen.getByRole("button", { name: "Crear visita" })).toBeInTheDocument();
	});
});
