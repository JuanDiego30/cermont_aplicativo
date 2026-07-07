import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EvidenceStatusBadge } from "../EvidenceStatusBadge";

const FSM_STATES = [
	"captured",
	"uploaded",
	"pending_review",
	"approved",
	"rejected",
	"replacement_requested",
	"locked",
	"archived",
] as const;

describe("EvidenceStatusBadge", () => {
	it.each(FSM_STATES)("renders badge for status %s", (status) => {
		const { container } = render(<EvidenceStatusBadge status={status} />);
		expect(container.firstChild).toBeInTheDocument();
	});

	it("has correct aria attributes", () => {
		render(<EvidenceStatusBadge status="approved" />);
		const badge = screen.getByText("Aprobada");
		expect(badge).toBeInTheDocument();
		expect(badge.className).toContain("rounded-full");
	});

	it("renders uppercase label text", () => {
		render(<EvidenceStatusBadge status="rejected" />);
		const badge = screen.getByText("Rechazada");
		expect(badge).toHaveClass("uppercase");
	});

	it("shows pending_review as 'En revisión'", () => {
		render(<EvidenceStatusBadge status="pending_review" />);
		expect(screen.getByText("En revisión")).toBeInTheDocument();
	});

	it("shows replacement_requested as 'Reemplazo solicitado'", () => {
		render(<EvidenceStatusBadge status="replacement_requested" />);
		expect(screen.getByText("Reemplazo solicitado")).toBeInTheDocument();
	});

	it("shows locked as 'Bloqueada'", () => {
		render(<EvidenceStatusBadge status="locked" />);
		expect(screen.getByText("Bloqueada")).toBeInTheDocument();
	});

	it("falls back gracefully for unknown status", () => {
		render(<EvidenceStatusBadge status="unknown_status" />);
		expect(screen.getByText("unknown_status")).toBeInTheDocument();
	});
});
