import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatusBadge } from "@/core/ui/StatusBadge";

describe("StatusBadge", () => {
	it("renders 'open' status correctly", () => {
		render(<StatusBadge status="open" />);
		expect(screen.getByText(/abierta/i)).toBeInTheDocument();
	});

	it("renders 'assigned' status correctly", () => {
		render(<StatusBadge status="assigned" />);
		expect(screen.getByText(/asignada/i)).toBeInTheDocument();
	});

	it("renders 'in_progress' status correctly", () => {
		render(<StatusBadge status="in_progress" />);
		expect(screen.getByText(/en progreso/i)).toBeInTheDocument();
	});

	it("renders 'completed' status correctly", () => {
		render(<StatusBadge status="completed" />);
		expect(screen.getByText(/completada/i)).toBeInTheDocument();
	});

	it("renders 'closed' status correctly", () => {
		render(<StatusBadge status="closed" />);
		expect(screen.getByText(/cerrada/i)).toBeInTheDocument();
	});
});
