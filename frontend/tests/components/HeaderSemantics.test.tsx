import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Header from "@/core/ui/layout/Header";

vi.mock("@gsap/react", () => ({ useGSAP: vi.fn() }));

vi.mock("gsap", () => ({
	default: {
		registerPlugin: vi.fn(),
		matchMedia: vi.fn(() => ({ add: vi.fn(), revert: vi.fn() })),
	},
}));

vi.mock("next/navigation", () => ({
	usePathname: () => "/dashboard",
}));

vi.mock("@tanstack/react-query", () => ({
	useQuery: () => ({
		data: { notifications: [], unreadCount: 0 },
		refetch: vi.fn(),
	}),
	useMutation: () => ({ mutateAsync: vi.fn() }),
}));

vi.mock("@/_shared/lib/http/api-client", () => ({
	apiClient: {
		get: vi.fn(),
		patch: vi.fn(),
		post: vi.fn(),
	},
}));

vi.mock("@/_shared/onboarding/GuideButton", () => ({
	GuideButton: () => <button type="button">Guide</button>,
}));

vi.mock("@/auth/hooks/useAuth", () => ({
	useAuth: () => ({ user: { name: "Cermont User" }, accessToken: "token" }),
}));

vi.mock("@/core/ui/layout/HeaderNotifications", () => ({
	HeaderNotifications: () => (
		<li>
			<button type="button">Notifications</button>
		</li>
	),
}));

vi.mock("@/core/ui/layout/HeaderUserMenu", () => ({
	HeaderUserMenu: () => <button type="button">User menu</button>,
}));

vi.mock("@/core/ui/layout/ThemeToggle", () => ({
	HeaderThemeToggle: () => <button type="button">Theme</button>,
}));

describe("Header semantics", () => {
	it("does not render a document h1; pages own the primary heading", () => {
		render(<Header sidebarOpen={false} setSidebarOpen={vi.fn()} />);

		expect(screen.queryByRole("heading", { level: 1 })).not.toBeInTheDocument();
		expect(screen.getAllByText("Dashboard").length).toBeGreaterThan(0);
	});
});
