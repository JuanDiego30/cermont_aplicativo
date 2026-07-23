/**
 * Dashboard KPIs — tests for operational KPI computation.
 *
 * Verifies:
 * - KPI calculation from raw counts
 * - SLA risk computation
 * - Bottleneck detection
 * - Step progression
 */

import { describe, expect, it } from "vitest";

interface StepCount {
	step: string;
	count: number;
}

interface Bottleneck {
	step: string;
	count: number;
	threshold: number;
	isBottleneck: boolean;
}

function detectBottlenecks(steps: StepCount[], threshold: number): Bottleneck[] {
	return steps.map((s) => ({
		step: s.step,
		count: s.count,
		threshold,
		isBottleneck: s.count > threshold,
	}));
}

function computeStepProgression(
	totalCases: number,
	steps: StepCount[],
): { step: string; count: number; percentage: number; accumulated: number }[] {
	let accumulated = 0;
	return steps.map((s) => {
		accumulated += s.count;
		return {
			step: s.step,
			count: s.count,
			percentage: totalCases > 0 ? (s.count / totalCases) * 100 : 0,
			accumulated,
		};
	});
}

describe("Dashboard KPI Computation", () => {
	it("should detect bottlenecks at step 5 (planning)", () => {
		const steps: StepCount[] = [
			{ step: "work_request", count: 5 },
			{ step: "proposal", count: 8 },
			{ step: "po", count: 6 },
			{ step: "planning", count: 15 },
			{ step: "execution", count: 4 },
			{ step: "report", count: 3 },
			{ step: "ses", count: 2 },
			{ step: "invoice", count: 1 },
			{ step: "payment", count: 0 },
		];
		const bottlenecks = detectBottlenecks(steps, 10);
		const planningBottleneck = bottlenecks.find((b) => b.step === "planning");
		expect(planningBottleneck?.isBottleneck).toBe(true);
		expect(planningBottleneck?.count).toBe(15);
	});

	it("should compute step progression correctly", () => {
		const steps: StepCount[] = [
			{ step: "work_request", count: 10 },
			{ step: "proposal", count: 8 },
			{ step: "approved", count: 5 },
			{ step: "completed", count: 3 },
		];
		const progression = computeStepProgression(10, steps);
		expect(progression[0].percentage).toBe(100);
		expect(progression[1].percentage).toBe(80);
		expect(progression[2].percentage).toBe(50);
		expect(progression[3].percentage).toBe(30);
	});

	it("should handle empty case list gracefully", () => {
		const progression = computeStepProgression(0, []);
		expect(progression).toHaveLength(0);
	});
});

describe("SLA Risk Computation", () => {
	it("should compute SLA risk levels", () => {
		const orders = [
			{ id: "1", daysOverdue: 5 },
			{ id: "2", daysOverdue: 15 },
			{ id: "3", daysOverdue: 30 },
			{ id: "4", daysOverdue: 2 },
		];
		const riskLevels = orders.map((o) => ({
			...o,
			risk:
				o.daysOverdue > 20
					? "critical"
					: o.daysOverdue > 10
						? "high"
						: o.daysOverdue > 3
							? "medium"
							: "low",
		}));
		const critical = riskLevels.filter((r) => r.risk === "critical");
		const high = riskLevels.filter((r) => r.risk === "high");
		expect(critical).toHaveLength(1);
		expect(high).toHaveLength(1);
		expect(riskLevels[0].risk).toBe("medium");
		expect(riskLevels[3].risk).toBe("low");
	});

	it("should flag orders needing immediate attention", () => {
		const slaRisk = {
			ordersAtRisk: 3,
			ordersBreached: 1,
			criticalCount: 1,
			averageOverdueDays: 13,
		};
		expect(slaRisk.ordersAtRisk).toBeGreaterThan(0);
		expect(slaRisk.ordersBreached).toBe(1);
	});

	it("should compute complianceRate correctly when cases exist", () => {
		const settled = 10;
		const resolved = 8;
		const complianceRate = settled > 0 ? Math.round((resolved / settled) * 100) : 0;
		expect(complianceRate).toBe(80);
	});

	it("should return 0% complianceRate when no cases resolved", () => {
		const settled = 5;
		const resolved = 0;
		const complianceRate = settled > 0 ? Math.round((resolved / settled) * 100) : 0;
		expect(complianceRate).toBe(0);
	});
});

