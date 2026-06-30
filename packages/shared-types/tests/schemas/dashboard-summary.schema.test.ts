import { describe, expect, it } from "vitest";
import {
	DashboardFieldReadinessSchema,
	DashboardFinancialAgingSchema,
	DashboardServiceDemandSchema,
} from "../../src/schemas/dashboard-summary.schema";

describe("dashboard operational contracts", () => {
	it("models field blockers from persisted operational data", () => {
		const result = DashboardFieldReadinessSchema.safeParse({
			blockingChecklistsPending: 3,
			blockingChecklistsFailed: 1,
			evidencePendingReview: 4,
			evidenceRejected: 2,
			evidenceGpsCoveragePct: 86,
			vehicleDocumentsExpiring: 2,
			vehicleDocumentsExpired: 1,
			toolCertificationsExpiring: 5,
			toolCertificationsExpired: 0,
			offlineSyncPending: 3,
			offlineSyncFailed: 1,
		});

		expect(result.success).toBe(true);
	});

	it("represents multi-service demand without a petroleum-only enum", () => {
		const result = DashboardServiceDemandSchema.safeParse({
			periodDays: 30,
			totalRequests: 7,
			items: [
				{ serviceType: "Refrigeración industrial", requests: 4 },
				{ serviceType: "Obra civil", requests: 3 },
			],
		});

		expect(result.success).toBe(true);
	});

	it("separates monetary aging from invoice counts", () => {
		const result = DashboardFinancialAgingSchema.parse({
			buckets: [
				{
					bucket: "31-60 días",
					minDays: 31,
					maxDays: 60,
					count: 2,
					amount: 18_500_000,
					currency: "COP",
				},
			],
			totalOutstandingAmount: 18_500_000,
			totalOverdueAmount: 18_500_000,
			overdueInvoiceCount: 2,
		});

		expect(result.totalOutstandingAmount).toBe(18_500_000);
		expect(result.overdueInvoiceCount).toBe(2);
	});
});
