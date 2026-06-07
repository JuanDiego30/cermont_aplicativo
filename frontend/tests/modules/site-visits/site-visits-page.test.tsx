import { render, screen } from "@testing-library/react";
import type { ComponentProps, ReactNode } from "react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import SiteVisitsPage from "@/app/(dashboard)/site-visits/page";

const siteVisitMocks = vi.hoisted(() => ({
	useConnectivity: vi.fn(),
	useSiteVisitsList: vi.fn(),
}));

vi.mock("next/link", () => ({
	default: ({ children, href, ...props }: ComponentProps<"a"> & { children: ReactNode }) => (
		<a href={String(href)} {...props}>
			{children}
		</a>
	),
}));

vi.mock("@/lib/offline/connectivity", () => ({
	useConnectivity: siteVisitMocks.useConnectivity,
}));

vi.mock("@/modules/site-visits/queries", () => ({
	useSiteVisitsList: siteVisitMocks.useSiteVisitsList,
}));

describe("Site visits page offline rendering", () => {
	beforeEach(() => {
		siteVisitMocks.useConnectivity.mockReset();
		siteVisitMocks.useSiteVisitsList.mockReset();
		siteVisitMocks.useConnectivity.mockReturnValue({ isOnline: false });
	});

	test("keeps the module rendered when offline has no local snapshot", () => {
		siteVisitMocks.useSiteVisitsList.mockReturnValue({
			data: {
				items: [],
				total: 0,
				page: 1,
				limit: 50,
				pages: 0,
				source: {
					status: "offline_empty",
					updatedAt: "2026-06-05T12:00:00.000Z",
				},
			},
			isLoading: false,
			isError: false,
			refetch: vi.fn(),
		});

		render(<SiteVisitsPage />);

		expect(screen.getByRole("heading", { name: "Visitas técnicas" })).toBeTruthy();
		expect(screen.getByText("Sin visitas guardadas localmente")).toBeTruthy();
		expect(screen.getByText(/Este dispositivo todavía no tiene visitas/)).toBeTruthy();
	});
});
