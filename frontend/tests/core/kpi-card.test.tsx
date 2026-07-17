import { render, screen } from "@testing-library/react";
import { ClipboardList } from "lucide-react";
import { describe, expect, it } from "vitest";
import { KPICard } from "@/core/ui/KPICard";

describe("KPICard", () => {
	it("renders label and value", () => {
		render(<KPICard label="Órdenes Activas" value={42} icon={ClipboardList} />);
		expect(screen.getByText("Órdenes Activas")).toBeDefined();
		expect(screen.getByText("42")).toBeDefined();
	});

	it("renders loading state as em dash with loading sublabel", () => {
		render(<KPICard label="Cargando" value={0} icon={ClipboardList} isLoading />);
		expect(screen.getByText("—")).toBeDefined();
		expect(screen.getByText("Cargando…")).toBeDefined();
	});

	it("renders with success variant", () => {
		render(<KPICard label="Completadas" value={10} icon={ClipboardList} variant="success" />);
		expect(screen.getByText("Completadas")).toBeDefined();
		expect(screen.getByText("10")).toBeDefined();
	});

	it("renders success variant as neutral when value is 0", () => {
		render(<KPICard label="Completadas" value={0} icon={ClipboardList} variant="success" />);
		expect(screen.getByText("Completadas")).toBeDefined();
		expect(screen.getByText("0")).toBeDefined();
		// Value should render in tertiary color (neutral) not success green
		const valueEl = screen.getByText("0");
		expect(valueEl.className).toContain("tertiary");
	});

	it("renders N/A state as em dash with na sublabel", () => {
		render(<KPICard label="SLA" value={0} icon={ClipboardList} isNA />);
		expect(screen.getByText("—")).toBeDefined();
		expect(screen.getByText("No aplica para este período")).toBeDefined();
	});

	it("renders empty state with custom emptyLabel", () => {
		render(
			<KPICard
				label="Casos"
				value={0}
				icon={ClipboardList}
				isEmpty
				emptyLabel="Sin casos disponibles"
			/>,
		);
		expect(screen.getByText("—")).toBeDefined();
		expect(screen.getByText("Sin casos disponibles")).toBeDefined();
	});

	it("renders sublabel when value is non-zero", () => {
		render(
			<KPICard
				label="Órdenes"
				value={15}
				icon={ClipboardList}
				sublabel="15 órdenes activas"
			/>,
		);
		expect(screen.getByText("15 órdenes activas")).toBeDefined();
	});

	it("handles click when onClick is provided", () => {
		let clicked = false;
		render(
			<KPICard
				label="Clickeable"
				value={5}
				icon={ClipboardList}
				onClick={() => {
					clicked = true;
				}}
			/>,
		);
		const article = screen.getByRole("button");
		article.click();
		expect(clicked).toBe(true);
	});

	it("renders with neutral variant by default", () => {
		render(<KPICard label="Default" value={0} icon={ClipboardList} />);
		expect(screen.getByText("Default")).toBeDefined();
		expect(screen.getByText("0")).toBeDefined();
	});
});
