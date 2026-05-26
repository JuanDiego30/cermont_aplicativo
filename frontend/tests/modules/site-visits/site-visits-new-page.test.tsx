import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ComponentProps, ReactNode } from "react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import SiteVisitNewPage from "@/app/(dashboard)/site-visits/new/page";
import { apiClient } from "@/lib/http/api-client";

const routerPush = vi.fn();

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
}));

vi.mock("@/lib/offline/connectivity", () => ({
	useConnectivity: () => ({ isOnline: true }),
}));

vi.mock("@/lib/http/api-client", () => ({
	apiClient: {
		post: vi.fn(),
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
	beforeEach(() => {
		routerPush.mockReset();
		vi.mocked(apiClient.post).mockReset();
	});

	test("creates a site visit through the canonical site-visits endpoint", async () => {
		vi.mocked(apiClient.post).mockResolvedValue({
			success: true,
			data: { _id: "507f1f77bcf86cd799439011" },
		});

		renderWithQueryClient(<SiteVisitNewPage />);

		fireEvent.change(screen.getByLabelText("Solicitud de trabajo"), {
			target: { value: "507f1f77bcf86cd799439001" },
		});
		fireEvent.change(screen.getByLabelText("Caso de servicio"), {
			target: { value: "507f1f77bcf86cd799439002" },
		});
		fireEvent.change(screen.getByLabelText("Cliente"), {
			target: { value: "507f1f77bcf86cd799439003" },
		});
		fireEvent.change(screen.getByLabelText("Nombre del cliente"), {
			target: { value: "Cermont Cliente" },
		});
		fireEvent.change(screen.getByLabelText("Fecha de visita"), {
			target: { value: "2026-05-22T08:30" },
		});
		fireEvent.change(screen.getByLabelText("Ubicación"), {
			target: { value: "Arauca, Colombia" },
		});
		fireEvent.change(screen.getByLabelText("Responsable"), {
			target: { value: "507f1f77bcf86cd799439004" },
		});
		fireEvent.change(screen.getByLabelText("Nombre del responsable"), {
			target: { value: "Supervisor Cermont" },
		});
		fireEvent.change(screen.getByLabelText("Requerimientos"), {
			target: { value: "Inspección de acceso y mediciones iniciales" },
		});

		fireEvent.click(screen.getByRole("button", { name: "Crear visita" }));

		await waitFor(() =>
			expect(apiClient.post).toHaveBeenCalledWith(
				"/site-visits",
				expect.objectContaining({
					workRequestId: "507f1f77bcf86cd799439001",
					serviceCaseId: "507f1f77bcf86cd799439002",
					clientId: "507f1f77bcf86cd799439003",
					clientName: "Cermont Cliente",
					visitDate: "2026-05-22T13:30:00.000Z",
					location: "Arauca, Colombia",
					responsibleUserId: "507f1f77bcf86cd799439004",
					responsibleName: "Supervisor Cermont",
					requirements: "Inspección de acceso y mediciones iniciales",
				}),
			),
		);
		expect(routerPush).toHaveBeenCalledWith("/site-visits/507f1f77bcf86cd799439011");
	});
});
