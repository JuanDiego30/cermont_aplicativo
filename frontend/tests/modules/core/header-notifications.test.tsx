import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient, ApiError } from "@/lib/http/api-client";
import Header from "@/modules/core/ui/layout/Header";

vi.mock("@gsap/react", () => ({ useGSAP: vi.fn() }));
vi.mock("gsap", () => ({ default: { from: vi.fn(), registerPlugin: vi.fn() } }));
vi.mock("next/navigation", () => ({ usePathname: () => "/dashboard" }));
vi.mock("@/modules/auth/hooks/useAuth", () => ({
	useAuth: () => ({
		accessToken: "access-token",
		user: { _id: "user-1", email: "manager@cermont.test", name: "Manager", role: "supervisor" },
	}),
}));
vi.mock("@/components/sync/NetworkStatusChip", () => ({ NetworkStatusChip: () => <span /> }));
vi.mock("@/core/ui/ThemeToggle", () => ({ ThemeToggle: () => <span /> }));
vi.mock("@/modules/core/ui/layout/HeaderNotifications", () => ({
	HeaderNotifications: () => <span />,
}));
vi.mock("@/modules/core/ui/layout/HeaderUserMenu", () => ({ HeaderUserMenu: () => <span /> }));

function renderHeader(queryClient: QueryClient): void {
	render(
		<QueryClientProvider client={queryClient}>
			<Header sidebarOpen={false} setSidebarOpen={vi.fn()} />
		</QueryClientProvider>,
	);
}

describe("Header notifications", () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	it("uses the canonical notifications endpoint", async () => {
		const getSpy = vi.spyOn(apiClient, "get").mockResolvedValue({
			success: true,
			data: { notifications: [], unreadCount: 0 },
		});
		const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

		renderHeader(queryClient);

		await waitFor(() => expect(getSpy).toHaveBeenCalledWith("/notifications?limit=20"));
	});

	it("preserves authentication errors in query state instead of swallowing them", async () => {
		vi.spyOn(apiClient, "get").mockRejectedValue(new ApiError(401, "Unauthorized"));
		const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

		renderHeader(queryClient);

		await waitFor(() => expect(queryClient.getQueryState(["notifications"])?.status).toBe("error"));
	});
});
