import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ActivityTimeline } from "@/modules/dashboard/ui/ActivityTimeline";

describe("dashboard visual components", () => {
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
