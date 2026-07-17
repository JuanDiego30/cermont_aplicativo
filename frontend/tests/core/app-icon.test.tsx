/**
 * AppIcon tests — variant rendering, size, aria attributes, className merging.
 */

import { render } from "@testing-library/react";
import { Home, User } from "lucide-react";
import { describe, expect, it } from "vitest";
import { AppIcon } from "@/core/ui/AppIcon";

describe("AppIcon", () => {
	it("renders with default variant", () => {
		const { container } = render(<AppIcon icon={Home} size={18} aria-label="Inicio" />);
		const svg = container.querySelector("svg");
		expect(svg).toBeDefined();
		expect(svg?.getAttribute("stroke-width")).toBe("1.5");
	});

	it("applies active variant class", () => {
		const { container } = render(
			<AppIcon icon={Home} size={18} variant="active" aria-label="Inicio activo" />,
		);
		const svg = container.querySelector("svg");
		expect(svg?.getAttribute("class")).toContain("text-[var(--color-success)]");
	});

	it("applies brand variant class", () => {
		const { container } = render(
			<AppIcon icon={User} size={20} variant="brand" aria-label="Usuario" />,
		);
		const svg = container.querySelector("svg");
		expect(svg?.getAttribute("class")).toContain("text-[var(--color-brand)]");
	});

	it("applies muted variant class", () => {
		const { container } = render(
			<AppIcon icon={Home} size={14} variant="muted" aria-label="Inicio muted" />,
		);
		const svg = container.querySelector("svg");
		expect(svg?.getAttribute("class")).toContain("text-[var(--text-tertiary)]");
	});

	it("applies success variant class", () => {
		const { container } = render(
			<AppIcon icon={Home} size={16} variant="success" aria-label="Éxito" />,
		);
		const svg = container.querySelector("svg");
		expect(svg?.getAttribute("class")).toContain("text-[var(--color-success)]");
	});

	it("applies warning variant class", () => {
		const { container } = render(
			<AppIcon icon={Home} size={16} variant="warning" aria-label="Advertencia" />,
		);
		const svg = container.querySelector("svg");
		expect(svg?.getAttribute("class")).toContain("text-[var(--color-warning)]");
	});

	it("applies danger variant class", () => {
		const { container } = render(
			<AppIcon icon={Home} size={16} variant="danger" aria-label="Peligro" />,
		);
		const svg = container.querySelector("svg");
		expect(svg?.getAttribute("class")).toContain("text-[var(--color-danger)]");
	});

	it("applies info variant class", () => {
		const { container } = render(
			<AppIcon icon={Home} size={16} variant="info" aria-label="Información" />,
		);
		const svg = container.querySelector("svg");
		expect(svg?.getAttribute("class")).toContain("text-[var(--color-info)]");
	});

	it("sets aria-hidden when specified", () => {
		const { container } = render(<AppIcon icon={Home} size={18} aria-hidden="true" />);
		const svg = container.querySelector("svg");
		expect(svg?.getAttribute("aria-hidden")).toBe("true");
	});

	it("merges custom className", () => {
		const { container } = render(
			<AppIcon icon={Home} size={18} className="my-custom-class" aria-label="Custom" />,
		);
		const svg = container.querySelector("svg");
		expect(svg?.getAttribute("class")).toContain("my-custom-class");
	});

	it("returns fallback when icon is not provided", () => {
		const { container } = render(
			<AppIcon icon={void 0 as never} size={18} />,
		);
		expect(container.innerHTML).toBe("");
	});

	it("uses default size 18", () => {
		const { container } = render(<AppIcon icon={Home} aria-label="Default size" />);
		const svg = container.querySelector("svg");
		expect(svg).toBeDefined();
	});
});
