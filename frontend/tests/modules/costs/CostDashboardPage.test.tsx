import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CostsPage from "@/app/(dashboard)/costs/page";

const mocks = vi.hoisted(() => ({
	push: vi.fn(),
	refetch: vi.fn(),
	useCostDashboard: vi.fn(),
	isOnline: true,
}));

vi.mock("next/navigation", () => ({
	useRouter: () => ({ push: mocks.push }),
}));

vi.mock("@/modules/auth/hooks/useAuth", () => ({
	useAuth: () => ({ accessToken: "token", isAuthenticated: true }),
}));

vi.mock("@/lib/hooks/useOnlineStatus", () => ({
	useOnlineStatus: () => mocks.isOnline,
}));

vi.mock("@/modules/costs", () => ({
	COST_CATEGORY_LABELS: {},
	formatCurrency: (value: number) => String(value),
	useCostDashboard: mocks.useCostDashboard,
}));

describe("CostDashboardPage", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.isOnline = true;
	});

	it("offers an explicit retry action when the dashboard request fails", () => {
		mocks.useCostDashboard.mockReturnValue({
			isLoading: false,
			isError: true,
			isFetching: false,
			refetch: mocks.refetch,
		});

		render(<CostsPage />);
		fireEvent.click(screen.getByRole("button", { name: "Reintentar" }));

		expect(mocks.refetch).toHaveBeenCalledOnce();
	});

	it("labels cached dashboard data when the device is offline", () => {
		mocks.isOnline = false;
		mocks.useCostDashboard.mockReturnValue({
			data: {
				generatedAt: "2026-07-12T12:00:00.000Z",
				totalEstimated: 1_000,
				totalActual: 800,
				totalBilled: 1_200,
				totalTax: 0,
				variance: -200,
				variancePercent: { status: "present", value: -20 },
				grossMargin: 400,
				grossMarginPercent: 33.33,
				hasNegativeVariance: false,
				period: "monthly",
				monthlyTrend: [],
				topVarianceOrders: [],
				byCategory: [],
			},
			isLoading: false,
			isError: false,
			isFetching: false,
			refetch: mocks.refetch,
		});

		render(<CostsPage />);

		expect(screen.getByText(/Mostrando los últimos datos disponibles en caché/)).toBeTruthy();
		expect(screen.getByText("-20.0%")).toBeTruthy();
	});
});
