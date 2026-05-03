import { describe, expect, it } from "vitest";

import {
	migrateCostControlFieldNames,
	migrateMaintenanceKitFieldNames,
	migrateOrderFieldNames,
	migrateResourceFieldNames,
} from "../../../tooling/backend-scripts/migrations/clean-field-name-transforms";

describe("clean field name migration transforms", () => {
	it("renames order execution phase and cost baseline fields", () => {
		const migrated = migrateOrderFieldNames({
			code: "OT-1",
			costosBaseline: { total: 120 },
			executionPhase: {
				preInicioCompletedAt: "2026-04-01T00:00:00.000Z",
				enEjecucionCompletedAt: "2026-04-02T00:00:00.000Z",
				cierreCompletedAt: "2026-04-03T00:00:00.000Z",
			},
		});

		expect(migrated).toMatchObject({
			costBaseline: { total: 120 },
			executionPhase: {
				preStartCompletedAt: "2026-04-01T00:00:00.000Z",
				inExecutionCompletedAt: "2026-04-02T00:00:00.000Z",
				closureCompletedAt: "2026-04-03T00:00:00.000Z",
			},
		});
		expect(migrated).not.toHaveProperty("costosBaseline");
		expect(migrated.executionPhase).not.toHaveProperty("preInicioCompletedAt");
	});

	it("renames resource date fields", () => {
		const migrated = migrateResourceFieldNames({
			purchase_date: "2026-04-01T00:00:00.000Z",
			maintenance_date: "2026-04-02T00:00:00.000Z",
		});

		expect(migrated).toEqual({
			purchaseDate: "2026-04-01T00:00:00.000Z",
			maintenanceDate: "2026-04-02T00:00:00.000Z",
		});
	});

	it("renames cost control item budget flags", () => {
		const migrated = migrateCostControlFieldNames({
			actual_items: [{ category: "labor", is_budgeted: true }],
		});

		expect(migrated).toEqual({
			actual_items: [{ category: "labor", isBudgeted: true }],
		});
	});

	it("renames maintenance kit review fields and version history timestamps", () => {
		const migrated = migrateMaintenanceKitFieldNames({
			last_reviewed_at: "2026-04-01T00:00:00.000Z",
			next_review_at: "2026-05-01T00:00:00.000Z",
			version_history: [{ version: "v1.0", changed_at: "2026-04-01T00:00:00.000Z" }],
		});

		expect(migrated).toEqual({
			lastReviewedAt: "2026-04-01T00:00:00.000Z",
			nextReviewAt: "2026-05-01T00:00:00.000Z",
			version_history: [{ version: "v1.0", changedAt: "2026-04-01T00:00:00.000Z" }],
		});
	});
});
