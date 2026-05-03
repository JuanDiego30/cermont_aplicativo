import { render, screen } from "@testing-library/react";
import { ClipboardList } from "lucide-react";
import { describe, expect, it, vi } from "vitest";
import { KPICard } from "@/dashboard/ui/KPICard";

// Mock GSAP to avoid issues with animation
vi.mock("gsap", () => ({
	default: {
		registerPlugin: vi.fn(),
		from: vi.fn(),
		to: vi.fn(),
		timeline: vi.fn(() => ({
			from: vi.fn().mockReturnThis(),
		})),
	},
}));

describe("KPICard", () => {
	it("renders title and value", () => {
		render(<KPICard title="Active Orders" value={25} icon={ClipboardList} />);

		expect(screen.getByText("Active Orders")).toBeInTheDocument();
	});

	it("renders description when provided", () => {
		render(
			<KPICard
				title="Active Orders"
				value={25}
				icon={ClipboardList}
				description="Total active orders in system"
			/>,
		);

		expect(screen.getByText("Total active orders in system")).toBeInTheDocument();
	});

	it("renders positive trend", () => {
		render(
			<KPICard
				title="Revenue"
				value={5000}
				icon={ClipboardList}
				trend={{ value: 15, isPositive: true }}
			/>,
		);

		expect(screen.getByText("15%")).toBeInTheDocument();
		expect(screen.getByRole("status")).toHaveAttribute("aria-label", "Incremento del 15%");
	});

	it("renders negative trend", () => {
		render(
			<KPICard
				title="Efficiency"
				value={85}
				icon={ClipboardList}
				trend={{ value: 5, isPositive: false }}
			/>,
		);

		expect(screen.getByText("5%")).toBeInTheDocument();
		expect(screen.getByRole("status")).toHaveAttribute("aria-label", "Descenso del 5%");
	});
});
