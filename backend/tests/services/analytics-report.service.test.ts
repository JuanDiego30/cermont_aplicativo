import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	orderFind: vi.fn(),
}));

function queryResult(rows: object[]) {
	return {
		sort: vi.fn().mockReturnValue({
			limit: vi.fn().mockReturnValue({
				lean: vi.fn().mockResolvedValue(rows),
			}),
		}),
	};
}

vi.mock("../../src/models", () => ({
	Order: {
		find: mocks.orderFind,
		countDocuments: vi.fn(),
	},
	Invoice: { find: vi.fn(), countDocuments: vi.fn() },
	Payment: { find: vi.fn(), countDocuments: vi.fn() },
	ServiceEntrySheet: { find: vi.fn(), countDocuments: vi.fn() },
}));
vi.mock("../../src/models/Evidence", () => ({
	Evidence: { countDocuments: vi.fn() },
}));
vi.mock("../../src/models/WorkRequest", () => ({
	WorkRequest: { find: vi.fn(), countDocuments: vi.fn() },
}));
vi.mock("../../src/models/ServiceCase", () => ({
	ServiceCase: { countDocuments: vi.fn() },
}));
vi.mock("../../src/models/Proposal", () => ({
	Proposal: { countDocuments: vi.fn() },
}));
vi.mock("../../src/models/ExecutionSession", () => ({
	ExecutionSession: { countDocuments: vi.fn() },
}));
vi.mock("../../src/models/DeliveryRecord", () => ({
	DeliveryRecord: { countDocuments: vi.fn() },
}));

import { AnalyticsReportService } from "../../src/modules/analytics-report/analytics-report.service";

describe("AnalyticsReportService", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("escapes commas, quotes, and line breaks in CSV exports", async () => {
		mocks.orderFind.mockReturnValue(
			queryResult([
				{
					_id: { toString: () => "order-1" },
					code: 'OT-"001"',
					assetName: "Bomba, principal",
					type: "maintenance\nurgent",
					priority: "alta",
					status: "active",
					createdAt: new Date("2026-06-11T12:00:00.000Z"),
				},
			]),
		);

		const csv = await AnalyticsReportService.exportToCSV("orders", {});

		expect(csv).toContain('"OT-""001"""');
		expect(csv).toContain('"Bomba, principal"');
		expect(csv).toContain('"maintenance\nurgent"');
	});
});
