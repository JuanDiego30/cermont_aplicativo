import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ComponentProps, ReactNode } from "react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import NewPurchaseOrderPage, {
	RegisterPOFormSchema,
} from "@/app/(dashboard)/purchase-orders/new/page";

const apiMocks = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }));

vi.mock("@/lib/http/api-client", () => ({ apiClient: apiMocks }));
vi.mock("next/navigation", () => ({
	useRouter: () => ({ push: vi.fn() }),
	useSearchParams: () => new URLSearchParams(),
}));
vi.mock("next/link", () => ({
	default: ({ children, href, ...props }: ComponentProps<"a"> & { children: ReactNode }) => (
		<a href={String(href)} {...props}>
			{children}
		</a>
	),
}));
vi.mock("@/modules/service-cases/hooks/useServiceCaseContext", () => ({
	useServiceCaseContext: () => ({ inheritedFields: [], isLoading: false }),
}));

function renderPage() {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
	});
	return render(
		<QueryClientProvider client={queryClient}>
			<NewPurchaseOrderPage />
		</QueryClientProvider>,
	);
}

describe("purchase order proposal selection", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		apiMocks.get.mockResolvedValue({ success: true, data: [] });
	});

	test("uses a user-facing message for an empty or malformed proposal id", () => {
		const baseInput = {
			proposalId: "",
			poNumber: "PO-2026-0001",
			contractReference: "",
			serviceAccount: "SERVICE-001",
			billingAccount: "BILLING-001",
			approvedAmount: 1,
			currency: "COP" as const,
			receivedAt: "2026-07-21T10:00",
		};

		for (const proposalId of ["", "malformed"]) {
			const result = RegisterPOFormSchema.safeParse({ ...baseInput, proposalId });
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues[0]?.message).toBe("Selecciona una propuesta aprobada.");
				expect(result.error.issues[0]?.message).not.toContain("MongoDB ObjectId");
			}
		}
	});

	test("renders the empty proposal state and does not request an empty proposal id", async () => {
		renderPage();

		await waitFor(() =>
			expect(
				screen.getByRole("option", { name: "No hay propuestas aprobadas disponibles." }),
			).toBeInTheDocument(),
		);
		expect(apiMocks.get).toHaveBeenCalledWith("/proposals?status=approved");
		fireEvent.click(screen.getByRole("button", { name: "Registrar PO" }));

		expect(apiMocks.post).not.toHaveBeenCalled();
		expect(apiMocks.get).not.toHaveBeenCalledWith(
			expect.stringMatching(/\/proposals\/(undefined|)$/),
		);
	});
});
