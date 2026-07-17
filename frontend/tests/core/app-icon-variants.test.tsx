import { render, screen } from "@testing-library/react";
import { ClipboardList } from "lucide-react";
import { describe, expect, it } from "vitest";
import { AppIcon } from "@/core/ui/AppIcon";

describe("AppIcon variants", () => {
	it("renders with default variant", () => {
		const { container } = render(<AppIcon icon={ClipboardList} />);
		const svg = container.querySelector("svg");
		expect(svg).toBeDefined();
		expect(svg?.getAttribute("stroke-width")).toBe("1.5");
	});

	it("renders with brand variant", () => {
		const { container } = render(<AppIcon icon={ClipboardList} variant="brand" />);
		const svg = container.querySelector("svg");
		expect(svg).toBeDefined();
	});

	it("renders with size xl (32px)", () => {
		const { container } = render(<AppIcon icon={ClipboardList} size="xl" />);
		const svg = container.querySelector("svg");
		expect(svg?.getAttribute("width")).toBe("32");
		expect(svg?.getAttribute("height")).toBe("32");
	});

	it("renders with numeric size", () => {
		const { container } = render(<AppIcon icon={ClipboardList} size={40} />);
		const svg = container.querySelector("svg");
		expect(svg?.getAttribute("width")).toBe("40");
	});

	it("renders with aria-label when provided", () => {
		render(<AppIcon icon={ClipboardList} aria-label="Órdenes" />);
		const svg = screen.getByLabelText("Órdenes");
		expect(svg).toBeDefined();
	});

	it("renders with aria-hidden when no label", () => {
		const { container } = render(<AppIcon icon={ClipboardList} />);
		const svg = container.querySelector("svg");
		expect(svg?.getAttribute("aria-hidden")).toBe("true");
	});

	it("renders all semantic variants without error", () => {
		const variants = [
			"default",
			"active",
			"brand",
			"muted",
			"success",
			"warning",
			"danger",
			"info",
			"currentColor",
		] as const;
		for (const variant of variants) {
			const { container } = render(<AppIcon icon={ClipboardList} variant={variant} />);
			const svg = container.querySelector("svg");
			expect(svg).toBeDefined();
		}
	});
});
