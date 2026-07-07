import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, apiClient } from "@/lib/http/api-client";
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
	HeaderNotifications: ({
		notifications,
		unreadCount,
	}: {
		notifications: readonly { id: string; mensaje: string }[];
		unreadCount: number;
	}) => (
		<span data-testid="notifications-summary">
			{notifications.map((notification) => notification.mensaje).join(",")}:{unreadCount}
		</span>
	),
}));
vi.mock("@/modules/core/ui/layout/HeaderUserMenu", () => ({ HeaderUserMenu: () => <span /> }));

// Mock the apiClient module to provide both `get` and `post` methods.
// The module-level mock ensures both exist so vi.spyOn can attach spies.
vi.mock("@/lib/http/api-client", () => ({
	apiClient: {
		get: vi.fn(),
		post: vi.fn(),
		patch: vi.fn(),
		put: vi.fn(),
		delete: vi.fn(),
	},
	ApiError: class {
		status: number;
		message: string;
		code: string | undefined;
		constructor(status: number, message: string, code?: string) {
			this.status = status;
			this.message = message;
			this.code = code;
		}
	},
}));

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

	it("renders the canonical notification envelope with one request", async () => {
		vi.mocked(apiClient.get).mockImplementation((path: string) => {
			if (path === "/notifications/unread-count") {
				return Promise.resolve({ success: true, data: { count: 1 } });
			}
			return Promise.resolve({
				success: true,
				data: [
					{
						_id: "507f1f77bcf86cd799439011",
						type: "SYSTEM_ALERT",
						title: "Alerta operativa",
						message: "Revisa el cierre documental.",
						isRead: false,
						createdAt: "2026-07-06T12:00:00.000Z",
					},
				],
			});
		});
		const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

		renderHeader(queryClient);

		await waitFor(() => {
			expect(vi.mocked(apiClient.get)).toHaveBeenCalledTimes(2);
			expect(vi.mocked(apiClient.get)).toHaveBeenCalledWith("/notifications");
			expect(document.querySelector("[data-testid='notifications-summary']")?.textContent).toBe(
				"Revisa el cierre documental.:1",
			);
		});
	});

	it("preserves authentication errors in query state instead of swallowing them", async () => {
		vi.mocked(apiClient.get).mockRejectedValue(new ApiError(401, "Unauthorized"));
		const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

		renderHeader(queryClient);

		await waitFor(() => {
			const state = queryClient.getQueryState(["notifications", "list"]);
			expect(state?.status).toBe("error");
		});
	});
});
