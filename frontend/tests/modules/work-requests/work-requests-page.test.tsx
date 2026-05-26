import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import type { ComponentProps, ReactNode } from "react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import WorkRequestsPage from "@/app/(dashboard)/work-requests/page";
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

describe("Work requests page", () => {
	beforeEach(() => {
		vi.mocked(apiClient.get).mockReset();
	});

	test("renders work requests from the canonical paginated backend envelope", async () => {
		vi.mocked(apiClient.get).mockResolvedValue({
			success: true,
			data: [
				{
					_id: "wr-1",
					code: "WR-0001",
					status: "submitted",
					shortDescription: "Inspección de línea de vida",
					clientName: "Cermont Cliente",
					urgency: "high",
					createdAt: "2026-05-14T00:00:00.000Z",
				},
			],
			pagination: {
				page: 0,
				limit: 20,
				total: 1,
				totalPages: 1,
			},
		});

		renderWithQueryClient(<WorkRequestsPage />);

		expect(await screen.findByText("Inspección de línea de vida")).toBeTruthy();
		expect(apiClient.get).toHaveBeenCalledWith("/work-requests");
	});
});
