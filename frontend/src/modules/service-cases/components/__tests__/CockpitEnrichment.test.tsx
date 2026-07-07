import type { ClosureWorkflowSummary, CostTraceabilitySummary } from "@cermont/shared-types";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AdministrativeClosurePipeline } from "../AdministrativeClosurePipeline";
import { CockpitTabs } from "../CockpitTabs";
import { SlaDeadlineBadge } from "../SlaDeadlineBadge";

const BILLING: CostTraceabilitySummary["billing"] = {
	sesValue: 1_000_000,
	invoiceValue: 1_000_000,
	paidValue: 0,
	pendingValue: 1_000_000,
};

function buildClosure(overrides: Partial<ClosureWorkflowSummary>): ClosureWorkflowSummary {
	return {
		deliveryRecordSigned: false,
		sesSubmitted: false,
		sesApproved: false,
		invoiceSubmitted: false,
		invoiceApproved: false,
		paymentReconciled: false,
		caseClosed: false,
		daysOverdue: 0,
		closingPackageReady: false,
		...overrides,
	};
}

describe("AdministrativeClosurePipeline", () => {
	it("renders the four closure stages with their status", () => {
		render(
			<AdministrativeClosurePipeline
				closure={buildClosure({ deliveryRecordSigned: true, sesSubmitted: true })}
				billing={BILLING}
			/>,
		);

		expect(screen.getByText("Acta de entrega")).toBeDefined();
		expect(screen.getByText("SES / Ariba")).toBeDefined();
		expect(screen.getByText("Factura")).toBeDefined();
		expect(screen.getByText("Pago")).toBeDefined();
		expect(screen.getByText("Radicada, esperando aprobación")).toBeDefined();
	});

	it("shows an overdue alert when the closure is late", () => {
		render(
			<AdministrativeClosurePipeline
				closure={buildClosure({ daysOverdue: 12 })}
				billing={BILLING}
			/>,
		);

		expect(screen.getByRole("alert").textContent).toContain("12 días");
	});
});

describe("CockpitTabs", () => {
	it("renders only the active panel and switches on click", () => {
		render(
			<CockpitTabs
				ariaLabel="Contenido del caso"
				tabs={[
					{ id: "one", label: "Documentos", badge: 3, content: <p>Panel documentos</p> },
					{ id: "two", label: "Evidencias", content: <p>Panel evidencias</p> },
				]}
			/>,
		);

		expect(screen.getByText("Panel documentos")).toBeDefined();
		expect(screen.queryByText("Panel evidencias")).toBeNull();

		fireEvent.click(screen.getByRole("tab", { name: /evidencias/i }));

		expect(screen.getByText("Panel evidencias")).toBeDefined();
		expect(screen.queryByText("Panel documentos")).toBeNull();
	});
});

describe("SlaDeadlineBadge", () => {
	it("marks an expired deadline as overdue", () => {
		const past = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
		render(<SlaDeadlineBadge deadline={past} />);

		expect(screen.getByText(/SLA vencido hace/i)).toBeDefined();
	});

	it("shows remaining time for a future deadline", () => {
		const future = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();
		render(<SlaDeadlineBadge deadline={future} />);

		expect(screen.getByText(/SLA vence en/i)).toBeDefined();
	});
});
