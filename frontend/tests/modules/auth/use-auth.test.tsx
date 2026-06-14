import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "@/lib/http/api-client";
import { useAuthActions } from "@/modules/auth/hooks/useAuth";
import { useAuthStore } from "@/store/auth.store";

vi.mock("@/lib/http/api-client", () => ({
	apiClient: {
		post: vi.fn(),
	},
}));

function createWrapper(queryClient: QueryClient) {
	return function Wrapper({ children }: { children: ReactNode }) {
		return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
	};
}

describe("useAuthActions logout", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		useAuthStore.getState().setAuth(
			{
				id: "user-1",
				name: "E2E Admin",
				email: "admin@cermont.test",
				role: "gerente",
			},
			"access-token",
		);
	});

	it("clears local auth without invalidating the session query", async () => {
		vi.mocked(apiClient.post).mockResolvedValue({ success: true });
		const queryClient = new QueryClient();
		const cancelQueries = vi.spyOn(queryClient, "cancelQueries");
		const invalidateQueries = vi.spyOn(queryClient, "invalidateQueries");
		const clear = vi.spyOn(queryClient, "clear");
		const { result } = renderHook(() => useAuthActions(), {
			wrapper: createWrapper(queryClient),
		});

		await act(async () => {
			await result.current.logout();
		});

		expect(apiClient.post).toHaveBeenCalledWith("/auth/logout");
		expect(cancelQueries).toHaveBeenCalled();
		expect(invalidateQueries).not.toHaveBeenCalled();
		expect(clear).toHaveBeenCalled();
		expect(useAuthStore.getState().isAuthenticated).toBe(false);
	});
});
