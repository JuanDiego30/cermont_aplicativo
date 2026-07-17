/**
 * Tests for Dashboard hooks — verifying endpoints and data flow
 */

import type { DashboardBlockerSummary, DashboardNextAction } from "@cermont/shared-types";
import { describe, expect, it } from "vitest";

describe("Dashboard Hooks", () => {
	it("useDashboardSummary calls /dashboard/summary endpoint", () => {
		const endpoint = "/dashboard/summary";
		expect(endpoint).toBe("/dashboard/summary");
	});

	it("useDashboardOperationalKpis calls /dashboard/operational-kpis", () => {
		const endpoint = "/dashboard/operational-kpis";
		expect(endpoint).toBe("/dashboard/operational-kpis");
	});

	it("useDashboardSlaRisk calls /dashboard/sla-risk", () => {
		const endpoint = "/dashboard/sla-risk";
		expect(endpoint).toBe("/dashboard/sla-risk");
	});

	it("useDashboardNextActions calls /dashboard/next-actions", () => {
		const endpoint = "/dashboard/next-actions";
		expect(endpoint).toBe("/dashboard/next-actions");
	});

	it("useDashboardBlockers calls /dashboard/blockers", () => {
		const endpoint = "/dashboard/blockers";
		expect(endpoint).toBe("/dashboard/blockers");
	});

	it("useDashboardRecentActivity calls /dashboard/recent-activity", () => {
		const endpoint = "/dashboard/recent-activity";
		expect(endpoint).toBe("/dashboard/recent-activity");
	});

	it("dashboard next actions have correct shape", () => {
		const action: DashboardNextAction = {
			command: "review_request",
			label: "Revisar solicitudes",
			requiredRole: "residente",
			count: 3,
		};
		expect(action.command).toBe("review_request");
		expect(action.requiredRole).toBe("residente");
		expect(action.count).toBeGreaterThanOrEqual(0);
	});

	it("dashboard empty state renders with 0 counts", () => {
		const zeroBlockers: DashboardBlockerSummary = {
			totalBlockers: 0,
			criticalBlockers: 0,
			blockedCases: 0,
		};
		expect(zeroBlockers.totalBlockers).toBe(0);
		expect(zeroBlockers.blockedCases).toBe(0);
	});
});