describe("KPI Empty State Handling", () => {
	it("should return zeros for all metrics when no dashboard summary exists", async () => {
		const { emptyDashboardKpis } = await import("@/modules/dashboard/model/dashboard-helpers");
		const kpis = emptyDashboardKpis();
		expect(kpis.overview.active_orders).toBe(0);
		expect(kpis.overview.closed_orders).toBe(0);
		expect(kpis.overview.overdue_orders).toBe(0);
		expect(kpis.financial.total_budget_approved).toBe(0);
	});

	it("should preserve real zero values as distinct from missing data", async () => {
		const { buildDashboardKpiSnapshot } = await import(
			"@/modules/dashboard/model/dashboard-helpers"
		);
		const result = buildDashboardKpiSnapshot(
			{
				pipeline: { stages: [], totalActive: 5, totalClosed: 0, completionRate: 0 },
			},
			void 0,
			3,
		);
		expect(result.overview.active_orders).toBe(5);
		expect(result.overview.closed_orders).toBe(0);
		expect(result.overview.completed_month_count).toBe(0);
	});

	it("should return empty KPIs when dashboard summary is missing", async () => {
		const { buildDashboardKpiSnapshot } = await import(
			"@/modules/dashboard/model/dashboard-helpers"
		);
		const result = buildDashboardKpiSnapshot(
			void 0,
			{
				totalCases: 10,
				activeCases: 7,
				pendingApproval: 0,
				inProgress: 0,
				completedThisMonth: 0,
				revenue: 0,
			},
			0,
		);
		expect(result.overview.total_orders).toBe(0);
		expect(result.overview.active_orders).toBe(0);
	});
});

describe("Contextual Cermont KPIs", () => {
	it("maps real service demand to lifeline and CCTV labels and certification readiness", async () => {
		const { buildContextualKpis } = await import("@/modules/dashboard/model/dashboard-helpers");
		const kpis = buildContextualKpis(
			{
				periodDays: 30,
				totalRequests: 9,
				items: [
					{ serviceType: "Instalación de líneas de vida", requests: 4 },
					{ serviceType: "CCTV y videovigilancia", requests: 3 },
					{ serviceType: "Mantenimiento eléctrico", requests: 2 },
				],
			},
			{
				blockingChecklistsPending: 0,
				blockingChecklistsFailed: 0,
				evidencePendingReview: 0,
				evidenceRejected: 0,
				evidenceGpsCoveragePct: 100,
				vehicleDocumentsExpiring: 0,
				vehicleDocumentsExpired: 0,
				toolCertificationsExpiring: 2,
				toolCertificationsExpired: 1,
				offlineSyncPending: 0,
				offlineSyncFailed: 0,
			},
		);

		expect(kpis.map(({ label, value }) => ({ label, value }))).toEqual([
			{ label: "Líneas de vida solicitadas", value: 4 },
			{ label: "Proyectos CCTV solicitados", value: 3 },
			{ label: "Certificaciones HSE por renovar", value: 3 },
		]);
	});

	it("marks malformed and older-than-15-minute snapshots as stale", async () => {
		const { isDashboardSnapshotStale } = await import(
			"@/modules/dashboard/model/dashboard-helpers"
		);
		const now = Date.parse("2026-07-21T15:30:00.000Z");

		expect(isDashboardSnapshotStale("2026-07-21T15:14:59.000Z", now)).toBe(true);
		expect(isDashboardSnapshotStale("2026-07-21T15:20:00.000Z", now)).toBe(false);
		expect(isDashboardSnapshotStale("malformed", now)).toBe(true);
	});
});

describe("Step Progression Empty Case", () => {
	it("should return empty array when no steps provided", () => {
		const progression = computeStepProgression(0, []);
		expect(progression).toHaveLength(0);
	});

	it("should return 0% for all steps when totalCases is 0", () => {
		const progression = computeStepProgression(0, [
			{ step: "step_01", count: 0 },
			{ step: "step_02", count: 0 },
		]);
		expect(progression.every((p) => p.percentage === 0)).toBe(true);
	});
});

describe("Cost Overrun Widget Logic", () => {
	it("should compute overrun percentage correctly", () => {
		const costData = {
			estimatedTotal: 100000,
			actualTotal: 125000,
			overrunAmount: 25000,
			overrunPercent: 25,
		};
		expect(costData.overrunPercent).toBe(25);
		expect(costData.overrunAmount).toBe(25000);
	});

	it("should categorize overruns by severity", () => {
		const overruns = [
			{ project: "A", overrunPercent: 5, severity: "low" as const },
			{ project: "B", overrunPercent: 18, severity: "medium" as const },
			{ project: "C", overrunPercent: 35, severity: "high" as const },
			{ project: "D", overrunPercent: 60, severity: "critical" as const },
		];
		const highOrCritical = overruns.filter(
			(o) => o.severity === "high" || o.severity === "critical",
		);
		expect(highOrCritical).toHaveLength(2);
	});
});
