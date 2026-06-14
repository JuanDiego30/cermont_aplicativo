import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ActivityTimeline } from "@/modules/dashboard/ui/ActivityTimeline";
import { StepTimeline } from "@/modules/dashboard/ui/StepTimeline";

describe("dashboard visual components", () => {
	it("renders operational step activity from the service-case distribution", () => {
		render(
			<StepTimeline
				stepDistribution={[
					{ stepCode: "step_01_work_request", count: 8 },
					{ stepCode: "step_06_execution", count: 3 },
				]}
			/>,
		);

		expect(screen.getByText("8 casos activos en Solicitud de Trabajo")).toBeTruthy();
		expect(screen.getByText("3 casos activos en Ejecución de Campo")).toBeTruthy();
		expect(screen.queryByText("2 casos activos en Propuesta Económica")).toBeNull();
	});

	it("renders recent activity from the dashboard contract", () => {
		render(
			<ActivityTimeline
				items={[
					{
						event: "ORDER_CREATED",
						entityType: "Order",
						entityCode: "OT-2026-008",
						occurredAt: "2026-06-11T16:30:00.000Z",
					},
				]}
			/>,
		);

		expect(screen.getByText("Orden creada")).toBeTruthy();
		expect(screen.getByText("OT-2026-008")).toBeTruthy();
	});
});
