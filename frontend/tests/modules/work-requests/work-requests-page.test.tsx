import { render, screen } from "@testing-library/react";
import type { ComponentProps, ReactNode } from "react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import WorkRequestsPage from "@/app/(dashboard)/work-requests/page";

const workRequestQueryMocks = vi.hoisted(() => ({
	useWorkRequests: vi.fn(),
}));

vi.mock("next/link", () => ({
	default: ({ children, href, ...props }: ComponentProps<"a"> & { children: ReactNode }) => (
		<a href={String(href)} {...props}>
			{children}
		</a>
	),
}));

vi.mock("@/modules/work-requests/queries", () => ({
	useWorkRequests: workRequestQueryMocks.useWorkRequests,
}));

describe("Work requests page offline rendering", () => {
	beforeEach(() => {
		workRequestQueryMocks.useWorkRequests.mockReset();
	});

	test("keeps the module rendered when offline has no local snapshot", () => {
		workRequestQueryMocks.useWorkRequests.mockReturnValue({
			data: {
				items: [],
				source: {
					status: "offline_empty",
					updatedAt: "2026-06-05T12:00:00.000Z",
				},
			},
			isLoading: false,
			error: null,
		});

		render(<WorkRequestsPage />);

		expect(screen.getByRole("heading", { name: "Solicitudes de Trabajo" })).toBeTruthy();
		expect(screen.getByText("Sin solicitudes guardadas localmente")).toBeTruthy();
		expect(
			screen.queryByText("No se pueden cargar las solicitudes. Verifica tu conexión a internet."),
		).toBeNull();
	});
});
