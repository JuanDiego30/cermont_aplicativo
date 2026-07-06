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

	it("uses the canonical notifications endpoint", async () => {
		// The current implementation fetches notifications and unread count separately.
		// useNotifications() → GET /notifications (returns Notification[])
		// useUnreadCount()  → GET /notifications/unread-count (returns number)
		vi.mocked(apiClient.get).mockResolvedValue({ success: true, data: [] });
		const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

		renderHeader(queryClient);

		await waitFor(() => {
			expect(vi.mocked(apiClient.get)).toHaveBeenCalledWith("/notifications");
		});
	});

	it("preserves authentication errors in query state instead of swallowing them", async () => {
		vi.mocked(apiClient.get).mockRejectedValue(new ApiError(401, "Unauthorized"));
		const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

		renderHeader(queryClient);

		// The notifications list query key is ["notifications", "list"]
		// The unread count query key is ["notifications", "unread-count"]
		await waitFor(() => {
			const state = queryClient.getQueryState(["notifications", "list"]);
			expect(state?.status).toBe("error");
		});
	});
});
